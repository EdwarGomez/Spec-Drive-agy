# Guía Paso a Paso de Comandos de Consola: Spec-Driven Development (SDD)

Esta guía recopila la **secuencia cronológica y lógica completa** de comandos de consola para ejecutar un proyecto bajo la metodología **Spec-Driven Development (SDD)** utilizando **Spec Kit (GitHub)** y **Antigravity CLI (`agy`)**.

---

## Índice de Fases

1. [Fase 0: Instalación de Herramientas y Entorno](#fase-0-instalación-de-herramientas-y-entorno)
2. [Fase 1: Inicialización del Proyecto con Spec Kit y agy](#fase-1-inicialización-del-proyecto-con-spec-kit-y-agy)
3. [Fase 2: Control de Versiones y Constitución del Proyecto](#fase-2-control-de-versiones-y-constitución-del-proyecto)
4. [Fase 3: Especificación Funcional (`/speckit-specify`)](#fase-3-especificación-funcional-speckit-specify)
5. [Fase 4: Clarificación y Resolución de Ambigüedades (`/speckit-clarify`)](#fase-4-clarificación-y-resolución-de-ambigüedades-speckit-clarify)
6. [Fase 5: Planificación Técnica y Arquitectura (`/speckit-plan`)](#fase-5-planificación-técnica-y-arquitectura-speckit-plan)
7. [Fase 6: Desglose de Tareas Atómicas y Análisis (`/speckit-tasks`)](#fase-6-desglose-de-tareas-atómicas-y-análisis-speckit-tasks)
8. [Fase 7: Implementación de Código Asistida por IA (`/speckit-implement`)](#fase-7-implementación-de-código-asistida-por-ia-speckit-implement)
9. [Fase 8: Puesta en Marcha y Validación de la Aplicación](#fase-8-puesta-en-marcha-y-validación-de-la-aplicación)
10. [Fase 9: Auditoría y Detección de Divergencias (`/speckit-converge`)](#fase-9-auditoría-y-detección-de-divergencias-speckit-converge)
11. [Fase 10: Solicitudes de Cambio (Change Requests) sin Spec Drift](#fase-10-solicitudes-de-cambio-change-requests-sin-spec-drift)

---

## Fase 0: Instalación de Herramientas y Entorno

Antes de comenzar, asegúrate de tener instalado:
- **Git** (control de versiones obligatorio).
- **Python 3.11+** y el administrador de paquetes **`uv`**.
- **Node.js LTS** (v20 o superior) y **npm**.

```powershell
# 1. Instalar la herramienta CLI de Spec Kit mediante uv
uv tool install --link-mode copy specify-cli

# 2. Verificar que specify esté disponible en tu terminal
specify --help
```

---

## Fase 1: Inicialización del Proyecto con Spec Kit y agy

Creamos la estructura del proyecto configurada específicamente para la integración con **Antigravity CLI (`agy`)**.

```powershell
# 1. Inicializar el proyecto con el preset agy de forma no interactiva
specify init my-project --integration agy --non-interactive

# 2. Navegar al directorio raíz del proyecto
cd my-project
```

> **Resultado**: Se crea la carpeta `.specify/` con los templates (`constitution-template.md`, `spec-template.md`, `plan-template.md`, `tasks-template.md`, `checklist-template.md`) y las skills en `.agents/skills/`.

---

## Fase 2: Control de Versiones y Constitución del Proyecto

La constitución establece las **reglas inquebrantables** (stack, catálogo cerrado, prevención de colisiones, cero código sombra).

```powershell
# 1. Inicializar el repositorio Git local
git init

# 2. Revisar los archivos sin trackear
git status

# 3. Crear y situarse en la rama de la constitución
git checkout -b "constitucion"

# 4. Iniciar Antigravity CLI
agy
```

Dentro del prompt interactivo de **`agy`**:
```text
/speckit-constitution
```
*(Pegar el texto de la constitución del proyecto ubicado en `recursos/constitution.md`)*.

Una vez generado `.specify/memory/constitution.md`:
```powershell
# 5. Guardar el checkpoint en Git
git add .
git commit -m "constitucion del proyecto"
git status
```

---

## Fase 3: Especificación Funcional (`/speckit-specify`)

Traduce las necesidades de negocio en un archivo de especificación estandarizado (`spec.md`) utilizando **Given-When-Then** y sintaxis **EARS**.

```powershell
# 1. Crear y cambiarse a la rama de spec
git checkout -b "spec"

# 2. Abrir Antigravity CLI
agy
```

Dentro del prompt de **`agy`**:
```text
/speckit-specify
```
*(Pasar la descripción de requerimientos de negocio de `recursos/SPEC OK.md`)*.

Al terminar de generar `specs/001-court-booking-system/spec.md`:
```powershell
# 3. Guardar el checkpoint en Git
git add .
git commit -m "spec del proyecto"
git status
```

---

## Fase 4: Clarificación y Resolución de Ambigüedades (`/speckit-clarify`)

Somete la especificación a un interrogatorio técnico para resolver vacíos y ambigüedades antes de planear o programar.

```powershell
# 1. Crear y posicionarse en la rama clarify
git checkout -b "clarify"

# 2. Iniciar Antigravity CLI
agy
```

Dentro de **`agy`**:
```text
/speckit-clarify
```
*(El agente formulará preguntas interactivas sobre: duración de sesión, visibilidad para visitantes sin login, manejo de reservas canceladas en el historial, longitud mínima de contraseñas, etc.)*.

Al finalizar la ronda de clarificación:
```powershell
# 3. Revisar las diferencias generadas en spec.md
git diff

# 4. Guardar los cambios clarificados en Git
git add .
git commit -m "clarify"
git status
```

---

## Fase 5: Planificación Técnica y Arquitectura (`/speckit-plan`)

Convierte el *qué* de la especificación en el *cómo* técnico (arquitectura, modelos de datos, contratos API y constitution check).

```powershell
# 1. Crear y cambiarse a la rama plan
git checkout -b "plan"

# 2. Abrir Antigravity CLI
agy
```

Dentro de **`agy`**:
```text
/speckit-plan
```
*(Genera `plan.md`, `research.md`, `data-model.md`, `contracts/rest-api.md` y `quickstart.md` dentro de `specs/001-court-booking-system/`)*.

```powershell
# 3. Confirmar los artefactos del plan en Git
git status
git add .
git commit -m "plan"
```

---

## Fase 6: Desglose de Tareas Atómicas y Análisis (`/speckit-tasks`)

Atomiza el plan técnico en tareas concretas agrupadas por fases secuenciales con dependencias y etiquetas `#p` (paralelizables).

```powershell
# 1. Crear y situarse en la rama tasks
git checkout -b "tasks"

# 2. Iniciar Antigravity CLI
agy
```

Dentro de **`agy`**:
```text
/speckit-tasks
/speckit-analyze
```
*(Genera `tasks.md` y valida la consistencia entre spec, plan y tareas)*.

```powershell
# 3. Guardar las tareas en Git
git status
git add .
git commit -m "tasks"
git branch
```

---

## Fase 7: Implementación de Código Asistida por IA (`/speckit-implement`)

El agente lee `tasks.md` y genera el código fuente completo respetando la constitución (cero código sombra).

```powershell
# 1. Crear y situarse en la rama implement
git checkout -b "implement"

# 2. Iniciar Antigravity CLI
agy
```

Dentro de **`agy`**:
```text
/speckit-implement
```
*(Construye las carpetas `/backend`, `/frontend`, `/db` y la base de datos `padel.db`)*.

```powershell
# 3. Confirmar la implementación en Git
git status
git add .
git commit -m "implement"
```

---

## Fase 8: Puesta en Marcha y Validación de la Aplicación

Ejecución de pruebas y despliegue del entorno local guiado por `quickstart.md`.

```powershell
# 1. Instalar dependencias del backend y frontend (si no se instalaron previamente)
npm --prefix backend install
npm --prefix frontend install

# 2. Ejecutar la suite de pruebas automatizadas (Vitest)
npm --prefix backend test

# 3. Iniciar el servidor Backend (Terminal 1)
npm --prefix backend run dev
# -> Activo en http://localhost:3001

# 4. Iniciar el servidor Frontend (Terminal 2)
npm --prefix frontend run dev
# -> Activo en http://localhost:5173
```

Abrir el navegador web en:
👉 **`http://localhost:5173`**

---

## Fase 9: Auditoría y Detección de Divergencias (`/speckit-converge`)

Valida el comportamiento de la aplicación y detecta si el código generado diverge de los contratos definidos en `spec.md`.

```powershell
# 1. Desde la raíz de my-project, abrir agy
agy
```

Dentro de **`agy`**:
```text
/speckit-converge
```
*(Analiza el repositorio contra la especificación y reporta si hay diferencias o trabajo pendiente)*.

---

## Fase 10: Solicitudes de Cambio (Change Requests) sin Spec Drift

Cuando el negocio solicita una modificación (ejemplo: cambiar la grilla de disponibilidad de 24 horas para que opere únicamente de 7:00 a.m. a 10:00 p.m.), **el cambio entra por la especificación, nunca por el código**.

```powershell
# 1. Crear una rama dedicada a la solicitud de cambio
git branch
git checkout -b "cr-horario-01"

# 2. Iniciar Antigravity CLI
agy
```

Dentro de **`agy`**, ejecutar la cadena de propagación en orden:
```text
# Paso 1: Propagar el cambio a la especificación
/speckit-clarify Necesito que la grilla de horarios disponibles solo sea de 7AM a 10PM, los rangos de 10PM a 6AM no deben aparecer en las opciones

# Paso 2: Regenerar el plan técnico con el cambio
/speckit-plan

# Paso 3: Regenerar las tareas atómicas
/speckit-tasks

# Paso 4: Validar coherencia
/speckit-analyze

# Paso 5: Implementar el código actualizado
/speckit-implement
```

Una vez completado:
```powershell
# 3. Validar con pruebas automatizadas
npm --prefix backend test

# 4. Confirmar los cambios del Change Request en Git
git status
git add .
git commit -m "cr-horario-01: ajuste de grilla 7am a 10pm"
```
