#!/bin/bash
# deploy-carnet.sh - CESA WEB v4.0
# Despliegue específico del módulo de Carnet Digital

IP="129.146.150.123"
USER="ubuntu"
REMOTE_PATH="/var/www/cesa-web"
SSH_KEY="/Users/robertoeduardocelisrobles/Documents/FT Apps/Web/CESA-WEB/unison keys/ssh-key-2026-05-12.key"

echo "🚀 Desplegando Módulo de Carnet Digital a Oracle VPS..."

# 1. Subir archivos de lógica
scp -i "$SSH_KEY" -o StrictHostKeyChecking=no backend/lib/CarnetService.php $USER@$IP:/tmp/
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no $USER@$IP "sudo mv /tmp/CarnetService.php $REMOTE_PATH/backend/lib/"

# 2. Subir endpoints API
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no $USER@$IP "sudo mkdir -p $REMOTE_PATH/backend/api/user $REMOTE_PATH/backend/api/auth"
scp -i "$SSH_KEY" -o StrictHostKeyChecking=no backend/api/user/carnet_payload.php $USER@$IP:/tmp/
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no $USER@$IP "sudo mv /tmp/carnet_payload.php $REMOTE_PATH/backend/api/user/"

scp -i "$SSH_KEY" -o StrictHostKeyChecking=no backend/api/auth/session.php $USER@$IP:/tmp/
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no $USER@$IP "sudo mv /tmp/session.php $REMOTE_PATH/backend/api/auth/"

# 3. Subir pantallas y assets actualizados (Sincronización Total v4.0)
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no $USER@$IP "sudo mkdir -p $REMOTE_PATH/backend/public/screens"
scp -i "$SSH_KEY" -o StrictHostKeyChecking=no backend/public/screens/*.php $USER@$IP:/tmp/
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no $USER@$IP "sudo mv /tmp/*.php $REMOTE_PATH/backend/public/screens/"

# Scripts y Shell Principal
scp -i "$SSH_KEY" -o StrictHostKeyChecking=no backend/public/index.php $USER@$IP:/tmp/
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no $USER@$IP "sudo mv /tmp/index.php $REMOTE_PATH/backend/public/"

scp -i "$SSH_KEY" -o StrictHostKeyChecking=no backend/public/assets/js/*.js $USER@$IP:/tmp/
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no $USER@$IP "sudo mv /tmp/*.js $REMOTE_PATH/backend/public/assets/js/"

scp -i "$SSH_KEY" -o StrictHostKeyChecking=no backend/public/sw.js $USER@$IP:/tmp/
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no $USER@$IP "sudo mv /tmp/sw.js $REMOTE_PATH/backend/public/"

# 4. Ajustar permisos
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no $USER@$IP "sudo chown -R www-data:www-data $REMOTE_PATH && sudo chmod -R 755 $REMOTE_PATH"

echo "✅ Industrialización CESA v4.0 Completa y Desplegada."
