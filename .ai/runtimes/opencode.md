# Adapter de OpenCode

Este adapter conecta la política canónica de esta base con OpenCode. Gentle-AI instala, sincroniza y verifica sus assets gestionados; OpenCode ejecuta el overlay multiagente y los comandos disponibles.

No es una segunda constitución. Las normas viven en [`../SYSTEM.md`](../SYSTEM.md) y la operación de Gentle-AI en [`../rules/gentle-ai.md`](../rules/gentle-ai.md).

## Ruta rápida

1. Configurá OpenCode con Gentle-AI y el scope que corresponda.
2. Confirmá que el `AGENTS.md` del workspace y las fuentes canónicas se resuelven antes de trabajar.
3. Usá el overlay multiagente sólo para misiones independientes y con ownership claro.
4. Tras actualizar Gentle-AI, ejecutá `sync --dry-run`, `sync`, `doctor` y una sesión representativa de OpenCode.

## Contrato de carga

Al iniciar una sesión en un proyecto que adopte esta base, el adapter debe entregar este orden de contexto:

1. `AGENTS.md` del workspace como punto de entrada;
2. `.ai/SYSTEM.md` como política canónica;
3. `.ai/rules/gentle-ai.md` como política de orquestación;
4. instrucciones y convenciones específicas del proyecto, si existen;
5. skills pertinentes, resueltos mediante el registry cuando esté disponible.

Gentle-AI proyecta el contexto de OpenCode mediante el overlay de `opencode.json`; el adapter no copia la constitución en perfiles, agentes o comandos. Si el runtime no puede descubrir alguna fuente, debe declararlo y no afirmar cumplimiento completo.

## Assets administrados

| Área | Ubicación o mecanismo | Ownership |
|---|---|---|
| Overlay, agentes y MCP | `~/.config/opencode/opencode.json` | Gentle-AI fusiona sus entradas administradas; preservar proveedores, agentes y servidores del usuario. |
| Skills | `~/.config/opencode/skills/` | Gestionados por instalación o sincronización de Gentle-AI. |
| Comandos | `~/.config/opencode/commands/` | Comandos SDD administrados por Gentle-AI. |
| Plugins | `~/.config/opencode/plugins/` | Gestionados por sus instaladores y Gentle-AI cuando corresponda. |
| Registry del proyecto | `.atl/skill-registry.md` y `.atl/.skill-registry.cache.json` | Generados por el refresh; no son una fuente normativa. |

El estado de los agentes gestionados reside en `~/.gentle-ai/state.json`. `gentle-ai sync` actualiza sólo esa selección registrada, salvo que se indique OpenCode explícitamente.

## Delegación y background workers

Gentle-AI instala un overlay multiagente de OpenCode en `opencode.json`: un orquestador y agentes de fases SDD. La delegación no es permiso para ocultar coordinación ni para paralelizar escrituras incompatibles.

- Usá workers de fondo únicamente para tareas independientes y de lectura: investigación acotada, inventario, análisis o verificación que no cambie archivos.
- No delegues a background workers escrituras dependientes, cambios sobre los mismos archivos, secuencias con handoff entre writers ni trabajo sujeto a RDD.
- Las escrituras dependientes, la integración del resultado y cualquier transición RDD permanecen en foreground, con un responsable claro y evidencia del candidato exacto.
- Si el overlay, el plugin de background o la capacidad de delegación no están disponibles, continuá en modo individual. No se reduce el estándar de seguridad, evidencia ni verificación.
- La delegación no selecciona SDD por sí sola; SDD sigue siendo una decisión explícita o aceptada.

## Puente operativo de interfaz asistida

Cuando el trabajo incluya interfaz, este runtime debe aplicar [`../rules/ui.md`](../rules/ui.md) sin asumir que Stitch o Impeccable están configurados. La disponibilidad, el nombre de la herramienta MCP, su schema y el método de recuperación se verifican en la sesión actual antes de usarlos.

1. Verificar que el MCP de Stitch y su operación para enviar el prompt estén disponibles; si no lo están, declarar la generación asistida como `BLOQUEADO`.
2. Enviar el prompt únicamente mediante la capacidad y el schema verificados. No inventar comandos, parámetros, identificadores ni formatos.
3. Detenerse y esperar que el cliente confirme explícitamente que la generación solicitada terminó. No hacer polling, recuperar, implementar ni iniciar la auditoría antes de esa confirmación.
4. Después de la confirmación, recuperar el artefacto sólo mediante una operación disponible. Si no se puede recuperar, solicitar enlace, exportación o adjunto autorizado; declarar el límite y no reconstruirlo como si fuera verificable.
5. Aplicar la UI al stack, sistema de diseño, accesibilidad y pruebas existentes del proyecto.
6. Verificar que Impeccable puede auditar el destino implementado. Ejecutar la auditoría sólo con su capacidad real; resolver los hallazgos relevantes o declararlos. Si no está disponible, informar `NO VERIFICADO` o `BLOQUEADO` sin simular la auditoría.

La confirmación del cliente habilita la recuperación, pero no demuestra por sí sola que el artefacto sea accesible ni que la implementación satisfaga requisitos funcionales o de accesibilidad.

## RDD y evidencia

RDD es controlado por el usuario. Cuando está activo, la revisión y la autorización se vinculan al candidato exacto; no se envía trabajo RDD a background workers ni se fabrican receipts con resultados parciales.

Si RDD está desactivado, aplicar el proceso ordinario del repositorio y declarar `disabled/unmanaged` cuando corresponda. No reactivarlo automáticamente.

## Operación y actualización

```bash
# Inspeccionar binario y assets previstos
gentle-ai version
gentle-ai sync --dry-run --agent opencode

# Tras actualizar el binario
gentle-ai sync --agent opencode
gentle-ai doctor
```

Antes de sincronizar, revisar las notas de release y confirmar que OpenCode está registrado en `state.json`. Para modelos custom, `opencode.json` debe conservar su configuración; cuando deban aparecer como opciones aptas para SDD en el selector, la documentación actual de Gentle-AI requiere `tool_call: true`. Ejecutá `opencode models --refresh` después de conectar proveedores si necesitás el modo multi-modelo.

No edites los bloques generados como mecanismo normal de actualización. Usá el flujo de Gentle-AI y separá las customizaciones de proyecto de los assets gestionados.

## Verificación del adapter

- [ ] OpenCode aparece como agente gestionado en `~/.gentle-ai/state.json`.
- [ ] `gentle-ai sync --dry-run --agent opencode` muestra sólo el alcance esperado.
- [ ] `gentle-ai sync --agent opencode` termina sin errores.
- [ ] `gentle-ai doctor` no reporta un fallo que impida OpenCode, Engram o el MCP requerido.
- [ ] `opencode.json` conserva las entradas no gestionadas y contiene el overlay esperado.
- [ ] Una sesión de OpenCode en el workspace reconoce `AGENTS.md` y sus fuentes canónicas.
- [ ] Todo background worker usado fue independiente, de lectura y ajeno a RDD.

## Límites

Este adapter no fija proveedores, modelos, perfiles de fase ni el número de workers. Son decisiones del usuario, del proyecto y de la versión compatible de OpenCode. El adapter tampoco garantiza que un plugin de fondo esté instalado: esa capacidad se verifica, no se presupone.

## Referencias dinámicas

- [Documentación de agentes de Gentle-AI](https://github.com/Gentleman-Programming/gentle-ai/blob/main/docs/agents.md)
- [Uso y sincronización de Gentle-AI](https://github.com/Gentleman-Programming/gentle-ai/blob/main/docs/usage.md)
- [Repositorio de OpenCode](https://github.com/anomalyco/opencode)
