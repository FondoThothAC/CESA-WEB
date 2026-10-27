#!/bin/bash
# deploy-bazar-realtime.sh v1.0
# Despliegue enfocado del Bazar en TIEMPO REAL (v8.0):
#   1. Migración v8.0 (bazar_eventos + verificado_por/fecha_verificacion)
#   2. PHP actualizado (bus de eventos, subir_logo, rate limits)
#   3. Nginx con ruta SSE sin buffering
#   4. Backend Rust con /api/v1/bazar/events/stream
#   5. Build estático del frontend (frontend/out) — ejecútalo ANTES:
#        cd frontend && npm run build
set -e

REMOTE_USER="ubuntu"
REMOTE_HOST="129.146.150.123"
REMOTE_PATH="/var/www/cesa-web"
SSH_KEY="$HOME/.ssh/unison_keys/ssh-key-2026-05-12.key"
SSH_OPTS=(-o StrictHostKeyChecking=no -i "$SSH_KEY")

echo "🚀 Despliegue Bazar en tiempo real (v8.0)..."

# 0. Frontend compuesto localmente
echo "🖥️ 0/5 Compilando frontend estático..."
(cd frontend && npm run build)

# 1. Migración SQL
echo "🗄️ 1/5 Aplicando migración v8.0 (bus de eventos)..."
scp "${SSH_OPTS[@]}" ./database/migrations/v8.0_bazar_realtime_and_polish.sql $REMOTE_USER@$REMOTE_HOST:/tmp/v8.0_bazar.sql

ssh "${SSH_OPTS[@]}" $REMOTE_USER@$REMOTE_HOST << 'EOF'
    DB_NAME=$(grep DB_NAME /var/www/cesa-web/backend/.env | cut -d '=' -f2)
    DB_USER=$(grep DB_USER /var/www/cesa-web/backend/.env | cut -d '=' -f2)
    DB_PASS=$(grep DB_PASS /var/www/cesa-web/backend/.env | cut -d '=' -f2)

    sudo mysql "$DB_NAME" -f < /tmp/v8.0_bazar.sql || true
    sudo mysql -e "SET GLOBAL event_scheduler = ON;" || true
    rm -f /tmp/v8.0_bazar.sql

    echo "   - Verificando tabla bazar_eventos..."
    sudo mysql "$DB_NAME" -e "SHOW TABLES LIKE 'bazar_eventos';"
    sudo mysql "$DB_NAME" -e "SHOW COLUMNS FROM emprendimientos LIKE 'verificado_por';"
EOF

# 2. PHP: bazar + admin + helper de eventos
echo "📦 2/5 Subiendo backend PHP..."
scp "${SSH_OPTS[@]}" \
    ./backend/api/bazar.php \
    ./backend/api/bazar-admin.php \
    ./backend/lib/BazarEvents.php \
    ./backend/lib/RateLimiter.php \
    $REMOTE_USER@$REMOTE_HOST:/tmp/

ssh "${SSH_OPTS[@]}" $REMOTE_USER@$REMOTE_HOST << EOF
    sudo mv /tmp/bazar.php $REMOTE_PATH/backend/api/bazar.php
    sudo mv /tmp/bazar-admin.php $REMOTE_PATH/backend/api/bazar-admin.php
    sudo mv /tmp/BazarEvents.php $REMOTE_PATH/backend/lib/BazarEvents.php
    sudo mv /tmp/RateLimiter.php $REMOTE_PATH/backend/lib/RateLimiter.php
    sudo mkdir -p $REMOTE_PATH/uploads/bazar
    sudo chown -R www-data:www-data $REMOTE_PATH/uploads/bazar
EOF

# 3. Nginx: ruta SSE sin buffering
echo "🔀 3/5 Actualizando nginx (SSE sin buffer)..."
scp "${SSH_OPTS[@]}" ./scripts/nginx_fullstack.conf $REMOTE_USER@$REMOTE_HOST:/tmp/nginx_cesa.conf
ssh "${SSH_OPTS[@]}" $REMOTE_USER@$REMOTE_HOST \
    "sudo mv /tmp/nginx_cesa.conf /etc/nginx/sites-available/cesa && sudo nginx -t && sudo systemctl reload nginx"

# 4. Rust: rsync + build release -j1 + PM2
echo "🦀 4/5 Backend Rust (stream SSE)..."
rsync -avz --delete --rsync-path="sudo rsync" -e "ssh -i \"$SSH_KEY\" -o StrictHostKeyChecking=no" \
    --exclude 'target' \
    rust-backend/ $REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/rust-backend/

ssh "${SSH_OPTS[@]}" $REMOTE_USER@$REMOTE_HOST << 'EOF'
    if ! sudo swapon --show | grep -q "/swapfile"; then
        echo "   - Creando SWAP (1GB RAM VPS)..."
        sudo fallocate -l 2G /swapfile 2>/dev/null || sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
        sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile
    fi
    cd /var/www/cesa-web/rust-backend
    export PATH="$HOME/.cargo/bin:$PATH"
    cargo build --release -j 1
    sudo -u www-data PM2_HOME=/var/www/home/.pm2 pm2 restart cesa-rust 2>/dev/null || \
    sudo -u www-data PM2_HOME=/var/www/home/.pm2 pm2 start target/release/cesa-rust-backend --name "cesa-rust" --max-memory-restart 250M --time
    sudo -u www-data PM2_HOME=/var/www/home/.pm2 pm2 save
EOF

# 5. Frontend estático
echo "🖥️ 5/5 Publicando frontend (out/)..."
rsync -avz --delete --rsync-path="sudo rsync" -e "ssh -i \"$SSH_KEY\" -o StrictHostKeyChecking=no" \
    frontend/out/ $REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/public/

ssh "${SSH_OPTS[@]}" $REMOTE_USER@$REMOTE_HOST "sudo chown -R www-data:www-data $REMOTE_PATH && sudo chmod -R 755 $REMOTE_PATH"

echo "✅ Bazar en tiempo real desplegado."
echo "   Stream: https://cesaunison.fondothoth.com/api/v1/bazar/events/stream (curl -N para probar)"
echo "   Prueba: registra un negocio y observa el toast en el mapa en otro dispositivo."
