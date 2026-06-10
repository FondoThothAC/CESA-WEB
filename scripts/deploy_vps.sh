#!/bin/bash

# ==========================================================
# CESA WEB - Full Stack VPS Deployment Script (Oracle)
# Industrial Version v4.2 - Includes SQL Migrations
# ==========================================================

# Salir inmediatamente si un comando falla
set -e

# PATH para Apple Silicon / Homebrew
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"

IP="129.146.150.123"
DOMAIN="cesa.unison.mx"
USER="ubuntu"
SSH_KEY="/Users/robertoeduardocelisrobles/Documents/FT Apps/Web/CESA-WEB/unison keys/ssh-key-2026-05-12.key"
REMOTE_PATH="/var/www/cesa-web"

echo "🚀 Iniciando despliegue FULL STACK en Oracle VPS ($IP)..."

# 1. Construir Frontend
echo "📦 1/5 Construyendo Frontend (Next.js Export)..."
cd "$(dirname "$0")/../frontend"

if [ -d "node_modules" ]; then
    echo "   - node_modules detectado. Saltando install..."
else
    echo "   - Instalando dependencias..."
    npm install --quiet
fi

echo "   - Ejecutando npm run build..."
npm run build

# Verificar out/
if [ ! -d "out" ]; then
    echo "❌ Error: La carpeta 'out/' no se generó."
    exit 1
fi

cd ..

# 2. Sincronizar Código
echo "🖥️  2/5 Sincronizando Código (Backend + Frontend)..."

# Asegurar que el directorio destino existe y tiene los permisos correctos temporalmente
echo "   - Preparando directorios en el VPS..."
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no $USER@$IP "sudo mkdir -p $REMOTE_PATH/backend $REMOTE_PATH/public && sudo chown -R $USER:$USER $REMOTE_PATH"

# Sincronizar Backend
rsync -avz --delete --rsync-path="sudo rsync" -e "ssh -i \"$SSH_KEY\" -o StrictHostKeyChecking=no" \
    --exclude '.git' \
    --exclude 'node_modules' \
    --exclude '.env' \
    --exclude 'storage/rate_limits/*' \
    backend/ $USER@$IP:$REMOTE_PATH/backend/

# Sincronizar Frontend (Static Output al directorio public)
rsync -avz --delete --rsync-path="sudo rsync" -e "ssh -i \"$SSH_KEY\" -o StrictHostKeyChecking=no" \
    frontend/out/ $USER@$IP:$REMOTE_PATH/public/

# Sincronizar Microservicio AI-Engine
rsync -avz --delete --rsync-path="sudo rsync" -e "ssh -i \"$SSH_KEY\" -o StrictHostKeyChecking=no" \
    --exclude 'node_modules' \
    --exclude '.env' \
    ai-engine/ $USER@$IP:$REMOTE_PATH/ai-engine/

# 3. Migraciones SQL
echo "🗄️  3/5 Ejecutando Migraciones SQL (Skills, Push & AI/Social)..."
# Subir migraciones y esquema base
scp -i "$SSH_KEY" -o StrictHostKeyChecking=no \
    database/schema.sql \
    database/migrations/05_skills.sql \
    database/migrations/06_push.sql \
    database/migrations/v4.3_bazar_schematic.sql \
    database/migrations/v4.4_delegation_and_social.sql \
    database/migrations/v4.5_bazar_spots_and_editions.sql \
    database/migrations/v4.6_psychometric_tests.sql \
    database/migrations/v4.7_seed_psychometric_tests.sql \
    database/migrations/v4.8_publicidad_and_godmode.sql \
    database/migrations/v4.9_seed_more_skills_questions.sql \
    database/migrations/v5.0_seed_chinese_questions.sql \
    database/migrations/v5.1_seed_all_remaining_questions.sql \
    database/migrations/v5.2_seed_gestion_y_otros.sql \
    $USER@$IP:/tmp/

# Ejecutar migraciones usando las credenciales del servidor
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no $USER@$IP << 'EOF'
    # Cargar variables del .env de forma segura
    if [ -f /var/www/cesa-web/backend/.env ]; then
        set -a
        source /var/www/cesa-web/backend/.env
        set +a
    fi
    
    DB_NAME=${DB_NAME:-cesa_web}
    DB_USER=${DB_USER:-cesa_admin}
    DB_PASS=${DB_PASS:-cesa_pw_20ff8077e040}

    echo "   - Configurando base de datos y permisos de usuario..."
    sudo mysql -e "CREATE DATABASE IF NOT EXISTS \`$DB_NAME\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    sudo mysql -e "CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASS';"
    sudo mysql -e "GRANT ALL PRIVILEGES ON \`$DB_NAME\`.* TO '$DB_USER'@'localhost';"
    sudo mysql -e "FLUSH PRIVILEGES;"

    if ! sudo mysql -e "USE \`$DB_NAME\`; DESCRIBE usuarios;" >/dev/null 2>&1; then
        echo "   - Base de datos inicial vacía. Aplicando schema.sql base..."
        sudo mysql "$DB_NAME" < /tmp/schema.sql
    fi

    echo "   - Aplicando 05_skills.sql..."
    sudo mysql "$DB_NAME" < /tmp/05_skills.sql
    echo "   - Aplicando 06_push.sql..."
    sudo mysql "$DB_NAME" < /tmp/06_push.sql
    
    # Manejar duplicados en v4.3 sin romper
    echo "   - Aplicando v4.3_bazar_schematic.sql..."
    sudo mysql "$DB_NAME" -f < /tmp/v4.3_bazar_schematic.sql || true
    
    # Manejar posibles duplicados en v4.4 sin romper el script
    echo "   - Aplicando v4.4_delegation_and_social.sql..."
    sudo mysql "$DB_NAME" -f < /tmp/v4.4_delegation_and_social.sql || true
    
    # Manejar posibles duplicados en v4.5 sin romper
    echo "   - Aplicando v4.5_bazar_spots_and_editions.sql..."
    sudo mysql "$DB_NAME" -f < /tmp/v4.5_bazar_spots_and_editions.sql || true
    
    # Aplicar modulo de tests psicometricos v4.6
    echo "   - Aplicando v4.6_psychometric_tests.sql..."
    sudo mysql "$DB_NAME" -f < /tmp/v4.6_psychometric_tests.sql || true
    
    # Aplicar sembrado de preguntas v4.7
    echo "   - Aplicando v4.7_seed_psychometric_tests.sql..."
    sudo mysql "$DB_NAME" -f < /tmp/v4.7_seed_psychometric_tests.sql || true

    # Aplicar configuración de publicidad v4.8
    echo "   - Aplicando v4.8_publicidad_and_godmode.sql..."
    sudo mysql "$DB_NAME" -f < /tmp/v4.8_publicidad_and_godmode.sql || true

    # Aplicar sembrado masivo de preguntas de skills v4.9
    echo "   - Aplicando v4.9_seed_more_skills_questions.sql..."
    sudo mysql "$DB_NAME" -f < /tmp/v4.9_seed_more_skills_questions.sql || true
    
    # Aplicar sembrado de preguntas de chino v5.0
    echo "   - Aplicando v5.0_seed_chinese_questions.sql..."
    sudo mysql "$DB_NAME" -f < /tmp/v5.0_seed_chinese_questions.sql || true

    # Aplicar sembrado de preguntas de chino e inglés adicionales v5.1
    echo "   - Aplicando v5.1_seed_all_remaining_questions.sql..."
    sudo mysql "$DB_NAME" -f < /tmp/v5.1_seed_all_remaining_questions.sql || true

    # Aplicar sembrado de preguntas faltantes en gestión de proyectos y otros v5.2
    echo "   - Aplicando v5.2_seed_gestion_y_otros.sql..."
    sudo mysql "$DB_NAME" -f < /tmp/v5.2_seed_gestion_y_otros.sql || true
    
    rm -f /tmp/schema.sql /tmp/05_skills.sql /tmp/06_push.sql /tmp/v4.3_bazar_schematic.sql /tmp/v4.4_delegation_and_social.sql /tmp/v4.5_bazar_spots_and_editions.sql /tmp/v4.6_psychometric_tests.sql /tmp/v4.7_seed_psychometric_tests.sql /tmp/v4.8_publicidad_and_godmode.sql /tmp/v4.9_seed_more_skills_questions.sql /tmp/v5.0_seed_chinese_questions.sql /tmp/v5.1_seed_all_remaining_questions.sql /tmp/v5.2_seed_gestion_y_otros.sql
EOF

# 4. Configurar .env y Nginx
echo "🔐 4/5 Aplicando configuraciones de servidor..."
# Actualizar .env desde local a servidor
scp -i "$SSH_KEY" -o StrictHostKeyChecking=no \
    backend/.env.production $USER@$IP:/tmp/.env.tmp
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no $USER@$IP \
    "sudo mv /tmp/.env.tmp $REMOTE_PATH/backend/.env && sudo chown www-data:www-data $REMOTE_PATH/backend/.env"

# Actualizar Nginx
scp -i "$SSH_KEY" -o StrictHostKeyChecking=no \
    scripts/nginx_fullstack.conf $USER@$IP:/tmp/nginx_cesa.conf
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no $USER@$IP \
    "sudo mv /tmp/nginx_cesa.conf /etc/nginx/sites-available/cesa && \
     sudo ln -sf /etc/nginx/sites-available/cesa /etc/nginx/sites-enabled/cesa && \
     sudo nginx -t && sudo systemctl reload nginx"

# 5. Permisos Finales
echo "🔑 5/6 Restaurando permisos para www-data..."
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no $USER@$IP \
    "sudo chown -R www-data:www-data $REMOTE_PATH && sudo chmod -R 755 $REMOTE_PATH"

# 6. Despliegue del Microservicio de IA (NODE.JS)
echo "📦 6/6 Levantando Motor de IA (Node.js)..."
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no $USER@$IP << 'EOF'
    # 1. Instalar Node.js 18 si no existe
    if ! command -v node &> /dev/null; then
        echo "   - Instalando Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi

    # 2. Instalar PM2 global si no existe
    if ! command -v pm2 &> /dev/null; then
        echo "   - Instalando PM2..."
        sudo npm install pm2@latest -g
    fi

    # 3. Configurar entorno seguro para www-data
    echo "   - Configurando PM2_HOME y cache para www-data..."
    sudo mkdir -p /var/www/home/.pm2 /var/www/home/.npm
    sudo chown -R www-data:www-data /var/www/home
    sudo usermod -d /var/www/home www-data || true

    # 4. Instalar dependencias del AI Engine
    echo "   - Instalando dependencias de IA..."
    cd /var/www/cesa-web/ai-engine
    sudo -u www-data PM2_HOME=/var/www/home/.pm2 npm_config_cache=/var/www/home/.npm npm install --production

    # 5. Levantar PM2 con límites de memoria
    echo "   - Reiniciando PM2 (Límite 220M)..."
    sudo -u www-data PM2_HOME=/var/www/home/.pm2 NODE_OPTIONS=--max-old-space-size=200 pm2 restart cesa-ai-engine 2>/dev/null || \
    sudo -u www-data PM2_HOME=/var/www/home/.pm2 NODE_OPTIONS=--max-old-space-size=200 pm2 start src/index.js --name "cesa-ai-engine" --max-memory-restart 220M --time
    
    sudo -u www-data PM2_HOME=/var/www/home/.pm2 pm2 save
EOF

echo "✅ Despliegue completado satisfactoriamente."
echo "🔗 URL: https://$DOMAIN"
echo "📲 PWA (PHP Shell): https://$DOMAIN/pwa/"
echo "🤖 AI Status: https://$DOMAIN/api/ia/admin/status"
