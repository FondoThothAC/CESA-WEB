# Checklist de Lanzamiento - CESA WEB v3.5

Sigue estos pasos para asegurar un despliegue exitoso en el entorno institucional de la UNISON.

## 1. Servidor MariaDB (Oracle VPS)
- [ ] Importar el esquema final: `mysql -u root -p < database/schema.sql`.
- [ ] Crear el usuario industrial: `CREATE USER 'cesa_admin'@'%' IDENTIFIED BY 'tu_password_seguro';`.
- [ ] Configurar el Firewall (iptables/ufw) para permitir el puerto 3306 solo desde la IP de HostGator.

## 2. Servidor de Aplicaciones (HostGator)
- [ ] Cargar los archivos de `/backend` a la carpeta `public_html/api/`.
- [ ] Cargar la carpeta `/out` (construcción Next.js) a `public_html/`.
- [ ] Configurar el archivo `.htaccess` para forzar HTTPS y manejar rutas de Next.js (si no usas exportación estática total).

## 3. Inteligencia Artificial (Mac Mini M4)
- [ ] Levantar el túnel de Cloudflare: `cloudflared tunnel run cesa-assistant`.
- [ ] Verificar que Ollama esté corriendo y con el modelo `llama3.1:8b` cargado.
- [ ] Probar el diagnóstico de salud: `https://tu-dominio.mx/api/health.php` y verificar que `ia_engine` devuelva "OK".

## 4. Seguridad Final
- [ ] Actualizar `backend/lib/cors.php` con el dominio oficial final.
- [ ] Cambiar el `JWT_SECRET` en el archivo `.env.production`.
- [ ] Verificar que la carpeta `uploads/` tenga permisos `755` y sea propiedad del usuario del servidor web.

---
> [!IMPORTANT]
> **Audit-Grade (CBIT-01)**: Nunca dejes credenciales en el archivo `schema.sql` ni en repositorios públicos. Utiliza variables de entorno para gestionar las llaves de API de Groq y Gemini.

**¡Portal listo para el periodo CESA 2026-2028!**
