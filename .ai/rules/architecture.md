# Política de arquitectura

La arquitectura debe responder al problema real del proyecto. Esta regla guía decisiones estructurales sin imponer un patrón, framework, lenguaje ni topología de despliegue.

## Ruta rápida

1. Descubrí el dominio, restricciones y estructura existente.
2. Identificá la decisión concreta y los límites que afecta.
3. Compará alternativas proporcionales, incluyendo mantener el estado actual.
4. Elegí la opción más simple que preserve evolución, seguridad y verificabilidad.
5. Registrá las decisiones durables y verificá el resultado arquitectónico.

## Invariantes

| Principio | Norma |
|---|---|
| El problema primero | Elegir arquitectura según requisitos funcionales y no funcionales, no por moda. |
| Límites explícitos | Definir responsabilidades, dependencias y contratos antes de cruzar módulos o capas. |
| Complejidad justificada | No introducir capas, servicios, eventos o abstracciones sin una presión concreta que los necesite. |
| Evolución segura | Preferir cambios incrementales, reversibles y verificables frente a reescrituras especulativas. |
| Dependencias dirigidas | Evitar acoplamientos que obliguen al dominio a conocer detalles de entrega, infraestructura o proveedores. |
| Evidencia | Validar que la estructura cumple el requisito; un diagrama o una intención no prueban el comportamiento. |

## Cuándo hay una decisión arquitectónica

Tratar como arquitectónica una decisión que modifica uno o más de estos límites:

- módulos, paquetes, capas o ownership de código;
- modelo, persistencia, migración o ciclo de vida de datos;
- contrato público, integración externa o compatibilidad;
- autenticación, autorización, aislamiento o confianza;
- concurrencia, consistencia, disponibilidad o rendimiento;
- despliegue, observabilidad, coste u operación;
- estrategia de testing o límites de testabilidad.

Un cambio local, reversible y sin alterar un límite existente no necesita ceremonia arquitectónica. Debe respetar la arquitectura ya presente.

## Proceso de decisión

Antes de elegir una solución relevante, documentar de manera concisa:

1. **Contexto:** problema, objetivos, restricciones y evidencia disponible.
2. **Límites afectados:** qué componentes, datos, contratos o equipos cambian.
3. **Alternativas:** opciones razonables, incluida no cambiar cuando aplique.
4. **Trade-offs:** complejidad, coste, riesgo, seguridad, operación, testing y reversibilidad.
5. **Decisión:** opción elegida, motivo y consecuencias aceptadas.
6. **Verificación:** pruebas, métricas, migración, revisión o experimento que demostrarán que funciona.

Si la decisión tiene efectos difíciles de revertir, impacto transversal o riesgo significativo, solicitar confirmación del usuario antes de multiplicarla en el código.

## Patrones y estilos

Clean Architecture, hexagonal, DDD, CQRS, event sourcing, MVC, monolito modular y microservicios son herramientas. No son niveles de madurez ni defaults universales.

Elegir un patrón sólo cuando resuelva una presión comprobable, por ejemplo:

| Presión | Posible respuesta |
|---|---|
| Varias interfaces de entrega para un mismo caso de uso | Separar aplicación y adaptadores. |
| Reglas de negocio complejas y estables | Modelar explícitamente el dominio. |
| Integraciones con distinta consistencia o latencia | Aislar contratos e introducir asincronía cuando aporte valor. |
| Despliegue, escala u ownership realmente independientes | Separar componentes operables de forma autónoma. |

La respuesta no está garantizada por la presión. Evaluar el coste de coordinación, observabilidad, testing y operación antes de adoptar el patrón.

## Diseño de límites y dependencias

- Un módulo debe tener una responsabilidad comprensible y un contrato explícito.
- Las dependencias deben apuntar hacia abstracciones estables, no hacia detalles accidentales.
- Los detalles de framework, base de datos, red y proveedor se aíslan cuando ese aislamiento reduce riesgo o coste de cambio.
- Los contratos públicos se versionan o evolucionan de forma compatible cuando consumidores externos dependen de ellos.
- No filtrar entidades internas, secretos o detalles de infraestructura a través de límites públicos.
- Cada límite relevante debe tener una estrategia de prueba adecuada.

## Cambios arquitectónicos en sistemas existentes

No reemplazar una arquitectura existente sólo por preferencia estética. Primero identificar la deuda, el coste actual, los puntos de dolor y el resultado medible deseado.

Preferir una migración incremental:

```text
medir el problema
    → introducir un límite o adaptación
    → migrar una porción verificable
    → medir y estabilizar
    → retirar el camino anterior sólo cuando sea seguro
```

Mantener compatibilidad, migraciones de datos, observabilidad y rollback como parte del diseño. Una reescritura completa requiere una justificación excepcional y aprobación explícita.

## Registro y comunicación

Registrar una decisión en documentación durable cuando afecte límites relevantes, sea difícil de revertir, cambie un contrato o explique una restricción que futuros cambios podrían ignorar.

La documentación debe contener contexto, decisión, alternativas descartadas, consecuencias y evidencia. Puede ubicarse en `docs/learning/decisions/` o en la taxonomía que establezca el proyecto. No registrar decisiones triviales ni transcribir conversaciones.

## Checklist

- [ ] El problema y los requisitos no funcionales están explícitos.
- [ ] Se identificaron límites, contratos y dependencias afectados.
- [ ] La solución no impone un patrón sin presión comprobable.
- [ ] Los trade-offs incluyen seguridad, testing, operación y reversibilidad.
- [ ] El cambio puede verificarse con evidencia concreta.
- [ ] Las decisiones durables quedaron documentadas en la ubicación correcta.

## Relación con otras reglas

- [`../SYSTEM.md`](../SYSTEM.md): constitución y prioridades universales.
- [`gentle-ai.md`](gentle-ai.md): selección de ruta, orquestación y RDD/SDD.
- La futura regla de investigación verifica tecnologías y versiones antes de materializar una decisión.
