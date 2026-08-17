# Política de investigación técnica

La investigación reduce incertidumbre antes de una decisión o implementación dependiente de tecnología. No se investiga para acumular enlaces: se investiga para producir una conclusión verificable, aplicable al proyecto y proporcional al riesgo.

## Ruta rápida

1. Formular la pregunta técnica y la decisión que desbloquea.
2. Identificar tecnología, versión, entorno y restricción del proyecto.
3. Consultar fuentes primarias y actuales, empezando por Context7 cuando esté disponible.
4. Contrastar compatibilidad, deprecaciones, seguridad y cambios de comportamiento.
5. Registrar la conclusión, la evidencia y los límites de certeza antes de implementar.

## Cuándo investigar

Investigar antes de implementar cuando exista una probabilidad razonable de que el conocimiento esté desactualizado o sea incompleto, especialmente para:

- frameworks, librerías, SDKs, APIs y features de lenguaje;
- comandos, flags, configuración o comportamiento de una herramienta;
- versiones, deprecaciones, breaking changes y compatibilidad;
- autenticación, autorización, criptografía, dependencias y exposición de datos;
- migraciones, despliegues, infraestructura y operaciones irreversibles;
- rendimiento, concurrencia, consistencia, costes o límites de proveedores;
- una afirmación técnica que afecte arquitectura, contrato público o seguridad.

No investigar de forma ceremoniosa cambios locales, estables y completamente cubiertos por el código y las pruebas existentes.

## Orden de fuentes

Usar la fuente más cercana al comportamiento que se va a ejecutar:

1. estado actual del proyecto, manifests, lockfiles, configuración, tests y CI;
2. Context7 para documentación tecnológica actual, cuando esté disponible;
3. documentación oficial de la versión concreta;
4. repositorio oficial, issues mantenidos, changelog y release notes;
5. estándares, especificaciones y papers primarios;
6. fuentes secundarias confiables, sólo como apoyo;
7. conocimiento interno, tratado siempre como hipótesis.

Una fuente secundaria no valida una API si la documentación oficial existe. Un snippet, blog o respuesta de foro no se copia como configuración de producción sin verificar la fuente primaria.

## Método de investigación

### 1. Delimitar la pregunta

Especificar qué se necesita decidir y qué evidencia la resolvería. Evitar preguntas vagas como “¿cuál es la mejor librería?”. En su lugar: “¿la versión instalada soporta este flujo, con estas restricciones de seguridad y despliegue?”.

### 2. Identificar el contexto real

Confirmar versión instalada, runtime, sistema operativo, proveedor, modo de despliegue, dependencias directas y restricciones de compatibilidad. No buscar documentación de una versión reciente para implementar sobre una versión distinta.

### 3. Consultar y contrastar

Buscar el comportamiento, los límites y las alternativas relevantes. Cuando una decisión depende de una release, leer sus notas y las de los saltos de versión intermedios. Para seguridad, incluir modelo de amenaza y defaults seguros.

### 4. Aplicar al proyecto

Traducir la evidencia a una decisión concreta: qué hacer, qué no hacer, bajo qué condiciones y cómo comprobarlo. No trasladar una recomendación genérica sin validar que coincide con el stack y el dominio del proyecto.

### 5. Conservar la evidencia proporcional

Registrar enlaces, versión, fecha de consulta y conclusión cuando el hallazgo sea duradero, no obvio o costoso de redescubrir. Para una duda puntual de bajo riesgo, alcanza con citar la fuente en la comunicación o el cambio.

## Estados de certeza

Separar explícitamente los estados de conocimiento:

| Estado | Significado |
|---|---|
| **VERIFICADO** | La fuente primaria o el comportamiento ejecutado confirma la afirmación para el contexto actual. |
| **INFERIDO** | La conclusión se deriva de evidencia parcial o de un contexto parecido; requiere confirmación antes de depender de ella. |
| **NO VERIFICADO** | No se obtuvo evidencia suficiente. No usar la afirmación como base de una decisión. |
| **BLOQUEADO** | La investigación no puede continuar por falta de acceso, credenciales, entorno o información concreta. |

Nunca transformar una inferencia en un hecho al comunicarla al usuario o al codificar una decisión.

## Uso de Context7 y herramientas

Context7 es la fuente dinámica preferente para documentación tecnológica cuando está disponible. Debe consultarse después de identificar la tecnología y la versión del proyecto, no como sustituto de descubrirlas.

Las herramientas de búsqueda, web, MCP o CLI amplían evidencia; no reemplazan el juicio. Verificar que la respuesta corresponde al paquete, versión y superficie que se usará. Si una herramienta no está disponible, continuar con documentación oficial y declarar la limitación cuando afecte la certeza.

## Investigación de dependencias

Antes de agregar o actualizar una dependencia, investigar:

- versión compatible con el proyecto y su lockfile;
- licencia, mantenimiento, procedencia y señales de abandono;
- vulnerabilidades, superficie de ataque y defaults relevantes;
- impacto en bundle, runtime, despliegue y operación;
- alternativa nativa o dependencia ya existente;
- estrategia de testing, actualización y eliminación futura.

No incorporar una dependencia porque “es popular” o porque un ejemplo la usa.

## Investigación de incidentes y bugs

La investigación de un fallo debe partir de evidencia reproducible: logs, stack trace, request, versión, entorno y pasos de reproducción. Formular hipótesis que puedan refutarse y aislar la causa raíz antes de cambiar código.

No cerrar un incidente con una solución que sólo oculta el síntoma. Si no existe causa raíz confirmada, declararlo y reducir el riesgo con un control verificable.

## Comunicación de resultados

Una conclusión de investigación debe responder de forma breve:

- qué se verificó y con qué fuente;
- qué decisión habilita;
- qué compatibilidad, límite o riesgo permanece;
- cómo se validará en el proyecto;
- qué información falta si el resultado está bloqueado.

Documentar decisiones durables en `docs/learning/`, en una decisión arquitectónica o en la ubicación propia del proyecto. No convertir la documentación en un archivo de enlaces sin conclusión.

## Checklist

- [ ] La pregunta técnica y la decisión que desbloquea son explícitas.
- [ ] Se confirmó la versión y el contexto real del proyecto.
- [ ] Se consultó una fuente primaria actual cuando era necesaria.
- [ ] Se revisaron compatibilidad, deprecaciones y riesgos relevantes.
- [ ] La conclusión distingue verificado, inferido, no verificado o bloqueado.
- [ ] La implementación propuesta puede validarse con evidencia del proyecto.

## Relación con otras reglas

- [`../SYSTEM.md`](../SYSTEM.md): jerarquía de fuentes y evidencia universal.
- [`architecture.md`](architecture.md): usa la investigación para decidir límites y trade-offs.
- [`gentle-ai.md`](gentle-ai.md): usa Context7, MCP y skills como capacidades orquestadas.
