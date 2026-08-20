# Política de planificación por fases

GitHub Projects es la fuente de seguimiento de toda iniciativa del proyecto. Cada iniciativa se descompone en fases e issues trazables antes de iniciar su ejecución; el Project enlaza el trabajo existente sin duplicar la información que ya pertenece a un issue o una pull request.

## Ruta rápida

1. Confirmar que el repositorio u organización dispone de GitHub Projects y que se tiene acceso al Project aplicable.
2. Definir el resultado de la iniciativa y dividirlo en fases con alcance, dependencias, criterio de entrada y criterio de salida.
3. Crear o relacionar un issue trazable para cada unidad de trabajo necesaria y añadirlo al Project.
4. Iniciar una fase únicamente cuando sus dependencias, entrada y salida verificable estén definidas.
5. Actualizar el Project, issues y PRs con evidencia del estado, bloqueos y riesgos.

## Invariantes

| Principio | Norma |
|---|---|
| Fuente de seguimiento | GitHub Projects registra la planificación y el estado de la iniciativa. |
| Trazabilidad | Cada fase se respalda en issues concretos y cada PR se vincula al issue que implementa cuando corresponde. |
| Sin duplicación | El Project organiza y enlaza; el detalle técnico, la discusión y la evidencia permanecen en issues y PRs. |
| Inicio controlado | No iniciar una fase sin criterios de entrada y salida, dependencias conocidas y un responsable o decisión explícita de ownership. |
| Estado basado en evidencia | No marcar trabajo como completado, desbloqueado o entregado sin evidencia verificable. |
| Adaptabilidad | Las fases describen resultados y se adaptan al proyecto; no imponen metodología, labels, campos, vistas ni automatizaciones universales. |

## Fases de una iniciativa

Usar las siguientes fases como mínimo adaptable. Un proyecto puede combinar, dividir, renombrar u omitir una fase sólo si su resultado no aplica y la decisión queda clara en el Project o issue de iniciativa.

| Fase | Resultado esperado | Criterio de salida mínimo |
|---|---|---|
| Descubrimiento | Problema, alcance, restricciones y riesgos iniciales entendidos. | Decisión de continuar, reformular o descartar con evidencia suficiente. |
| Diseño | Enfoque técnico o de producto y dependencias definidos a la profundidad proporcional. | Issues ejecutables, dependencias declaradas y verificación prevista. |
| Implementación | Unidades de trabajo construidas en ramas o worktrees controlados. | Cambios revisables vinculados a sus issues y evidencia técnica disponible. |
| Verificación | Comportamiento, seguridad y calidad comprobados proporcionalmente. | Evidencia registrada y defectos o riesgos residuales visibles. |
| Entrega y aprendizaje | Integración, release o cierre según corresponda, con conocimiento durable. | Entrega o limitación comunicada, rollback considerado y documentación actualizada cuando aplica. |

Una fase no debe ocultar trabajo no planificado. Si aparece un cambio sustancial de alcance, dependencia, riesgo o criterio de salida, actualizar primero la planificación y los issues afectados.

## Estructura y trazabilidad

- Crear un issue de iniciativa cuando el alcance requiere varias fases, coordinación o decisiones durables.
- Descomponer cada fase en issues de resultado verificable; usar jerarquías o dependencias nativas cuando estén disponibles y aprobadas por la organización.
- Añadir al Project los issues y PRs relacionados. No copiar en tarjetas el contenido completo de issues, PRs, tests, decisiones o conversaciones.
- Vincular una PR al issue que resuelve mediante el mecanismo admitido por el repositorio. La referencia no sustituye la descripción, evidencia y revisión de la PR.
- Mantener bloqueos, dependencias y riesgos en el lugar donde puedan revisarse: issue, Project o ambos mediante enlaces, sin crear versiones divergentes.

## Estado, bloqueos y riesgos

Cada actualización relevante debe reflejar hechos comprobables:

- avance o estado real de la fase y sus issues;
- evidencia disponible, por ejemplo pruebas ejecutadas, revisión, decisión o limitación;
- dependencia bloqueante y quién debe resolverla, si se conoce;
- riesgo, impacto, mitigación y decisión pendiente cuando sea material.

No convertir una estimación en compromiso ni una hipótesis en estado. Si la evidencia es insuficiente, indicar el estado como no verificado o bloqueado según corresponda.

## Disponibilidad de GitHub Projects

Antes de planificar, descubrir el Project existente, permisos, plantillas, campos, vistas, automatizaciones y convenciones de la organización. No crear ni suponer labels, campos, estados, vistas, automatizaciones o estructuras de Project sin esa evidencia.

Si GitHub Projects no está disponible, falta acceso o la organización prohíbe su uso, declarar el bloqueo y solicitar una decisión sobre la herramienta de seguimiento. No simular un Project mediante archivos locales, tablas paralelas o estados inventados.

## Relación con las rutas de trabajo

La planificación por fases organiza la iniciativa; no altera la ruta de implementación:

- el trabajo directo sigue siendo válido para una unidad pequeña y entendida dentro de una fase;
- la delegación sigue siendo acotada y se rige por la política de orquestación;
- SDD continúa siendo opcional y sólo se usa por solicitud explícita o aceptación;
- RDD continúa siendo opt-in y controla la revisión del candidato, no la planificación ni el avance del Project.

## Checklist

- [ ] El Project aplicable, acceso y convenciones reales fueron verificados.
- [ ] La iniciativa tiene fases adaptadas a su resultado y issues trazables.
- [ ] Cada fase tiene entrada, salida, dependencias y ownership definidos.
- [ ] Issues y PRs están vinculados sin duplicar su fuente de verdad.
- [ ] Los estados, bloqueos y riesgos tienen evidencia y responsables o decisiones pendientes visibles.
- [ ] No se inició una fase cuyo criterio de entrada o dependencia permanece indefinido.

## Fuentes dinámicas

- [About Projects](https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects/about-projects)
- [Planning and tracking work for your team or project](https://docs.github.com/en/issues/tracking-your-work-with-issues/learning-about-issues/planning-and-tracking-work-for-your-team-or-project)
- [About issues](https://docs.github.com/en/issues/tracking-your-work-with-issues/learning-about-issues/about-issues)
- [About pull request fields](https://docs.github.com/en/issues/planning-and-tracking-with-projects/understanding-fields/about-pull-request-fields)
