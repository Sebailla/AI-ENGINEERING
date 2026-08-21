# P0: conformance y readiness operacional

P0.4 agrega el comando de sólo lectura `ai-engineering conformance`. Ejecuta un dry-run del bootstrap, el doctor, la matriz de runtimes y la validación de templates. No instala binarios, no modifica el proyecto y no infiere autenticación, MCP o acceso a GitHub.

## Uso

```bash
node dist/src/cli.js conformance --cwd <project> --format json
```

El proceso devuelve código `0` sólo cuando todos los casos están `VERIFICADO`. Devuelve código `2` cuando la implementación está operativa pero quedan checks `NO_VERIFICADO` o bloqueos externos. Un caso `FALLIDO` requiere corregir el harness.

## Casos

| Caso | Evidencia |
|---|---|
| `bootstrap.dry-run` | `init --dry-run` completó sin escribir el estado. |
| `doctor.readiness` | Readiness agregada por el doctor, con blockers explícitos. |
| `runtime.<name>` | Configuración de workspace detectada o ausencia declarada. |
| `templates.portability` | Templates relativos, enlazados a la política y sin secretos. |

## Verificación reproducible

Ejecutado el 2026-08-21 en este workspace:

```text
pnpm typecheck                 exit 0
pnpm test                      13 passed, 0 failed
pnpm pack                      dist/src/cli.js y cuatro templates presentes
node dist/src/cli.js conformance --cwd . --format json
                              exit 2; complete=false; 4 blockers externos/operativos
```

El `exit 2` es esperado mientras el proyecto no tenga estado de adopción y el acceso al Project de GitHub no se haya verificado desde el runtime. No representa una falla del código del harness.

Gentle-AI sigue siendo el owner de sus assets administrados: este comando sólo informa la remediación oficial y nunca los sobrescribe.
