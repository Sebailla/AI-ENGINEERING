# Política de diseño e implementación de interfaz

El diseño generado por herramientas es una entrada de trabajo, no una especificación ni una implementación autorizada. Cuando el proyecto use Stitch mediante MCP, el flujo separa obligatoriamente la generación del diseño, la confirmación explícita del cliente, la implementación en el stack real y la auditoría visual con Impeccable.

## Ruta rápida

1. Descubrir requisitos de producto, stack, componentes, rutas, tokens, accesibilidad y convenciones de UI del proyecto.
2. Redactar un prompt de Stitch con esos requisitos y enviarlo sólo mediante el MCP disponible y su schema verificado.
3. Detener el flujo y esperar la confirmación explícita del cliente de que la generación de Stitch terminó.
4. Recuperar el artefacto generado con la capacidad real disponible; no asumir que la confirmación lo descarga ni lo aplica.
5. Implementar la interfaz en el stack, arquitectura y sistema de diseño existentes.
6. Ejecutar las verificaciones funcionales, visuales y de accesibilidad aplicables.
7. Ejecutar la auditoría de Impeccable si está disponible y resolver o declarar sus hallazgos relevantes.

## Invariantes

| Principio | Norma |
|---|---|
| Separación de fases | Generar, confirmar, recuperar, implementar y auditar son fases distintas. No se debe adelantar una fase sin la evidencia de la anterior. |
| Confirmación humana | Después de enviar el prompt, el agente espera una confirmación explícita del cliente. No consulta repetidamente, no presupone finalización y no inicia implementación antes de recibirla. |
| Capacidades reales | Los nombres de herramientas, schemas, comandos, identificadores y formatos se obtienen de la integración disponible. No se inventan. |
| Fuente de verdad | Los requisitos aprobados, el código y el sistema de diseño del proyecto prevalecen sobre un artefacto generado. |
| Adaptación al proyecto | La implementación usa el stack, componentes, convenciones, tokens, routing y estado existentes; no incorpora un framework ni dependencias sin justificación. |
| Calidad integral | Una UI debe preservar accesibilidad, seguridad, comportamiento, rendimiento y pruebas; fidelidad visual por sí sola no completa la entrega. |
| Transparencia | La disponibilidad de Stitch e Impeccable, la confirmación del cliente y los resultados de auditoría se reportan como evidencia, no como supuestos. |

## Fase 1: preparación y generación con Stitch

Antes de redactar el prompt, identificar lo necesario para que la propuesta sea útil y verificable: objetivo de usuario, flujo, contenido, estados de carga/error/vacío, variantes responsive, componentes existentes, tokens visuales, restricciones de marca y requisitos de accesibilidad.

El prompt debe describir intención y restricciones, sin secretos, datos personales, contenido de clientes no autorizado ni instrucciones que sustituyan controles de seguridad. Debe incluir, cuando corresponda:

- pantalla o flujo y resultado esperado;
- jerarquía de información y acciones disponibles;
- estados y validaciones visibles;
- comportamiento responsive;
- requisitos de teclado, foco, contraste, semántica y mensajes de error;
- componentes o design system que la implementación debe respetar.

Invocar el MCP de Stitch únicamente si la sesión expone esa capacidad y su contrato puede verificarse. Registrar una referencia no sensible de la solicitud o artefacto cuando exista. No afirmar que Stitch recibió, generó o exportó un diseño sin resultado observable.

## Punto de espera obligatorio

Después de enviar el prompt a Stitch, comunicar que el agente queda a la espera de la confirmación del cliente. La confirmación debe ser explícita y referirse a la generación solicitada.

Mientras se espera:

- no recuperar, interpretar ni implementar un resultado como si estuviera completo;
- no ejecutar la auditoría de Impeccable;
- no iniciar polling, automatizaciones de espera o una segunda solicitud de Stitch sin un requisito y capacidad verificados;
- se puede conservar el contexto mínimo necesario para reanudar el flujo de forma segura.

La confirmación habilita la recuperación; no prueba por sí sola que el artefacto pueda leerse desde el runtime actual.

## Fase 2: recuperación e implementación

Tras la confirmación, recuperar el artefacto mediante el MCP de Stitch sólo si la operación y el formato están disponibles. Si el runtime no permite recuperarlo, solicitar al cliente el enlace, exportación o adjunto autorizado; no reconstruir ni inventar el diseño desde una descripción incompleta.

Antes de aplicar cambios, contrastar el artefacto con los requisitos y el proyecto. Implementar únicamente el alcance solicitado y conservar:

- componentes, tokens y patrones existentes;
- estructura semántica y navegación por teclado;
- foco visible, contraste suficiente y mensajes de estado comprensibles;
- validación y autorización en límites confiables; la interfaz no es un control de seguridad;
- compatibilidad responsive y estados de carga, vacío y error cuando correspondan.

Los recursos, estilos y dependencias añadidos requieren la evaluación de las reglas de arquitectura, dependencias y seguridad. Un mockup no autoriza cambios de producto, recolección de datos, permisos ni integraciones externas.

## Fase 3: verificación y auditoría con Impeccable

Primero ejecutar las pruebas y comprobaciones que el proyecto soporte: build, tipos, lint, pruebas de componentes o end-to-end, evaluación de accesibilidad y verificación visual en los viewports relevantes. La selección debe seguir [`testing.md`](testing.md).

Luego usar Impeccable sólo cuando la sesión exponga la integración y su contrato verificable. La auditoría debe cubrir el artefacto implementado, no sólo el diseño generado. Registrar el objetivo auditado, el resultado y los hallazgos accionables sin incluir datos sensibles.

Corregir los hallazgos relevantes dentro del alcance y volver a ejecutar las verificaciones afectadas. Si un hallazgo queda diferido, declarar impacto, motivo y siguiente acción; no presentarlo como aprobado.

## Degradación segura

| Capacidad ausente o insuficiente | Comportamiento requerido |
|---|---|
| MCP de Stitch no disponible o schema no verificable | No enviar un prompt simulado. Declarar `BLOQUEADO` para la generación asistida y continuar sólo con un diseño proporcionado por el cliente o con un flujo de UI que éste autorice. |
| Stitch envió el prompt pero no permite recuperar el artefacto | Esperar confirmación y solicitar enlace, exportación o adjunto autorizado. No implementar un artefacto inexistente. |
| Falta confirmación explícita del cliente | Permanecer en espera. No recuperar, implementar ni auditar. |
| Impeccable no disponible o no puede auditar el destino | Ejecutar las verificaciones disponibles y declarar la auditoría de Impeccable como `NO VERIFICADO` o `BLOQUEADO`, con la causa. |
| Auditoría devuelve hallazgos no resolubles | No ocultarlos. Informar evidencia, riesgo y decisión necesaria antes de declarar completitud. |

La ausencia de una herramienta no rebaja los requisitos de accesibilidad, seguridad, pruebas ni transparencia; sólo limita la evidencia específica que dicha herramienta habría aportado.

## Evidencia de entrega

La comunicación final debe separar claramente:

- prompt enviado a Stitch y referencia disponible, si existe;
- confirmación explícita recibida del cliente;
- artefacto recuperado y alcance implementado;
- verificaciones ejecutadas y resultados;
- auditoría de Impeccable, hallazgos, correcciones o limitación concreta;
- riesgos, trabajo diferido y elementos no verificados.

## Checklist

- [ ] Se descubrieron requisitos de UI, stack, componentes y restricciones aplicables.
- [ ] El prompt de Stitch no contiene datos sensibles y se envió mediante una capacidad real.
- [ ] El flujo se detuvo tras el envío y recibió confirmación explícita del cliente antes de continuar.
- [ ] El artefacto se recuperó de una fuente autorizada y se contrastó con los requisitos.
- [ ] La implementación respeta sistema de diseño, semántica, teclado, foco, contraste y estados relevantes.
- [ ] Se ejecutaron pruebas, build, lint, tipos y verificaciones visuales aplicables o se declararon.
- [ ] Impeccable se ejecutó cuando estuvo disponible; de lo contrario, la limitación quedó declarada.

## Relación con otras reglas

- [`../SYSTEM.md`](../SYSTEM.md): define evidencia, alcance y portabilidad.
- [`gentle-ai.md`](gentle-ai.md): orquesta MCP y capacidades por runtime.
- [`architecture.md`](architecture.md): conserva límites y patrones del proyecto.
- [`dependencies.md`](dependencies.md): evalúa recursos y paquetes incorporados.
- [`testing.md`](testing.md): selecciona evidencia funcional, visual y de accesibilidad.
- [`security.md`](security.md): protege datos, límites de confianza y acciones sensibles.
- [`documentation.md`](documentation.md): documenta flujos y decisiones durables cuando corresponde.
