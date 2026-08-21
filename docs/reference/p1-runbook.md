# Runbook P1: operación y continuidad

## Autoridad

Gentle-AI manda la operación: proyecta y hace cumplir `.ai/SYSTEM.md`, `.ai/rules/gentle-ai.md` y las reglas locales en Codex, Claude Code, OpenCode y Pi. El harness observa y reporta; no reemplaza el ownership de Gentle-AI ni edita sus assets como mecanismo normal.

## Ciclo seguro de actualización

Ejecutar desde el proyecto adoptante:

```text
gentle-ai version
gentle-ai update
gentle-ai sync --dry-run
<revisar scope y notas de release>
<actualizar el binario por el método instalado>
gentle-ai version
gentle-ai sync
gentle-ai doctor
ai-engineering conformance --format json
```

Reglas:

- `update` comprueba disponibilidad; no se toma su salida como autorización para actualizar.
- `sync --dry-run` es obligatorio antes de una actualización relevante o cambio de agentes.
- `sync` sólo alcanza los agentes registrados en `~/.gentle-ai/state.json`, salvo selección explícita con `--agent`.
- Una actualización del binario no refresca assets; `sync` debe ejecutarse después.
- Si `doctor` o `conformance` detectan un bloqueo, se detiene la afirmación de readiness y se conserva la remediación.

## Verificación por runtime

| Runtime | Qué se puede afirmar | Qué requiere sesión real |
|---|---|---|
| Codex | Configuración y proyección detectadas | Que Codex cargó el prompt y ejecuta MCP en esta sesión |
| Claude Code | Configuración y proyección detectadas | Que Claude Code cargó reglas y subagentes con el scope esperado |
| OpenCode | Configuración, `gentle-orchestrator` o assets gestionados detectados | Que el overlay y MCP ejecutan el flujo foreground correcto |
| Pi | Agentes/paquete `gentle-pi` detectados | Que Pi refrescó assets y ejecuta chains con el prompt canónico |

No se infiere autenticación, MCP, Engram o continuidad de contexto por la sola presencia de archivos.

## Continuidad y compactación

Antes de compactar o abrir una sesión nueva:

1. Guardar un resumen con objetivo, decisiones, descubrimientos, archivos, evidencia y próximos pasos en Engram cuando el MCP esté alcanzable.
2. Registrar en GitHub Project el estado de la fase y el blocker concreto, sin copiar el detalle técnico completo.
3. Dejar el worktree limpio o describir exactamente los cambios no publicados.
4. Conservar el último commit, receipt RDD y comando de verificación.
5. Al retomar, ejecutar primero `gentle-ai review mode status`, `gentle-ai doctor` y `ai-engineering conformance --format json`.

Si Engram no responde, el resumen debe quedar en la respuesta y en el issue de la fase; no se debe afirmar continuidad automática.

## Rollback

- Para assets de Gentle-AI: usar `gentle-ai restore` y sus snapshots; no borrar archivos manualmente.
- Para assets del harness: revertir sólo archivos cuyo ownership y digest estén registrados por `init`.
- Para un cambio de código: revertir el commit candidato o usar una PR de corrección; no reescribir historia publicada.
- Después de cualquier restauración: ejecutar `gentle-ai doctor`, `gentle-ai sync --dry-run` y `ai-engineering conformance`.

## Estado actual de P1

P1 queda entregado con blockers explícitos:

- Gentle-AI local: `2.4.0`.
- RDD: `on`, decidido globalmente.
- Codex: duplicado en `PATH`.
- Engram MCP: handshake `initialize` fallido.
- OpenCode y Pi: no verificados en el target de conformance por falta de configuración de workspace.
- Conformance: `complete=false` correctamente; no se oculta ninguna limitación.

Seguimiento: <https://github.com/Sebailla/AI-ENGINEERING/projects>.
