# Implementation Plan: Court Booking System (Sistema de Reserva de Canchas)

**Branch**: `001-court-booking-system` | **Date**: 2026-10-17 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-court-booking-system/spec.md`

## Summary

Construir el sistema web de reserva de canchas de pádel con autenticación obligatoria de usuarios, catálogo cerrado e inmutable de 5 canchas en Medellín (`Cancha Laureles`, `Cancha El Poblado`, `Cancha Belén`, `Cancha Robledo`, `Cancha Envigado`), visualización de disponibilidad en formato de 24 horas dividida en 15 bloques enteros de 1 hora de `07:00` a `22:00` (`07:00 - 08:00` hasta `21:00 - 22:00`, excluyendo de las opciones los rangos de `22:00` a `07:00`), prevención crítica de colisiones (*double-booking*) mediante transacciones inmediatas e índices únicos parciales en SQLite (`better-sqlite3`), restricción de máximo 1 reserva activa por usuario (`hora_fin > hora_actual`) y panel personal "Mis Reservas" con cancelación permitida hasta 1 hora antes del inicio del turno.

## Technical Context

**Language/Version**: TypeScript 5.x sobre Node.js 20 LTS+ (Frontend y Backend)

**Primary Dependencies**:
- **Frontend**: React 18+, Vite, Tailwind CSS (estilos utilitarios, componentes funcionales con Hooks).
- **Backend**: Node.js, Express 4.x, `better-sqlite3` (sentencias SQL puras y transacciones síncronas atómicas), `jsonwebtoken` + `cookie-parser` (sesión activa), `node:crypto` (`scrypt` para hash de contraseñas), `cors`.

**Storage**: SQLite local en archivo `/db/padel.db` accedido directamente con `better-sqlite3` (sin ORMs pesados).

**Testing**: Vitest + Supertest para pruebas de integración de contratos HTTP, concurrencia/colisión (`409 Conflict`), límite de reserva activa única y ventanas horarias (`07:00` a `22:00`).

**Target Platform**: Aplicación Web Local / Servidor Node.js + Navegadores web modernos.

**Project Type**: `web-application` con estructura plana (`/frontend`, `/backend`, `/db`).

**Performance Goals**:
- Confirmación y liberación de reservas reflejadas en `< 1 segundo` (SC-003).
- Flujo completo de exploración y reserva en `< 60 segundos` (SC-002).
- Transacciones de reserva en SQLite resueltas en `< 10ms`.

**Constraints**:
- **Zona Horaria y Horario Operativo**: `America/Bogota` (UTC-5) para toda validación de fechas pasadas, horario operativo exclusivo de `07:00` a `22:00` (15 bloques de 1 hora), vigencia de reserva activa (`hora_fin > hora_actual`) y ventana de cancelación (`>= 1 hora` antes de `hora_inicio`).
- **Sin Código Sombra**: Prohibido incluir pasarelas de pago, paneles administrativos, notificaciones externas o matchmaking (FR-015).
- **Arquitectura Plana**: Sin Clean Architecture ni clases innecesarias; programación funcional con `camelCase` para variables/funciones y `PascalCase` para Interfaces/Tipos.

**Scale/Scope**: 5 canchas fijas, 15 bloques operativos de 1 hora por cancha/día de `07:00` a `22:00` (75 turnos diarios en total), usuarios concurrentes del club deportivo, 2 vistas principales autenticadas (Grilla de Disponibilidad y Panel "Mis Reservas") + vista de Autenticación (Login/Registro).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio / Regla Constitucional | Evaluación Pre-Investigación | Evaluación Post-Diseño (Phase 1) |
|----------------------------------|------------------------------|----------------------------------|
| **I. Prevención de Colisiones (Double-Booking) (NON-NEGOTIABLE)** | **PASS**: Se diseñará validación atómica en base de datos antes de escribir cualquier reserva. | **PASS**: Garantizado por `db.transaction(...).immediate()` en `better-sqlite3` + índice único parcial `idx_bookings_active_slot ON bookings(court_id, booking_date, start_hour) WHERE status = 'ACTIVE'` ([data-model.md](./data-model.md)). |
| **II. Catálogo Cerrado y Bloques de Tiempo (Formato 24h)** | **PASS**: Catálogo fijo de las 5 canchas de Medellín y grilla en formato de 24 horas de `07:00` a `22:00` en bloques de 1h (`07:00 - 08:00` hasta `21:00 - 22:00`). | **PASS**: Semilla inmutable de 5 canchas en `/db/schema.sql` sin endpoints de mutación; 15 bloques enteros (`start_hour` `7..21`) en formato 24h ([contracts/rest-api.md](./contracts/rest-api.md)). |
| **III. Autenticación Obligatoria** | **PASS**: Ningún flujo de reserva ni disponibilidad completa es accesible sin sesión activa. | **PASS**: Middleware `requireAuth` protege todos los endpoints de `/api/courts` y `/api/bookings` retornando `401` si no hay sesión ([contracts/rest-api.md](./contracts/rest-api.md)). |
| **IV. Cero Código Sombra (Shadow Code)** | **PASS**: Se excluyen pagos, administración de canchas, notificaciones y matchmaking. | **PASS**: El modelo de datos y contratos contienen exclusivamente lo requerido por FR-001 a FR-015. |
| **V. Fuente de la Verdad (Reglas SDD)** | **PASS**: `spec.md` tiene todas las clarificaciones resueltas sin contradicciones con `constitution.md`. | **PASS**: 100% de trazabilidad entre `spec.md`, `research.md`, `data-model.md`, `contracts/rest-api.md` y `quickstart.md`. |
| **Stack y Estructura Plana (`/frontend`, `/backend`, `/db`)** | **PASS**: React + Tailwind, Express, SQLite (`padel.db` con `better-sqlite3`), TypeScript, estructura plana. | **PASS**: Árbol de directorios plano sin capas de sobreingeniería, usando funciones y Hooks, errores amigables y códigos HTTP semánticos (`400`, `401`, `403`, `404`, `409`). |

## Project Structure

### Documentation (this feature)

```text
specs/001-court-booking-system/
├── plan.md              # Este archivo (salida del comando /speckit-plan)
├── research.md          # Salida de Fase 0 (decisiones técnicas y patrones)
├── data-model.md        # Salida de Fase 1 (esquema SQLite, índices y estados)
├── quickstart.md        # Salida de Fase 1 (guía de ejecución y validación E2E)
├── contracts/           # Salida de Fase 1 (contratos de interfaz REST JSON)
│   └── rest-api.md
└── tasks.md             # Salida de Fase 2 (comando /speckit-tasks)
```

### Source Code (repository root)

```text
db/
├── schema.sql           # DDL de tablas (users, courts, bookings), índices y seed de las 5 canchas
├── client.ts            # Inicialización de better-sqlite3 apuntando a db/padel.db
└── padel.db             # Archivo SQLite local (generado automáticamente al iniciar)

backend/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts         # Punto de entrada del servidor Express
│   ├── app.ts           # Configuración de Express, CORS, cookies y rutas
│   ├── types.ts         # Interfaces TypeScript en PascalCase (User, Court, BookingSummary, TimeSlot)
│   ├── time.ts          # Utilidades de fecha/hora en zona America/Bogota (UTC-5)
│   ├── auth.ts          # Funciones de hash, firma/verificación JWT y middleware requireAuth
│   └── routes/
│       ├── authRoutes.ts    # POST /api/auth/register, /login, /logout, GET /me
│       ├── courtRoutes.ts   # GET /api/courts, GET /api/courts/:courtId/availability
│       └── bookingRoutes.ts # POST /api/bookings, GET /api/bookings/my, DELETE /api/bookings/:bookingId
└── tests/
    └── booking.test.ts  # Pruebas de integración (colisiones 409, límite 1 reserva activa, cancelación >= 1h)

frontend/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
└── src/
    ├── main.tsx         # Entrada de React
    ├── App.tsx          # Control de sesión activa y navegación entre Grilla y "Mis Reservas"
    ├── index.css        # Directivas de Tailwind CSS
    ├── types.ts         # Interfaces compartidas de dominio y respuestas API
    ├── api.ts           # Cliente HTTP fetch con traducción de errores amigables
    └── components/
        ├── AuthForm.tsx     # Registro (nombre, email, password >= 8) e Inicio de Sesión
        ├── Navbar.tsx       # Encabezado con usuario activo, selector de vista y cerrar sesión
        ├── CourtGrid.tsx    # Selector de las 5 canchas, calendario sin límite futuro y grilla 24h (15 bloques de 07:00 a 22:00)
        └── MyBookings.tsx   # Panel "Mis Reservas" (futuras activas con cancelación >= 1h e historial completadas)
```

**Structure Decision**: Se selecciona la estructura plana mandatoria de tres carpetas en la raíz (`/db`, `/backend`, `/frontend`) exigida por la Constitución del proyecto. No se introducen capas de "Clean Architecture", repositorios abstractos ni clases de servicio; las rutas de Express invocan funciones puras y transacciones directas de `better-sqlite3` sobre `/db/padel.db`, mientras que el frontend utiliza componentes funcionales de React con Hooks y Tailwind CSS.

## Complexity Tracking

> **No existen violaciones a la Constitución.** Todas las puertas del *Constitution Check* fueron aprobadas sin excepciones.
