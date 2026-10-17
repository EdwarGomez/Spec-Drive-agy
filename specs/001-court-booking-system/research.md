# Phase 0: Research & Technical Decisions

**Feature**: Court Booking System (`001-court-booking-system`)  
**Date**: 2026-10-17

## 1. Prevención de Colisiones (Double-Booking) en SQLite (`better-sqlite3`)

- **Decision**: Implementar bloqueo atómico en base de datos combinando un **Índice Único Parcial** en SQLite y transacciones inmediatas (`db.transaction(...).immediate()`) en `better-sqlite3`.
- **Rationale**:
  - `better-sqlite3` opera de manera síncrona en el hilo principal de Node.js, lo que serializa naturalmente las ejecuciones de funciones transaccionales dentro de un mismo proceso.
  - Además, definir `CREATE UNIQUE INDEX idx_active_court_slot ON bookings(court_id, booking_date, start_hour) WHERE status = 'ACTIVE'` garantiza a nivel de motor de base de datos que jamás puedan existir dos reservas activas para la misma cancha, fecha y hora, incluso si un turno fue previamente reservado y luego cancelado (`status = 'CANCELLED'`).
  - Al ejecutar la verificación de disponibilidad + verificación de reserva activa única del usuario + inserción dentro de `db.transaction()`, cualquier colisión arroja o retorna un código de conflicto controlado (`409 Conflict`) en menos de 5ms.
- **Alternatives considered**:
  - *Verificación `SELECT` asíncrona seguida de `INSERT` sin transacción*: Rechazada porque en entornos asíncronos permite condiciones de carrera (TOCTOU - Time-Of-Check to Time-Of-Use).
  - *Constraint `UNIQUE(court_id, booking_date, start_hour)` estándar*: Rechazada porque impediría volver a reservar un bloque que fue cancelado previamente si se conserva el registro con estado `CANCELLED` para trazabilidad en base de datos, o bien obligaría a hacer `DELETE` físico. Con el índice único parcial (`WHERE status = 'ACTIVE'`), se soporta tanto trazabilidad como re-reserva limpia.

## 2. Regla de Reserva Activa Única y Criterio Temporal (`America/Bogota`)

- **Decision**: Evaluar la vigencia de una reserva calculando la marca de tiempo actual en zona horaria `America/Bogota` (UTC-5) y comparando contra la fecha y `end_hour` de las reservas con `status = 'ACTIVE'`.
- **Rationale**:
  - Según `spec.md` (FR-010 y Clarifications), una reserva deja de contarse como activa exactamente cuando finaliza su bloque de 1 hora (`hora_fin <= hora_actual`).
  - Colombia (Medellín) utiliza `UTC-5` todo el año sin horario de verano (DST). Al formatear el instante actual en `America/Bogota` a `YYYY-MM-DD` y hora entera `0..23` (o timestamp ISO local), se determina de forma determinista si una reserva sigue activa (`booking_date > currentDate OR (booking_date = currentDate AND end_hour > currentHourDecimal)`), sin depender de tareas cron en segundo plano para cambiar estados.
- **Alternatives considered**:
  - *Cron job cada hora para actualizar `status = 'COMPLETED'`*: Rechazada como mecanismo primario porque introduce retrasos de sincronización si el job falla o se retrasa por segundos. En su lugar, el estado efectivo ("Activa" vs "Completada") se evalúa dinámicamente en las consultas y validaciones según `hora_fin` vs `hora_actual`, manteniendo exactitud al milisegundo.

## 3. Autenticación y Manejo de Sesiones

- **Decision**: Utilizar autenticación basada en **JWT firmado (`jsonwebtoken`) en cookie `HttpOnly` (o header `Authorization: Bearer`)** acompañado de hashing de contraseñas con **`bcryptjs`** (o `node:crypto` `scrypt`).
- **Rationale**:
  - Cumple estrictamente con el Principio III (Autenticación Obligatoria) y FR-001/FR-002/FR-003.
  - Usar `node:crypto` (`scryptSync` + `randomBytes`) o `bcryptjs` evita dependencias nativas pesadas adicionales, manteniendo el stack liviano.
  - El token incluye únicamente `{ userId, email, fullName }` y es validado por un middleware plano en Express (`requireAuth`) que inyecta `req.user` y devuelve `401 Unauthorized` si no es válido.
- **Alternatives considered**:
  - *OAuth2 / Firebase Auth / Auth0*: Rechazado por violar el principio de simplicidad local y requerir servicios externos no especificados en `spec.md`.
  - *Sesiones en memoria sin persistencia*: Rechazado porque al reiniciar el servidor de desarrollo se perderían todas las sesiones activas.

## 4. Regla de Cancelación con 1 Hora de Anticipación

- **Decision**: Validar en el backend antes de cancelar que `(timestamp_inicio_reserva - timestamp_actual) >= 3600 segundos (1 hora)` y reflejar el mismo cálculo en el frontend para deshabilitar el botón de cancelación.
- **Rationale**:
  - Cumple FR-013 y FR-014. Si un turno inicia a las `18:00`, el usuario puede cancelarlo hasta las `17:00:00` inclusive. Si faltan menos de 60 minutos, el backend rechaza con `400 Bad Request` (o `409 Conflict`) y mensaje amigable.
  - Al cancelar, el registro cambia a `status = 'CANCELLED'`. En el panel "Mis Reservas" (FR-011), la consulta filtra `WHERE status = 'ACTIVE'` y clasifica en *Futuras Activas* (`hora_fin > hora_actual`) y *Pasadas Completadas* (`hora_fin <= hora_actual`), ocultando las canceladas tal como se especificó en la sesión de clarificación.
- **Alternatives considered**:
  - *Borrado físico (`DELETE FROM bookings`)*: Funciona igualmente bien con el requisito de ocultar canceladas del panel "Mis Reservas" y liberar el bloque en la grilla. Sin embargo, actualizar `status = 'CANCELLED'` con el índice parcial `WHERE status = 'ACTIVE'` permite auditar en pruebas que la cancelación ocurrió sin afectar la liberación inmediata del bloque ni la vista del usuario.

## 5. Arquitectura Plana y Stack Frontend/Backend/DB

- **Decision**: Monorepo ligero con tres carpetas de nivel superior (`/db`, `/backend`, `/frontend`), TypeScript en ambos extremos, Vite + React + Tailwind CSS en `/frontend`, y Express + `better-sqlite3` + `vitest`/`supertest` en `/backend`.
- **Rationale**:
  - Respeta de forma literal la sección *Estructura, Estilo de Código y Manejo de Errores* de `constitution.md`: *"NO implementar Clean Architecture ni patrones complejos. Usar una estructura simple: `/frontend`, `/backend`, y `/db`"*.
  - Programación funcional pura (funciones exportadas y React Hooks).
- **Alternatives considered**:
  - *Next.js / Remix fullstack*: Rechazado porque la constitución exige explícitamente separar `/frontend` (React + Tailwind) y `/backend` (Node.js con Express).
