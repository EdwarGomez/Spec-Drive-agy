# Tasks: Court Booking System (Sistema de Reserva de Canchas)

**Input**: Design documents from `/specs/001-court-booking-system/`
**Prerequisites**: [plan.md](./plan.md) (required), [spec.md](./spec.md) (required for user stories), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/rest-api.md](./contracts/rest-api.md), [quickstart.md](./quickstart.md)

**Tests**: Se incluyen pruebas automatizadas de integración en `backend/tests/booking.test.ts` según lo definido en `plan.md` y `quickstart.md` para verificar prevención de colisiones (`409 Conflict`), control de acceso (`401`/`403`), reserva activa única y ventana de cancelación de 1 hora.

**Organization**: Las tareas están agrupadas por historia de usuario (`US1` a `US4`) respetando la estructura plana constitucional (`/db`, `/backend`, `/frontend`) para permitir la implementación y validación independiente de cada incremento.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo (archivos distintos, sin dependencias de tareas incompletas)
- **[Story]**: Historia de usuario a la que pertenece la tarea (`[US1]`, `[US2]`, `[US3]`, `[US4]`)
- Todas las tareas incluyen rutas de archivo exactas y las restricciones literales de `data-model.md`

## Path Conventions

- **Database**: `db/schema.sql`, `db/client.ts`, `db/padel.db`
- **Backend**: `backend/src/`, `backend/tests/`
- **Frontend**: `frontend/src/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Inicialización de la estructura plana del proyecto (`/db`, `/backend`, `/frontend`) y configuración de TypeScript, Express, Vite, Tailwind CSS y Vitest.

- [X] T001 Create flat directory structure (`db/`, `backend/src/routes/`, `backend/tests/`, `frontend/src/components/`) at repository root per `plan.md`
- [X] T002 Initialize backend Node.js + TypeScript project with Express, `better-sqlite3`, `jsonwebtoken`, `cookie-parser`, `cors`, `vitest`, and `supertest` in `backend/package.json` and `backend/tsconfig.json`
- [X] T003 [P] Initialize frontend React 18 + TypeScript + Vite + Tailwind CSS project in `frontend/package.json`, `frontend/tsconfig.json`, `frontend/vite.config.ts`, `frontend/index.html`, and `frontend/src/index.css`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Infraestructura base obligatoria (esquema SQLite con restricciones e índices, cliente `better-sqlite3`, utilidades de zona horaria `America/Bogota`, utilidades JWT/`scrypt` y servidor base Express) que DEBE completarse antes de iniciar las historias de usuario.

**⚠️ CRITICAL**: Ningún trabajo de historias de usuario puede comenzar hasta completar esta fase.

- [X] T004 Create SQLite schema and idempotent seed in `db/schema.sql` with verbatim constraints: `users` (`id INTEGER PRIMARY KEY AUTOINCREMENT`, `full_name TEXT NOT NULL`, `email TEXT NOT NULL UNIQUE COLLATE NOCASE`, `password_hash TEXT NOT NULL`, `created_at TEXT NOT NULL DEFAULT (datetime('now'))`), `courts` (`id INTEGER PRIMARY KEY`, `name TEXT NOT NULL UNIQUE` seeded with `(1, 'Cancha Laureles')`, `(2, 'Cancha El Poblado')`, `(3, 'Cancha Belén')`, `(4, 'Cancha Robledo')`, `(5, 'Cancha Envigado')`), `bookings` (`id INTEGER PRIMARY KEY AUTOINCREMENT`, `user_id INTEGER NOT NULL REFERENCES users(id)`, `court_id INTEGER NOT NULL REFERENCES courts(id)`, `booking_date TEXT NOT NULL`, `start_hour INTEGER NOT NULL CHECK (start_hour >= 0 AND start_hour <= 23)`, `end_hour INTEGER NOT NULL CHECK (end_hour = start_hour + 1)`, `status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CANCELLED'))`, `created_at TEXT NOT NULL DEFAULT (datetime('now'))`), and indexes `idx_bookings_active_slot ON bookings (court_id, booking_date, start_hour) WHERE status = 'ACTIVE'` and `idx_bookings_user_status ON bookings (user_id, status, booking_date, end_hour)`
- [X] T005 Implement synchronous `better-sqlite3` connection and automatic `db/schema.sql` initialization targeting `db/padel.db` in `db/client.ts`
- [X] T006 [P] Define PascalCase domain interfaces (`User`, `Court`, `TimeSlot`, `BookingSummary`) in `backend/src/types.ts` and `frontend/src/types.ts`
- [X] T007 [P] Implement `America/Bogota` (UTC-5) date/time helper functions (current Bogotá date `YYYY-MM-DD`, current hour/timestamp, past-slot check, active-booking end comparison `hora_fin > hora_actual`, and `>= 3600 seconds` cancellation window check) in `backend/src/time.ts`
- [X] T008 [P] Implement password hashing (`node:crypto` `scrypt`), JWT signing/verification (`jsonwebtoken`), and `requireAuth` middleware returning `401 Unauthorized` (`{ "error": "Debes iniciar sesión para acceder a las reservas." }`) in `backend/src/auth.ts`
- [X] T009 Setup Express application with CORS, `cookie-parser`, JSON body parsing, route mounting (`/api/auth`, `/api/courts`, `/api/bookings`), and friendly semantic error handler (never exposing raw SQLite errors or stack traces) in `backend/src/app.ts` and `backend/src/index.ts`
- [X] T010 [P] Implement base HTTP fetch wrapper with credentials/token support and friendly Spanish error translation in `frontend/src/api.ts` and bootstrap React root in `frontend/src/main.tsx`

**Checkpoint**: Base de datos `padel.db`, utilidades de tiempo `America/Bogota`, middleware de autenticación y servidor Express listos para conectar las historias de usuario.

---

## Phase 3: User Story 2 - Autenticación y Control de Acceso (Priority: P1) 🎯 MVP Gate

**Goal**: Permitir el registro de nuevos usuarios (nombre completo, correo electrónico válido y contraseña de mínimo 8 caracteres) y el inicio/cierre de sesión, bloqueando el acceso a la disponibilidad y a las reservas para visitantes no autenticados y garantizando el aislamiento de datos entre usuarios.

**Independent Test**: Un visitante sin sesión activa abre la aplicación y solo visualiza el formulario de inicio de sesión/registro (las llamadas directas a `/api/courts` o `/api/bookings` sin sesión retornan `401 Unauthorized`); tras registrarse con `fullName` (>= 2 caracteres), `email` válido y `password` (>= 8 caracteres), inicia sesión automáticamente y queda autenticado para acceder a las vistas protegidas.

### Implementation for User Story 2

- [X] T011 [US2] Implement `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, and `GET /api/auth/me` in `backend/src/routes/authRoutes.ts` enforcing `data-model.md` constraints verbatim (`full_name`: required, non-empty after `trim()`, min 2 chars; `email`: `UNIQUE COLLATE NOCASE` normalized to lowercase matching `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`; `password`: min 8 chars before hashing; returning `400 Bad Request` on invalid fields, `409 Conflict` on duplicate email, and `401 Unauthorized` on bad credentials)
- [X] T012 [P] [US2] Add authentication client functions (`registerUser`, `loginUser`, `logoutUser`, `getCurrentUser`) to `frontend/src/api.ts`
- [X] T013 [P] [US2] Implement `AuthForm` functional component supporting login and registration modes with client-side validation (`fullName` >= 2 chars, valid `email`, `password` >= 8 chars) and friendly error feedback in `frontend/src/components/AuthForm.tsx`
- [X] T014 [P] [US2] Implement `Navbar` functional component displaying authenticated user's `fullName`, navigation tabs (`"Disponibilidad de Canchas"` and `"Mis Reservas"`), and logout button in `frontend/src/components/Navbar.tsx`
- [X] T015 [US2] Implement session check on startup (`getCurrentUser`), unauthenticated redirection/gating to `AuthForm`, and 401 session-expiration handling in `frontend/src/App.tsx`

**Checkpoint**: User Story 2 es funcional e independiente: el control de acceso obligatorio (Principio III) está activo y permite registrarse, iniciar sesión y cerrar sesión desde el navegador.

---

## Phase 4: User Story 1 - Exploración y Reserva con Prevención de Colisión (Priority: P1) 🎯 MVP Core

**Goal**: Permitir a un jugador autenticado explorar el catálogo cerrado de 5 canchas de Medellín, consultar la grilla de 24 horas en bloques enteros de 1 hora (`00:00 - 01:00` a `23:00 - 24:00`) para cualquier fecha actual o futura, y confirmar una reserva con prevención atómica de colisiones (`double-booking`).

**Independent Test**: Un usuario autenticado selecciona `Cancha Laureles` para una fecha futura a las `10:00`, confirma la reserva y el bloque pasa inmediatamente a estado `"Reservado"` (`BOOKED`); si un segundo usuario intenta reservar el mismo bloque `(courtId, bookingDate, startHour)`, el backend rechaza la transacción con `409 Conflict` (`SLOT_ALREADY_BOOKED`) y el mensaje amigable `"La cancha ya fue reservada en este horario. Por favor selecciona otro bloque disponible."`.

### Implementation for User Story 1

- [X] T016 [US1] Implement `GET /api/courts` and `GET /api/courts/:courtId/availability?date=YYYY-MM-DD` (validating `courtId` in `1..5`, rejecting past dates with `400 Bad Request`, and returning the 24 hourly `TimeSlot` items in 24h format `"00:00 - 01:00"` to `"23:00 - 24:00"` with `status: 'AVAILABLE' | 'BOOKED'`, `isPast`, and `bookedByCurrentUser`) in `backend/src/routes/courtRoutes.ts`
- [X] T017 [US1] Implement `POST /api/bookings` using `db.transaction(...).immediate()` to validate `courtId` (`1..5`), `bookingDate` (`YYYY-MM-DD`), `startHour` (`0..23`), `end_hour = start_hour + 1` (`1..24`), reject past slots with `400 Bad Request` (`PAST_TIME_SLOT`), verify slot availability against `idx_bookings_active_slot` (`WHERE status = 'ACTIVE'`) returning `409 Conflict` (`SLOT_ALREADY_BOOKED`) on collision, and insert the active booking in `backend/src/routes/bookingRoutes.ts`
- [X] T018 [P] [US1] Add court catalog, availability fetch, and booking creation methods (`getCourts`, `getCourtAvailability`, `createBooking`) to `frontend/src/api.ts`
- [X] T019 [US1] Implement `CourtGrid` functional component with selector for the 5 immutable courts, interactive date picker without future limit (`min` set to current Bogotá date), 24-hour grid of 1-hour blocks (`00:00 - 01:00` to `23:00 - 24:00`) displaying `"Disponible"` / `"Reservado"`, blocking past slots, and handling booking confirmation and `409 Conflict` refresh in `frontend/src/components/CourtGrid.tsx`

**Checkpoint**: User Stories 2 y 1 funcionan integradas (MVP completo): ningún usuario sin sesión puede ver la grilla ni reservar, y los usuarios autenticados exploran el catálogo cerrado de 5 canchas en grilla de 24 horas y reservan sin colisiones.

---

## Phase 5: User Story 3 - Restricción de Reserva Activa Única (Priority: P2)

**Goal**: Garantizar que cada usuario pueda tener máximo una (1) reserva activa vigente a la vez (`status = 'ACTIVE'` y `hora_fin > hora_actual` en zona `America/Bogota`), permitiendo reservar nuevamente solo cuando el turno haya finalizado (`hora_fin <= hora_actual`) o haya sido cancelado.

**Independent Test**: Un usuario con una reserva activa para hoy o el futuro (`hora_fin > hora_actual`) intenta reservar otro horario en cualquier cancha; el sistema rechaza la petición con `409 Conflict` (`USER_ALREADY_HAS_ACTIVE_BOOKING`) e informa que debe esperar a que finalice o cancelarla. Cuando `hora_fin <= hora_actual`, el sistema le permite crear una nueva reserva.

### Implementation for User Story 3

- [X] T020 [US3] Enforce single active booking rule inside the `POST /api/bookings` immediate transaction in `backend/src/routes/bookingRoutes.ts` by querying `bookings` via `idx_bookings_user_status` for any record with `user_id = req.user.id` and `status = 'ACTIVE'` where `(booking_date + end_hour:00) > now_bogota` and returning `409 Conflict` (`code: 'USER_ALREADY_HAS_ACTIVE_BOOKING'`)
- [X] T021 [US3] Compute and return accurate `userHasActiveBooking` boolean (`status = 'ACTIVE'` and `hora_fin > hora_actual` in `America/Bogota`) in `GET /api/courts/:courtId/availability` inside `backend/src/routes/courtRoutes.ts`
- [X] T022 [US3] Update `frontend/src/components/CourtGrid.tsx` to display an informative banner when `userHasActiveBooking` is `true` and surface the friendly `USER_ALREADY_HAS_ACTIVE_BOOKING` message if the user attempts a second active booking

**Checkpoint**: La regla de máximo 1 reserva activa por usuario (`hora_fin > hora_actual`) está activa en base de datos, API e interfaz.

---

## Phase 6: User Story 4 - Gestión y Cancelación de "Mis Reservas" (Priority: P2)

**Goal**: Proveer a cada usuario el panel personal `"Mis Reservas"` con separación entre reservas futuras activas e historial de reservas pasadas completadas (ocultando las canceladas), y permitir cancelar reservas futuras propias únicamente con al menos 1 hora (60 minutos) de anticipación antes de `start_hour`, liberando de inmediato el bloque horario en la grilla.

**Independent Test**: El usuario abre `"Mis Reservas"`, visualiza su reserva futura activa con cancha, fecha y horario (`18:00 - 19:00`), y si faltan `>= 60 minutos` pulsa `"Cancelar"`, con lo cual la reserva pasa a `status = 'CANCELLED'`, desaparece del panel `"Mis Reservas"` y el bloque vuelve a mostrarse `"Disponible"` en la grilla en `< 1 segundo`. Si faltan `< 60 minutos` o es una reserva de otro usuario, el sistema rechaza con `400 Bad Request` (`CANCELLATION_WINDOW_EXPIRED`) o `403 Forbidden` (`FORBIDDEN_BOOKING_ACCESS`).

### Implementation for User Story 4

- [X] T023 [US4] Implement `GET /api/bookings/my` in `backend/src/routes/bookingRoutes.ts` filtering `WHERE user_id = ? AND status = 'ACTIVE'` (excluding `'CANCELLED'` records per FR-011), splitting results into `activeBookings` (`end_timestamp > now_bogota`) and `pastBookings` (`end_timestamp <= now_bogota`), and computing `canCancel` (`start_timestamp - now_bogota >= 3600 seconds`)
- [X] T024 [US4] Implement `DELETE /api/bookings/:bookingId` in `backend/src/routes/bookingRoutes.ts` verifying booking existence (`404 Not Found` if missing or already `'CANCELLED'`), strict ownership `booking.user_id === req.user.id` (`403 Forbidden` with `FORBIDDEN_BOOKING_ACCESS`), and minimum 1-hour advance notice `start_timestamp - now_bogota >= 3600 seconds` (`400 Bad Request` with `CANCELLATION_WINDOW_EXPIRED`), updating `status = 'CANCELLED'` to immediately free `idx_bookings_active_slot`
- [X] T025 [P] [US4] Add `getMyBookings` and `cancelBooking` client methods in `frontend/src/api.ts`
- [X] T026 [US4] Implement `MyBookings` functional component displaying two separated lists (*Reservas Futuras Activas* and *Historial de Reservas Pasadas Completadas*, excluding cancelled bookings) with court name, date, 24h time range label, and cancellation button enabled only when `canCancel` is `true` (`>= 1 hour` before start) in `frontend/src/components/MyBookings.tsx`
- [X] T027 [US4] Connect `"Mis Reservas"` view switching and immediate availability grid state refresh upon booking cancellation in `frontend/src/App.tsx`

**Checkpoint**: Todas las historias de usuario (`US2`, `US1`, `US3`, `US4`) están completas y son verificables de forma independiente.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Pruebas automatizadas de integración y concurrencia, verificación de cumplimiento constitucional (cero código sombra, códigos HTTP semánticos) y validación E2E con `quickstart.md`.

- [X] T028 Implement automated integration and concurrency test suite in `backend/tests/booking.test.ts` covering: unauthenticated `401` access, registration validation & login (`US2`), 5 immutable courts & 24h availability grid (`US1`), simultaneous double-booking prevention returning `409 Conflict` `SLOT_ALREADY_BOOKED` (`US1`/`SC-001`), single active booking restriction `USER_ALREADY_HAS_ACTIVE_BOOKING` and automatic release when `hora_fin <= hora_actual` (`US3`), ownership protection `403 Forbidden`, and cancellation window `>= 1h` vs `< 1h` `CANCELLATION_WINDOW_EXPIRED` (`US4`)
- [X] T029 Run backend test suite (`npm --prefix backend test`) and frontend production build check (`npm --prefix frontend run build`) to verify zero TypeScript errors, zero shadow code (FR-015), and full compliance with `specs/001-court-booking-system/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sin dependencias — puede comenzar de inmediato (`T001` → `T002`, `T003`).
- **Foundational (Phase 2)**: Depende de Phase 1 — **BLOQUEA** todas las historias de usuario (`T004` → `T005` → `T006`..`T010`).
- **User Story 2 (Phase 3 - P1 🎯 MVP Gate)**: Depende de Phase 2 (`T011`..`T015`). Habilita el registro/login en navegador.
- **User Story 1 (Phase 4 - P1 🎯 MVP Core)**: Depende de Phase 2 (`T016`..`T019`) y se valida E2E en navegador junto con Phase 3.
- **User Story 3 (Phase 5 - P2)**: Depende de Phase 2 y extiende la validación de creación/disponibilidad de `US1` (`T020`..`T022`).
- **User Story 4 (Phase 6 - P2)**: Depende de Phase 2 y extiende `bookingRoutes.ts` y `App.tsx` (`T023`..`T027`).
- **Polish (Phase 7)**: Depende de completar las fases 3 a 6 (`T028`, `T029`).

### User Story Dependency Graph

```text
Phase 1: Setup (T001-T003)
    │
    ▼
Phase 2: Foundational (T004-T010)
    ├──► Phase 3: US2 - Autenticación y Control de Acceso (P1 MVP Gate) (T011-T015)
    └──► Phase 4: US1 - Exploración y Reserva sin Colisión (P1 MVP Core) (T016-T019)
             ├──► Phase 5: US3 - Reserva Activa Única (P2) (T020-T022)
             └──► Phase 6: US4 - Mis Reservas y Cancelación >= 1h (P2) (T023-T027)
                      └──► Phase 7: Polish & Integration Tests (T028-T029)
```

### Parallel Opportunities

- **Setup (Phase 1)**: `T002` (backend init) y `T003` (frontend init) pueden ejecutarse en paralelo tras `T001`.
- **Foundational (Phase 2)**: `T006` (`types.ts`), `T007` (`time.ts`), `T008` (`auth.ts`) y `T010` (`frontend/src/api.ts`) pueden ejecutarse en paralelo tras `T004`-`T005`.
- **User Story 2 (Phase 3)**: `T012` (`api.ts`), `T013` (`AuthForm.tsx`) y `T014` (`Navbar.tsx`) pueden ejecutarse en paralelo mientras se implementa `T011` (`authRoutes.ts`).
- **User Story 1 (Phase 4)**: `T018` (`frontend/src/api.ts`) puede ejecutarse en paralelo con `T016` y `T017` (backend routes).
- **User Story 4 (Phase 6)**: `T025` (`api.ts`) puede ejecutarse en paralelo con `T023` y `T024` (`bookingRoutes.ts`).

---

## Parallel Example: User Story 2 & User Story 1

```bash
# Ejemplo 1: Tareas paralelas en Phase 2 (Foundational)
Task: "T006 [P] Define PascalCase domain interfaces in backend/src/types.ts and frontend/src/types.ts"
Task: "T007 [P] Implement America/Bogota (UTC-5) date/time helper functions in backend/src/time.ts"
Task: "T008 [P] Implement password hashing, JWT signing/verification, and requireAuth middleware in backend/src/auth.ts"
Task: "T010 [P] Implement base HTTP fetch wrapper in frontend/src/api.ts and bootstrap React root in frontend/src/main.tsx"

# Ejemplo 2: Tareas paralelas en Phase 3 (User Story 2)
Task: "T011 [US2] Implement POST /api/auth/register, /login, /logout, and GET /api/auth/me in backend/src/routes/authRoutes.ts"
Task: "T013 [P] [US2] Implement AuthForm functional component in frontend/src/components/AuthForm.tsx"
Task: "T014 [P] [US2] Implement Navbar functional component in frontend/src/components/Navbar.tsx"
```

---

## Implementation Strategy

### MVP First (Phase 3 US2 + Phase 4 US1)

1. Completar **Phase 1: Setup** (`T001`–`T003`).
2. Completar **Phase 2: Foundational** (`T004`–`T010`) — deja lista la base de datos SQLite `padel.db`, el índice único parcial anti-colisiones y el middleware `requireAuth`.
3. Completar **Phase 3: User Story 2** (`T011`–`T015`) — habilita el registro e inicio de sesión obligatorio desde el navegador.
4. Completar **Phase 4: User Story 1** (`T016`–`T019`) — habilita la grilla de 24h en las 5 canchas inmutables y la reserva atómica sin colisiones.
5. **STOP & VALIDATE**: Verificar registro/login, visualización de las 5 canchas inmutables en grilla de 24 horas y prevención de colisiones (`409 Conflict`).

### Incremental Delivery

1. **Foundation (`T001`–`T010`)**: Esquema SQLite, semilla de 5 canchas y servidor Express listos.
2. **Incremento 1 (`US2` + `US1`, `T011`–`T019`)**: Autenticación obligatoria, exploración del catálogo cerrado y reserva atómica sin *double-booking* (MVP operativo).
3. **Incremento 2 (`US3`, `T020`–`T022`)**: Regla de máximo 1 reserva activa por usuario (`hora_fin > hora_actual`).
4. **Incremento 3 (`US4`, `T023`–`T027`)**: Panel `"Mis Reservas"` (activas futuras vs. pasadas completadas, ocultando canceladas) y cancelación con anticipación mínima de 1 hora.
5. **Incremento 4 (`Phase 7`, `T028`–`T029`)**: Suite automatizada de pruebas de integración y concurrencia en Vitest + Supertest.
