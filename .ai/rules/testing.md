# Política de testing y verificación

Las pruebas son evidencia de comportamiento. La estrategia se deriva del riesgo y del contrato que cambia; no de un porcentaje de cobertura ni de la preferencia por una herramienta.

## Ruta rápida

1. Identificá el comportamiento, contrato o regresión que el cambio puede afectar.
2. Elegí el nivel de prueba más cercano que demuestre ese comportamiento.
3. Escribí o actualizá la prueba antes o junto con la implementación cuando el riesgo lo justifique.
4. Ejecutá las verificaciones relevantes y conservá su resultado.
5. Comunicá con precisión qué se verificó, qué no y por qué.

## Invariantes

| Principio | Norma |
|---|---|
| Comportamiento primero | Una prueba demuestra un resultado observable, no una implementación incidental. |
| Nivel mínimo suficiente | Usar la prueba de menor coste que cubra el riesgo real; escalar cuando cruza límites. |
| Determinismo | Evitar dependencias implícitas de tiempo, red, orden, estado global o datos compartidos. |
| Aislamiento | Cada prueba prepara y limpia su propio estado, salvo que el contrato pruebe integración intencional. |
| Regresión | Un bug corregido recibe una prueba o control que habría detectado la causa raíz cuando sea proporcionado. |
| Evidencia | Nunca informar tests, build, lint o tipos como exitosos sin ejecutar y registrar el resultado. |

## Selección del nivel de prueba

| Cambio o riesgo | Evidencia esperada |
|---|---|
| Lógica local, reglas de dominio o transformación | Prueba unitaria enfocada. |
| Integración entre módulos, persistencia, red o infraestructura | Prueba de integración con dependencias reales o equivalentes controlados. |
| Contrato entre servicios, API pública o eventos | Prueba de contrato, compatibilidad o consumer-driven cuando aplique. |
| Flujo crítico visible para usuario | Prueba end-to-end o smoke test representativo. |
| Seguridad, permisos, validación o aislamiento | Casos positivos, negativos y de denegación explícita. |
| Bug regresivo | Caso mínimo que reproduce la causa y demuestra la corrección. |
| Configuración, build o empaquetado | Comando de build, validación de configuración y smoke test de artefacto cuando corresponda. |

No usar mocks para probar detalles que una prueba de integración debe validar. No usar end-to-end para esconder una unidad no testeable si puede aislarse con un diseño mejor.

## Diseño de pruebas

- Nombrar la prueba por el comportamiento y condición observable.
- Mantener una intención por caso; usar tablas o parametrización para variantes del mismo contrato.
- Construir fixtures mínimas y explícitas; evitar datos mágicos o compartidos entre suites.
- Controlar reloj, aleatoriedad, zona horaria, IO y red cuando afecten determinismo.
- Probar rutas de error, límites y autorización, no sólo el camino feliz.
- No hacer que una prueba dependa de orden de ejecución, estado persistido de otra prueba o recursos externos no controlados.

## TDD y cambios existentes

TDD es una técnica útil cuando ayuda a descubrir el contrato y reducir incertidumbre. Debe usarse de forma estricta cuando el proyecto o el flujo SDD lo requieran; no como ritual que genere pruebas sin valor.

En un sistema existente:

1. caracterizar el comportamiento actual antes de modificarlo si no está cubierto;
2. añadir el caso que expresa el nuevo contrato o la regresión;
3. implementar el cambio mínimo;
4. refactorizar sólo con la suite en verde;
5. ejecutar verificaciones más amplias cuando el límite afectado lo requiera.

## Cobertura y calidad

La cobertura es una señal, no una meta aislada. Una cifra alta no prueba contratos relevantes, seguridad ni integración; una cifra baja puede ser aceptable en código generado, bordes de infraestructura o áreas medidas por pruebas superiores.

Usar cobertura para detectar huecos y priorizar riesgo. No escribir pruebas vacías, snapshots indiscriminados o aserciones de implementación sólo para aumentar porcentaje.

## Fallos y flakiness

Un test que falla requiere diagnóstico, no repetición hasta que pase. Clasificar:

- defecto del producto;
- defecto o supuesto incorrecto de la prueba;
- problema de entorno, datos, dependencia o infraestructura;
- flakiness por tiempo, concurrencia, orden, red o estado compartido.

No marcar una prueba como flaky, ignorarla o deshabilitarla para liberar cambios sin causa, ticket/owner y plan de resolución. Una prueba intermitente no es evidencia confiable.

## Verificación de cambios

Antes de declarar un cambio listo, ejecutar el conjunto proporcional disponible:

- test enfocado del comportamiento modificado;
- suite relevante del módulo o paquete;
- lint, format y chequeo de tipos cuando el proyecto los posea;
- build, migración, contrato o smoke test cuando el cambio cruce esos límites;
- revisión RDD cuando esté activa y aplique al candidato.

Si una verificación no puede ejecutarse, informar `NO VERIFICADO` o `BLOQUEADO`, su causa y el impacto. Nunca reemplazarla con “debería funcionar”.

## Comunicación de evidencia

Reportar de forma concreta:

| Estado | Forma de comunicarlo |
|---|---|
| **VERIFICADO** | Comando o prueba ejecutada y resultado. |
| **FALLÓ** | Comando, fallo relevante y efecto sobre el cambio. |
| **NO VERIFICADO** | Verificación omitida y motivo. |
| **BLOQUEADO** | Dependencia, acceso o entorno faltante y próximo paso necesario. |

No ocultar tests fallidos, warnings relevantes, exclusiones ni limitaciones de cobertura.

## Checklist

- [ ] Se identificó el contrato o comportamiento afectado.
- [ ] El nivel de prueba elegido corresponde al riesgo y al límite cruzado.
- [ ] Las pruebas son deterministas, aisladas y legibles.
- [ ] Se cubrieron error, límite o autorización cuando son relevantes.
- [ ] Los tests, build, lint y tipos aplicables se ejecutaron o declararon.
- [ ] Una regresión conocida tiene una prueba o control proporcional.

## Relación con otras reglas

- [`../SYSTEM.md`](../SYSTEM.md): exige evidencia antes de afirmar corrección.
- [`architecture.md`](architecture.md): diseña límites testeables y migraciones verificables.
- [`gentle-ai.md`](gentle-ai.md): coordina SDD, RDD y workers de verificación cuando están disponibles.
