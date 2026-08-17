# Política de contexto, compacción y continuidad

El contexto es un recurso finito. Esta base conserva lo importante fuera de la conversación y carga sólo la información necesaria para la decisión actual. El objetivo no es mantener una sesión indefinidamente: es preservar continuidad, evidencia y criterio cuando una sesión debe compactarse o continuar en otra.

## Ruta rápida

1. Iniciar con un entrypoint corto y fuentes canónicas referenciadas.
2. Cargar reglas, skills, archivos y evidencia de forma progresiva.
3. Evaluar el riesgo de pérdida de contexto en background o en checkpoints seguros.
4. Persistir decisiones, evidencia y próximo paso antes de una compactación o cambio de sesión.
5. Reanudar desde un handoff compacto y releer las fuentes canónicas.

## Invariantes

| Principio | Norma |
|---|---|
| Contexto mínimo útil | No inyectar documentación completa, diffs, logs o reglas no pertinentes al inicio de cada sesión. |
| Fuentes durables | Las reglas viven en Git; decisiones y actividad relevante viven en Engram o en artefactos versionados. La conversación no es la única fuente de verdad. |
| Carga progresiva | Cargar el contenido detallado sólo cuando la tarea, un skill o una decisión lo requieren. |
| Prevención | Evaluar riesgo antes de agotar contexto o perder continuidad; no esperar al error de overflow. |
| Handoff verificable | No recomendar una nueva sesión sin preservar objetivo, decisiones, evidencia, cambios y siguiente acción. |
| Transparencia | Declarar qué se cargó, resumió, omitió o no pudo persistirse. No afirmar monitoreo continuo si el runtime no lo permite. |

## Contexto inicial

El contexto inicial debe ser pequeño y estable:

1. `AGENTS.md` como entrypoint;
2. referencia a `.ai/SYSTEM.md` y a las reglas aplicables;
3. objetivo de la tarea actual y restricciones explícitas;
4. resumen de sesión o handoff, si existe;
5. índice de skills y capacidades, no el contenido completo de todos los skills.

No duplicar la constitución en prompts por runtime. Los adapters de Gentle-AI deben proyectar las referencias canónicas y permitir su carga bajo demanda.

## Carga progresiva

Cargar información según necesidad, en este orden:

| Necesidad | Contexto a cargar |
|---|---|
| Cambio local conocido | Archivos y reglas del módulo afectado. |
| Tecnología o API | Versión del proyecto y documentación primaria actual. |
| Cambio transversal | Mapa estructural, límites arquitectónicos y reglas relevantes. |
| Delegación | Misión autocontenida, rutas, restricciones y evidencia esperada; no toda la conversación. |
| Revisión o entrega | Diff enfocado, pruebas, estado Git y evidencia del candidato exacto. |

Preferir resúmenes estructurados, paths, identificadores y comandos reproducibles frente a copiar tool output extenso. Limitar logs, resultados de búsqueda y diffs a la porción necesaria; conservar el artefacto completo fuera del prompt cuando sea necesario para auditoría.

## Centinela de contexto

El **centinela de contexto** evalúa el riesgo de pérdida de continuidad sin modificar trabajo ni abrir una sesión nueva por su cuenta. Su resultado es una recomendación basada en evidencia.

### Señales de riesgo

Evaluar las señales que el runtime exponga:

- presión de ventana de contexto, tokens o mensajes acumulados;
- respuestas de herramientas, logs, diffs o documentos excesivamente grandes;
- cantidad de subtareas, ramas de razonamiento o delegaciones activas;
- decisiones, bugs, hallazgos o preferencias aún no persistidos;
- cambios no committeados, verificaciones pendientes o efectos externos sin confirmar;
- instrucciones dinámicas que podrían perderse tras compactación;
- errores de truncado, compactación fallida o `context_length_exceeded` previos.

No inferir una métrica que el runtime no expone. La ausencia de una métrica reduce certeza; no demuestra que el riesgo sea bajo.

### Ejecución

- Cuando el runtime permita evaluación en background, ejecutarla en límites seguros y no interrumpir una operación crítica.
- Cuando no exista background real, evaluar en checkpoints: antes de investigación amplia, tool output grande, delegación, cambio de fase, review, commit, release o respuesta extensa.
- La evaluación no debe cargar contexto adicional masivo ni iniciar herramientas costosas sólo para medir tokens.
- Un adapter puede usar señales nativas de compacción, pero no debe prometer que todos los runtimes compactan de la misma forma o con el mismo umbral.

### Estados y acciones

| Estado | Significado | Acción |
|---|---|---|
| **NORMAL** | Contexto suficiente y estado durable actualizado. | Continuar. |
| **OBSERVAR** | Una o más señales crecen, pero no hay riesgo inmediato. | Reducir output, cargar bajo demanda y persistir decisiones próximas. |
| **HANDOFF RECOMENDADO** | Riesgo relevante de degradación o pérdida de continuidad. | Preparar y validar handoff compacto; sugerir nueva sesión al usuario. |
| **CRÍTICO** | Riesgo alto, truncado o compactación fallida detectada. | Detener expansión de contexto, persistir estado mínimo y pedir continuar en nueva sesión. |
| **BLOQUEADO** | No se pudo persistir o verificar información esencial. | Declarar la causa; no afirmar una transición segura. |

El usuario decide abrir una sesión nueva. El centinela recomienda y prepara evidencia; nunca archiva, reinicia, descarta ni transfiere trabajo silenciosamente.

## Compacción segura

Antes de compactar o resumir:

1. persistir decisiones, preferencias, bugs, hallazgos y cambios de dirección relevantes;
2. registrar objetivo, estado Git, archivos afectados, verificaciones ejecutadas y resultados;
3. conservar comandos, errores, URLs y artefactos sólo si son necesarios para continuar;
4. producir un resumen orientado a la próxima acción, no una transcripción;
5. confirmar que el resumen no contiene secretos, tokens, datos personales ni tool output innecesario.

Después de una compactación o al iniciar una sesión nueva:

1. releer `AGENTS.md`, `.ai/SYSTEM.md` y reglas aplicables;
2. recuperar el handoff y la memoria persistente relevante;
3. verificar el estado actual del repositorio antes de asumir que sigue igual;
4. declarar cualquier parte del contexto anterior que no se pudo recuperar;
5. continuar sólo después de reconciliar objetivo, cambios, decisiones y evidencia.

## Contrato de handoff

Un handoff compacto debe contener únicamente lo que evita repetir trabajo o tomar una decisión inconsistente:

```markdown
## Objetivo
[resultado actual]

## Restricciones e instrucciones
[preferencias, políticas, decisiones del usuario]

## Estado verificable
- Rama / worktree / estado Git
- Archivos modificados y su propósito
- Comandos ejecutados y resultados

## Decisiones y hallazgos
- [decisión o hallazgo con motivo y evidencia]

## Próxima acción
[una tarea concreta y verificable]

## Riesgos o bloqueos
- [lo que podría invalidar la continuación]
```

El handoff no debe duplicar el contenido de documentos canónicos ni incluir logs completos. Debe referenciar paths, commits, URLs o identificadores de memoria cuando basten.

## Engram y artefactos versionados

Engram conserva memoria entre sesiones: decisiones, preferencias, bugs, hallazgos y resúmenes. Los repositorios conservan la fuente de verdad durable de código, reglas, documentos, tests y commits.

- Guardar en Engram sólo observaciones accionables y estructuradas.
- Guardar en Git decisiones y contratos que deben revisarse, compartirse o sobrevivir a un entorno local.
- No usar memoria persistente para reemplazar un archivo versionado, ni un archivo de handoff para reemplazar un commit o una prueba.
- Antes de continuar trabajo previo, recuperar contexto de memoria y contrastarlo contra el estado actual del repositorio.

## Privacidad y seguridad

Los resúmenes, handoffs y memoria deben respetar [`security.md`](security.md): no incluir secretos, tokens, paths privados, PII innecesaria, contenido de clientes ni outputs sensibles. Redactar con placeholders sin destruir la información necesaria para continuar.

## Checklist

- [ ] El contexto inicial contiene referencias, no copias masivas de reglas.
- [ ] Las reglas, skills y documentos se cargaron sólo cuando eran relevantes.
- [ ] El centinela evaluó las señales disponibles en un checkpoint seguro.
- [ ] Decisiones, evidencia y siguiente paso se persistieron antes de compactar o cambiar de sesión.
- [ ] El handoff es compacto, verificable y no contiene secretos.
- [ ] La sesión nueva relee fuentes canónicas y verifica el estado real del repositorio.

## Relación con otras reglas

- [`../SYSTEM.md`](../SYSTEM.md): define fuentes de verdad, evidencia y portabilidad.
- [`gentle-ai.md`](gentle-ai.md): orquesta skills, MCP, memoria y adapters.
- [`research.md`](research.md): evita cargar investigación no pertinente y preserva evidencia.
- [`git.md`](git.md): usa estado Git y worktrees como evidencia verificable.
- [`security.md`](security.md): protege el contenido de prompts, resúmenes y handoffs.
