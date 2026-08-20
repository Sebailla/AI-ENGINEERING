# Adapter de Pi

Este adapter conecta la política canónica de esta base con Pi. Gentle-AI gestiona la integración de alto nivel, mientras que el paquete `gentle-pi` posee en Pi los prompts, skills, agentes SDD y chains en tiempo de ejecución.

No es una segunda constitución. Las normas viven en [`../SYSTEM.md`](../SYSTEM.md) y la operación de Gentle-AI en [`../rules/gentle-ai.md`](../rules/gentle-ai.md).

## Ruta rápida

1. Instalá Pi antes de configurarlo con Gentle-AI.
2. Confirmá que `gentle-pi` y las dependencias de Pi gestionadas por Gentle-AI están disponibles.
3. Iniciá Pi normalmente para que su hook de sesión pueda refrescar los assets del proyecto sin sobrescribir archivos locales.
4. Tras actualizar Gentle-AI o paquetes de Pi, verificá el plan de `sync`, ejecutá `sync`, `doctor` y una sesión representativa de Pi.

## Contrato de carga

Al iniciar una sesión normal en un proyecto que adopte esta base, el adapter debe entregar este orden de contexto:

1. `AGENTS.md` del workspace como punto de entrada;
2. `.ai/SYSTEM.md` como política canónica;
3. `.ai/rules/gentle-ai.md` como política de orquestación;
4. instrucciones y convenciones específicas del proyecto, si existen;
5. skills pertinentes y el registry disponible para la sesión.

`gentle-pi` realiza la proyección de runtime y posee sus prompts, skills, agentes SDD y chains. Esta base los referencia; no crea copias paralelas bajo `.pi/`. Si una fuente canónica no puede resolverse, Pi debe declararlo y no afirmar cumplimiento completo.

> **Atención:** `pi -ns` (o `pi --no-skills`) saltea la carga de skills y los hooks de inicio. En ese modo no ocurre el refresh automático de registry ni de assets de inicio; no debe declararse que el contexto se refrescó. Ejecutá el refresh manual cuando necesites reglas actualizadas en esa sesión.

## Assets administrados

| Área | Ubicación o mecanismo | Ownership |
|---|---|---|
| Integración de Pi | Paquetes instalados mediante `pi install` | Gentle-AI instala el stack; cada paquete administra su comportamiento. |
| Prompts, skills, agentes y chains | `gentle-pi` en runtime; assets de proyecto bajo `.pi/agents/`, `.pi/chains/` y `.pi/gentle-ai/support/` | `gentle-pi` los proyecta al inicio sin sobrescribir archivos locales, salvo recuperación explícita con `--force`. |
| Configuración de modelos y persona | `gentle-pi` y sus comandos | El paquete es dueño de estos flujos; no duplicarlos en esta base. |
| Memoria y MCP de Engram | `gentle-engram`, `pi-mcp-adapter` y la configuración que inicializa `pi-engram` | Gestionados por sus paquetes; preservar entradas ajenas. |
| Registry del proyecto | `.atl/skill-registry.md` y `.atl/.skill-registry.cache.json` | Generados por el refresh; no son una fuente normativa. |

El estado de los agentes gestionados reside en `~/.gentle-ai/state.json`. `gentle-ai sync` actualiza sólo esa selección registrada, salvo que se indique Pi explícitamente.

## Delegación y degradación segura

Pi usa subagentes administrados por paquetes: `pi-subagents` descubre y ejecuta los assets disponibles en `.pi/agents/`, y `gentle-pi` provee los agentes y chains SDD.

- Para trabajo directo y acotado, ejecutar en el agente principal.
- Para una misión aislable, usar los agentes o chains realmente presentes y pasar objetivo, restricciones y evidencia esperada.
- No asumir que un agente, chain, paquete o modelo está instalado sólo porque figura en documentación; verificarlo en la sesión.
- Si las capacidades de subagentes, hooks, MCP o memoria faltan, continuar en modo individual o declarar el bloqueo. No se reduce el estándar de seguridad, evidencia ni verificación.
- La delegación no convierte un cambio automáticamente en SDD; SDD sigue siendo una decisión explícita o aceptada.

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

RDD es controlado por el usuario. Cuando está activo, la revisión y la autorización se vinculan al candidato exacto; los subagentes y chains no pueden fabricar, reutilizar ni eludir receipts.

Si RDD está desactivado, seguir el proceso ordinario del repositorio y declarar `disabled/unmanaged` cuando corresponda. No reactivarlo automáticamente.

## Operación y actualización

```bash
# Inspeccionar binario y assets previstos
gentle-ai version
gentle-ai sync --dry-run --agent pi

# Tras actualizar el binario o los componentes afectados
gentle-ai sync --agent pi
gentle-ai doctor
```

Antes de sincronizar, revisar las notas de release y confirmar que Pi está registrado en `state.json`. En una sesión normal, `gentle-pi` refresca sus assets de proyecto sin sobrescribir archivos locales. Si se inició con `pi -ns`, ejecutar el refresh manual de registry antes de depender de reglas cambiadas:

```bash
gentle-ai skill-registry refresh --force
```

Para reparar assets SDD de Pi, usar los comandos actuales que exponga `gentle-pi`; `--force` es una recuperación explícita y requiere revisar el impacto antes de usarla. No editar los assets gestionados para sustituir el flujo de sincronización.

## Verificación del adapter

- [ ] Pi aparece como agente gestionado en `~/.gentle-ai/state.json`.
- [ ] `gentle-ai sync --dry-run --agent pi` muestra sólo el alcance esperado.
- [ ] `gentle-ai sync --agent pi` termina sin errores.
- [ ] `gentle-ai doctor` no reporta un fallo que impida Pi, `gentle-pi`, Engram o el MCP requerido.
- [ ] Una sesión normal de Pi en el workspace reconoce `AGENTS.md` y sus fuentes canónicas.
- [ ] Si la sesión usa `pi -ns`, se declaró la ausencia de hooks/refresh y se ejecutó el refresh manual necesario.
- [ ] La disponibilidad de subagentes, chains, MCP y memoria fue comprobada en vez de asumida.

## Límites

Este adapter no fija modelos, asignaciones de fase, persona, paquetes ni versiones de Pi. Esas capacidades cambian con los paquetes compatibles y deben verificarse en su documentación vigente. `pi -ns` es compatible con una sesión reducida, pero no con afirmar que los hooks de inicio aplicaron o que el registry se refrescó automáticamente.

## Referencias dinámicas

- [Documentación de agentes de Gentle-AI](https://github.com/Gentleman-Programming/gentle-ai/blob/main/docs/agents.md)
- [Uso y sincronización de Gentle-AI](https://github.com/Gentleman-Programming/gentle-ai/blob/main/docs/usage.md)
- [Repositorio de gentle-pi](https://github.com/Gentleman-Programming/gentle-pi)
- [Paquete gentle-pi](https://www.npmjs.com/package/gentle-pi)
