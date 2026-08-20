# Política de integración con Gentle-AI

Gentle-AI es el **orquestador dominante y ecosistema de ejecución** de esta base universal. Desde el inicio de cada proyecto y sesión, es la entrada que instala, adapta, carga y hace cumplir el system prompt canónico y las reglas del proyecto en los runtimes soportados. Configura capacidades —skills, MCP, memoria, SDD, RDD y adaptación por runtime—, pero no reemplaza ni reescribe la política de ingeniería canónica de `.ai/SYSTEM.md`.

Esta regla aplica a cualquier proyecto que adopte la base. El producto, su stack y su arquitectura siguen siendo decisiones del proyecto.

## Ruta rápida

1. Instalá y configurá los runtimes que realmente vayas a usar mediante Gentle-AI.
2. Proyectá `.ai/SYSTEM.md` y las reglas de proyecto mediante el adapter correspondiente antes de delegar o ejecutar trabajo.
3. Elegí el scope conscientemente: global para preferencias personales; workspace para assets propios de un proyecto.
4. Antes de actualizar, verificá versión, impacto y plan con `update`, notas de release y `sync --dry-run`.
5. Después de actualizar el binario, sincronizá sólo los assets administrados y ejecutá `doctor`.
6. Usá el enrutamiento más pequeño útil: directo, delegado o SDD opcional.

## Invariantes

| Tema | Política |
|---|---|
| Rol de Gentle-AI | Orquestador operativo obligatorio: proyecta y hace cumplir `.ai/SYSTEM.md` y las reglas del proyecto; no redefine sus estándares. |
| Carga de prompt | Antes de trabajo autónomo o delegado, el adapter debe cargar el system prompt canónico y las reglas aplicables. Si no puede hacerlo, declara la limitación y no afirma cumplimiento. |
| Portabilidad | La misma política debe operar en Codex, Claude Code, OpenCode y Pi. Los adapters cambian el **cómo**, nunca el contenido normativo, el **cuándo** ni el nivel de evidencia requerido. |
| Versiones | Preferir la última versión estable compatible. Una RC o `main` requiere decisión explícita, revisión de notas y un motivo concreto. |
| Ownership | Los archivos administrados por Gentle-AI se actualizan con sus comandos. Los archivos del usuario o del proyecto no se sobrescriben manualmente ni mediante sync sin revisar el plan. |
| Evidencia | No declarar una instalación, sync, diagnóstico, prueba o revisión como exitosos sin su salida verificable. |
| Autonomía | Continuar con cambios reversibles y claros; pedir decisión sólo si el cambio de scope, seguridad, costo, efecto externo o arquitectura lo exige. |

## Scopes y ownership

Gentle-AI instala por defecto los archivos específicos de cada agente en su configuración global. `gentle-ai install --scope=workspace` los instala en el proyecto cuando el runtime admite configuración local.

Elegí el scope según la propiedad del comportamiento:

- **Global:** persona personal, configuración de una herramienta usada por todos los proyectos y componentes que el runtime sólo admite globalmente.
- **Workspace:** system prompt, skills, agentes SDD y otros assets que deban viajar con un proyecto y ser revisables en Git.
- **Global obligatorio:** paquetes o settings que el runtime no lee desde el workspace. Su existencia debe documentarse, no simularse como portable.

`~/.gentle-ai/state.json` es el registro operativo de los agentes seleccionados por la instalación. Por eso `sync` actualiza **sólo** los agentes registrados allí, salvo que se indiquen explícitamente con `--agent`.

Nunca edites como mecanismo normal los archivos generados por Gentle-AI. Usá `install`, `sync` o `uninstall`; para customizaciones, mantené archivos de proyecto separados y conservá el modo de persona `custom` si corresponde.

## Ciclo de actualización y sincronización

Actualizar el ejecutable y sincronizar los assets son operaciones diferentes. La secuencia obligatoria es:

```text
inspeccionar estado
    → verificar release estable y notas
    → previsualizar sync
    → actualizar binario
    → verificar versión
    → sincronizar assets administrados
    → ejecutar doctor
    → verificar los runtimes afectados
```

### Procedimiento

```bash
# Estado y disponibilidad de una versión nueva
gentle-ai version
gentle-ai update

# Antes de modificar assets: inspección del alcance efectivo
gentle-ai sync --dry-run

# Actualización por el método de instalación elegido
# Homebrew: brew upgrade gentle-ai
# Instalador propio: gentle-ai upgrade

gentle-ai version
gentle-ai sync
gentle-ai doctor
```

Reglas:

- Consultar las notas de release oficiales antes de cada upgrade; evaluar deprecaciones, cambios de schema y cambios de adapter.
- Una actualización del binario **no** actualiza automáticamente prompts, skills, MCP ni orquestadores. Ejecutar `sync` después.
- `sync` es idempotente, pero `--dry-run` es obligatorio antes de un upgrade relevante o cuando cambió el conjunto de agentes.
- `sync` no reinstala binarios externos. Si fallan Engram, GGA u otras dependencias, investigar el diagnóstico y su instalador específico.
- `doctor` es de sólo lectura y debe ser el primer paso de diagnóstico ante un sync inesperado.
- Antes de modificar archivos gestionados, Gentle-AI crea snapshots de respaldo. Verificar el alcance del snapshot: cubre los agentes registrados, no todos los directorios de agentes existentes.
- No adoptar `@main`. Para una RC, instalar el tag exacto y documentar el motivo, la versión anterior y la estrategia de reversión.

## Enrutamiento de implementación

El usuario pide resultados, no fases ceremoniales.

| Ruta | Usarla cuando | Regla |
|---|---|---|
| Directa | Decidir o verificar demanda 1–3 archivos, o el cambio es mecánico, entendido y de un único archivo. | Ejecutar y verificar en el contexto principal. |
| Delegada | Comprender demanda 4+ archivos, hay investigación amplia, o un escritor debe modificar 2+ archivos no triviales. | Delegar una misión acotada con objetivo, restricciones y evidencia esperada. |
| SDD opcional | Existe ambigüedad sustancial o proposal/spec/design/tasks reducen incertidumbre de forma material. | Proponerlo; usarlo sólo tras solicitud explícita o aceptación. |

El riesgo puede reforzar la verificación y la revisión, pero no fuerza SDD. Los tests, builds, instalaciones y revisiones pueden usar workers sin convertir un cambio directo en un ciclo SDD.

## RDD: evidencia y control del usuario

Receipt-Driven Development (RDD) vincula revisión y autorización de entrega a una identidad inmutable del candidato. No convierte una explicación del agente en evidencia.

- La revisión ocurre después de producir un candidato, no antes de empezar a trabajar.
- La intensidad de revisión depende de la evidencia y del riesgo, no sólo del tamaño del diff.
- El usuario controla RDD con `gentle-ai review mode status|enable|disable`.
- Si RDD está desactivado, no se lo reactiva ni se lo reintenta por iniciativa del agente. El trabajo continúa con la política ordinaria del repositorio y sin fabricar una aprobación.
- Una receipt válida sólo gobierna los bytes exactos que fueron revisados. Un cambio posterior requiere nueva evidencia.

Ejemplo de consulta en un repositorio Git:

```bash
gentle-ai review mode status --cwd .
```

## Skills, MCP y memoria

- Los **skills** son procedimientos especializados: detectar necesidad, cargar sus instrucciones, ejecutar el flujo y verificar el resultado.
- El registry se refresca al iniciar sesión en runtimes que soportan hooks; si hace falta recuperarlo manualmente, usar `gentle-ai skill-registry refresh --force` desde el proyecto.
- El registry genera `.atl/skill-registry.md` y un cache local. No es una fuente de política; es un índice de capacidades disponibles.
- MCP proporciona capacidades como documentación, memoria o navegación. La política canónica decide cuándo invocarlas.
- Engram preserva decisiones, hallazgos y resúmenes. Nunca reemplaza una respuesta al usuario ni es una fuente de verdad del código.

## Integraciones de UI asistida

Cuando el runtime exponga Stitch o Impeccable mediante MCP, Gentle-AI debe declarar la capacidad real y proyectar la política de [`ui.md`](ui.md) sin inventar schemas, comandos o resultados. Stitch se usa para enviar el prompt; el flujo queda detenido hasta que el cliente confirme explícitamente la finalización de la generación. Sólo entonces puede recuperarse el artefacto, implementarse la UI y auditarse el resultado con Impeccable.

Si una integración no está disponible, el adapter declara la limitación y aplica la degradación segura definida en `ui.md`; no sustituye una herramienta ausente con una afirmación narrativa ni reduce la evidencia de accesibilidad, seguridad o pruebas.

## Adapters por runtime y cumplimiento del prompt

Cada adapter debe proyectar, al inicio de sesión, `.ai/SYSTEM.md`, esta regla operativa y las reglas locales aplicables usando los mecanismos nativos del runtime. Gentle-AI centraliza esa proyección y su verificación; esta base no mantiene copias divergentes del prompt para cada runtime.

| Runtime | Mecanismo del adapter | Regla de compatibilidad |
|---|---|---|
| Codex | `~/.codex/config.toml`, `AGENTS.md`, skills y MCP; delegación nativa si está disponible. | El adapter debe inyectar la constitución y reglas locales antes de operar. Si no hay delegación, ejecutar en modo individual sin bajar el estándar. |
| Claude Code | `CLAUDE.md`, skills, MCP y subagentes mediante `Task`. | El adapter debe cargar la constitución y reglas locales; los subagentes reciben además misiones aisladas y evidencia verificable. |
| OpenCode | `opencode.json`, commands, skills y overlay multiagente. | El adapter debe cargar la constitución y reglas locales. Los trabajos de escritura dependientes o RDD permanecen en foreground; el background es sólo para tareas independientes de lectura. |
| Pi | Paquetes administrados, especialmente `gentle-pi`, con assets bajo `.pi/`. | `gentle-pi` debe cargar la constitución y reglas locales; posee prompts, agents, chains y refresh de inicio, por lo que no se duplican esos assets desde esta base. |

Cada adapter debe declarar sus capacidades reales, confirmar la carga aplicable del prompt y degradar de forma segura. Ninguno puede ocultar que una capacidad no existe ni suplirla con una afirmación narrativa.

## Verificación mínima por cambio de ecosistema

- [ ] La versión y las notas de release fueron revisadas.
- [ ] `sync --dry-run` mostró el scope esperado.
- [ ] Sólo se actualizaron runtimes registrados o elegidos explícitamente.
- [ ] `gentle-ai version` confirma el binario esperado.
- [ ] `gentle-ai sync` terminó sin errores.
- [ ] `gentle-ai doctor` fue ejecutado y sus advertencias quedaron resueltas o declaradas.
- [ ] Se verificó el runtime afectado con una sesión o comando representativo.
- [ ] Se preservaron las customizaciones que no pertenecen a Gentle-AI.

## Fuentes dinámicas

Esta política no congela comandos, versiones ni capacidades que cambian con releases. Antes de ejecutar una acción dependiente de Gentle-AI, consultar la documentación y las releases oficiales:

- [Repositorio de Gentle-AI](https://github.com/Gentleman-Programming/gentle-ai)
- [Releases oficiales](https://github.com/Gentleman-Programming/gentle-ai/releases)
- [Uso y sincronización](https://github.com/Gentleman-Programming/gentle-ai/blob/main/docs/usage.md)
- [Matriz de runtimes](https://github.com/Gentleman-Programming/gentle-ai/blob/main/docs/agents.md)
