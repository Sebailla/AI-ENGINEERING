# Política de dependencias

Una dependencia es una decisión de arquitectura, seguridad y mantenimiento. Debe resolver una necesidad concreta mejor que las alternativas razonables, sin transferir al proyecto un coste oculto desproporcionado.

## Ruta rápida

1. Definí la necesidad y verificá si el proyecto o el runtime ya la resuelven.
2. Investigá compatibilidad, mantenimiento, licencia, seguridad y coste operativo.
3. Elegí la versión estable compatible y conservá el lockfile.
4. Agregá la dependencia con el cambio mínimo y verificá build, tests y vulnerabilidades aplicables.
5. Documentá el motivo cuando la elección sea durable o no obvia.

## Invariantes

| Principio | Norma |
|---|---|
| Necesidad antes que paquete | No agregar una dependencia por popularidad, moda o conveniencia momentánea. |
| Reutilización consciente | Preferir una capacidad nativa o una dependencia existente si satisface el requisito sin crear acoplamiento innecesario. |
| Estabilidad compatible | Elegir la última versión estable apropiada para el runtime, el proyecto y el lockfile. |
| Seguridad de cadena de suministro | Evaluar procedencia, mantenimiento, licencia, vulnerabilidades y scripts de instalación. |
| Reproducibilidad | Mantener manifest, lockfile, checksum y toolchain coherentes; no regenerarlos sin entender el impacto. |
| Removibilidad | Conocer cómo aislar o reemplazar una dependencia antes de extenderla por todo el sistema. |
| Ecosistema Node.js | Usar pnpm como manejador canónico de paquetes y dependencias de JavaScript/TypeScript. |

## Evaluación antes de agregar

Antes de agregar una dependencia de producción, responder:

- ¿qué requisito funcional o no funcional resuelve?
- ¿por qué una capacidad nativa, código pequeño propio o una dependencia existente no alcanza?
- ¿es compatible con el lenguaje, runtime, plataforma, licencia y despliegue actuales?
- ¿tiene mantenimiento visible, releases verificables y una procedencia confiable?
- ¿qué permisos, red, datos, binario, código nativo o scripts de instalación introduce?
- ¿cómo afecta bundle, arranque, memoria, latencia, coste y observabilidad?
- ¿cómo se prueba, actualiza, reemplaza o elimina?

Para una dependencia de desarrollo, aplicar el mismo criterio de seguridad y reproducibilidad, con evaluación proporcional a su superficie de riesgo.

## Selección de versiones

- Usar versiones estables compatibles con las restricciones del proyecto.
- No adoptar alpha, beta, RC, nightly, canary o `main` sin decisión explícita, justificación y plan de salida.
- Respetar rangos de versión y el package manager existente; no mezclar gestores ni editar lockfiles manualmente.
- Revisar breaking changes, migraciones y deprecaciones antes de un salto mayor.
- No actualizar transitive dependencies de forma manual salvo que el ecosistema lo requiera y el resultado pueda verificarse.

`latest` significa “última publicada”, no “adecuada para este proyecto”.

## Ecosistema Node.js: pnpm

Para proyectos Node.js, JavaScript o TypeScript que adopten esta base, **pnpm es el manejador canónico de paquetes y dependencias**. Esta decisión no se extiende a otros ecosistemas: SwiftPM, Cargo, Go modules, Poetry, uv u otros gestores se seleccionan según su plataforma.

- Usar `pnpm install`, `pnpm add`, `pnpm remove`, `pnpm update` y `pnpm run`; no mezclar npm, Yarn o Bun para modificar dependencias del mismo proyecto.
- Versionar `package.json` y `pnpm-lock.yaml`; nunca ignorar, editar manualmente ni regenerar el lockfile sin entender el cambio resultante.
- Declarar el gestor y su versión compatible mediante el campo `packageManager` de `package.json` cuando el proyecto lo soporte.
- Preferir Corepack o el mecanismo de distribución aprobado por el proyecto para obtener la versión declarada de pnpm.
- En workspaces, usar `pnpm-workspace.yaml` y filtros de pnpm en lugar de scripts que recorran paquetes manualmente.
- Si un proyecto existente usa otro gestor, no migrarlo silenciosamente: evaluar lockfile, CI, tooling, workspaces y coste de migración; pedir confirmación antes de cambiarlo.

## Instalación segura

Antes de instalar, consultar la documentación oficial y el registro o repositorio canónico. Revisar especialmente:

| Riesgo | Verificación mínima |
|---|---|
| Procedencia | Organización, repositorio, firma/provenance o publisher esperado. |
| Scripts | `postinstall`, binarios descargados, acceso a red o modificaciones del entorno. |
| Vulnerabilidades | Advisory oficial o herramienta de auditoría compatible con el ecosistema. |
| Licencia | Compatibilidad con la distribución y obligaciones del proyecto. |
| Confusión de paquetes | Nombre exacto, namespace y URL del paquete; evitar typosquatting. |

No desactivar controles de seguridad, ignorar integridad ni ejecutar scripts desconocidos sólo para resolver una instalación.

## Actualizaciones

Separar actualización de evaluación. Antes de actualizar:

1. inspeccionar el diff de manifest y lockfile;
2. leer notas de release, guía de migración y advisories relevantes;
3. identificar cambios de API, comportamiento, permisos y compatibilidad;
4. actualizar el conjunto mínimo coherente;
5. ejecutar las verificaciones del proyecto;
6. registrar riesgo residual o rollback si el cambio lo justifica.

No ejecutar actualizaciones masivas “para estar al día” sin una razón, alcance y estrategia de verificación.

## Dependencias transitivas y overrides

Las transitivas también forman parte de la superficie de seguridad y operación. Usar overrides, resolutions, patches o forks sólo para un problema identificado y con:

- versión y motivo explícitos;
- referencia al advisory, bug o incompatibilidad;
- alcance limitado;
- prueba de que el override funciona;
- condición o fecha para retirarlo.

No perpetuar un patch local sin owner ni criterio de eliminación.

## Eliminación y aislamiento

Una dependencia transversal debe entrar detrás de un límite propio cuando pueda cambiar de proveedor, modelo de datos o protocolo. Evitar propagar tipos y detalles del paquete por el dominio o contratos públicos.

Al eliminar una dependencia, retirar imports, configuración, scripts, documentación, credenciales y artefactos asociados; luego regenerar el lockfile con el package manager correspondiente y verificar el proyecto.

## Evidencia y comunicación

Al proponer o cambiar una dependencia, informar:

- necesidad y alternativas consideradas;
- paquete y versión exacta;
- compatibilidad, licencia y riesgos relevantes;
- archivos modificados, incluidos manifests y lockfiles;
- verificaciones ejecutadas y estado de su resultado;
- plan de rollback o eliminación cuando el riesgo lo amerite.

## Checklist

- [ ] Existe una necesidad concreta que el proyecto no resuelve adecuadamente.
- [ ] Se evaluaron alternativa nativa, dependencia existente y opciones razonables.
- [ ] Paquete, procedencia, licencia, seguridad y compatibilidad fueron verificados.
- [ ] La versión es estable y compatible; el lockfile se preserva correctamente.
- [ ] El cambio es mínimo y sus verificaciones fueron ejecutadas o declaradas.
- [ ] Overrides, patches o forks tienen motivo y criterio de eliminación.

## Relación con otras reglas

- [`research.md`](research.md): verifica versión, procedencia, advisories y compatibilidad.
- [`architecture.md`](architecture.md): decide límites para que una dependencia no invada el dominio.
- [`../SYSTEM.md`](../SYSTEM.md): define reproducibilidad, seguridad y evidencia como invariantes.
