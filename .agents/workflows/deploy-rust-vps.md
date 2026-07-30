# 🚀 Workflow: Despliegue del Backend Rust al VPS (Oracle Cloud)

Este workflow automatiza la compilación del binario en Rust y su despliegue al servidor VPS en `129.146.150.123`.

## Requisitos Previos
- Servidor VPS disponible en `129.146.150.123`.
- Llave SSH en `/Users/robertoeduardocelisrobles/Documents/FT Apps/Web/CESA-WEB/unison keys/ssh-key-2026-05-12.key`.

## Pasos del Despliegue

1. **Validar la compilación de producción del backend:**
   ```bash
   export PATH="$HOME/.cargo/bin:$PATH"
   cd rust-backend
   cargo check
   ```

2. **Ejecutar el script de despliegue automatizado:**
   ```bash
   bash scripts/deploy_vps.sh
   ```

3. **Verificar el servicio en el VPS:**
   - Endpoint de salud en Rust: `https://cesaunison.fondothoth.com/api/v1/health`
   - Endpoint de noticias en Rust: `https://cesaunison.fondothoth.com/api/v1/noticias`
   - Endpoint del Asistente Bob en Rust: `https://cesaunison.fondothoth.com/api/v1/chat`
