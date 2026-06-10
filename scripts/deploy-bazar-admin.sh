#!/bin/bash
# deploy-bazar-admin.sh v1.0
# Despliegue de Lógica de Negocios y Administración del Bazar

set -e

# Configuración del servidor (Alineado con scripts/deploy_vps.sh)
REMOTE_USER="ubuntu"
REMOTE_HOST="129.146.150.123"
REMOTE_PATH="/var/www/cesa-web"
SSH_KEY="/Users/robertoeduardocelisrobles/Documents/FT Apps/Web/CESA-WEB/unison keys/ssh-key-2026-05-12.key"
SSH_OPTS=(-o StrictHostKeyChecking=no -i "$SSH_KEY")

echo "🚀 Iniciando despliegue de CESA Bazar (Full Logic)..."

# 1. Aplicar Migración SQL en Producción
echo "🗄️ 1/4 Sincronizando base de datos en producción..."
scp "${SSH_OPTS[@]}" ./database/migrations/v4.2_bazar_expansion.sql $REMOTE_USER@$REMOTE_HOST:/tmp/v4.2_bazar.sql

ssh "${SSH_OPTS[@]}" $REMOTE_USER@$REMOTE_HOST << 'EOF'
    # Extraer credenciales directamente del .env sin exportar todo (evita errores de parsing)
    DB_NAME=$(grep DB_NAME /var/www/cesa-web/backend/.env | cut -d '=' -f2)
    DB_USER=$(grep DB_USER /var/www/cesa-web/backend/.env | cut -d '=' -f2)
    DB_PASS=$(grep DB_PASS /var/www/cesa-web/backend/.env | cut -d '=' -f2)
    
    echo "   - Ejecutando v4.2_bazar.sql..."
    # Limpiamos el SQL de IF NOT EXISTS en CHANGE (no soportado) antes de ejecutar
    # O mejor, ejecutamos los ALTER individuales
    sudo mariadb -u$DB_USER -p$DB_PASS $DB_NAME -e "ALTER TABLE emprendimientos ADD COLUMN IF NOT EXISTS ubicacion_lat DECIMAL(10, 8) NULL AFTER ubicacion;"
    sudo mariadb -u$DB_USER -p$DB_PASS $DB_NAME -e "ALTER TABLE emprendimientos ADD COLUMN IF NOT EXISTS ubicacion_lng DECIMAL(11, 8) NULL AFTER ubicacion_lat;"
    # Intento de rename silenciando el error si ya existe
    sudo mariadb -u$DB_USER -p$DB_PASS $DB_NAME -e "ALTER TABLE emprendimientos CHANGE active activo BOOLEAN DEFAULT TRUE;" 2>/dev/null || true
    
    # Crear tablas faltantes
    sudo mariadb -u$DB_USER -p$DB_PASS $DB_NAME < /tmp/v4.2_bazar.sql
    rm /tmp/v4.2_bazar.sql
EOF

# 2. Sincronizar archivos al backend
echo "📦 2/4 Subiendo archivos de API y Helpers..."
# Subir a carpeta temporal para evitar problemas de permisos directos
scp "${SSH_OPTS[@]}" \
    ./backend/api/bazar-admin.php \
    ./backend/api/bazar-metrics.php \
    ./backend/lib/AdminHelper.php \
    ./backend/lib/MetricHelper.php \
    ./backend/scripts/geocode_worker.php \
    $REMOTE_USER@$REMOTE_HOST:/tmp/

ssh "${SSH_OPTS[@]}" $REMOTE_USER@$REMOTE_HOST << EOF
    sudo mv /tmp/bazar-admin.php $REMOTE_PATH/backend/api/
    sudo mv /tmp/bazar-metrics.php $REMOTE_PATH/backend/api/
    sudo mv /tmp/AdminHelper.php $REMOTE_PATH/backend/lib/
    sudo mv /tmp/MetricHelper.php $REMOTE_PATH/backend/lib/
    sudo mv /tmp/geocode_worker.php $REMOTE_PATH/backend/scripts/
EOF

# 3. Sincronizar archivos de la interfaz pública
echo "🖥️ 3/4 Subiendo archivos de UI y Public Admin..."
ssh "${SSH_OPTS[@]}" $REMOTE_USER@$REMOTE_HOST "sudo mkdir -p $REMOTE_PATH/backend/public/admin $REMOTE_PATH/backend/public/estudiante"
scp "${SSH_OPTS[@]}" ./backend/public/admin/bazar.php $REMOTE_USER@$REMOTE_HOST:/tmp/admin_bazar.php
scp "${SSH_OPTS[@]}" ./backend/public/estudiante/bazar-metrics.php $REMOTE_USER@$REMOTE_HOST:/tmp/estudiante_bazar.php

ssh "${SSH_OPTS[@]}" $REMOTE_USER@$REMOTE_HOST << EOF
    sudo mv /tmp/admin_bazar.php $REMOTE_PATH/backend/public/admin/bazar.php
    sudo mv /tmp/estudiante_bazar.php $REMOTE_PATH/backend/public/estudiante/bazar-metrics.php
EOF

# 4. Restaurar permisos para www-data
echo "🔑 4/4 Restaurando permisos de archivos..."
ssh "${SSH_OPTS[@]}" $REMOTE_USER@$REMOTE_HOST "sudo chown -R www-data:www-data $REMOTE_PATH && sudo chmod -R 755 $REMOTE_PATH"

echo "✅ Despliegue completado satisfactoriamente."
echo "🔗 Admin: https://cesaunison.fondothoth.com/admin/bazar.php"
echo "📈 Metrics: https://cesaunison.fondothoth.com/estudiante/bazar-metrics.php"
