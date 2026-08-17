# Adapter de Codex

Este adapter conecta la política canónica de esta base con Codex. Gentle-AI es el orquestador: instala, sincroniza y verifica los assets administrados; Codex ejecuta las capacidades nativas disponibles.

No es una segunda constitución. Las normas viven en [`../SYSTEM.md`](../SYSTEM.md) y la operación de Gentle-AI en [`../rules/gentle-ai.md`](../rules/gentle-ai.md).

## Ruta rápida

1. Configurá Codex con Gentle-AI usando el scope apropiado.
2. Confirmá que `AGENTS.md` y las reglas canónicas del workspace se cargan antes de trabajar.
3. Usá delegación nativa sólo si sus herramientas están disponibles; de lo contrario continuá en modo individual.
4. Después de una actualización, ejecutá `sync --dry-run`, `sync`, `doctor` y una sesión de verificación.

## Contrato de carga

Al iniciar una sesión en un proyecto que adopte esta base, el adapter debe entregar este orden de contexto:

1. `AGENTS.md` del workspace como punto de entrada;
2. `.ai/SYSTEM.md` como política canónica;
3. `.ai/rules/gentle-ai.md` como política de orquestación;
4. instrucciones y convenciones específicas del proyecto, si existen;
5. skills pertinentes, resueltos mediante el registry cuando esté disponible.

No copiar el contenido de estas fuentes en perfiles, prompts o skills del adapter. El adapter referencia y carga las fuentes canónicas. Si Codex no puede descubrir una de ellas, debe declararlo y no afirmar cumplimiento completo.

## Assets administrados

| Área | Ubicación o mecanismo | Ownership |
|---|---|---|
| Configuración global | `~/.codex/config.toml` | Gentle-AI actualiza sus bloques gestionados sin borrar entradas ajenas. |
| Prompt global | `~/.codex/AGENTS.md` | Complementa, no reemplaza, las instrucciones del workspace. |
| Skills | `~/.codex/skills/` | Gestionados por la instalación o sincronización de Gentle-AI. |
| Memoria | `~/.codex/engram-instructions.md` y MCP configurado | Gestionado por Engram y Gentle-AI. |
| MCP | Bloques `[mcp_servers.<name>]` en `~/.codex/config.toml` | Upsert de los servidores administrados; preservar servidores del usuario. |
| Perfiles SDD | `~/.codex/<nombre>.config.toml` | Opcionales; seleccionar con `codex --profile <nombre>`. |

El estado de los agentes gestionados reside en `~/.gentle-ai/state.json`. `gentle-ai sync` sólo actualiza esa selección registrada, salvo que se indique un agente explícitamente.

## Delegación y degradación segura

Codex puede utilizar delegación nativa cuando la configuración y las herramientas `spawn_agent`, `wait_agent` y `list_agents` están disponibles. Gentle-AI puede configurar esa capacidad; el adapter no debe asumirla.

- Para trabajo directo y acotado, ejecutar en el agente principal.
- Para exploración o escritura que requiera contexto aislado, delegar una misión concreta con objetivo, restricciones y evidencia esperada.
- Si las herramientas nativas faltan o están deshabilitadas, continuar en modo individual sin reducir requisitos de seguridad, evidencia ni verificación.
- La delegación no convierte automáticamente un cambio en SDD. SDD continúa siendo una decisión explícita o aceptada.

## RDD y evidencia

RDD es controlado por el usuario. Cuando está activo, la review y la autorización se vinculan al candidato exacto; el adapter no debe recrear, aprobar ni eludir receipts por su cuenta.

Si RDD está desactivado, seguir el proceso ordinario del repositorio y declarar la disposición `disabled/unmanaged` cuando corresponda. No reactivarlo automáticamente.

## Operación y actualización

```bash
# Inspeccionar binario y assets previstos
gentle-ai version
gentle-ai sync --dry-run --agent codex

# Tras actualizar el binario
gentle-ai sync --agent codex
gentle-ai doctor
```

Antes de sincronizar, revisar las notas de release y confirmar que Codex está registrado en `state.json`. Nunca editar manualmente los assets generados para resolver una actualización; usar el flujo de Gentle-AI o conservar la personalización en una capa de proyecto separada.

## Verificación del adapter

- [ ] Codex aparece como agente gestionado en `~/.gentle-ai/state.json`.
- [ ] `gentle-ai sync --dry-run --agent codex` muestra sólo el alcance esperado.
- [ ] `gentle-ai sync --agent codex` finaliza sin errores.
- [ ] `gentle-ai doctor` no reporta un fallo que impida Codex, Engram o el MCP requerido.
- [ ] Una sesión de Codex en el workspace reconoce `AGENTS.md` y sus fuentes canónicas.
- [ ] La presencia o ausencia de delegación nativa fue comprobada, no supuesta.

## Límites

Este adapter documenta la integración de Codex; no fija modelos, proveedores, niveles de esfuerzo ni perfiles SDD universales. Son decisiones dependientes del proyecto, del usuario y de la versión compatible de Codex.

## Referencias dinámicas

- [Documentación de agentes de Gentle-AI](https://github.com/Gentleman-Programming/gentle-ai/blob/main/docs/agents.md)
- [Uso y sincronización de Gentle-AI](https://github.com/Gentleman-Programming/gentle-ai/blob/main/docs/usage.md)
