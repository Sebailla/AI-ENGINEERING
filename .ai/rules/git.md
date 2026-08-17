# Política de Git y entrega

Git preserva intención, evidencia y reversibilidad. Worktrees, commits, issues, pull requests y releases forman una única cadena de entrega: cada etapa debe dejar el proyecto en un estado comprensible, verificable y recuperable.

## Ruta rápida

1. Descubrí repositorio, rama, estado, remotos y reglas de contribución antes de modificar.
2. Aislá el trabajo cuando haya cambios paralelos mediante un worktree seguro.
3. Implementá unidades de trabajo pequeñas con pruebas y documentación pertinentes.
4. Usá commits convencionales, coherentes y reversibles.
5. Abrí issues y PRs según la política real del repositorio, con evidencia y alcance claro.
6. Publicá releases sólo desde un candidato verificado, versionado y con rollback posible.

## Invariantes

| Principio | Norma |
|---|---|
| Preservación | Nunca destruir, sobrescribir o esconder trabajo ajeno sin autorización explícita. |
| Estado conocido | Antes de un cambio relevante, inspeccionar raíz, rama, `status` y diff pertinente. |
| Unidad de trabajo | Un commit debe representar un comportamiento, corrección, migración o documentación revisable. |
| Evidencia | Tests, CI, reviews, tags y releases se informan sólo cuando fueron verificados. |
| Política del repositorio | Templates, labels, approvals, protecciones y versionado se descubren; no se inventan. |
| Reversibilidad | Cada entrega debe tener un límite claro de rollback sin eliminar trabajo no relacionado. |

## Descubrimiento inicial

Antes de crear rama, worktree, commit, issue, PR o release, verificar:

```bash
git rev-parse --show-toplevel
git status --short
git branch --show-current
git remote -v
git log --oneline -5
```

Leer `README`, `CONTRIBUTING`, instrucciones locales, plantillas, CI y configuración de protección disponibles. Si el repositorio no existe todavía, inicializarlo sólo cuando el usuario haya decidido versionar el proyecto.

Nunca ejecutar sin autorización explícita acciones destructivas como `git reset --hard`, `git clean -fd`, `git checkout -- .`, eliminación de ramas ajenas o reescritura de historia publicada.

## Worktrees

Usar worktrees cuando una tarea necesita aislamiento de otra rama, revisión paralela, experimentación o una corrección urgente sin contaminar el checkout principal.

- Crear cada worktree como hermano del repositorio bajo el directorio personal del usuario, por ejemplo `<parent>/<repo>-worktrees/<nombre>`.
- No crear worktrees dependientes de CodeGraph en `/tmp`, `/var/tmp` ni otros directorios temporales.
- Nombrar rama y worktree por resultado: `feat/<descripcion>`, `fix/<descripcion>`, `docs/<descripcion>`.
- Verificar que el worktree inicia limpio y que no comparte cambios no committeados con otro trabajo.
- Cada worktree que use CodeGraph necesita su propio índice `.codegraph/`; nunca copiar, enlazar ni reutilizar el índice de otro checkout.
- Sincronizar o eliminar un worktree sólo después de confirmar que no contiene trabajo único pendiente.

Un worktree no es una licencia para que dos agentes escriban los mismos archivos. Coordinar ownership y secuenciar writers dependientes.

## Ramas

Seguir la convención del repositorio. Si no existe, usar nombres en minúsculas con el formato `tipo/descripcion`, donde `tipo` describe el resultado (`feat`, `fix`, `docs`, `refactor`, `test`, `build`, `ci` o `chore`).

Mantener la rama enfocada en un resultado. No mezclar refactors oportunistas, cambios de formato masivos o actualizaciones no relacionadas con una corrección o feature.

## Commits

Usar Conventional Commits cuando el repositorio sea compatible:

```text
<type>(<scope opcional>): <resultado conciso>
```

Ejemplos:

```text
feat(auth): add refresh token rotation
fix(sync): prevent duplicate reconciliation
docs(testing): explain contract test strategy
```

Reglas:

- Un commit representa una unidad de trabajo entregable; no dividir por tipo de archivo si el resultado deja el repositorio inconsistente.
- Incluir tests, migraciones y documentación con el comportamiento que verifican o explican.
- Revisar el diff antes de stagear y antes de commitear.
- El mensaje explica el resultado, no la lista de archivos.
- No incluir `Co-Authored-By` ni atribución de IA.
- No mezclar secretos, artefactos locales, lockfiles accidentales ni cambios ajenos.

Antes de crear un commit, confirmar propósito, prueba enfocada, evidencia disponible y límite de rollback.

## Issues

Un issue captura un problema o resultado concreto antes de expandir trabajo que requiere coordinación, priorización o trazabilidad. Para cambios pequeños y entendidos, no crear burocracia artificial si la política del repositorio no lo exige.

Antes de publicar:

1. descubrir si el repositorio usa issues, Discussions, templates, labels o gates de aprobación;
2. buscar duplicados abiertos y cerrados;
3. reunir evidencia reproducible, impacto, comportamiento esperado y alcance;
4. aplicar sólo templates y labels existentes que la política permita;
5. eliminar secretos, usuarios, hosts, paths internos y tokens, manteniendo ejemplos reproducibles con placeholders.

No inventar labels, estados, prioridades, templates ni requisitos de aprobación. No publicar un issue sin confirmar el repositorio destino y sin revisar su contenido por privacidad.

## Pull requests

Una PR entrega una unidad de trabajo revisable. Debe permitir que un revisor entienda qué cambia, por qué, cómo se verificó y qué queda fuera de alcance sin reconstruir toda la conversación.

Antes de abrirla:

- inspeccionar el diff contra la base correcta y eliminar cambios contaminantes;
- confirmar que la rama contiene sólo la unidad declarada;
- ejecutar las verificaciones aplicables;
- usar el template y los checks requeridos por el repositorio;
- vincular un issue sólo si la política del repositorio lo exige o existe un issue que debe cerrarse;
- incluir resumen, alcance, riesgos, verificación, rollback y trabajo fuera de alcance;
- aplicar labels y approvals sólo cuando existen y la política los define.

Una PR enfocada debe aspirar a poder revisarse en aproximadamente una hora. Como guardrail, una PR con más de **400 líneas autorales** (adiciones + eliminaciones) debe dividirse en slices independientes o usar una estrategia encadenada, salvo excepción explícita del mantenedor o un diff generado/migración que no pueda separarse limpiamente.

Para trabajo encadenado, declarar dependencias, orden de merge, base de cada slice y qué PR es la actual. Mantener tests y documentación en la misma slice que el comportamiento que validan.

## RDD, CI y merge

RDD no reemplaza tests ni CI. Si RDD está activo, la receipt gobierna sólo el candidato exacto revisado. Si está desactivado, continuar según la política ordinaria del repositorio y no fabricar aprobación.

Nunca hacer merge, push protegido, bypass de CI o aprobación en nombre del usuario. Esperar los checks y aprobaciones requeridos por el repositorio; reportar fallos y riesgos con evidencia.

## Releases

Un release es una entrega de artefacto, no sólo un tag. Antes de publicar:

1. confirmar versión, estrategia de versionado y rama/tag objetivo del repositorio;
2. confirmar árbol limpio, commit exacto y CI exitoso para ese SHA;
3. ejecutar build, tests, validaciones de empaquetado y seguridad aplicables;
4. generar changelog o notas desde commits, PRs e issues verificables;
5. crear tag anotado o el mecanismo de release que el proyecto exija;
6. publicar sólo los artefactos verificables y conservar checksums, firmas o provenance cuando existan;
7. comunicar despliegue, monitoreo y rollback.

No asumir SemVer, GitHub Releases, npm publish, contenedores ni un proveedor. Adoptarlos sólo si el proyecto los usa. Nunca publicar prereleases, paquetes o imágenes desde `main` sin confirmar la política y el alcance de la release.

## Recuperación y rollback

Ante una entrega defectuosa, preservar evidencia antes de actuar. Preferir revertir una unidad identificable, detener la publicación o deshabilitar una feature con control explícito antes que reescribir historia o borrar datos.

Registrar qué versión, commit, artefacto o configuración se revierte y cómo se verificó la recuperación. Si el rollback no es seguro, declarar el bloqueo y escalar con el impacto concreto.

## Checklist

- [ ] Se verificaron raíz, rama, estado, diff y reglas del repositorio.
- [ ] El worktree, si existe, es aislado, limpio y tiene su índice CodeGraph propio.
- [ ] La rama y el commit representan una única unidad de trabajo reversible.
- [ ] Tests, documentación y migraciones relevantes acompañan la unidad correcta.
- [ ] Issues y PRs respetan políticas, templates, labels, privacidad y aprobación reales.
- [ ] La PR está enfocada o posee una estrategia explícita de slices/chain.
- [ ] La release, si aplica, está vinculada al SHA, CI y artefactos exactos.

## Relación con otras reglas

- [`../SYSTEM.md`](../SYSTEM.md): define evidencia, seguridad y completitud.
- [`testing.md`](testing.md): ejecuta la verificación funcional que acompaña commits y PRs.
- [`gentle-ai.md`](gentle-ai.md): coordina RDD, review y delivery cuando estén disponibles.
