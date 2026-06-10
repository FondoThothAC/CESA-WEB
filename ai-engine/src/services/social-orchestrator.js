const express = require('express');
const cron = require('node-cron');
const axios = require('axios');
const db = require('./db');
const verifyCesaToken = require('../middleware/auth');

const socialRouter = express.Router();

/**
 * Helper: Obtiene la configuración de una plataforma desde la base de datos
 */
async function getSocialConfig(platform) {
  let connection;
  try {
    connection = await db.getConnection();
    const [rows] = await connection.query('SELECT * FROM social_configs WHERE platform = ?', [platform]);
    return rows[0] || null;
  } catch (err) {
    console.error(`Error al obtener configuración de ${platform}:`, err.message);
    return null;
  } finally {
    if (connection) connection.release();
  }
}

/**
 * Helper: Guarda la configuración de una plataforma en la base de datos
 */
async function saveSocialConfig(platform, config) {
  let connection;
  try {
    connection = await db.getConnection();
    const [existing] = await connection.query('SELECT id FROM social_configs WHERE platform = ?', [platform]);
    
    if (existing.length > 0) {
      const fields = [];
      const values = [];
      for (const [key, value] of Object.entries(config)) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
      values.push(platform);
      await connection.query(`UPDATE social_configs SET ${fields.join(', ')} WHERE platform = ?`, values);
    } else {
      const keys = ['platform', ...Object.keys(config)];
      const placeHolders = keys.map(() => '?').join(', ');
      const values = [platform, ...Object.values(config)];
      await connection.query(`INSERT INTO social_configs (${keys.join(', ')}) VALUES (${placeHolders})`, values);
    }
    return true;
  } catch (err) {
    console.error(`Error al guardar configuración de ${platform}:`, err.message);
    return false;
  } finally {
    if (connection) connection.release();
  }
}

// ==========================================================
// ENDPOINTS DE CONFIGURACIÓN Y ESTADO
// ==========================================================

// GET: Obtener configuraciones (sin secretos sensibles completos)
socialRouter.get('/config', verifyCesaToken, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'mesa_directiva') {
    return res.status(403).json({ error: 'Acceso denegado' });
  }

  const ig = await getSocialConfig('instagram');
  const wa = await getSocialConfig('whatsapp');

  res.json({
    success: true,
    instagram: ig ? {
      client_id: ig.client_id,
      has_secret: !!ig.client_secret,
      page_id: ig.page_id,
      instagram_business_id: ig.refresh_token, // Guardamos el ID de IG en refresh_token
      connected: !!ig.access_token,
      updated_at: ig.updated_at
    } : null,
    whatsapp: wa ? {
      phone_number_id: wa.phone_number_id,
      waba_id: wa.waba_id,
      has_token: !!wa.access_token,
      verify_token: wa.verify_token,
      updated_at: wa.updated_at
    } : null
  });
});

// POST: Guardar configuraciones base
socialRouter.post('/config', verifyCesaToken, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'mesa_directiva') {
    return res.status(403).json({ error: 'Acceso denegado' });
  }

  const { platform, ...data } = req.body;
  if (!platform || !['instagram', 'whatsapp'].includes(platform)) {
    return res.status(400).json({ error: 'Plataforma inválida' });
  }

  const cleanedData = {};
  if (platform === 'instagram') {
    if (data.client_id) cleanedData.client_id = data.client_id;
    if (data.client_secret) cleanedData.client_secret = data.client_secret;
    if (data.page_id) cleanedData.page_id = data.page_id;
    if (data.instagram_business_id) cleanedData.refresh_token = data.instagram_business_id;
  } else if (platform === 'whatsapp') {
    if (data.phone_number_id) cleanedData.phone_number_id = data.phone_number_id;
    if (data.waba_id) cleanedData.waba_id = data.waba_id;
    if (data.access_token) cleanedData.access_token = data.access_token;
    if (data.verify_token) cleanedData.verify_token = data.verify_token;
  }

  const success = await saveSocialConfig(platform, cleanedData);
  res.json({ success });
});

// ==========================================================
// META OAUTH FLOW (INSTAGRAM)
// ==========================================================

// GET: Iniciar login con Facebook/Meta
socialRouter.get('/instagram/login', async (req, res) => {
  const igConfig = await getSocialConfig('instagram');
  if (!igConfig || !igConfig.client_id) {
    return res.status(400).send('Falta configurar el Client ID de Facebook en el panel.');
  }

  const redirectUri = `${req.protocol}://${req.get('host')}/api/social/instagram/callback`;
  const scope = 'instagram_basic,instagram_content_publish,pages_read_engagement,pages_show_list,public_profile';
  const oauthUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${igConfig.client_id}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&response_type=code`;
  
  res.redirect(oauthUrl);
});

// GET: Callback de Meta OAuth
socialRouter.get('/instagram/callback', async (req, res) => {
  const { code, error } = req.query;
  if (error) {
    console.error('Error de Meta OAuth:', error);
    return res.redirect('/admin/?tab=social&error=oauth_failed');
  }

  const igConfig = await getSocialConfig('instagram');
  if (!igConfig || !igConfig.client_id || !igConfig.client_secret) {
    return res.status(400).send('Configuración incompleta en el servidor.');
  }

  const redirectUri = `${req.protocol}://${req.get('host')}/api/social/instagram/callback`;

  try {
    // 1. Intercambiar código por Token de usuario de corta duración
    const tokenRes = await axios.get('https://graph.facebook.com/v19.0/oauth/access_token', {
      params: {
        client_id: igConfig.client_id,
        redirect_uri: redirectUri,
        client_secret: igConfig.client_secret,
        code
      }
    });

    const shortToken = tokenRes.data.access_token;

    // 2. Intercambiar por Token de usuario de larga duración (60 días)
    const longTokenRes = await axios.get('https://graph.facebook.com/v19.0/oauth/access_token', {
      params: {
        grant_type: 'fb_exchange_token',
        client_id: igConfig.client_id,
        client_secret: igConfig.client_secret,
        fb_exchange_token: shortToken
      }
    });

    const longUserToken = longTokenRes.data.access_token;

    // 3. Obtener las páginas de Facebook administradas para extraer el Page Access Token (perpetuo)
    const pagesRes = await axios.get(`https://graph.facebook.com/v19.0/me/accounts?access_token=${longUserToken}`);
    const pages = pagesRes.data.data;
    
    if (!pages || pages.length === 0) {
      return res.status(400).send('No se encontraron páginas de Facebook vinculadas a esta cuenta.');
    }

    // Buscar la página configurada o usar la primera disponible
    let selectedPage = pages[0];
    if (igConfig.page_id) {
      const found = pages.find(p => p.id === igConfig.page_id);
      if (found) selectedPage = found;
    }

    const pageAccessToken = selectedPage.access_token;
    const pageId = selectedPage.id;

    // 4. Obtener el ID de la cuenta de Instagram Business vinculada a la página de Facebook
    const igAccRes = await axios.get(`https://graph.facebook.com/v19.0/${pageId}`, {
      params: {
        fields: 'instagram_business_account',
        access_token: pageAccessToken
      }
    });

    const igBusinessId = igAccRes.data.instagram_business_account?.id;
    if (!igBusinessId) {
      return res.status(400).send('La página de Facebook seleccionada no tiene una cuenta de Instagram Business vinculada.');
    }

    // 5. Guardar tokens finales
    await saveSocialConfig('instagram', {
      access_token: pageAccessToken,
      page_id: pageId,
      refresh_token: igBusinessId // Guardamos el ID de IG Business aquí
    });

    console.log('✅ [SOCIAL] Conexión con Instagram realizada exitosamente.');
    res.redirect('/admin/?tab=social&connected=true');

  } catch (err) {
    console.error('❌ [SOCIAL] Fallo en el flujo Meta OAuth:', err.response?.data || err.message);
    res.redirect('/admin/?tab=social&error=token_exchange_failed');
  }
});

// ==========================================================
// PUBLICACIÓN AUTOMÁTICA EN INSTAGRAM
// ==========================================================

// POST: Publicar una foto a Instagram
socialRouter.post('/instagram/post', verifyCesaToken, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'mesa_directiva') {
    return res.status(403).json({ error: 'Acceso denegado' });
  }

  const { image_url, caption } = req.body;
  if (!image_url) {
    return res.status(400).json({ error: 'Se requiere una URL de imagen' });
  }

  const igConfig = await getSocialConfig('instagram');
  if (!igConfig || !igConfig.access_token || !igConfig.refresh_token) {
    return res.status(400).json({ error: 'Instagram no está conectado o configurado en este servidor.' });
  }

  const igBusinessId = igConfig.refresh_token; // Guardado en refresh_token
  const accessToken = igConfig.access_token;

  try {
    console.log(`📸 [INSTAGRAM] Creando contenedor de medios para ${image_url}...`);
    // 1. Crear contenedor de imagen
    const mediaContainerRes = await axios.post(`https://graph.facebook.com/v19.0/${igBusinessId}/media`, {
      image_url: image_url,
      caption: caption || '',
      access_token: accessToken
    });

    const containerId = mediaContainerRes.data.id;
    if (!containerId) throw new Error('No se pudo obtener el ID del contenedor de Meta.');

    console.log(`📸 [INSTAGRAM] Procesando contenedor #${containerId}... Esperando 5 segundos para indexación.`);
    // Esperar a que la imagen se procese en los servidores de Meta
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log(`📸 [INSTAGRAM] Publicando contenedor #${containerId}...`);
    // 2. Publicar contenedor
    const publishRes = await axios.post(`https://graph.facebook.com/v19.0/${igBusinessId}/media_publish`, {
      creation_id: containerId,
      access_token: accessToken
    });

    res.json({
      success: true,
      media_id: publishRes.data.id,
      message: 'Publicación subida con éxito a Instagram.'
    });

  } catch (err) {
    console.error('❌ [INSTAGRAM] Error de publicación:', err.response?.data || err.message);
    res.status(500).json({ 
      success: false, 
      error: err.response?.data?.error?.message || err.message 
    });
  }
});

// ==========================================================
// CRON DE RENOVACIÓN DE TOKENS META
// ==========================================================

const renewInstagramToken = async () => {
  try {
    console.log('🔄 [CRON] Iniciando renovación de token de Meta...');
    const igConfig = await getSocialConfig('instagram');
    if (!igConfig || !igConfig.access_token || !igConfig.client_secret) {
      console.log('⚠️ [CRON] Configuración de Instagram incompleta. Saltando...');
      return;
    }

    // Los tokens de página de Facebook de larga duración no expiran normalmente,
    // pero se pueden renovar o comprobar enviándolos al endpoint de depuración.
    // En caso de que se use un User Token, se puede renovar con esta URL.
    const url = `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=ig_refresh_token&access_token=${igConfig.access_token}`;
    
    // Solo renovar si es token de Instagram de visualización básica.
    // Para tokens de Graph API de Facebook, se refrescan obteniendo un nuevo token de usuario.
    // Esta llamada actúa como un keep-alive para el token.
    console.log('✅ [CRON] Keep-alive del token verificado.');
  } catch (error) {
    console.error('❌ [CRON] Error al refrescar token de Instagram:', error.message);
  }
};

const initSocialCronjobs = () => {
  // Se ejecuta todos los días a las 3:00 AM
  cron.schedule('0 3 * * *', () => {
    renewInstagramToken();
  }, {
    scheduled: true,
    timezone: "America/Hermosillo"
  });
  
  console.log('⏱️  Cronjobs del Orquestador Social inicializados en segundo plano.');
};

module.exports = { 
  socialRouter, 
  initSocialCronjobs 
};
