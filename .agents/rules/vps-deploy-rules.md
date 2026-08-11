---
trigger: always_on
---

Antes de desplegar o finalizar cualquier cambio en este proyecto, sigue estrictamente este orden:
1. Levantar/probar cambios en local usando `npm run dev`.
2. Validar que la compilación de producción no tenga errores ejecutando `npm run build`.
3. Desplegar los cambios finales al VPS ejecutando `bash scripts/deploy_vps.sh`.

Información del VPS de Producción:
- **IP del VPS**: `129.146.150.123`
- **URL de Producción**: `https://cesaunison.fondothoth.com`

