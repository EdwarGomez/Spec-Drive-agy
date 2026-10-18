# Quickstart & Validation Guide: Court Booking System

**Feature**: Court Booking System (`001-court-booking-system`)  
**References**:
- [Data Model](./data-model.md)
- [REST API Contract](./contracts/rest-api.md)

---

## 1. Prerequisites

- **Node.js**: v20 LTS o superior (incluye `npm`).
- **Sistema Operativo**: Windows, macOS o Linux (con herramientas de compilación estándar si `better-sqlite3` no descarga binario precompilado).
- **Zona Horaria**: El sistema evalúa fechas y horas automáticamente bajo `America/Bogota` (UTC-5).

---

## 2. Project Setup & Execution

### 2.1 Instalar dependencias e inicializar base de datos (`padel.db`)

Desde la raíz del repositorio:

```powershell
# Instalar dependencias del backend (incluye acceso a /db/padel.db)
npm --prefix backend install

# Instalar dependencias del frontend
npm --prefix frontend install
```

### 2.2 Levantar el entorno de desarrollo

En dos terminales separadas (o mediante script raíz):

```powershell
# Terminal 1: Iniciar API Backend en http://localhost:3001
npm --prefix backend run dev

# Terminal 2: Iniciar Frontend React + Tailwind en http://localhost:5173
npm --prefix frontend run dev
```

Al iniciar el backend por primera vez, se crea automáticamente `/db/padel.db`, se aplican las tablas definidas en [data-model.md](./data-model.md) y se insertan de forma idempotente las 5 canchas del catálogo cerrado:
1. Cancha Laureles
2. Cancha El Poblado
3. Cancha Belén
4. Cancha Robledo
5. Cancha Envigado

---

## 3. Automated Test Execution

Para ejecutar la suite de validación automatizada (incluyendo la prueba de concurrencia/colisión y las reglas de horario):

```powershell
npm --prefix backend test
```

---

## 4. End-to-End Validation Scenarios

### Escenario 1: Control de Acceso y Registro (User Story 2)
1. Abrir `http://localhost:5173` sin sesión activa.
2. **Resultado esperado**: El usuario ve únicamente el formulario de Inicio de Sesión / Registro; una llamada directa a `GET /api/courts` sin token retorna `401 Unauthorized`.
3. Registrarse con nombre `"Juan Pérez"`, correo `"juan@padel.co"` y contraseña `"padel2026"` (8 caracteres).
4. **Resultado esperado**: El sistema crea la cuenta (`201 Created`), inicia sesión automáticamente y muestra el selector con las **5 canchas inmutables** y la grilla de **15 bloques de 1 hora en formato 24h (`07:00 - 08:00` hasta `21:00 - 22:00`)**, sin incluir ningún horario entre las `22:00` y las `07:00`.

### Escenario 2: Exploración, Reserva y Prevención de Colisiones (User Story 1 & SC-001)
1. Con el Usuario A (`juan@padel.co`), seleccionar `"Cancha Laureles"`, fecha de mañana y el bloque `14:00 - 15:00` (`Disponible`).
2. Confirmar la reserva.
3. **Resultado esperado**: El bloque cambia inmediatamente a `Reservado` (`201 Created`).
4. Con un Usuario B (`maria@padel.co`) en otra sesión/navegador, intentar reservar el mismo bloque (`Cancha Laureles`, fecha de mañana, `14:00 - 15:00`).
5. **Resultado esperado**: El servidor rechaza la petición con `409 Conflict` y el mensaje amigable `"La cancha ya fue reservada en este horario. Por favor selecciona otro bloque disponible."`, manteniendo una única reserva activa en `padel.db`.

### Escenario 3: Restricción de Reserva Activa Única (User Story 3)
1. Con el Usuario A (`juan@padel.co`), que ya tiene activa la reserva de mañana de `14:00 - 15:00`, intentar reservar `"Cancha El Poblado"` para pasado mañana de `10:00 - 11:00`.
2. **Resultado esperado**: El sistema rechaza la segunda reserva con `409 Conflict` (`USER_ALREADY_HAS_ACTIVE_BOOKING`) e informa que solo puede tener 1 reserva activa a la vez hasta que finalice (`hora_fin <= hora_actual`) o la cancele.

### Escenario 4: Panel "Mis Reservas" y Cancelación con Anticipación >= 1 Hora (User Story 4)
1. Con el Usuario A, abrir la pestaña **"Mis Reservas"**.
2. **Resultado esperado**: Se visualizan dos secciones separadas: *Reservas Futuras Activas* (mostrando `Cancha Laureles`, mañana, `14:00 - 15:00`) e *Historial de Reservas Pasadas Completadas*.
3. Como faltan más de 60 minutos para el inicio del turno, pulsar **"Cancelar reserva"** y confirmar.
4. **Resultado esperado**:
   - La reserva se anula (`200 OK`).
   - Desaparece del panel "Mis Reservas" (las reservas canceladas se ocultan de ambas listas según FR-011).
   - Al volver a la grilla de `"Cancha Laureles"` para mañana, el bloque `14:00 - 15:00` figura inmediatamente como **`Disponible`**, y el Usuario A puede volver a agendar un turno.

### Escenario 5: Horario Operativo (`07:00 - 22:00`), Horarios Pasados y Bloqueo de Cancelación Tardía (< 1 Hora) (FR-006, FR-008 & FR-014)
1. En la grilla de disponibilidad, verificar las opciones listadas.
2. **Resultado esperado**: Solo aparecen 15 bloques (`07:00 - 08:00` a `21:00 - 22:00`); cualquier intento de reservar vía API fuera de ese rango (`startHour < 7` o `startHour > 21`) es rechazado con `400 Bad Request` (`OUTSIDE_OPERATING_HOURS`).
3. En la grilla del día de hoy, verificar los bloques cuya hora ya pasó.
4. **Resultado esperado**: Los bloques pasados se muestran bloqueados y el backend rechaza cualquier intento con `400 Bad Request` (`PAST_TIME_SLOT`).
5. Para una reserva cuyo inicio esté a menos de 60 minutos de la hora actual, verificar en "Mis Reservas".
6. **Resultado esperado**: El botón de cancelar aparece deshabilitado indicando la regla de 1 hora mínima de anticipación, y cualquier petición `DELETE /api/bookings/:id` retorna `400 Bad Request` (`CANCELLATION_WINDOW_EXPIRED`).
