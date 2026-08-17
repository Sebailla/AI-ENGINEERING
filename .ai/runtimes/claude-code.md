# Adapter de Claude Code

Este adapter conecta la política canónica de esta base con Claude Code. Gentle-AI instala, sincroniza y verifica los assets que administra; Claude Code ejecuta la carga de instrucciones, MCP, skills y subagentes nativos.

No es una segunda constitución. Las normas viven en [`../SYSTEM.md`](../SYSTEM.md) y la operación de Gentle-AI en [`../rules/gentle-ai.md`](../rules/gentle-ai.md).

## Ruta rápida

1. Configurá Claude Code con Gentle-AI usando el scope apropiado.
2. Confirmá que `AGENTS.md` del workspace y las fuentes canónicas se cargan antes de trabajar.
3. Delegá con `Task` sólo misiones independientes, completas y verificables.
4. Tras actualizar Gentle-AI, ejecutá `sync --dry-run`, `sync`, `doctor` y una sesión representativa.

## Contrato de carga

Al iniciar una sesión en un proyecto que adopte esta base, el adapter debe entregar este orden de contexto:

1. `AGENTS.md` del workspace como punto de entrada;
2. `.ai/SYSTEM.md` como política canónica;
3. `.ai/rules/gentle-ai.md` como política de orquestación;
4. instrucciones y convenciones específicas del proyecto, si existen;
5. skills pertinentes resueltos por el registry cuando esté disponible.

Gentle-AI proyecta los bloques administrados de Claude Code; el adapter no copia la constitución en `CLAUDE.md`, prompts o skills. Si no puede descubrir una fuente canónica, debe declararlo y no afirmar cumplimiento completo.

## Assets administrados

| Área | Ubicación o mecanismo | Ownership |
|---|---|---|
| Configuración global | `~/.claude/` | Gentle-AI administra sólo sus archivos y secciones reconocibles. |
| Prompt global | Secciones Markdown gestionadas en `~/.claude/CLAUDE.md` | Complementa las instrucciones del workspace; preservar contenido ajeno. |
| Skills | `~/.claude/skills/` | Gestionados por la instalación o sincronización de Gentle-AI. |
| MCP | Plugins y configuración bajo `~/.claude/mcp/` | Gentle-AI gestiona sus entradas sin eliminar servidores del usuario. |
| Output styles | `~/.claude/output-styles/` | Gestionados según el preset elegido; las customizaciones ajenas permanecen fuera de bloques administrados. |
| Subagentes SDD | Assets del adapter configurados por Gentle-AI | Reflejan la política canónica; no crear copias divergentes. |

El estado de los agentes gestionados reside en `~/.gentle-ai/state.json`. `gentle-ai sync` actualiza esa selección registrada, salvo que se indique un agente explícitamente.

## Delegación con `Task`

Claude Code ofrece subagentes nativos mediante `Task`, cada uno con una ventana de contexto aislada. El orquestador conserva la responsabilidad del alcance y de la integración.

- Delegá una misión autocontenida: objetivo, rutas, restricciones, evidencia esperada y criterio de retorno.
- Sólo paralelizá trabajo realmente independiente; las dependencias y los writers sobre el mismo worktree se resuelven secuencialmente.
- Tratá el resultado de un subagente como un informe, no como evidencia definitiva: verificá archivos, comandos y efectos externos antes de declararlos correctos.
- Si `Task` o la delegación nativa no están disponibles, continuá en modo individual sin disminuir requisitos de seguridad, evidencia ni verificación.
- Delegar no activa SDD automáticamente; SDD requiere solicitud explícita o aceptación.

## RDD y evidencia

RDD es controlado por el usuario. Si está activo, la revisión y la autorización se vinculan al candidato exacto; ningún subagente puede fabricar, reutilizar o eludir receipts.

Si RDD está desactivado, seguir el proceso ordinario del repositorio y declarar `disabled/unmanaged` cuando corresponda. No reactivarlo automáticamente.

## Operación y actualización

```bash
# Inspeccionar assets previstos
gentle-ai version
gentle-ai sync --dry-run --agent claude-code

# Tras actualizar el binario
gentle-ai sync --agent claude-code
gentle-ai doctor
```

Antes de sincronizar, revisar las notas de release y confirmar que Claude Code está registrado en `state.json`. No editar manualmente los assets generados para resolver una actualización; usar el flujo de Gentle-AI o mantener la personalización en una capa de proyecto separada.

## Verificación del adapter

- [ ] Claude Code aparece como agente gestionado en `~/.gentle-ai/state.json`.
- [ ] `gentle-ai sync --dry-run --agent claude-code` muestra sólo el alcance esperado.
- [ ] `gentle-ai sync --agent claude-code` finaliza sin errores.
- [ ] `gentle-ai doctor` no reporta un fallo que impida Claude Code, Engram o el MCP requerido.
- [ ] Una sesión de Claude Code en el workspace reconoce `AGENTS.md` y sus fuentes canónicas.
- [ ] Cada subagente utilizado recibió una misión autocontenida y su resultado fue verificado.

## Límites

Este adapter no fija modelos, permisos, hooks, personas ni fases SDD universales. Son decisiones dependientes del proyecto, del usuario y de la versión compatible de Claude Code.

## Referencias dinámicas

- [Documentación de agentes de Gentle-AI](https://github.com/Gentleman-Programming/gentle-ai/blob/main/docs/agents.md)
- [Uso y sincronización de Gentle-AI](https://github.com/Gentleman-Programming/gentle-ai/blob/main/docs/usage.md)
