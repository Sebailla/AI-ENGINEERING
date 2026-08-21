# Verificación P1.4: readiness y recuperación

## Alcance

Se verificó el candidato P1.3 publicado en `feat/p0-harness-bootstrap` con pruebas locales, packaging, CLI compilado y observación real del ecosistema Gentle-AI. No se ejecutó `sync` aplicador ni se modificaron assets gestionados.

## Resultados reproducibles

| Comando | Resultado |
|---|---|
| `pnpm typecheck` | exit 0 |
| `pnpm test` | 14 passed, 0 failed |
| `pnpm pack` | exit 0; incluye `dist/src/cli.js` y cuatro templates de runtime |
| `node dist/src/cli.js conformance --cwd . --format json` | exit 2; `complete=false`, 6 blockers explícitos |
| `gentle-ai sync --dry-run` | exit 0; 4 agentes registrados, 19 pasos de aplicación previstos, sin aplicar cambios |
| `gentle-ai doctor` | 9 checks passed, 1 failed, 1 warning; estado `unhealthy` |

## Matriz observada

| Caso | Estado | Evidencia |
|---|---|---|
| `bootstrap.dry-run` | `VERIFICADO` | No escribe estado de adopción. |
| `doctor.readiness` | `NO_VERIFICADO` | El doctor del harness conserva checks pendientes. |
| `runtime.codex` | `VERIFICADO` | Configuración de workspace detectada. |
| `runtime.claude-code` | `VERIFICADO` | Configuración de workspace detectada. |
| `runtime.opencode` | `NO_VERIFICADO` | No se detectó configuración de workspace en el target. |
| `runtime.pi` | `NO_VERIFICADO` | No se detectó configuración de workspace en el target. |
| `gentle-ai.version` | `VERIFICADO` | `gentle-ai 2.4.0`. |
| `gentle-ai.sync-plan` | `VERIFICADO` | Plan read-only para `claude-code`, `opencode`, `pi` y `codex`. |
| `gentle-ai.doctor` | `VERIFICADO` | El proceso terminó y sus advertencias se conservaron. |
| `context.continuity` | `BLOQUEADO` | Engram MCP no completa el handshake `initialize`. |
| `templates.portability` | `VERIFICADO` | Templates relativos, enlazados a la política y sin secretos. |

## Blockers residuales

1. El entorno tiene dos ejecutables `codex` en `PATH`; debe quedar uno solo.
2. El servidor MCP de Engram no responde al handshake de inicialización.
3. OpenCode y Pi no tienen configuración de workspace en este target; no se infiere que sus runtimes fallen.
4. El estado de adopción del harness aún no existe en este workspace.
5. El Project de GitHub es evidencia externa y se verifica fuera de archivos locales.
6. `complete=false` es correcto: la entrega no oculta blockers ni convierte `NO_VERIFICADO` en éxito.

## Controles de recuperación

- Un comando Gentle-AI fallido queda `BLOQUEADO` y conserva su remediación.
- Un comando exitoso sin salida queda `NO_VERIFICADO`.
- Un handshake Engram fallido impide declarar continuidad de contexto.
- La evidencia sensible se redacta antes de formar el reporte.
- Repetir conformance es seguro porque todas sus operaciones son de observación.

## Criterio de salida

La implementación y la matriz están verificadas con evidencia local y los límites externos son visibles. La iniciativa no se marca completa mientras los blockers permanezcan, pero P1.5 puede documentar el runbook y las decisiones de entrega.
