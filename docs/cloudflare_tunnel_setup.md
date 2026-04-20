# Configuración de Túnel Cloudflare para CESA WEB

Este documento describe cómo exponer de forma segura el motor de inferencia local (**Mac Mini M4 / Ollama**) al portal en producción sin abrir puertos en tu router.

## 1. Instalación en Mac Mini
Si no tienes `cloudflared` instalado, usa Homebrew:
```bash
brew install cloudflared
```

## 2. Autenticación
Inicia sesión en tu cuenta de Cloudflare:
```bash
cloudflared tunnel login
```

## 3. Crear el Túnel
Creamos un túnel dedicado para el Asistente del CESA:
```bash
cloudflared tunnel create cesa-assistant
```
Anota el ID del túnel generado (ej: `f70912...`).

## 4. Configurar el Enrutamiento
Asocia el túnel a un subdominio (ej: `assistant.tu-dominio.com`):
```bash
cloudflared tunnel route dns cesa-assistant assistant.tu-dominio.com
```

## 5. Ejecutar el Túnel localmente
Vincula el tráfico del subdominio al puerto local de **Ollama** (11434):
```bash
cloudflared tunnel run --url http://localhost:11434 cesa-assistant
```

## 6. Verificación
Accede desde cualquier red a `https://assistant.tu-dominio.com/api/tags`. Si ves la lista de modelos de Ollama, ¡el puente está activo!

---
> [!IMPORTANT]
> **Seguridad**: Cloudflare encripta todo el tráfico. Asegúrate de que el puerto de Ollama solo esté escuchando en `localhost` dentro de tu Mac para evitar accesos directos por IP.
