# Contrato del harness P0

P0 convierte esta base de políticas en un harness ejecutable, portable y verificable. El harness no reemplaza a Gentle-AI: descubre el proyecto, instala únicamente assets propios y valida que las fuentes canónicas, los runtimes y las integraciones declaradas puedan usarse con evidencia.

## Decisión

Implementar un CLI de Node.js en TypeScript, administrado por pnpm, con dos comandos iniciales:

```text
ai-engineering init
ai-engineering doctor
```

La elección aprovecha pnpm como estándar ya establecido para Node.js, permite una distribución multiplataforma y evita imponer un framework o una arquitectura al proyecto adoptante. El CLI debe tener cero dependencias de ejecución salvo que una necesidad verificada lo justifique; TypeScript y herramientas de prueba son dependencias de desarrollo.

Alternativa descartada para P0: shell scripts. Reducen la puesta en marcha inicial, pero dificultan portabilidad, validación estructurada, tests y soporte consistente entre entornos. Un binario nativo queda fuera de alcance hasta que la adopción justifique el coste de distribución por plataforma.

## Alcance P0

| Entrega | Resultado verificable |
|---|---|
| Bootstrap | Adopta un proyecto con `init`, previsualización, idempotencia y fallo seguro. |
| Doctor | Emite checks estructurados y accionables sobre el estado del harness. |
| Templates | Versiona plantillas propias, portables y sin secretos para los runtimes soportados. |
| Conformance | Ejecuta smoke tests de init/doctor y declara límites externos por runtime. |

No forman parte de P0: publicación pública, CI remoto, release semántico, catálogo de templates de producto ni modificación automática de credenciales o assets gestionados por terceros.

## Estructura propuesta

```text
package.json
pnpm-lock.yaml
pnpm-workspace.yaml
src/
  cli.ts
  commands/
    init.ts
    doctor.ts
  core/
    discovery.ts
    filesystem.ts
    report.ts
    templates.ts
  runtimes/
    codex.ts
    claude-code.ts
    opencode.ts
    pi.ts
templates/
  runtime/
  config/
test/
  init.test.ts
  doctor.test.ts
  fixtures/
docs/
  design/
  reference/
```

El código del harness sólo administra `templates/` y su estado de adopción. `.ai/SYSTEM.md`, `.ai/rules/*` y los archivos administrados por Gentle-AI siguen siendo fuentes canónicas con ownership independiente.

## Estado de adopción

`init` puede crear un único archivo de estado del harness en el proyecto objetivo:

```json
{
  "schemaVersion": 1,
  "harnessVersion": "<installed-version>",
  "runtimes": ["codex"],
  "templates": [{"path": "<relative-path>", "digest": "<content-digest>"}]
}
```

El archivo no guarda tokens, rutas absolutas, datos de clientes ni configuración opaca de proveedores. Antes de modificarlo, `init` compara versión y digests para informar si un archivo es propio, fue cambiado por el usuario o requiere una migración explícita.

## Contrato de `init`

```text
ai-engineering init --cwd <project> [--runtime <name>]... [--dry-run] [--force]
```

### Comportamiento

1. Resolver la raíz y confirmar que el destino es un proyecto real; nunca inicializar `$HOME` ni un directorio temporal como destino implícito.
2. Descubrir Git, archivos de instrucciones, `.ai/`, runtimes y configuración existente.
3. Calcular un plan: assets que crear, actualizar, preservar u omitir y causas de cada acción.
4. Con `--dry-run`, emitir el plan y no escribir bytes.
5. Sin `--force`, no sobrescribir un archivo cuyo digest no coincida con el estado previo del harness.
6. Aplicar escrituras atómicas, registrar el nuevo estado y devolver un reporte verificable.
7. Si una escritura falla, no declarar adopción completa; preservar los archivos previos y señalar la recuperación concreta.

`init` no instala binarios, no inicia sesión, no copia credenciales y no habilita RDD. Para assets de Gentle-AI, indica el comando oficial aplicable y verifica el resultado sólo si se ejecutó.

## Contrato de `doctor`

```text
ai-engineering doctor --cwd <project> [--format text|json]
```

Cada check devuelve `VERIFICADO`, `NO_VERIFICADO`, `BLOQUEADO` o `FALLIDO`, una evidencia breve y una remediación. El formato JSON es estable y apto para CI futuro; el formato de texto es para uso humano.

| Grupo | Checks P0 |
|---|---|
| Base | raíz válida, Git, fuentes canónicas presentes, estado del harness legible. |
| Integridad | templates registrados, digests esperados, ausencia de secretos y rutas absolutas en assets propios. |
| Runtimes | configuración y assets declarados para Codex, Claude Code, OpenCode y Pi. |
| Herramientas | disponibilidad de Gentle-AI, pnpm y CodeGraph cuando la política aplicable los requiere. |
| MCP | Stitch, Impeccable y Engram sólo si el runtime declara su integración; una ausencia es limitación explícita, no éxito. |
| Delivery | remoto Git, autenticación GitHub y Project aplicable como evidencia para iniciar fases. |

El doctor no interpreta a ciegas formatos privados de herramientas externas ni informa éxito a partir de la mera presencia de un ejecutable.

## Templates y ownership

Las plantillas sólo contienen referencias relativas, comentarios mínimos y placeholders explícitos. La configuración sensible se obtiene en tiempo de ejecución desde variables de entorno o mecanismos de credenciales del runtime; nunca desde el repositorio.

| Área | Owner | Regla |
|---|---|---|
| `.ai/SYSTEM.md` y reglas | Base | El harness las valida y referencia; no las reescribe. |
| Assets de Gentle-AI | Gentle-AI | El harness recomienda o invoca su flujo sólo de forma explícita. |
| Templates del harness | Harness | Puede crearlos, migrarlos y verificar su digest. |
| Configuración local y tokens | Usuario/runtime | No se versiona, no se copia y no se muestra en reportes. |

## Idempotencia, reversión y seguridad

- Dos ejecuciones consecutivas de `init` con el mismo estado no cambian archivos y producen un plan vacío o equivalente.
- Las escrituras se preparan en archivos temporales del mismo filesystem y se reemplazan sólo tras validación.
- `--force` requiere una advertencia explícita con los archivos que se reemplazarían.
- Cada cambio del harness registra un límite de rollback: eliminar únicamente los assets cuyo digest y ownership coincidan.
- Los reportes redactan secretos, home paths y valores de configuración sensibles.

## Matriz de conformance P0

| Runtime | Verificación mínima |
|---|---|
| Codex | Detectar configuración de workspace, fuentes canónicas y disponibilidad de MCP declarada. |
| Claude Code | Detectar configuración de workspace, fuentes canónicas y disponibilidad de MCP declarada. |
| OpenCode | Detectar `opencode.json` o configuración equivalente y capacidades declaradas. |
| Pi | Detectar `.pi/` o configuración equivalente y capacidades declaradas. |

La matriz no exige que los cuatro runtimes estén instalados en cada máquina. Un runtime ausente queda `NO_VERIFICADO`; un runtime requerido pero sin configuración queda `BLOQUEADO`.

## Verificación de la implementación

P0.2 y P0.3 deben incluir, como mínimo:

- pruebas de proyecto vacío, proyecto ya adoptado y archivo modificado por el usuario;
- prueba de `--dry-run` sin escrituras;
- prueba de segunda ejecución idempotente;
- fixtures por runtime, sin dependencias de una cuenta o secreto reales;
- tests del esquema JSON de `doctor` y de sus estados;
- smoke test real del CLI compilado;
- `pnpm` como único gestor de dependencias Node.js del harness.

## Criterio de cierre de diseño

El diseño queda listo cuando este documento, los issues P0.2–P0.4 y la política existente delimitan el comportamiento sin necesitar decisiones de producto, seguridad o ownership no resueltas. La implementación comienza por P0.2 y P0.3 en paralelo sólo si no modifican los mismos contratos o archivos.
