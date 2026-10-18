<!--
Sync Impact Report
- Version change: 1.0.0 → 1.0.1
- Modified principles:
  - I. Prevención de Colisiones (Double-Booking) - NON-NEGOTIABLE (refined for explicit rationale and testability)
  - II. Catálogo Cerrado y Bloques de 24 Horas (aligned with project nature and exact user input)
  - III. Autenticación Obligatoria (standardized declarative rules)
  - IV. Cero Código Sombra (Zero Shadow Code) (explicit reference to spec.md)
  - V. Fuente de la Verdad y Gobernanza SDD (explicit halt-and-warn workflow)
- Added sections:
  - Naturaleza del Proyecto (integrated under Core Principles preamble)
  - Explicit amendment procedure, semantic versioning policy, and compliance review expectations in Governance
- Removed sections: None
- Follow-up TODOs: None
-->
# Sistema de Reservas de Padel Constitution

Aplicación para la reserva de canchas de pádel cuyo propósito es permitir a los usuarios
autenticarse y gestionar reservas de tiempo en espacios específicos.

## Core Principles

### I. Prevención de Colisiones (Double-Booking) (NON-NEGOTIABLE)

Bajo ninguna circunstancia se DEBE escribir una reserva en la base de datos sin validar primero
que la cancha seleccionada esté libre en ese horario. Esta es la regla crítica e inmutable del
sistema para garantizar la integridad de la programación de canchas.

### II. Catálogo Cerrado y Bloques de Tiempo

El sistema SOLO DEBE manejar 5 canchas fijas e inmutables:

- Cancha Laureles
- Cancha El Poblado
- Cancha Belén
- Cancha Robledo
- Cancha Envigado

Las reservas DEBEN operar estrictamente en formato de 24 horas.

### III. Autenticación Obligatoria

Todo flujo de reserva EXIGE que haya un usuario con sesión activa antes de procesar o registrar
cualquier reserva de tiempo.

### IV. Cero Código Sombra (Shadow Code)

El agente de IA DEBE construir estrictamente lo documentado en `spec.md`. Queda prohibido añadir
características "por si acaso" (no pasarelas de pago, no perfiles complejos, ni funcionalidades
no especificadas).

### V. Fuente de la Verdad (Reglas SDD)

Si una instrucción del usuario contradice esta constitución o si se detecta una falla lógica, el
agente de IA DEBE detenerse inmediatamente, advertir del problema y solicitar actualizar el
`spec.md` antes de tocar el código fuente.

## Stack Tecnológico y Reglas de Implementación

- **Frontend / UI:** React. Se DEBE usar Tailwind CSS para los estilos.
- **Backend:** Node.js con Express.
- **Base de Datos:** SQLite local (archivo `padel.db`). NO se DEBEN usar ORMs pesados para
  mantener la simplicidad; se DEBE usar `better-sqlite3` o sentencias SQL puras.
- **Lenguaje:** TypeScript en todo el stack.

## Estructura, Estilo de Código y Manejo de Errores

- **Estructura Plana:** Evitar la sobreingeniería. NO implementar "Clean Architecture" ni
  patrones complejos. Usar una estructura simple: `/frontend`, `/backend`, y `/db`.
- **Estilo:** Priorizar la programación funcional y los componentes funcionales (Hooks en React).
  Evitar el uso de clases a menos que sea obligatorio.
- **Nomenclatura:** Usar `camelCase` para funciones/variables y `PascalCase` para Interfaces/Tipos.
- **UI (Manejo de Errores):** Nunca exponer errores crudos o *stack traces* al usuario final. Todo
  error técnico DEBE traducirse a un mensaje amigable (ej: "La cancha ya fue reservada en este
  horario").
- **Backend (Códigos HTTP):** Retornar siempre códigos de estado HTTP semánticos (`400` petición
  inválida, `401` no autenticado, `409` conflicto de reserva).

## Governance

Esta constitución prevalece sobre cualquier otra práctica, decisión técnica o instrucción ad-hoc.

- **Procedimiento de Enmienda:** Cualquier cambio a las reglas de dominio, stack o arquitectura
  requiere actualizar explícitamente `.specify/memory/constitution.md` y sincronizar `spec.md`
  antes de modificar el código fuente.
- **Política de Versionado:** Se aplica versionado semántico (`MAJOR.MINOR.PATCH`):
  - `MAJOR`: Eliminación o redefinición incompatible de principios o reglas inmutables.
  - `MINOR`: Adición de nuevos principios o expansión material de reglas técnicas.
  - `PATCH`: Clarificaciones de redacción, formato o refinamientos no semánticos.
- **Revisión de Cumplimiento:** Todo plan (`plan.md`), especificación (`spec.md`) e implementación
  de código DEBE verificar el cumplimiento estricto de estos principios antes de darse por
  completado.

**Version**: 1.0.1 | **Ratified**: 2026-10-16 | **Last Amended**: 2026-10-16
