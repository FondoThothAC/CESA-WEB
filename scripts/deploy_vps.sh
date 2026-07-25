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
DOMAIN="cesaunison.fondothoth.com"
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
    database/migrations/v3.6_admin_governance.sql \
    database/migrations/v3.6_skills_and_credits.sql \
    database/migrations/v3.7_karma_system.sql \
    database/migrations/v3.8_karma_expansion.sql \
    database/migrations/v3.9_tutorias_module.sql \
    database/migrations/v4.1_inbox_system.sql \
    database/migrations/v4.1_skills_vacantes.sql \
    database/migrations/v4.2_bazar_expansion.sql \
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
    database/migrations/v5.3_admin_granular_roles_and_ia_metadata.sql \
    database/migrations/v5.4_votaciones_noticias.sql \
    database/migrations/v5.5_refinamiento_electoral.sql \
    database/migrations/v5.6_matrix_permissions.sql \
    database/migrations/v5.7_admin_seeds.sql \
    database/migrations/v5.8_extended_permissions.sql \
    database/migrations/v6.0_dynamic_providers.sql \
    database/migrations/v6.1_job_applications.sql \
    database/migrations/v6.2_sociedades_anuncios_y_elecciones.sql \
    database/migrations/v6.3_test_seed_votaciones.sql \
    database/migrations/v6.4_update_candidates_photos.sql \
    database/migrations/v6.5_add_external_fields_to_vacantes.sql \
    database/migrations/v6.6_rag_bazar_marketplace_auth.sql \
    database/migrations/v6.7_ollama_pool_and_chat_sessions.sql \
    database/migrations/v6.8_activate_publicidad_and_bazar.sql \
    database/migrations/v6.9_student_expediente_credits_and_auditoria.sql \
    database/migrations/v7.0_zeroclaw_swarm.sql \
    database/migrations/v7.1_bazar_multi_map_and_archiving.sql \
    database/migrations/v7.2_seed_user_a222219849.sql \
    database/migrations/v7.3_seed_user_a221216515.sql \
    database/migrations/v7.4_seed_new_users.sql \
    scripts/setup_telegram_webhook.php \
    scripts/install_zeroclaw.sh \
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

    # Aplicar migraciones v3.6 a v3.9
    echo "   - Aplicando v3.6_admin_governance.sql..."
    sudo mysql "$DB_NAME" -f < /tmp/v3.6_admin_governance.sql || true
    echo "   - Aplicando v3.6_skills_and_credits.sql..."
    sudo mysql "$DB_NAME" -f < /tmp/v3.6_skills_and_credits.sql || true
    echo "   - Aplicando v3.7_karma_system.sql..."
    sudo mysql "$DB_NAME" -f < /tmp/v3.7_karma_system.sql || true
    echo "   - Aplicando v3.8_karma_expansion.sql..."
    sudo mysql "$DB_NAME" -f < /tmp/v3.8_karma_expansion.sql || true
    echo "   - Aplicando v3.9_tutorias_module.sql..."
    sudo mysql "$DB_NAME" -f < /tmp/v3.9_tutorias_module.sql || true
    
    # Aplicar inbox system v4.1
    echo "   - Aplicando v4.1_inbox_system.sql..."
    sudo mysql "$DB_NAME" -f < /tmp/v4.1_inbox_system.sql || true
    
    # Aplicar skills vacantes v4.1
    echo "   - Aplicando v4.1_skills_vacantes.sql..."
    sudo mysql "$DB_NAME" -f < /tmp/v4.1_skills_vacantes.sql || true

    # Aplicar bazar expansion v4.2
    echo "   - Aplicando v4.2_bazar_expansion.sql..."
    sudo mysql "$DB_NAME" -f < /tmp/v4.2_bazar_expansion.sql || true

    
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

    # Aplicar permisos granulares de administrador y metadatos de IA v5.3
    echo "   - Aplicando v5.3_admin_granular_roles_and_ia_metadata.sql..."
    sudo mysql "$DB_NAME" -f < /tmp/v5.3_admin_granular_roles_and_ia_metadata.sql || true

    # Aplicar votaciones y noticias v5.4
    echo "   - Aplicando v5.4_votaciones_noticias.sql..."
    sudo mysql "$DB_NAME" -f < /tmp/v5.4_votaciones_noticias.sql || true

    # Aplicar refinamiento electoral v5.5
    echo "   - Aplicando v5.5_refinamiento_electoral.sql..."
    sudo mysql "$DB_NAME" -f < /tmp/v5.5_refinamiento_electoral.sql || true

    # Aplicar matriz de permisos v5.6
    echo "   - Aplicando v5.6_matrix_permissions.sql..."
    sudo mysql "$DB_NAME" -f < /tmp/v5.6_matrix_permissions.sql || true
    
    # Aplicar seeds de administrador v5.7
    echo "   - Aplicando v5.7_admin_seeds.sql..."
    sudo mysql "$DB_NAME" -f < /tmp/v5.7_admin_seeds.sql || true

    # Aplicar matriz extendida v5.8
    echo "   - Aplicando v5.8_extended_permissions.sql..."
    sudo mysql "$DB_NAME" -f < /tmp/v5.8_extended_permissions.sql || true

    # Aplicar proveedores dinámicos v6.0
    echo "   - Aplicando v6.0_dynamic_providers.sql..."
    sudo mysql "$DB_NAME" -f < /tmp/v6.0_dynamic_providers.sql || true

    # Aplicar reportes de prácticas y vacantes v6.1
    echo "   - Aplicando v6.1_job_applications.sql..."
    sudo mysql "$DB_NAME" -f < /tmp/v6.1_job_applications.sql || true
    
    # Aplicar carrera destino y elecciones v6.2
    echo "   - Aplicando v6.2_sociedades_anuncios_y_elecciones.sql..."
    sudo mysql "$DB_NAME" -f < /tmp/v6.2_sociedades_anuncios_y_elecciones.sql || true

    # Aplicar sembrado de votaciones de prueba v6.3
    echo "   - Aplicando v6.3_test_seed_votaciones.sql..."
    sudo mysql "$DB_NAME" -f < /tmp/v6.3_test_seed_votaciones.sql || true

    # Aplicar fotos de candidatos v6.4
    echo "   - Aplicando v6.4_update_candidates_photos.sql..."
    sudo mysql "$DB_NAME" -f < /tmp/v6.4_update_candidates_photos.sql || true
    
    # Aplicar campos de bolsa externa v6.5
    echo "   - Aplicando v6.5_add_external_fields_to_vacantes.sql..."
    sudo mysql "$DB_NAME" -f < /tmp/v6.5_add_external_fields_to_vacantes.sql || true

    # Aplicar RAG, Bazar Marketplace, Auth Unificada y Edición Agosto v6.6
    echo "   - Aplicando v6.6_rag_bazar_marketplace_auth.sql..."
    sudo mysql "$DB_NAME" -f < /tmp/v6.6_rag_bazar_marketplace_auth.sql || true

    # Aplicar Ollama Pool & Persistencia de Sesiones v6.7
    echo "   - Aplicando v6.7_ollama_pool_and_chat_sessions.sql..."
    sudo mysql "$DB_NAME" -f < /tmp/v6.7_ollama_pool_and_chat_sessions.sql || true

    # Aplicar Modelo OCEAN y 7 Emociones Basales v6.8
    echo "   - Aplicando v6.8_ocean_psychometric_sentiment.sql..."
    sudo mysql "$DB_NAME" -f < /tmp/v6.8_ocean_psychometric_sentiment.sql || true

    # Aplicar Activación de Publicidad y Dashboard Bazar v6.8
    echo "   - Aplicando v6.8_activate_publicidad_and_bazar.sql..."
    sudo mysql "$DB_NAME" -f < /tmp/v6.8_activate_publicidad_and_bazar.sql || true

    # Aplicar Expediente, Créditos Académicos y Auditoría v6.9
    echo "   - Aplicando v6.9_student_expediente_credits_and_auditoria.sql..."
    sudo mysql "$DB_NAME" -f < /tmp/v6.9_student_expediente_credits_and_auditoria.sql || true
    
    # Aplicar Swarm de Sub-Agentes v7.0
    echo "   - Aplicando v7.0_zeroclaw_swarm.sql..."
    sudo mysql "$DB_NAME" -f < /tmp/v7.0_zeroclaw_swarm.sql || true

    # Aplicar Multi-Mapas y Archivo Histórico del Bazar v7.1
    echo "   - Aplicando v7.1_bazar_multi_map_and_archiving.sql..."
    sudo mysql "$DB_NAME" -f < /tmp/v7.1_bazar_multi_map_and_archiving.sql || true

    # Aplicar Semillas de Usuarios v7.2, v7.3, v7.4
    echo "   - Aplicando v7.2_seed_user_a222219849.sql..."
    sudo mysql "$DB_NAME" -f < /tmp/v7.2_seed_user_a222219849.sql || true
    echo "   - Aplicando v7.3_seed_user_a221216515.sql..."
    sudo mysql "$DB_NAME" -f < /tmp/v7.3_seed_user_a221216515.sql || true
    echo "   - Aplicando v7.4_seed_new_users.sql..."
    sudo mysql "$DB_NAME" -f < /tmp/v7.4_seed_new_users.sql || true
    
    # Configurar Webhook oficial de Telegram (@CesaUnisonBot)
    echo "   - Vinculando Webhook de Telegram (@CesaUnisonBot)..."
    php /tmp/setup_telegram_webhook.php https://cesaunison.fondothoth.com

    # Instalar y Configurar ZeroClaw y Pixel Office
    echo "   - Configurando motor ZeroClaw y Pixel Office..."
    sudo bash /tmp/install_zeroclaw.sh
    
    echo "✅ Archivos migrados, permisos configurados y bots vinculados."

    rm -f /tmp/schema.sql /tmp/05_skills.sql /tmp/06_push.sql /tmp/v3.6_admin_governance.sql /tmp/v3.6_skills_and_credits.sql /tmp/v3.7_karma_system.sql /tmp/v3.8_karma_expansion.sql /tmp/v3.9_tutorias_module.sql /tmp/v4.1_inbox_system.sql /tmp/v4.1_skills_vacantes.sql /tmp/v4.2_bazar_expansion.sql /tmp/v4.3_bazar_schematic.sql /tmp/v4.4_delegation_and_social.sql /tmp/v4.5_bazar_spots_and_editions.sql /tmp/v4.6_psychometric_tests.sql /tmp/v4.7_seed_psychometric_tests.sql /tmp/v4.8_publicidad_and_godmode.sql /tmp/v4.9_seed_more_skills_questions.sql /tmp/v5.0_seed_chinese_questions.sql /tmp/v5.1_seed_all_remaining_questions.sql /tmp/v5.2_seed_gestion_y_otros.sql /tmp/v5.3_admin_granular_roles_and_ia_metadata.sql /tmp/v5.4_votaciones_noticias.sql /tmp/v5.5_refinamiento_electoral.sql /tmp/v5.6_matrix_permissions.sql /tmp/v5.7_admin_seeds.sql /tmp/v5.8_extended_permissions.sql /tmp/v6.0_dynamic_providers.sql /tmp/v6.1_job_applications.sql /tmp/v6.2_sociedades_anuncios_y_elecciones.sql /tmp/v6.3_test_seed_votaciones.sql /tmp/v6.4_update_candidates_photos.sql /tmp/v6.5_add_external_fields_to_vacantes.sql /tmp/v6.8_activate_publicidad_and_bazar.sql /tmp/v6.9_student_expediente_credits_and_auditoria.sql /tmp/v7.0_zeroclaw_swarm.sql /tmp/v7.1_bazar_multi_map_and_archiving.sql /tmp/v7.2_seed_user_a222219849.sql /tmp/v7.3_seed_user_a221216515.sql /tmp/v7.4_seed_new_users.sql /tmp/setup_telegram_webhook.php /tmp/install_zeroclaw.sh


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
