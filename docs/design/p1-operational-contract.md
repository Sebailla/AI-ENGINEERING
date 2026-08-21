# Diseño P1.2: conformance operacional gobernado por Gentle-AI

## Decisión

Extender `ai-engineering conformance` en lugar de crear otro comando de readiness. El comando existente ya es de sólo lectura, produce JSON estable y separa los blockers externos; P1 agrega evidencia de Gentle-AI sin duplicar su ownership.

## Contrato de salida

El reporte conserva `complete`, `checks` y los estados `VERIFICADO`, `NO_VERIFICADO`, `BLOQUEADO` y `FALLIDO`. P1 agrega estos checks:

| Check | Fuente | Regla |
|---|---|---|
| `gentle-ai.version` | `gentle-ai version` | Verifica que el ejecutable responde y registra la versión observada. |
| `gentle-ai.sync-plan` | `gentle-ai sync --dry-run` | Registra agentes y componentes que el sync realmente alcanzaría; no aplica cambios. |
| `gentle-ai.doctor` | `gentle-ai doctor` | Conserva pass, warning y failure como evidencia separada; no colapsa warnings en éxito. |
| `runtime.adapter.<name>` | roots/configuración del runtime | Declara presencia y ownership; no prueba ejecución real de MCP o autenticación. |
| `context.continuity` | evidencia de Engram/runtime | `VERIFICADO` sólo con una comprobación representativa; handshake fallido queda `BLOQUEADO`. |

Cada check incluye `id`, `status`, `evidence`, `remediation` y, cuando aplica, `source` (`local-command`, `runtime-observation` o `external`). Los comandos ausentes, errores de parseo y timeouts son estados explícitos, nunca valores vacíos interpretados como éxito.

## Secuencia operacional

```text
version → sync --dry-run → doctor → runtime matrix → context continuity
```

La secuencia es de observación. `update`, `upgrade`, `sync` sin `--dry-run`, instalación, modificación de credenciales y edición de assets administrados quedan fuera del comando.

## Ownership y límites

- Gentle-AI sigue siendo owner de `~/.gentle-ai`, sus snapshots y los assets proyectados a cada runtime.
- El harness sólo captura stdout/stderr redactado y códigos de salida; no copia prompts, tokens, rutas privadas ni configuraciones completas.
- La matriz de adapters cubre Codex, Claude Code, OpenCode y Pi. Un root ausente es `NO_VERIFICADO`; un runtime declarado como requerido sin configuración es `BLOQUEADO`.
- La presencia de `gentle-orchestrator`, `gentle-ai` o `agent-routing` es una señal de proyección, no una prueba de que el runtime cargó el prompt durante una sesión.

## Estados agregados

`complete=true` sólo cuando todos los checks requeridos están `VERIFICADO`. Los checks opcionales no convierten un blocker requerido en éxito. El reporte debe conservar la diferencia entre:

- `FALLIDO`: el harness no pudo ejecutar o interpretar una comprobación que sí debía poder ejecutar.
- `BLOQUEADO`: una dependencia o estado externo impide verificarla.
- `NO_VERIFICADO`: no hay evidencia suficiente, sin afirmar que la capacidad falla.

## Rollback y controles negativos

- El comando no escribe archivos, no ejecuta `sync` aplicador y no cambia el estado global de Gentle-AI.
- Una prueba con un binario inexistente debe producir `NO_VERIFICADO` o `BLOQUEADO`, nunca `VERIFICADO`.
- Un `sync --dry-run` que devuelve código distinto de cero debe conservar el error y no producir un plan exitoso.
- Un handshake de Engram fallido debe impedir `context.continuity=VERIFICADO`.
- Las pruebas no dependen de cuentas, tokens ni los cuatro runtimes instalados.

## Verificación prevista para P1.3

1. Unit tests de parseo, estados y redacción de evidencia.
2. Fixtures para versión, dry-run y doctor exitosos, bloqueados y fallidos.
3. Smoke test del CLI compilado con el nuevo reporte.
4. `pnpm typecheck`, `pnpm test` y `pnpm pack`.
5. Una ejecución real de observación en este workspace, sin aplicar sync.

## Criterio de salida P1.2

Existe un contrato ejecutable y reversible para capturar la secuencia Gentle-AI y la matriz de runtimes. P1.3 puede implementar el slice sin decidir ownership, comandos peligrosos o semántica de estados nuevamente.
