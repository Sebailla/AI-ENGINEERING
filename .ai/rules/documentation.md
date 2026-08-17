# Política de documentación

La documentación conserva intención, contratos y operación que el código por sí solo no expresa. Debe reducir incertidumbre futura; no repetir implementación ni transcribir conversaciones.

## Ruta rápida

1. Identificá quién necesita la información y qué decisión o acción debe poder tomar.
2. Elegí la fuente canónica y el formato más cercano al uso real.
3. Documentá el porqué, contrato, límite y verificación; no sólo el cómo.
4. Actualizá o retirá documentación afectada junto con el cambio.
5. Verificá enlaces, comandos, ejemplos y consistencia con el estado actual.

## Invariantes

| Principio | Norma |
|---|---|
| Una fuente canónica | Cada concepto, contrato o decisión tiene una ubicación principal; otros documentos la referencian. |
| Cercanía al uso | La documentación vive junto al código, contrato, operación o flujo que explica cuando eso reduce búsqueda. |
| Intención durable | Documentar decisiones, límites, trade-offs y operación que no se deducen de forma fiable del código. |
| Actualidad | Un documento que ya no describe el sistema se actualiza, se archiva o se elimina. |
| Proporcionalidad | Un cambio trivial no exige un documento nuevo; un contrato público o decisión difícil de revertir sí. |
| Verificabilidad | Comandos, ejemplos, URLs y flujos documentados deben comprobarse antes de declararlos válidos. |

## Qué documentar

| Situación | Documentación esperada |
|---|---|
| API, evento, CLI o contrato público | Semántica, entradas/salidas, errores, compatibilidad y ejemplos representativos. |
| Decisión arquitectónica durable | Contexto, alternativas, decisión, consecuencias y evidencia. |
| Operación o despliegue | Prerrequisitos, pasos seguros, verificación, rollback y owner. |
| Configuración relevante | Propósito, valores permitidos, defaults, secretos excluidos y efecto de cambio. |
| Bug no obvio o incidente | Causa raíz, corrección, prevención y señales de diagnóstico. |
| Flujo recurrente de contribución | Camino feliz, límites, verificación y links a reglas canónicas. |
| Conocimiento reusable | Concepto, ejemplo, trade-offs y cómo reconocer cuándo aplicarlo. |

No documentar detalles que cambian con cada refactor interno si el código, tipos, tests o generated docs ya son su fuente de verdad.

## Elección de ubicación

Usar la ubicación más cercana y mantenible:

- README para propósito, inicio rápido y orientación de alto nivel.
- Archivos junto al módulo para contratos y decisiones locales.
- `docs/` para arquitectura transversal, operación, guías y referencias que requieren navegación propia.
- `docs/learning/` para conocimiento reusable que aumenta el criterio del desarrollador.
- Comentarios sólo para restricciones, invariantes o decisiones que deben leerse junto al código; no para narrar sintaxis obvia.
- Issues, PRs y releases para trazabilidad temporal; no como fuente permanente de una regla o contrato.

La taxonomía `docs/learning/` es orientativa. Si un proyecto ya tiene una organización coherente, extenderla en lugar de imponer otra.

## Diseño para lectura eficiente

Cada documento debe permitir encontrar la respuesta sin leer todo:

1. abrir con el resultado, decisión o acción principal;
2. mostrar el camino feliz primero;
3. separar detalles, riesgos, variantes y troubleshooting;
4. usar encabezados, tablas, checklists y ejemplos cuando reduzcan carga cognitiva;
5. enlazar a fuentes canónicas en vez de copiar reglas extensas;
6. indicar qué está fuera de alcance cuando evita interpretaciones erróneas.

Preferir ejemplos pequeños, reales y verificables. No publicar ejemplos con secretos, rutas privadas, tokens, datos de clientes o configuraciones peligrosas.

## Documentación de aprendizaje

`docs/learning/` preserva conocimiento transferible, no chat logs. Las categorías pueden incluir:

```text
docs/learning/
├── README.md
├── concepts/
├── architecture/
├── technologies/
├── debugging/
├── testing/
├── git/
└── decisions/
```

Cada documento de aprendizaje debe explicar:

- problema o señal que motiva el concepto;
- modelo mental o principio;
- ejemplo reducido y verificable;
- trade-offs, límites y anti-patrones;
- cómo aplicar o validar el aprendizaje en otro proyecto.

No registrar una lección si sólo repite un detalle local sin valor fuera de su cambio.

## Mantenimiento y retiro

La documentación es parte de la entrega. Al cambiar comportamiento, contrato, flujo, configuración o decisión, evaluar los documentos afectados en la misma unidad de trabajo.

- Actualizar ejemplos, diagramas, comandos, rutas y versiones relevantes.
- Marcar deprecaciones con alternativa y fecha o condición de retiro.
- Archivar decisiones históricas cuando sigan explicando el estado actual; eliminar guías obsoletas que induzcan a error.
- No conservar dos guías contradictorias por temor a borrar información: preservar la historia en Git y mantener una única guía activa.
- Revisar links internos y externos; una referencia rota es una deuda de producto para quien la sigue.

## Verificación

Antes de finalizar documentación:

- confirmar que refleja el código, configuración o proceso actual;
- ejecutar comandos y ejemplos seguros, o declararlos `NO VERIFICADO`;
- validar rutas, anchors, links y referencias cruzadas;
- verificar que no expone secretos, PII o información interna;
- confirmar que no duplica una fuente canónica existente;
- incluirla en el mismo commit que el cambio que explica cuando corresponda.

## Comunicación y contexto

Los resúmenes de sesión y handoffs sirven para continuidad, pero no reemplazan documentación durable. Seguir [`context.md`](context.md) para mantenerlos compactos y [`git.md`](git.md) para que decisiones y cambios revisables vivan en Git.

Cuando una conversación produce una decisión significativa, convertirla en el artefacto adecuado: regla, decision record, contrato, guía de operación o documento de aprendizaje. No dejar la única explicación dentro del contexto del agente.

## Checklist

- [ ] Existe un lector y una decisión o acción concreta que la documentación habilita.
- [ ] La ubicación es la fuente canónica o referencia correctamente a ella.
- [ ] Explica intención, contrato, límites o trade-offs no evidentes en el código.
- [ ] Comandos, ejemplos, links y versiones fueron verificados o declarados.
- [ ] No expone secretos ni duplica contenido que ya tiene fuente canónica.
- [ ] Se actualizó, archivó o retiró documentación afectada por el cambio.

## Relación con otras reglas

- [`../SYSTEM.md`](../SYSTEM.md): documentación y enseñanza como parte de la completitud.
- [`architecture.md`](architecture.md): registra decisiones durables y sus trade-offs.
- [`context.md`](context.md): distingue handoffs de documentación persistente.
- [`git.md`](git.md): versiona documentación con los cambios que explica.
- [`security.md`](security.md): protege contenido sensible en documentación y ejemplos.
