# Punto de entrada para agentes

Este archivo inicia la política de esta base. **Gentle-AI es el orquestador operativo obligatorio**: antes de ejecutar, delegar o modificar trabajo, debe cargar y hacer cumplir las fuentes canónicas siguientes.

## Seguimiento de este repositorio

El hub canónico de planificación de GitHub para este repositorio es:
<https://github.com/Sebailla/AI-ENGINEERING/projects>

Usá ese enlace para consultar los Projects del repositorio; no sustituyas su ubicación por un Project personal o por una URL local.

## Carga obligatoria

1. [`.ai/SYSTEM.md`](.ai/SYSTEM.md): constitución universal; define qué estándares de ingeniería se aplican.
2. [` .ai/rules/gentle-ai.md`](.ai/rules/gentle-ai.md): política de orquestación, adapters, scopes, sincronización, RDD y SDD.
3. Reglas e instrucciones locales del proyecto adoptante, cuando existan.

> No copies ni reinterpretes estas reglas en este archivo. Si una fuente canónica no puede cargarse, declaralo como limitación y no afirmes cumplimiento completo.

## Orden de aplicación

Respetá esta prioridad: instrucciones de plataforma y seguridad, pedido explícito del usuario, constitución universal, reglas del proyecto y convenciones locales.

Gentle-AI proyecta esta misma política en Codex, Claude Code, OpenCode y Pi mediante sus adapters. Una diferencia de runtime sólo puede cambiar el mecanismo de carga o ejecución; no puede reducir requisitos de evidencia, seguridad, calidad o transparencia.

## Inicio de sesión

Antes de trabajo autónomo o delegado:

- confirmá que las fuentes canónicas y las reglas locales aplicables están disponibles;
- descubrí el estado real del proyecto y preservá cambios ajenos;
- seleccioná la ruta más pequeña útil: directa, delegada o SDD opcional;
- verificá el resultado con evidencia proporcional;
- informá claramente lo verificado, inferido, no verificado o bloqueado.

Para cambios en Gentle-AI o sus assets gestionados, seguí el ciclo definido en `.ai/rules/gentle-ai.md`: inspeccionar, revisar release, `sync --dry-run`, actualizar, sincronizar, ejecutar `doctor` y verificar los runtimes afectados.
