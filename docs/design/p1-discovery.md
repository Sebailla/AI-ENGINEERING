# Descubrimiento P1.1: adopción y conformance operacional

## Resultado

P0 dejó un harness ejecutable y verificable, pero todavía no prueba que un proyecto adoptante esté operativamente alineado con Gentle-AI. P1 debe cerrar esa brecha sin apropiarse de assets administrados por Gentle-AI.

## Evidencia local

| Señal | Resultado | Interpretación |
|---|---|---|
| `gentle-ai version` | `2.4.0` | El binario estable está instalado. |
| `gentle-ai review mode status --cwd .` | `on`, decisión global | RDD sigue habilitado explícitamente. |
| `gentle-ai sync --dry-run` | `claude-code`, `opencode`, `pi`, `codex`; 19 pasos de aplicación | El alcance efectivo proviene de los agentes registrados. No se aplicó ningún cambio. |
| `gentle-ai doctor` | 4 agentes registrados; assets en `2.4.0` | La instalación está registrada, pero el entorno no está saludable. |
| Codex | Duplicado en `PATH` | Bloqueo operativo externo: hay dos ejecutables resolubles. |
| Engram MCP | Handshake `initialize` fallido | Bloqueo operativo externo; no se puede afirmar memoria MCP disponible. |
| `gentle-ai update` | Consulta incompleta por DNS/API | No se verificó una versión más nueva desde este entorno; no se actualizó nada. |

La inspección de los roots locales encontró configuración para Claude Code, OpenCode, Pi y Codex. Los assets gestionados contienen referencias de Gentle-AI en Claude Code, OpenCode y Codex; Pi expone agentes `gentle-ai-*` y el paquete `gentle-pi`, pero su proyección no debe inferirse desde una coincidencia textual en dos archivos JSON.

## Evidencia oficial

- La release estable `v2.4.0` fue publicada después de la serie `v2.4.0-rc.1` a `rc.8`.
- La actualización del binario no refresca los assets: después de `upgrade` se debe ejecutar `gentle-ai sync`.
- `sync` opera sobre los agentes registrados en `~/.gentle-ai/state.json`, no sobre todos los directorios de agentes existentes.
- `sync --dry-run` es la previsualización del alcance y `doctor` es el diagnóstico de sólo lectura.

Fuentes: [release estable v2.4.0](https://github.com/Gentleman-Programming/gentle-ai/releases/tag/v2.4.0), [uso y sincronización](https://github.com/Gentleman-Programming/gentle-ai/blob/main/docs/usage.md), [trigger rules](https://github.com/Gentleman-Programming/gentle-ai/blob/main/docs/trigger-rules.md).

## Invariante P1 seleccionada

> El harness sólo puede declarar conformance operacional cuando conserva el ownership de Gentle-AI, registra el alcance de `sync --dry-run`, ejecuta `doctor` después de una actualización y separa evidencia local de capacidades externas no verificadas.

### Límites

- El harness no edita `~/.gentle-ai`, configuraciones de runtime ni credenciales como mecanismo normal.
- La presencia de un binario, una configuración o un adapter no prueba que el runtime pueda ejecutar MCP, memoria o autenticación.
- El harness no actualiza Gentle-AI automáticamente en P1. La actualización y la selección de versión siguen siendo una decisión operativa explícita.

## Entrada a P1.2

P1.2 debe convertir esta invariante en contratos ejecutables para:

1. Capturar versión, agentes registrados y plan de `sync --dry-run` sin secretos.
2. Registrar la secuencia `version → update → sync → doctor` y sus resultados.
3. Modelar la matriz de conformance de Codex, Claude Code, OpenCode y Pi con estados honestos.
4. Definir rollback y recuperación cuando `doctor` detecta un bloqueo.
5. Añadir continuidad de contexto como evidencia, sin confundir Engram no alcanzable con memoria disponible.

## Criterio de salida P1.1

El alcance, la invariante, los blockers y la evidencia están documentados. La siguiente fase puede diseñar contratos sin decidir nuevamente ownership, versión o límites de verificación.
