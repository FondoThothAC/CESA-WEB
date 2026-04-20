#!/bin/bash

# ==========================================================
# CESA WEB - Automated Industrial Deployment Script
# Archivo: /scripts/deploy.sh
# ==========================================================

# Configuración (Modificar con tus datos reales)
HOSTGATOR_USER="roberto_cesa"
HOSTGATOR_IP="tuservidor.hostgator.com"
HOSTGATOR_PATH="/public_html/"

ORACLE_USER="opc"
ORACLE_IP="144.24.23.61"

echo "🚀 Iniciando despliegue de CESA WEB v3.5..."

# 1. Preparar Frontend (Next.js Static Export para HostGator)
echo "📦 Construyendo Frontend (Exportación Estática)..."
cd frontend
npm run build # Esto debería generar la carpeta /out si configuraste output: 'export'
cd ..

# 2. Sincronizar Backend PHP a HostGator
echo "🖥️ Sincronizando Backend a HostGator..."
# rsync -avz --exclude '.git' --exclude 'uploads' backend/ $HOSTGATOR_USER@$HOSTGATOR_IP:$HOSTGATOR_PATH/api/

# 3. Sincronizar Frontend a HostGator
echo "🌐 Sincronizando Frontend a HostGator..."
# rsync -avz frontend/out/ $HOSTGATOR_USER@$HOSTGATOR_IP:$HOSTGATOR_PATH/

# 4. Desplegar Esquema DB a Oracle
echo "🗄️ Actualizando Base de Datos en Oracle VPS..."
# scp database/schema.sql $ORACLE_USER@$ORACLE_IP:~/
# ssh $ORACLE_USER@$ORACLE_IP "sudo mysql < ~/schema.sql"

echo "✅ Despliegue completado satisfactoriamente."
echo "🔔 Recuerda verificar que el Túnel de Cloudflare esté activo en tu Mac Mini."
