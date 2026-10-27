# Rotación de secretos — CESA-WEB

**Motivo:** el historial público de GitHub ya contiene al menos una clave `gsk_` y una `AIza`, y
varios archivos tenían fallbacks con credenciales. Una clave que estuvo publicada se considera
comprometida aunque se borre del historial.

**Regla:** los valores nuevos viven solo en `backend/.env.production` en el VPS, con permisos
`600`. No se pegan en el chat, en issues, en commits ni en este documento.

## Inventario

| Secreto | Dónde se usa | Dónde se rota | Estado |
|---|---|---|---|
| `GROQ_API_KEY` | Rust `config.rs`, Node `ai-router.js`, PHP `chat.php` | Consola de Groq | Pendiente |
| `GEMINI_API_KEY` | Rust, Node, PHP | Google AI Studio | Pendiente |
| `MISTRAL_API_KEY` | Node `ai-router.js` | Consola de Mistral | Pendiente |
| `OLLAMA_API_KEY` / `OLLAMA_API_KEYS` | Rust, PHP | Ollama Cloud | Pendiente |
| `TELEGRAM_BOT_TOKEN` | Rust `telegram`, PHP `telemetria.php`, `setup_telegram_webhook.php` | BotFather | Pendiente |
| `TELEGRAM_WEBHOOK_SECRET` | Webhook PHP/Rust | Generar con `openssl rand -hex 32` | Pendiente |
| `CANVA_API_KEY` / `CANVA_CLIENT_SECRET` | Rust `modules/canva` | Canva Developers | Pendiente |
| `FACEBOOK_APP_SECRET` / `META_PAGE_TOKEN` | Rust `social_media`, Node `social-orchestrator.js` | Meta for Developers | Pendiente |
| `SMTP_GMAIL_PASS` / `SMTP_PASS` | Rust `tools.rs`, PHP | Contraseñas de aplicación de Google | Pendiente |
| `DB_PASS` | Rust, Node, PHP, scripts de despliegue | Panel de MariaDB / Oracle | Pendiente |
| `JWT_SECRET` | PHP `JWTHelper`, Rust, Node | Generar con `openssl rand -base64 48` | Pendiente |
| `APP_AES_KEY` | PHP `SecureConfig`, votaciones | **No rotar a ciegas**; ver abajo | Pendiente |
| `VAPID_PRIVATE_KEY` | Web Push | Generar par nuevo | Pendiente |
| `REPLICATE_API_KEY` | Rust (opcional) | Consola de Replicate | Pendiente |
| `BANXICO_TOKEN` | Proxy PHP `tipo_cambio.php` (antes embebido en `pedimento/js/app.js`) | Banxico SIE | Pendiente — estuvo público en el repo y en `cesa-ui 26 oct.json` |

Claves que ya no se usen: revocarlas, no solo reemplazarlas.

## Orden de rotación

1. **Inventariar `APP_AES_KEY`.** Antes de cambiarla, identificar qué datos cifrados existen
   (`api_configs`, votos, tokens). Si solo protege claves de API, re-encriptarlas y rotar. Si
   protege votos, definir un plan de re-encriptación con respaldo y auditoría.
2. **Rotar proveedores de IA** (Groq, Gemini, Mistral, Ollama) y actualizar `ai-engine`/Rust/PHP.
3. **Rotar Telegram** (token y secreto de webhook) y volver a registrar el webhook con la URL
   correcta (`/api/zeroclaw_webhook.php`), no la raíz.
4. **Rotar Canva, Meta y SMTP.**
5. **Rotar `DB_PASS`.** Crear el usuario con la clave nueva, probar conexión y luego retirar la
   anterior. Los scripts ya no traen valor por defecto: exigen `DB_PASS`.
6. **Rotar `JWT_SECRET`.** Cierra todas las sesiones; hacerlo en ventana de mantenimiento y avisar.
7. **Revocar las claves viejas** en cada consola, aunque el historial todavía no esté purgado.
8. **Registrar** fecha, responsable y resultado en este documento (sin valores).

## Actualización en el VPS

```bash
# En el VPS, como usuario de despliegue
chmod 600 backend/.env.production
# editar con un editor seguro; nunca con echo en el historial del shell
sudo systemctl restart php8.3-fpm
pm2 restart cesa-ai-engine cesa-rust   # o retirar los procesos que ya no se usen
```

`backend/.env.production` está en `.gitignore`; verificar que no se agregue al índice.

## Verificación (sin imprimir valores)

```bash
# 1. Que el árbol no tenga patrones conocidos
grep -rIlE 'gsk_|AIza|sk-[A-Za-z0-9]{20,}|[0-9]{8,10}:AA[A-Za-z0-9_-]{30,}' \
  --exclude-dir=.git --exclude-dir=node_modules . || echo "sin coincidencias"

# 2. Que las variables existan en el entorno del servicio (solo nombres)
sudo systemctl show-environment | grep -E 'JWT_SECRET|DB_PASS' | cut -d= -f1

# 3. Salud real (no debe devolver latencias fijas)
curl -fsS https://cesaunison.fondothoth.com/api/health.php | head

# 4. Login y chat de prueba; revisar logs sin tokens
pm2 logs cesa-ai-engine --lines 50 --nostream
```

## Criterio de cierre

- [ ] `APP_AES_KEY` inventariada y, si aplica, datos re-encriptados.
- [ ] Proveedores de IA rotados y servicios reiniciados sin errores.
- [ ] Telegram, Canva, Meta y SMTP rotados.
- [ ] `DB_PASS` y `JWT_SECRET` rotados en ventana de mantenimiento.
- [ ] Claves viejas revocadas.
- [ ] `.env.production` con permisos `600` y fuera de git.
- [ ] `gitleaks` limpio y alertas de GitHub resueltas.
- [ ] Fecha y responsable registrados abajo.

## Registro

| Fecha | Responsable | Alcance | Resultado |
|---|---|---|---|
| | | | |
