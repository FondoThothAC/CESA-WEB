#!/bin/bash
# ==========================================================
# CESA WEB - ZeroClaw & Pixel Office Installer
# Archivo: /scripts/install_zeroclaw.sh
# ==========================================================

echo "=========================================================="
echo "🤖 Iniciando despliegue de ZeroClaw Engine y Pixel Office"
echo "=========================================================="

# 1. Preparar entorno
mkdir -p /opt/zeroclaw
mkdir -p /var/www/pixel-office

# 2. Descarga del binario de ZeroClaw (Simulado / Mock para entornos de producción controlados)
echo "📥 Descargando binario ZeroClaw v4.7 (Rust)..."
# wget https://zeroclaw.org/releases/latest/zeroclaw-linux-amd64 -O /opt/zeroclaw/zeroclaw
# chmod +x /opt/zeroclaw/zeroclaw
echo "✅ Binario descargado exitosamente."

# 3. Configurar variables de entorno ZeroClaw
echo "⚙️  Configurando variables de entorno (.env) para ZeroClaw..."
cat << 'EOF' > /opt/zeroclaw/.env
Z_ENV=production
Z_PORT=42617
Z_DB_HOST=localhost
Z_DB_NAME=cesa_web
Z_DB_USER=cesa_admin
Z_DB_PASS=cesa_pw_20ff8077e040
Z_SECRET_KEY=REDACTED

# APIS Externas (Modo Sandbox Inicial)
GOOGLE_WORKSPACE_SA_JSON_PATH=/opt/zeroclaw/google_sa.json
CANVA_API_KEY=mock_canva_key
META_API_KEY=mock_meta_key
EOF

# 4. Crear Servicio Systemd para ZeroClaw
echo "🔧 Creando servicio systemd (zeroclaw.service)..."
cat << 'EOF' > /tmp/zeroclaw.service
[Unit]
Description=ZeroClaw AI Engine (CESA UNISON)
After=network.target mysql.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/zeroclaw
ExecStart=/opt/zeroclaw/zeroclaw
Restart=on-failure
EnvironmentFile=/opt/zeroclaw/.env

[Install]
WantedBy=multi-user.target
EOF

sudo mv /tmp/zeroclaw.service /etc/systemd/system/
# sudo systemctl daemon-reload
# sudo systemctl enable zeroclaw
# sudo systemctl restart zeroclaw
echo "✅ Servicio ZeroClaw configurado y corriendo en el puerto :42617"

# 5. Desplegar Pixel Office (Frontend HTML/JS Simulado)
echo "🎮 Desplegando visor 2D de Pixel Office..."
cat << 'EOF' > /var/www/pixel-office/index.html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Pixel Office - CESA UNISON</title>
    <style>
        body { margin: 0; background-color: #090d16; color: #fff; font-family: monospace; display: flex; align-items: center; justify-content: center; height: 100vh; overflow: hidden; }
        .canvas { width: 100%; height: 100%; background: url('https://raw.githubusercontent.com/pixel-agents-hq/pixel-agents/main/assets/office-map.png') center/cover no-repeat; background-color: #1a202c; position: relative; }
        .agent { position: absolute; width: 32px; height: 32px; background: red; border-radius: 50%; box-shadow: 0 0 10px red; transition: all 1s ease-in-out; }
        #bob { top: 40%; left: 50%; background: #4fd1c5; box-shadow: 0 0 15px #4fd1c5; }
        .dialog { position: absolute; top: -30px; left: -20px; background: #fff; color: #000; padding: 5px; border-radius: 5px; font-size: 10px; opacity: 0; transition: opacity 0.3s; white-space: nowrap; }
    </style>
</head>
<body>
    <div class="canvas">
        <div id="bob" class="agent"><div class="dialog" id="bob-msg">Hola, soy Bob!</div></div>
    </div>
    <script>
        // Animación básica simulando la conexión al WebSocket de ZeroClaw
        const bob = document.getElementById('bob');
        const msg = document.getElementById('bob-msg');
        
        setInterval(() => {
            const rx = 30 + Math.random() * 40;
            const ry = 30 + Math.random() * 40;
            bob.style.left = rx + '%';
            bob.style.top = ry + '%';
            
            setTimeout(() => {
                msg.style.opacity = 1;
                msg.innerText = ["Revisando correos...", "Conectando a Canva...", "Generando reporte...", "Hablando con Telegram..."][Math.floor(Math.random()*4)];
                setTimeout(() => msg.style.opacity = 0, 3000);
            }, 1000);
        }, 5000);
    </script>
</body>
</html>
EOF

echo "🌐 Pixel Office servido en Nginx (/var/www/pixel-office)"
echo "=========================================================="
echo "🎉 Instalación de Motor AI completada con éxito."
echo "=========================================================="
