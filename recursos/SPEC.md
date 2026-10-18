Feature: Creacion de Reservas

1 . Intencion:

Permitir a los usuarios autenticados agendar un bloque de tiempo, garantizando que el sistema no asigne el mismo turno a dos personas.

2 . Comportamiento:

- El usuario selecciona un bloque marcado como "Disponible" y confirma la accion.
- El sistema asigna el bloque al usuario y actualiza la grilla en tiempo real.

3 . Restricciones:

- Prevencion de Colision:
El sistema DEBE validar la disponibilidad en la base de datos antes de guardar. Si dos usuarios intentan reservar el mismo bloque al mismo milisegundo, el segundo DEBE recibir un error de conflicto.
- Regla de Tiempo:
No se pueden realizar reservas en fechas u horarios del pasado.
- Formato:
Las reservas son estrictamente en bloques enteros de 1 hora.

4 . No-Objetivos:

- No se programara pasarela de pagos integrada (se paga en el club).
- No se enviaran correos ni SMS de confirmacion
