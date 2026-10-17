# REST API Contract: Court Booking System

**Feature**: Court Booking System (`001-court-booking-system`)  
**Base URL**: `/api`  
**Format**: JSON (`application/json`)  
**Timezone Assumption**: Todas las fechas (`YYYY-MM-DD`) y horas (`0..23`) se evalúan en zona horaria `America/Bogota` (UTC-5).

---

## Reglas Globales del Contrato

1. **Autenticación Obligatoria (Principio III y FR-002)**:
   - Todos los endpoints bajo `/api/courts` y `/api/bookings` exigen sesión activa (cookie `HttpOnly` `token` o cabecera `Authorization: Bearer <jwt>`).
   - Cualquier petición sin sesión válida retorna `401 Unauthorized` con `{ "error": "Debes iniciar sesión para acceder a las reservas." }`.
2. **Manejo de Errores Semántico y Amigable (Constitution Rule)**:
   - Ninguna respuesta de error incluye *stack traces* ni mensajes crudos de SQLite.
   - Formato estándar de error:
     ```json
     {
       "error": "Mensaje amigable en español para mostrar en la interfaz",
       "code": "IDENTIFICADOR_INTERNO_OPCIONAL"
     }
     ```
   - Códigos HTTP semánticos obligatorios:
     - `200 OK` / `201 Created`: Operación exitosa.
     - `400 Bad Request`: Datos de entrada inválidos, fecha/hora en el pasado o cancelación con menos de 1 hora de anticipación.
     - `401 Unauthorized`: Credenciales inválidas o sesión inexistente/expirada.
     - `403 Forbidden`: Intento de cancelar o acceder a una reserva que pertenece a otro usuario (FR-003).
     - `404 Not Found`: Cancha o reserva inexistente.
     - `409 Conflict`: Colisión de horario (cancha ya reservada en ese bloque), usuario ya posee una reserva activa vigente, o correo electrónico ya registrado.

---

## 1. Autenticación (`/api/auth`)

### 1.1 `POST /api/auth/register`
Registra un nuevo usuario e inicia su sesión inmediatamente (FR-001).

**Request Body**:
```json
{
  "fullName": "Camila Restrepo",
  "email": "camila@ejemplo.com",
  "password": "password123"
}
```

**Validaciones**:
- `fullName`: string no vacío (mínimo 2 caracteres).
- `email`: formato de correo electrónico válido.
- `password`: mínimo 8 caracteres.

**Responses**:
- `201 Created`:
  ```json
  {
    "user": {
      "id": 1,
      "fullName": "Camila Restrepo",
      "email": "camila@ejemplo.com"
    },
    "token": "<jwt_token>"
  }
  ```
- `400 Bad Request`: `{ "error": "Por favor ingresa un nombre válido, un correo válido y una contraseña de al menos 8 caracteres." }`
- `409 Conflict`: `{ "error": "Ya existe una cuenta registrada con este correo electrónico." }`

---

### 1.2 `POST /api/auth/login`
Autentica a un usuario existente con correo electrónico y contraseña (FR-001).

**Request Body**:
```json
{
  "email": "camila@ejemplo.com",
  "password": "password123"
}
```

**Responses**:
- `200 OK`:
  ```json
  {
    "user": {
      "id": 1,
      "fullName": "Camila Restrepo",
      "email": "camila@ejemplo.com"
    },
    "token": "<jwt_token>"
  }
  ```
- `400 Bad Request`: `{ "error": "Debes ingresar tu correo electrónico y contraseña." }`
- `401 Unauthorized`: `{ "error": "Correo electrónico o contraseña incorrectos." }`

---

### 1.3 `POST /api/auth/logout`
Cierra la sesión activa limpiando la cookie de autenticación.

**Responses**:
- `200 OK`: `{ "message": "Sesión cerrada correctamente." }`

---

### 1.4 `GET /api/auth/me`
Verifica la sesión activa y retorna el perfil básico del usuario autenticado.

**Responses**:
- `200 OK`:
  ```json
  {
    "user": {
      "id": 1,
      "fullName": "Camila Restrepo",
      "email": "camila@ejemplo.com"
    }
  }
  ```
- `401 Unauthorized`: `{ "error": "Sesión no válida o expirada." }`

---

## 2. Catálogo y Disponibilidad de Canchas (`/api/courts`)

### 2.1 `GET /api/courts`
Retorna el catálogo cerrado e inmutable de 5 canchas (FR-004). Requiere autenticación (FR-002).

**Responses**:
- `200 OK`:
  ```json
  {
    "courts": [
      { "id": 1, "name": "Cancha Laureles" },
      { "id": 2, "name": "Cancha El Poblado" },
      { "id": 3, "name": "Cancha Belén" },
      { "id": 4, "name": "Cancha Robledo" },
      { "id": 5, "name": "Cancha Envigado" }
    ]
  }
  ```

---

### 2.2 `GET /api/courts/:courtId/availability?date=YYYY-MM-DD`
Retorna la grilla de 24 bloques horarios de 1 hora (00:00 a 24:00) para una cancha y fecha específicas, junto con el estado de reserva activa del usuario actual (FR-005, FR-006, FR-007, FR-008).

**Query Parameters**:
- `date` (obligatorio): Fecha en formato `YYYY-MM-DD` (debe ser igual o posterior a la fecha actual en `America/Bogota`).

**Responses**:
- `200 OK`:
  ```json
  {
    "court": {
      "id": 1,
      "name": "Cancha Laureles"
    },
    "date": "2026-10-18",
    "userHasActiveBooking": false,
    "slots": [
      {
        "startHour": 0,
        "endHour": 1,
        "label": "00:00 - 01:00",
        "status": "AVAILABLE",
        "isPast": false,
        "bookedByCurrentUser": false
      },
      {
        "startHour": 14,
        "endHour": 15,
        "label": "14:00 - 15:00",
        "status": "BOOKED",
        "isPast": false,
        "bookedByCurrentUser": true
      }
    ]
  }
  ```
- `400 Bad Request`: `{ "error": "La fecha seleccionada no es válida o pertenece al pasado." }`
- `404 Not Found`: `{ "error": "La cancha solicitada no existe en el catálogo." }`

---

## 3. Gestión de Reservas (`/api/bookings`)

### 3.1 `POST /api/bookings`
Crea una nueva reserva de 1 hora ejecutando validación atómica de no colisión y límite de 1 reserva activa por usuario (FR-008, FR-009, FR-010).

**Request Body**:
```json
{
  "courtId": 1,
  "bookingDate": "2026-10-18",
  "startHour": 14
}
```

**Reglas de Negocio Verificadas en Transacción Atómica (`IMMEDIATE`)**:
1. `courtId` existe en el catálogo cerrado (`1..5`).
2. `bookingDate` es formato `YYYY-MM-DD` válido y el bloque `startHour` (`0..23`) no ha iniciado ni transcurrido respecto a la hora actual en `America/Bogota`.
3. El usuario autenticado **no tiene otra reserva activa vigente** (`status = 'ACTIVE'` cuya `hora_fin > hora_actual`).
4. El bloque `(courtId, bookingDate, startHour)` **está libre** (`status = 'ACTIVE'` no existe para esa tupla).

**Responses**:
- `201 Created`:
  ```json
  {
    "message": "Reserva confirmada exitosamente.",
    "booking": {
      "id": 42,
      "userId": 1,
      "courtId": 1,
      "courtName": "Cancha Laureles",
      "bookingDate": "2026-10-18",
      "startHour": 14,
      "endHour": 15,
      "timeRangeLabel": "14:00 - 15:00",
      "canCancel": true,
      "createdAt": "2026-10-17T16:20:00.000Z"
    }
  }
  ```
- `400 Bad Request` (Horario pasado o parámetros inválidos):
  ```json
  {
    "error": "No es posible reservar en una fecha u horario que ya transcurrió.",
    "code": "PAST_TIME_SLOT"
  }
  ```
- `409 Conflict` (Colisión de horario - FR-009):
  ```json
  {
    "error": "La cancha ya fue reservada en este horario. Por favor selecciona otro bloque disponible.",
    "code": "SLOT_ALREADY_BOOKED"
  }
  ```
- `409 Conflict` (Usuario ya posee una reserva activa - FR-010):
  ```json
  {
    "error": "Ya tienes una reserva activa vigente. Debes esperar a que finalice o cancelarla antes de agendar un nuevo turno.",
    "code": "USER_ALREADY_HAS_ACTIVE_BOOKING"
  }
  ```

---

### 3.2 `GET /api/bookings/my`
Obtiene las reservas del usuario autenticado separadas en dos listas: reservas futuras/en curso activas e historial de reservas pasadas completadas. Las reservas canceladas se excluyen de ambas listas (FR-003, FR-011, FR-012).

**Responses**:
- `200 OK`:
  ```json
  {
    "activeBookings": [
      {
        "id": 42,
        "userId": 1,
        "courtId": 1,
        "courtName": "Cancha Laureles",
        "bookingDate": "2026-10-18",
        "startHour": 14,
        "endHour": 15,
        "timeRangeLabel": "14:00 - 15:00",
        "canCancel": true,
        "createdAt": "2026-10-17T16:20:00.000Z"
      }
    ],
    "pastBookings": [
      {
        "id": 15,
        "userId": 1,
        "courtId": 2,
        "courtName": "Cancha El Poblado",
        "bookingDate": "2026-10-10",
        "startHour": 18,
        "endHour": 19,
        "timeRangeLabel": "18:00 - 19:00",
        "canCancel": false,
        "createdAt": "2026-10-09T12:00:00.000Z"
      }
    ]
  }
  ```

---

### 3.3 `DELETE /api/bookings/:bookingId`
Cancela una reserva futura perteneciente al usuario autenticado, liberando inmediatamente el bloque en la grilla (FR-003, FR-013, FR-014).

**Reglas de Negocio Verificadas**:
1. La reserva existe y está en estado `ACTIVE`.
2. `booking.user_id === req.user.id` (de lo contrario retorna `403 Forbidden`).
3. Faltan **al menos 60 minutos (1 hora)** para la hora de inicio del turno (`start_timestamp - now_bogota >= 3600s`). Si falta menos de 1 hora o ya pasó, retorna `400 Bad Request`.

**Responses**:
- `200 OK`:
  ```json
  {
    "message": "Tu reserva ha sido cancelada y el horario ha quedado libre."
  }
  ```
- `400 Bad Request` (Menos de 1 hora de anticipación o turno pasado - FR-014):
  ```json
  {
    "error": "Solo puedes cancelar una reserva con al menos 1 hora de anticipación antes del inicio del turno.",
    "code": "CANCELLATION_WINDOW_EXPIRED"
  }
  ```
- `403 Forbidden` (Intento de cancelar reserva de otro usuario - FR-003):
  ```json
  {
    "error": "No tienes permiso para cancelar esta reserva.",
    "code": "FORBIDDEN_BOOKING_ACCESS"
  }
  ```
- `404 Not Found`:
  ```json
  {
    "error": "La reserva solicitada no existe o ya fue cancelada."
  }
  ```
