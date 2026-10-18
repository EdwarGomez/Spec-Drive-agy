# Feature Specification: Court Booking System (Sistema de Reserva de Canchas)

**Feature Branch**: `001-court-booking-system`

**Created**: 2026-10-17

**Status**: Draft

**Input**: User description: "Sistema de reservas de canchas de pádel con autenticación de usuarios, catálogo cerrado de 5 canchas en Medellín, visualización de grilla en formato de 24 horas con 15 bloques de 1 hora (de 07:00 a 22:00, excluyendo de 22:00 a 07:00), prevención crítica de colisiones (double-booking), límite de una reserva activa por usuario y gestión de reservas personales (historial y cancelación)."

## Clarifications

### Session 2026-10-17

- Q: ¿Con cuánta anticipación mínima debe un usuario cancelar su reserva para que sea permitida? (FR-013) → A: Con al menos 1 hora de anticipación antes del inicio del turno (Opción B).
- Q: ¿Exactamente en qué momento una reserva deja de contarse como "activa" para permitir que el usuario agende un nuevo turno? (FR-010) → A: Al finalizar el turno de 1 hora (`hora_fin <= hora_actual`) (Opción A).
- Q: ¿Con cuántos días de anticipación como máximo puede un usuario consultar y reservar una cancha en el calendario? (FR-005) → A: Sin límite de anticipación (cualquier fecha futura es válida) (Opción A).
- Q: ¿Cómo deben visualizarse las reservas que fueron canceladas por el usuario dentro del panel "Mis Reservas"? (FR-011) → A: Se ocultan del panel tras cancelarse (solo se listan reservas futuras activas y pasadas completadas) (Opción A).
- Q: ¿Qué datos se deben solicitar y validar en el formulario de registro de nuevos usuarios? (FR-001) → A: Nombre completo, correo electrónico válido y contraseña (mínimo 8 caracteres) (Opción A).
- Q: ¿Cuál debe ser exactamente el primer y el último bloque de 1 hora disponible en la grilla diaria (manteniendo el formato de 24 horas de la constitución)? (FR-006) → A: De 07:00 a 22:00 como hora de cierre (15 bloques diarios: primer turno `07:00 - 08:00` y último turno `21:00 - 22:00`; no aparecen ni se permiten bloques entre las `22:00` y las `07:00`) (Opción A).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Exploración y Reserva con Prevención de Colisión (Priority: P1)

Como jugador registrado con sesión activa, quiero seleccionar una cancha del catálogo cerrado, elegir una fecha y un bloque de 1 hora disponible para confirmar mi reserva sin riesgo de que otra persona tome el mismo turno al mismo tiempo.

**Why this priority**: Es el flujo central de valor del negocio. Sin la capacidad de reservar y la garantía de no colisión de horarios, el sistema no cumple su función principal.

**Independent Test**: Un usuario autenticado selecciona Cancha Laureles para una fecha futura a las 10:00, confirma la reserva y el bloque pasa inmediatamente a estado "Reservado", impidiendo que cualquier otro usuario lo reserve.

**Acceptance Scenarios**:

1. **Given** un usuario autenticado sin reservas activas en la grilla de disponibilidad, **When** selecciona un bloque "Disponible" (ej. 14:00 a 15:00) y confirma la reserva, **Then** el sistema confirma la reserva, el bloque cambia visualmente a "Reservado" y se descuenta la disponibilidad.
2. **Given** dos usuarios intentando reservar el mismo bloque horario casi al mismo tiempo, **When** el primer usuario confirma exitosamente y el segundo intenta confirmar instantes después, **Then** el sistema del segundo usuario rechaza la transacción con un mensaje claro indicando que el horario ya no está disponible y actualiza la vista.
3. **Given** un usuario visualizando la grilla, **When** intenta seleccionar un horario o fecha que ya transcurrió en el tiempo, **Then** el sistema no permite la selección y bloquea la acción.

---

### User Story 2 - Autenticación y Control de Acceso (Priority: P1)

Como nuevo usuario o usuario existente, quiero registrarme (con nombre completo, correo electrónico y contraseña) e iniciar sesión (con correo electrónico y contraseña) para acceder a la disponibilidad completa de las canchas y realizar reservas.

**Why this priority**: Es un principio constitucional del sistema. Nadie puede ver la disponibilidad completa ni agendar reservas sin estar debidamente identificado.

**Independent Test**: Un visitante no autenticado intenta ingresar al sistema de reservas y es redirigido al formulario de inicio de sesión/registro; una vez autenticado, accede a la grilla y a sus opciones personales.

**Acceptance Scenarios**:

1. **Given** un visitante no autenticado, **When** proporciona su nombre completo, un correo electrónico válido y una contraseña de mínimo 8 caracteres para registrarse, **Then** el sistema crea la cuenta, inicia su sesión y le permite acceder a la grilla de canchas.
2. **Given** un usuario con sesión activa, **When** consulta las canchas, **Then** puede ver la disponibilidad completa y sus reservas asociadas.
3. **Given** un usuario autenticado, **When** intenta consultar o cancelar reservas que pertenecen a otro usuario, **Then** el sistema prohíbe el acceso y solo expone sus propios datos.

---

### User Story 3 - Restricción de Reserva Activa Única (Priority: P2)

Como administrador del club, quiero que cada usuario pueda tener únicamente una (1) reserva activa a la vez para garantizar un acceso equitativo a las canchas para toda la comunidad.

**Why this priority**: Evita el acaparamiento de turnos por parte de un solo usuario y fomenta la rotación justa de los espacios.

**Independent Test**: Un usuario que ya tiene una reserva confirmada para mañana a las 16:00 intenta reservar otro turno para el fin de semana; el sistema rechaza la solicitud informando que ya posee una reserva activa.

**Acceptance Scenarios**:

1. **Given** un usuario que ya cuenta con una reserva futura o en curso activa, **When** intenta confirmar una nueva reserva en cualquier cancha, **Then** el sistema rechaza la solicitud y muestra un mensaje indicando que debe completar o cancelar su reserva previa antes de reservar de nuevo.
2. **Given** un usuario cuya reserva previa ya culminó en el tiempo (`hora_fin <= hora_actual`, pasando al historial de pasadas), **When** solicita una nueva reserva, **Then** el sistema le permite reservar normalmente.

---

### User Story 4 - Gestión y Cancelación de "Mis Reservas" (Priority: P2)

Como usuario que ha realizado una reserva, quiero revisar en un panel personal mis turnos agendados y tener la posibilidad de cancelar una reserva futura si no puedo asistir.

**Why this priority**: Brinda autonomía al usuario para controlar sus compromisos y permite liberar cupos para otros jugadores si hay cancelaciones.

**Independent Test**: Un usuario entra a su sección "Mis Reservas", visualiza su reserva activa para las 18:00 (faltando más de 1 hora), pulsa "Cancelar", confirma la acción y el horario queda inmediatamente liberado como "Disponible" en la grilla general.

**Acceptance Scenarios**:

1. **Given** un usuario autenticado en su panel "Mis Reservas", **When** consulta la sección, **Then** visualiza dos listas separadas: reservas futuras activas e historial de reservas pasadas completadas (excluyendo las reservas canceladas), indicando cancha, fecha y horario.
2. **Given** un usuario con una reserva futura en su panel con al menos 1 hora de anticipación antes del inicio del turno, **When** selecciona cancelar y confirma la acción, **Then** la reserva queda anulada, se oculta del panel "Mis Reservas" y el bloque horario se vuelve a mostrar disponible en la grilla para otros usuarios.
3. **Given** una reserva que ya transcurrió en el tiempo o para la cual falta menos de 1 hora antes de su inicio, **When** el usuario la consulta o intenta cancelarla, **Then** el sistema bloquea o deshabilita la cancelación e informa la restricción si aplica.

---

### Edge Cases

- **Intento de reserva simultánea (Race Condition / Concurrencia)**: Si dos usuarios abren el mismo bloque disponible al mismo tiempo, el sistema re-valida la disponibilidad antes de confirmar la escritura. El que complete primero gana el turno; el segundo recibe una notificación de conflicto y el bloque se actualiza como reservado.
- **Cambio de fecha u hora del sistema durante la navegación**: Si el usuario mantiene la pantalla abierta hasta que un horario disponible pase a ser pasado, la validación final rechaza la reserva si el horario ya transcurrió.
- **Intento de manipular el identificador de usuario**: El sistema valida que el usuario solo pueda cancelar reservas donde su identidad coincida estrictamente con la del creador de la reserva.
- **Cierre inesperado de sesión**: Si la sesión caduca mientras el usuario explora la grilla, el intento de confirmación exige re-autenticación antes de proceder.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE permitir a los usuarios registrarse proporcionando nombre completo, correo electrónico válido y contraseña (mínimo 8 caracteres), e iniciar sesión utilizando su correo electrónico y contraseña.
- **FR-002**: El sistema DEBE restringir la visualización de la disponibilidad completa y la creación de reservas exclusivamente a usuarios con sesión activa.
- **FR-003**: El sistema DEBE restringir el acceso a la gestión de reservas para que cada usuario solo pueda visualizar y cancelar sus propias reservas.
- **FR-004**: El sistema DEBE exponer un catálogo cerrado e inmutable compuesto exactamente por 5 canchas: "Cancha Laureles", "Cancha El Poblado", "Cancha Belén", "Cancha Robledo" y "Cancha Envigado".
- **FR-005**: El sistema DEBE permitir seleccionar cualquier fecha actual o futura (sin límite máximo de días de anticipación) en un calendario interactivo para consultar la disponibilidad y reservar la cancha elegida.
- **FR-006**: El sistema DEBE mostrar una grilla de horarios en formato estricto de 24 horas dividida en 15 bloques enteros de 1 hora entre las 07:00 y las 22:00 (primer turno de `07:00` a `08:00`, último turno de `21:00` a `22:00`), ocultando de las opciones e impidiendo reservas en los rangos horarios entre las `22:00` y las `07:00`.
- **FR-007**: El sistema DEBE señalar claramente el estado de cada bloque horario como "Disponible" o "Reservado".
- **FR-008**: El sistema DEBE impedir la selección o confirmación de reservas en fechas y horas que pertenezcan al pasado.
- **FR-009 (CRÍTICO - Prevención de Colisiones)**: El sistema DEBE re-validar que el bloque horario continúe libre inmediatamente antes de asentar la reserva; si el bloque fue tomado por otro usuario, la transacción DEBE rechazarse con un mensaje explicativo y sin inconsistencias de datos.
- **FR-010**: El sistema DEBE impedir que un usuario confirme una reserva si ya cuenta con una reserva activa vigente, considerándose activa hasta que finalice el bloque de 1 hora (`hora_fin > hora_actual`) y no haya sido cancelada (regla de máximo 1 reserva activa por usuario).
- **FR-011**: El sistema DEBE proveer un panel "Mis Reservas" con la separación de reservas futuras activas e historial de reservas pasadas completadas (las reservas canceladas se ocultan de ambas listas).
- **FR-012**: Cada registro en el panel de reservas DEBE mostrar el nombre de la cancha, la fecha y el horario reservado.
- **FR-013**: El sistema DEBE permitir al usuario cancelar una reserva futura desde su panel únicamente con al menos 1 hora de anticipación antes de la hora de inicio del turno, liberando de forma inmediata el bloque horario para que otros usuarios puedan reservarlo.
- **FR-014 (Complemento de FR-013)**: Cuando falte menos de 1 hora antes de la hora de inicio del turno o la reserva pertenezca al pasado, el sistema DEBE deshabilitar la opción de cancelación en la interfaz y rechazar cualquier solicitud de cancelación en el servidor.
- **FR-015 (Non-Goals explícitos)**: El sistema NO DEBE incluir pasarelas de pago, paneles administrativos de creación de canchas, notificaciones externas por email/SMS/WhatsApp, reservas continuas multidía/multihra en un solo clic, ni módulos de emparejamiento (matchmaking).

### Key Entities *(include if feature involves data)*

- **Usuario (User)**:
  - Representa al jugador registrado en la plataforma.
  - Atributos clave: Identificador único, nombre completo, correo electrónico único, credenciales seguras de acceso, fecha de registro.
  - Relación: Puede tener asociadas múltiples reservas a lo largo del tiempo, pero máximo una en estado activa (`hora_fin > hora_actual`).

- **Cancha (Court)**:
  - Representa uno de los 5 espacios deportivos físicos disponibles.
  - Atributos clave: Identificador único, nombre inmutable ("Cancha Laureles", "Cancha El Poblado", "Cancha Belén", "Cancha Robledo", "Cancha Envigado").
  - Relación: Posee una grilla operativa de 15 bloques de tiempo de 1 hora por cada día calendario (de `07:00` a `22:00` en formato 24 horas).

- **Reserva (Booking)**:
  - Representa la asignación exclusiva de un bloque horario de 1 hora en una cancha y fecha específicas a un usuario.
  - Atributos clave: Identificador único, usuario asociado, cancha asociada, fecha calendario, hora de inicio (formato 24h, de `07:00` a `21:00`), hora de fin (de `08:00` a `22:00`), estado (activa mientras `hora_fin > hora_actual` y no cancelada; completada cuando `hora_fin <= hora_actual`; cancelada), fecha y hora de creación.
  - Relación: Vincula exactamente a un Usuario con una Cancha en un intervalo de tiempo indivisible.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Cero incidencias de colisión o reservas duplicadas (double-booking) en pruebas de concurrencia y operación diaria (100% de integridad garantizada).
- **SC-002**: Un usuario puede explorar la grilla, seleccionar un bloque disponible y completar una reserva en menos de 60 segundos.
- **SC-003**: El 100% de las cancelaciones de reservas futuras reflejan la liberación inmediata del bloque en la grilla sin requerir recargas forzadas ni esperas mayores a 1 segundo.
- **SC-004**: El sistema rechaza el 100% de los intentos de reserva simultánea o reservas secundarias no autorizadas, informando con mensajes comprensibles para el usuario.
- **SC-005**: 100% de cumplimiento con el catálogo cerrado de 5 canchas y la visualización en formato de 24 horas de los 15 bloques unitarios de 1 hora (de `07:00` a `22:00`), sin exponer opciones ni permitir reservas entre las `22:00` y las `07:00`.

## Assumptions

- **Gestión de Pagos**: Los cobros por alquiler de canchas se efectúan de manera presencial en la sede deportiva del club, por lo que el sistema no valida estados de pago financiero.
- **Zona Horaria**: Todas las fechas y horas se gestionan bajo la hora legal de Colombia (UTC-5 / America/Bogota), correspondiente a la ubicación de las canchas en Medellín y el Valle de Aburrá.
- **Duración Fija y Horario Operativo**: Todos los turnos tienen una duración exacta de 60 minutos e inician en punto dentro del horario operativo de `07:00` a `22:00` (primer turno `07:00 - 08:00`, último turno `21:00 - 22:00`).
- **Conectividad**: Los usuarios disponen de un navegador web moderno con conexión a internet para interactuar con la plataforma.
