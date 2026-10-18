## Resumen de CLASES

### Clase 1: Spec-driven development frente al vibe coding

Aprender a programar hoy es una ventaja competitiva, pero el verdadero factor diferenciador está en el spec-driven development: guiar a la inteligencia artificial para que cree software mantenible, escalable y entendible. Este contenido es para quien quiere pasar de hacer demos a construir productos reales.

Por qué el vibe coding no basta para software real

Hacer vibe coding es divertido y produce demos increíbles, pero deja preguntas incómodas sin responder. Y aquí viene lo interesante: la mayoría de esas respuestas suelen ser un no.

Antes de seguir, hazte estas preguntas con total honestidad sobre lo que estás construyendo:

¿Es escalable esa aplicación que desarrollas?
¿Es mantenible en el tiempo?
¿Entiendes realmente qué hace tu código?
Si mañana falla, ¿sabes qué está pasando?
¿Está lista para que cientos o miles de personas la usen?
Si respondiste no a la mayoría, no estás solo. Ese es el punto de partida para dar el salto hacia un desarrollo más sólido.

¿Qué es el vibe coding? Es programar dejándote llevar por prompts sueltos y la intuición del momento con ayuda de IA. Funciona genial para demos, pero suele dejar deuda técnica y aplicaciones difíciles de mantener o escalar.

Qué diferencia al spec-driven development del vibe coding

La gran diferencia entre ambos enfoques es la deuda técnica que deja el primero. Mientras el vibe coding acumula problemas invisibles, el spec-driven development construye sobre bases documentadas.

Mira este contraste que resume todo:

Un prompt puede ser efímero; una especificación sobrevive con el tiempo.
Un historial de chat se puede contaminar y perder contexto; una spec mantiene el rumbo.
Una especificación es un documento vivo que recibe cambios y escala en el tiempo.
Esa es la clave: dejar de depender de conversaciones que se ensucian y empezar a trabajar con documentos que perduran.

¿Qué es una spec en desarrollo de software? Es una especificación técnica: un documento vivo que describe qué debe hacer tu aplicación y cómo. A diferencia de un prompt, no se pierde ni se contamina, sino que evoluciona con el proyecto.

Qué vas a aprender con las especificaciones

El camino se centra en tres habilidades concretas que le dan estructura a tu trabajo con IA.

Redactar especificaciones a prueba de bala que resistan cambios y crecimiento.
Dominar los contratos técnicos de tu aplicación para definir cómo se comunican sus partes.
Orquestar los flujos agénticos para que la inteligencia artificial entregue exactamente lo que esperas.
Con estas piezas dejas de improvisar y empiezas a dirigir a la máquina con intención.

Para quién es aprender a entender tu proyecto de principio a fin

La promesa de valor es algo que el 90% de las personas no sabe hacer: entender tu proyecto de software de principio a fin. Y ahí está la diferencia real entre jugar y crear.

Si quieres quedarte vycodeando, creando demos y divirtiéndote, está muy bien. Pero si quieres materializar tus ideas con algo más allá de una demo y desarrollar productos reales, el enfoque de especificaciones es tu punto de partida.

¿Qué son los flujos agénticos? Son secuencias orquestadas de tareas que ejecuta la inteligencia artificial siguiendo tus especificaciones. Bien diseñados, hacen que la IA te entregue justo el software que necesitas, no una aproximación.

Así que la pregunta final es tuya: ¿quieres seguir haciendo demos o empezar a construir software que sobreviva? Cuéntame en los comentarios qué proyecto quieres llevar de la demo al producto real.

### Clase 2: Por qué el Vibe Coding no es escalable

Si quieres convertir tus ideas en productos de software escalables y mantenibles, Spec-driven Development es la metodología que necesitas dominar. La pregunta clave que la explica es sencilla: ¿dónde reside la fuente de verdad de tu aplicación? La respuesta cambia todo, y aquí es donde el vibe coding empieza a mostrar sus límites.

¿Dónde reside la fuente de verdad en tu proyecto de software?

En el desarrollo tradicional y en el vibe coding, la fuente de verdad vive en el código. Si quieres entender cómo funciona una aplicación, te vas al repositorio y empiezas a leer los scripts de Python o de JavaScript para descifrar la lógica detrás de ella. A lo mucho, tienes un README como soporte [00:29].

Antes de la inteligencia artificial generativa y de los harnesses agénticos que usamos hoy, el código era casi lo único que importaba. La documentación quedaba como algo opcional, ese PDF que escribías una sola vez porque el jefe lo pidió, por normativa o por buenas prácticas [00:40].

¿Qué es la fuente de verdad en un proyecto de software? Es el lugar donde reside la información autoritativa sobre cómo debe funcionar tu aplicación. En el desarrollo tradicional es el código; en Spec-driven Development son las especificaciones.

¿Qué es Spec-driven Development y cómo cambia el código?

Con la inteligencia artificial generativa ocurre un giro importante. El código se vuelve un commodity, algo casi desechable, y lo más importante pasan a ser las especificaciones [01:30]. Esos documentos técnicos indican qué debe hacer y qué no debe hacer tu aplicación, y el código termina siendo un subproducto de ellas.

En Spec-driven Development la documentación deja de ser un documento estático. Se convierte en un artefacto vivo que da órdenes y lineamientos a la inteligencia artificial encargada de desarrollar ese código [00:55].

¿Qué diferencia hay entre vibe coding y Spec-driven Development? En el vibe coding la fuente de verdad es el código y la documentación es opcional. En Spec-driven Development las especificaciones mandan y el código se genera a partir de ellas.

¿Por qué el vibe coding no escala? El problema del spec drift

Para verlo en concreto, imagina una aplicación web que reserva canchas de pádel. Eliges una cancha de la lista, seleccionas la fecha y escoges el horario de una grilla de 24 horas [02:50]. El detalle es que las canchas solo deberían estar disponibles de 7:00 a 22:00, pero la grilla te permite reservar incluso a la 1:00 o a las 2:00 de la madrugada.

Aquí entra en juego el harness agéntico (como Antigravity CLI / `agy` u otros agentes CLI con acceso a tu repositorio) [03:35]. Si con un simple prompt le pides que modifique la grilla para que vaya de 7:00 a 22:00 sin actualizar la especificación, el cambio queda hecho en el código al instante.

¿Y aquí viene lo interesante? Al revisar la documentación aparece la contradicción:

La historia de usuario número dos dice que el usuario revisa una grilla de horarios de 24 horas [04:24].
El functional requirement número siete indica que el sistema debe mostrar una grilla de 24 horas dividida en bloques de una hora [04:40].
El código y la aplicación, en cambio, ya solo permiten reservas de 7:00 a 22:00.
Ese desfase entre lo que dice la documentación y lo que hace el código tiene nombre.

¿Qué es el spec drift? Es cuando la documentación y el código dejan de coincidir y pasas de tener una fuente de verdad a tener dos. El problema es que con dos fuentes contradictorias, en realidad no tienes ninguna.

¿Por qué dos fuentes de verdad rompen tu proyecto?

El vibe coding solo se interesa por modificar el código cuando le pides un cambio o una nueva funcionalidad [05:15]. Ignora la documentación, y así la especificación termina diciendo una cosa mientras la aplicación hace otra muy distinta.

Cuando eso pasa, la inteligencia artificial se encuentra con instrucciones contradictorias: lo que afirma el código frente a lo que afirma la especificación. El vibe coding no está mal, solo está limitado [06:00]. Por eso no escala.

El objetivo real es tener el control total de tu aplicación: entenderla de principio a fin, poder irte a dormir tranquilo sabiendo que mañana puedes explicarle a cualquier persona cómo funciona [02:15]. Eso es justo lo que el vibe coding no te garantiza.

¿Ya te ha pasado que la IA modifica tu código pero deja tu documentación desactualizada? Cuéntame en los comentarios cómo lo has resuelto.

### Clase 3: Spec vs Prompt: Una opción para borrar la deuda técnica

La diferencia entre un spec y un prompt marca el límite entre crear un demo que funciona una vez y construir un producto que escala. Si has vibecodeado aplicaciones con inteligencia artificial y terminas con historiales de chat interminables llenos de parches, este contenido es para ti: aprenderás la anatomía mínima de una especificación técnica y por qué reemplaza al prompt en proyectos serios.

¿Por qué un prompt largo termina fallando?

Piensa en el último prompt que usaste. Funcionó bien, seguiste iterando, y después de 50 interacciones tienes un historial lleno de errores, inconsistencias y reparcheos. Ese problema tiene nombre: saturación del contexto [00:38].

Lo que sucede es que la inteligencia artificial empieza a olvidar las reglas de oro que definiste al principio. Se enfoca en cosas poco relevantes y descarta lo que sí importa para el proyecto.

¿Qué es la saturación del contexto? Es cuando la IA, tras muchas interacciones, olvida las reglas iniciales del proyecto y prioriza detalles irrelevantes. El resultado son inconsistencias y errores acumulados en el desarrollo.

Y hay un problema extra. Si un desarrollador nuevo entra a colaborar, ¿le vas a pasar tu historial de 50 mensajes para que entienda la idea detrás de la aplicación? Ahí es donde todo se cae.

¿Qué es el efecto Jenga en el vibe coding?

Cuando avanzas en un proyecto, la deuda técnica se acumula y termina impidiendo que escales el producto. En el vibe coding esto se conoce como el efecto Jenga [1:20].

Ocurre cuando, por resolver una funcionalidad, terminas afectando otra que ya estaba funcionando bien. Como en el juego: mueves una pieza y la torre se tambalea.

La raíz del problema es simple. Tu historial de chat con la inteligencia artificial no es un documento de ingeniería. Esa es la diferencia central con una especificación.

¿Qué es un spec? Es un contrato técnico con vida propia que no vive en un historial de chat, sino en tu repositorio, junto al código del proyecto. No deja espacio para ambigüedades.

¿Cuál es la anatomía mínima de un spec?

Para el proyecto del curso trabajaremos un spec llamado Creación de reservas, que encontrarás en la carpeta de recursos. Vamos parte por parte [1:53].

Una especificación mínima se compone de cuatro bloques claros:

Intención: permitir a usuarios autenticados agendar un bloque de tiempo, garantizando que el sistema no asigne el mismo turno a dos personas. Aquí defines por qué importa la funcionalidad y qué resuelve.
Comportamiento: el usuario selecciona un bloque disponible y confirma; el sistema lo asigna y actualiza la grilla en tiempo real. Define qué hace la funcionalidad.
Restricciones: los límites del negocio.
No objetivos (non goals): lo que deliberadamente no vas a construir.
Después de esos cuatro pilares, conviene detenerse en los dos que más confusión generan.

¿Qué van en las restricciones de un spec?

Las restricciones ponen los límites físicos o del negocio [2:35]. En el spec de reservas incluyen:

Prevención de colisión: el sistema valida la disponibilidad en la base de datos antes de guardar. Si dos usuarios reservan el mismo bloque en el mismo milisegundo, el segundo recibe un error de conflicto.
Regla de tiempo: no se pueden hacer reservas en fechas u horarios del pasado.
Formato: las reservas son estrictamente en bloques enteros de una hora.
Estas reglas eliminan la interpretación libre y le dan a la IA fronteras claras.

¿Por qué son importantes los no objetivos?

En los non goals especificas qué no quieres hacer [3:14]. Para el spec de reservas se definió que no se programará pasarela de pagos integrada, porque se paga en el club, y que no se enviarán correos ni SMS de confirmación.

Y aquí viene lo interesante. Como la inteligencia artificial no es determinista, suele tomarse atribuciones. Es muy probable que decida desarrollarte una pasarela de pago por su cuenta, asumiendo que ese es el siguiente paso lógico tras una reserva.

Por eso decirle explícitamente qué no debe construir es tan valioso como decirle qué sí.

¿Cómo detectar los gaps de un prompt?

Ahora al ejercicio: encontrar todos los gaps de un prompt real. Este es uno que se usaría para desarrollar la misma app de reservas de pádel con vibe coding [4:15]. Estos son los vacíos que aparecen:

Alcance desmedido: pedir "login con Google y Facebook" o una pasarela de pagos como si fueran viñetas o cambios de color. Son funcionalidades críticas y complejas tratadas como triviales.
Subjetividad: pedir un calendario "con animaciones suaves" o una interfaz "tipo Airbnb o Uber" no dice nada preciso a la IA.
Micromanagement: definir "verde manzana claro" para bloques libres y "gris oscuro" para ocupados cuando ni siquiera existe la estructura de base de datos. Preocuparse por el color antes que por los cimientos.
Desconexión con el negocio: pedir "usa Firebase o Postgres, la que escale mejor". Son bases muy distintas: una es NoSQL y la otra es SQL. La elección depende del tipo de información a almacenar, no de una corazonada.
Delegar el pensamiento crítico: pedirle a la IA que "piense en casos donde podría haber inconsistencias y los solucione". Ese pensamiento crítico es tuyo como arquitecto o director del producto.
Sí puedes usar la inteligencia artificial para descubrir estos gaps, pero eres tú quien debe definirlos.

¿Cuál es la diferencia clave entre spec y prompt?

Si hay algo que quiero que te lleves es esto: el spec es un documento técnico que no deja espacio para ambigüedades, mientras que el prompt improvisa y acumula deuda técnica.

Un prompt sirve para crear demos. Un spec sirve para crear productos [00:00]. Con tu primer spec ya listo, el siguiente paso es dejar todo el setup preparado para desarrollar el proyecto.

# Recursos adicionales Clase 3

- [recursos/SPEC.md](recursos/SPEC.md)

### Clase 4 . Instala tu Spec Kit y arranca tu proyecto

El spec-driven development es una metodología agnóstica: no es una marca registrada ni depende de una herramienta específica. Aquí aprenderás a preparar el entorno completo para trabajar con **Spec Kit de GitHub**, la herramienta que utilizaremos en el proyecto, junto con **Antigravity CLI (`agy`)**.

En teoría, podrías aplicar esta metodología hasta en un cuaderno de notas. Pero existen frameworks estandarizados que lo hacen estructurado y ágil, como OpenSpec, Kiro o el Spec Kit de GitHub.

Qué herramientas necesitas para tu setup de Spec Kit

Antes de generar cualquier especificación, necesitas preparar los componentes esenciales de tu entorno:

1. **Git**: gestiona las versiones de tu código y artefactos. Es obligatorio porque Spec Kit versiona cada fase sobre Git.
2. **Python**: requerido para ejecutar componentes internos de CLI y herramientas asociadas.
3. **uv**: administrador de paquetes y herramientas de Python ultrarrápido.
4. **Harness agéntico de IA**: el framework o CLI basado en agentes que ejecuta el flujo. En nuestro caso utilizamos **Antigravity CLI (`agy`)**, el entorno agéntico de Google DeepMind.
5. **Spec Kit de GitHub**: framework open-source que genera todos los contratos y plantillas técnicas necesarias para tu aplicación.
6. **Specify CLI**: comando de inicialización que arranca la estructura del proyecto configurada con los presets de integración correspondientes.

Un detalle clave: **Spec Kit es completamente agnóstico respecto al modelo y harness de inteligencia artificial que elijas** [1:04]. Soporta integraciones para `agy`, `copilot`, `gemini`, `claude`, `opencode`, etc.

¿Qué es spec-driven development? Es una metodología para desarrollar software definiendo primero las especificaciones y contratos técnicos, y luego el código. No es una herramienta ni una marca, sino una forma de trabajar que puedes implementar con frameworks como Spec Kit.

Por qué el asistente agéntico (`agy`) usa Spec Kit como skills y plugins

Spec Kit no reemplaza al agente de IA; le da estructura y superpoderes. Provee un conjunto de **skills** y **templates** que el agente (`agy`) va completando de forma sistemática y rigurosa [1:52].

Es decir, el agente actúa como el arquitecto y constructor que ejecuta las tareas, mientras que Spec Kit aporta la metodología, los contratos técnicos y los checkpoints de calidad.

Cómo inicializar tu proyecto con el comando Specify Init

Una vez instaladas las herramientas base, inicializamos el proyecto. Ejecutamos el comando especificando la integración deseada:

```powershell
uv tool install --link-mode copy specify-cli
specify init my-project --integration agy --non-interactive
cd my-project
```

El comando consta de tres partes clave:
- **`specify`**: la herramienta base de Spec Kit.
- **`init my-project`**: crea la carpeta del proyecto con los templates iniciales.
- **`--integration agy`**: configura las skills y workflows específicamente optimizados para Antigravity CLI.
- **`--non-interactive`**: ejecuta la configuración directa sin detenerse en preguntas interactivas.

¿Qué hace el comando Specify Init? Inicializa tu proyecto y crea las carpetas con los templates base que el agente completará. Es el punto de arranque de todo el flujo spec-driven.

Qué archivos y templates se instalan en tu proyecto

Al abrir el proyecto generado en tu editor, encontrarás:
- La carpeta `.specify/`: contiene los templates (`constitution-template.md`, `spec-template.md`, `plan-template.md`, `tasks-template.md`, `checklist-template.md`).
- La carpeta `.agents/skills/`: contiene las habilidades que `agy` invoca durante el flujo (`speckit-constitution`, `speckit-specify`, `speckit-clarify`, `speckit-plan`, `speckit-tasks`, `speckit-implement`, `speckit-converge`).

Son archivos Markdown con placeholders y reglas que el agente completará a partir de la información de tu negocio.

# Recursos adicionales clase 4

- <https://github.com/github/spec-kit>
- [recursos/recurso-comandos-de-instalacion.pdf](recursos/recurso-comandos-de-instalacion.pdf)

Comandos de instalación:
```powershell
uv tool install --link-mode copy specify-cli
specify init my-project --integration agy --non-interactive
cd my-project
```

### Clase 5 . Crea la Constitución de tu proyecto con Spec Kit

Antes de escribir una sola línea de código, necesitas la constitución de tu proyecto de software: el documento con las reglas inquebrantables que guían todo el desarrollo. Si construyes una casa sin el permiso de construcción, tienes un problema. Aquí ocurre lo mismo.

Por qué la constitución va antes que el código

Piensa en construir tu casa: ya eliges materiales, muebles y colores de los muros, pero todavía no tienes el permiso para construir en esa zona. Ese permiso faltante es exactamente lo que pasa cuando arrancas un proyecto sin constitución.

La regla es clara: debes tener la constitución mucho antes de definir cualquier especificación o desarrollar cualquier línea de código [00:22]. Sin ese permiso, todo lo demás se construye sobre terreno inestable.

¿Qué es la constitución de un proyecto de software? Es el documento que define las reglas inquebrantables de tu proyecto: propósito, tecnología, lógica de negocio y estilo de código. La IA la respeta en cada especificación y en cada línea que genera.

Qué componentes debe tener una constitución

La anatomía de una constitución se arma con seis bloques que ordenan tu proyecto de principio a fin. Vamos uno por uno con el ejemplo real de una app de reservas de canchas de pádel.

Cómo defines naturaleza, stack y reglas de dominio

Los primeros tres componentes fijan qué construyes y bajo qué límites.

Naturaleza del proyecto: el propósito de la aplicación. En el ejemplo, permitir a los usuarios autenticarse y gestionar reservas de tiempo en espacios específicos [00:38].
Stack de tecnología: frontend, backend y base de datos. Aquí se definió React para el frontend, Node.js con Express para el backend, SQLite en local y TypeScript como lenguaje [01:37].
Reglas de dominio y lógica de negocio: los límites de los que el proyecto no se puede salir [01:52].

Si no vienes de tecnología, no te preocupes por el stack. En ese espacio puedes escribir reglas de negocio que sí conoces, como no usar herramientas de pago ni pedir tarjeta de crédito [01:13].

En las reglas de dominio del pádel se definieron cuatro puntos concretos:

Catálogo cerrado: el sistema solo maneja cinco canchas fijas.
Bloques de tiempo: las reservas operan en formato de 24 horas.
Prevención de colisiones: la regla crítica, nunca escribir una reserva sin validar primero que la cancha esté libre en ese horario [02:26].
Autenticación: todo flujo de reserva exige un usuario con sesión activa.

Cómo defines estructura, estilo y manejo de errores

Los siguientes componentes controlan cómo se escribe y cómo falla tu código.

Estructura y estilo de código define la organización del proyecto y las convenciones de escritura [02:50]. En el ejemplo se optó por una estructura plana, evitar la sobreingeniería y no implementar Clean Architecture ni patrones complejos. En estilo se priorizó la programación funcional, con componentes funcionales y hooks en React, evitando clases salvo obligación. La nomenclatura usa camelCase para funciones y variables, y PascalCase para interfaces y tipos [03:22].

Manejo de errores y validaciones indica cómo responder ante fallas [03:50]. Desde la interfaz, nunca exponer errores crudos ni stack traces al usuario final: todo error técnico se traduce en un mensaje amigable como "la cancha ya fue reservada en este horario". Desde el backend, retornar siempre el código de estado HTTP semántico (401 para errores de autenticación, 400 para petición inválida, 409 para conflicto de reserva) [04:31].

¿Qué es la fuente de la verdad en una constitución? Es la instrucción que ordena a la IA detenerse si una orden del usuario contradice la constitución o detecta una falla lógica, avisar el problema y pedir actualizar el spec.md antes de tocar el código.

Ese último bloque, la fuente de la verdad, le dice a la IA cómo comportarse en cada especificación y cada vez que desarrolle código [04:35].

Cómo pasas la constitución a Spec Kit mediante Antigravity CLI (`agy`)

Con la anatomía lista, convertimos ese texto en un documento estructurado dentro del proyecto:

1. Entras a la raíz del proyecto (`my-project`).
2. Inicias Antigravity CLI ejecutando `agy`.
3. Ejecutas el comando `/speckit-constitution` y proporcionas el texto con las reglas inquebrantables.
4. El agente utiliza la skill `speckit-constitution` y los templates para estructurar el archivo final en `.specify/memory/constitution.md`.

# Recursos adicionales Clase 5

- [recursos/constitution.md](recursos/constitution.md)

### Clase 6 . Cómo convertir tu spec en prompt estructurado

Definir una spec con Spec Kit es lo que separa el picar código a ciegas de dirigir un proyecto de software con intención. Aquí aprendes a versionar tu proyecto con Git y a convertir tus especificaciones en un prompt que el agente de IA transforma en una estructura completa.

La idea central es simple: primero aseguras tus checkpoints con ramas independientes en Git, y luego defines el qué y el porqué de tu aplicación para que la IA decida el cómo.

Por qué usar Git para versionar cada paso del proyecto

Antes de escribir una sola especificación, conviene tener control sobre los cambios. Git es la herramienta que permite manejar el versionado de los artefactos y del código de tu proyecto de software [00:38]. Piensa en cada rama como un checkpoint al que puedes volver si algo falla.

El flujo empieza ubicándote en la raíz del proyecto, en este caso my-project, e inicializando el repositorio:
```powershell
git init
git status
```

¿Para qué sirve crear una rama por cada comando? Sirve para aislar los cambios de cada paso y poder regresar al punto más estable de la aplicación en caso de que algo falle. Cada comando del curso vive en su propia rama independiente.

Cómo crear una rama y trackear los cambios en Git

La estrategia es trabajar cada avance en una rama separada:
```powershell
git checkout -b "constitucion"
git add .
git commit -m "constitucion del proyecto"
git status
```

Qué cambio de mentalidad exige el spec driven development

En el vibe coding estamos acostumbrados a microgestionar la IA: le dictamos qué componente usar en el backend, qué librería en el frontend, etcétera [03:14]. Ese enfoque te convierte en un supervisor de detalles.

Con el spec driven development el rol cambia por completo: tú eres el director de producto. A un equipo de ingeniería no le dictas cómo escribir el código; le defines el qué y el porqué, y la IA decide el cómo en los pasos técnicos siguientes [03:22].

Qué debe contener una spec bien estructurada

Una spec sólida retoma la anatomía mínima vista antes: intención, comportamiento, restricciones y no objetivos [03:55]. En el proyecto de reservas de pádel, las funcionalidades principales son:
1. Autenticación de usuario.
2. Exploración y selección de canchas.
3. Creación de reservas.
4. Gestión de reservas personales.

Por qué los no objetivos son clave en tu especificación

Tan importante como decir qué construir es decir qué no construir. Los no objetivos evitan que la IA agregue funcionalidades que no pediste (cero código sombra):
- No habrá pasarela de pagos.
- No habrá panel de administrador web.
- No habrá notificaciones externas.
- No habrá reservas de más de una hora continua.
- No habrá sistema de matchmaking para buscar compañeros de juego [05:20].

Cómo pasar tu spec a Antigravity CLI con Spec Kit

El proceso es sencillo y estructurado:
1. Creas la rama `spec` con `git checkout -b "spec"`.
2. Inicias `agy`.
3. Ejecutas `/speckit-specify` proporcionando la descripción del requerimiento (`recursos/SPEC OK.md`).
4. El agente procesa los requerimientos y genera `specs/001-court-booking-system/spec.md` y `checklists/requirements.md`.

# Recursos adicionales Clase 6

- [recursos/SPEC OK.md](recursos/SPEC OK.md)

# Consola de comandos

```powershell
git init
git status
git checkout -b "constitucion"
git add .
git commit -m "constitucion del proyecto"
git status

git branch
git checkout -b "spec"
agy
/speckit-specify [recursos/SPEC OK.md]

git add .
git commit -m "spec del proyecto"
git status
```

### Clase 7 Cómo leer una spec: Metodologías Given-When-Then y EARS

Cuando trabajas con spec-driven development y se genera una especificación, el verdadero valor no está en el código, sino en entender qué construyes y por qué. Aquí aprendes a leer una spec, sus componentes estándar y dos metodologías clave que la sostienen: Given-When-Then y EARS.

¿Qué contiene una especificación de software bien hecha?

Una spec completa reúne el contenido mínimo que cualquier proyecto de software profesional debería tener:
- Historias de usuario.
- Criterios de aceptación.
- Casos de borde o edge cases.
- Requerimientos funcionales.
- Métricas de resultados y outputs.
- Assumptions o supuestos.

¿Qué son las historias de usuario en una spec?

Las historias de usuario son los requerimientos funcionales vistos desde la perspectiva del negocio [01:10]. Indican qué hará cada feature, por qué es prioritaria, cómo se validará de manera independiente y cuáles son sus criterios de aceptación.

¿Cómo funciona la metodología Given-When-Then?

Para eliminar ambigüedades en los criterios de aceptación, se utiliza el formato estandarizado Given-When-Then [01:35]:
- **Given**: el estado o contexto inicial (ej. un usuario registrado sin reservas activas).
- **When**: la acción que se ejecuta (ej. selecciona un bloque disponible y confirma).
- **Then**: el resultado esperado verificable (ej. el sistema confirma la reserva y el bloque pasa a estado "Reservado").

¿Qué son los casos de borde y por qué importan?

Los casos de borde describen escenarios extremos o concurrentes y cómo el sistema debe gestionarlos [02:15]. Un ejemplo crítico: ¿qué ocurre si dos usuarios intentan confirmar el mismo bloque horario casi al mismo tiempo? El sistema valida la disponibilidad en el momento de la escritura y solo concede el turno al primero, rechazando al segundo con un mensaje amigable de conflicto (`409 Conflict`).

¿Qué es la metodología EARS en los requerimientos funcionales?

EARS significa *Easy Approach to Requirement Syntax*. Establece que cada requerimiento funcional debe escribirse iniciando de forma activa con el sujeto y la acción obligatoria del sistema:
- *Ambiguo*: que la gente no pueda reservar en el pasado.
- *Con EARS*: el sistema DEBE impedir la selección o confirmación de reservas en fechas y horas pasadas.

¿Qué son las assumptions que hace la IA?

Son los supuestos y decisiones razonables que se asumen cuando el requerimiento no especificó un detalle secundario (ej. que no se enviará verificación por correo porque no hay notificaciones externas en v1). Como dueño del producto, siempre puedes ajustar estos supuestos en `spec.md`.

### Clase 8 Comando Clarify: Casos borde, ambigüedades y supuestos

El comando Clarify de Spec Kit toma tu especificación y la somete a un interrogatorio riguroso para encontrar vacíos y ambigüedades antes de escribir una sola línea de código.

¿Para qué sirve el comando Clarify?

Detecta lagunas en `spec.md`, genera preguntas puntuales de alto impacto y, con tus respuestas, actualiza automáticamente el documento para que la IA no tome decisiones arbitrarias por ti.

¿Cómo se ejecuta Clarify paso a paso?

```powershell
# 1. Crear la rama clarify
git branch
git checkout -b "clarify"

# 2. Iniciar el agente agy
agy
```

Dentro de `agy`:
```text
/speckit-clarify
```

El agente evalúa la especificación y presenta preguntas clave (hasta 5 preguntas relevantes), tales como:
1. **Duración de la sesión activa**: se establece en 24 horas como estándar razonable para una app deportiva.
2. **Visibilidad para visitantes sin sesión**: el catálogo completo queda restringido hasta que el usuario inicie sesión o se registre.
3. **Manejo de reservas canceladas**: se ocultan de las listas de Mis Reservas para mantener un panel limpio.
4. **Longitud mínima de contraseña**: se fija en un mínimo seguro de 8 caracteres.
5. **Anticipación mínima para cancelar**: se define un margen mínimo de 1 hora antes del inicio del turno.

Una vez terminada la ronda, `spec.md` se actualiza automáticamente con la sección `## Clarifications`.

# Consola de comandos

```powershell
git branch
git checkout -b "clarify"
agy
/speckit-clarify

git diff
git add .
git commit -m "clarify"
```

### Clase 9 Comando Plan: de la Spec al código

El comando Plan de Spec Kit convierte tus especificaciones en un plan técnico concreto, sin escribir código todavía. La especificación responde el *qué* y el plan responde el *cómo*.

Qué hace el comando Plan y por qué importa

Lee la Constitución y la especificación (`spec.md`) y genera el plan de trabajo técnico del proyecto [00:09], sirviendo de puente entre el lenguaje de negocio y el de ingeniería.

Qué artefactos genera el comando Plan:
- `plan.md`: contexto técnico, verificación de principios constitucionales (Constitution Check) y estructura del proyecto.
- `research.md`: investigación sobre decisiones técnicas clave (autenticación JWT/cookies, transacciones SQLite para anti-colisión, etc.).
- `data-model.md`: entidades, atributos, relaciones y ciclo de vida de usuarios, canchas y reservas.
- `contracts/rest-api.md`: especificación de endpoints, métodos HTTP, códigos de respuesta y formatos de carga.
- `quickstart.md`: guía paso a paso para inicializar y validar backend y frontend.

# Consola de comandos

```powershell
git status
git branch
git checkout -b "plan"
agy
/speckit-plan

git status
git add .
git commit -m "plan"
```

### Clase 10 Comando Task: tareas con orden lógico

El comando task de Spec Kit convierte el plan técnico en tareas atómicas ordenadas de forma lógica y listas para ser ejecutadas.

Por qué las tareas se agrupan por fase y no como lista suelta

Las tareas se organizan en fases secuenciales (Setup inicial, Fundamentos y modelos, Flujos prioritarios P1, Flujos secundarios P2, Pulido y pruebas).
- La etiqueta `#p` indica tareas independientes que pueden ejecutarse en paralelo.
- Cada tarea hace referencia a la historia de usuario correspondiente, garantizando trazabilidad total.
- Alertas de dependencias evitan iniciar componentes cuya base aún no está lista.

# Consola de comandos

```powershell
git checkout -b "tasks"
agy
/speckit-tasks
/speckit-analyze

git status
git add .
git commit -m "tasks"
git branch
```

### Clase 11 Comando Implement: Tu app cobra vida

El comando implement convierte las tareas definidas en `tasks.md` en código fuente real y funcional para tu aplicación.

Cómo se ejecuta la implementación

El agente lee `tasks.md` y construye ordenadamente:
- La carpeta `/backend` con Express, TypeScript y la lógica de validación de reservas y prevención de colisiones.
- La carpeta `/db` con el cliente SQLite (`better-sqlite3`) y el esquema de base de datos (`padel.db`).
- La carpeta `/frontend` con React, Vite y Tailwind CSS para la interfaz interactiva.
- La suite de pruebas automatizadas en `backend/tests/`.

Puesta en marcha:
Los comandos para inicializar los servicios se encuentran en `quickstart.md`:

```powershell
# En terminal 1: Backend (puerto 3001)
npm --prefix backend run dev

# En terminal 2: Frontend (puerto 5173)
npm --prefix frontend run dev
```

Al abrir `http://localhost:5173` en el navegador, la aplicación está lista para interactuar y validar.

# Consola de comandos

```powershell
git checkout -b "implement"
agy
/speckit-implement

git status
git add .
git commit -m "implement"

# Validación y ejecución
npm --prefix backend test
npm --prefix backend run dev
npm --prefix frontend run dev
```

### Clase 12 Converge: Audita el código generado por IA

Auditar el código contra las especificaciones es fundamental porque los modelos de IA son no determinísticos y pueden omitir detalles o introducir divergencias.

Qué es el Eval-Driven Development

En lugar de limitarse a pruebas unitarias manuales, se evalúa el comportamiento de la aplicación frente a los criterios de aceptación y casos de borde definidos en la spec.

Cómo automatizar la auditoría con `/speckit-converge`

El comando `/speckit-converge` compara todo el código generado frente a `spec.md`, `plan.md` y `tasks.md`. Si detecta discrepancias, las reporta y permite generar las tareas correctivas necesarias para alcanzar la convergencia total.

# Consola de comandos

```powershell
agy
/speckit-converge
```

### Clase 13 Spec Drift: ¿qué pasa cuando los requerimientos cambian?

El **spec drift** es la desincronización entre el código y las especificaciones. Ocurre cuando se modifica el código directamente mediante prompts casuales sin actualizar la documentación, provocando la pérdida de la fuente de verdad y acumulando deuda técnica (el efecto Jenga).

Por cuál nivel entra un cambio en Spec-Driven Development

**Un cambio nunca entra por el código; entra siempre por el artefacto más alto que afecta:**
- Si cambia la tecnología o lineamientos base: entra por la **Constitución**.
- Si cambia la lógica de negocio o funcionalidad: entra por la **Especificación (`spec.md`)**.

Ejemplo práctico: Solicitud de cambio de horario (de 24 horas a horario diurno de 7:00 a.m. a 10:00 p.m.).

Cadena de propagación ordenada:
1. Crear una rama dedicada (`cr-horario-01`).
2. Actualizar la especificación con `/speckit-clarify`.
3. Propagar al plan con `/speckit-plan`.
4. Regenerar tareas con `/speckit-tasks` y `/speckit-analyze`.
5. Ejecutar la implementación del cambio con `/speckit-implement`.

# Consola de comandos

```powershell
git branch
git checkout -b "cr-horario-01"
agy
> /speckit-clarify Necesito que la grilla de horarios disponibles solo sea de 7AM a 10PM, los rangos de 10PM a 6AM no deben aparecer en las opciones
> /speckit-plan
> /speckit-tasks
> /speckit-analyze
> /speckit-implement

# Comprobar y confirmar
npm --prefix backend test
git add .
git commit -m "cr-horario-01: ajuste de grilla 7am a 10pm"
```
