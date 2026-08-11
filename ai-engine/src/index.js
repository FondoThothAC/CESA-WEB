// 1. Cargar variables de entorno del backend antes de inicializar dependencias
require('./services/env-loader').loadEnv();

const express = require('express');
const { aiRouter } = require('./services/ai-router');
const { socialRouter, initSocialCronjobs } = require('./services/social-orchestrator');
const { initDelegationWorker } = require('./services/delegation-worker');
const verifyCesaToken = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON ultraligero
app.use(express.json({ limit: '10kb' }));

// Montar rutas de Redes Sociales
app.use('/api/social', socialRouter);

// Iniciar cronjobs en segundo plano (renovación de tokens Meta, delegación IA)
initSocialCronjobs();
initDelegationWorker();

// ==========================================
// ENDPOINTS DE INTELIGENCIA ARTIFICIAL
// ==========================================

// Chat interactivo con middleware de autenticación compartido (PHP JWT)
app.post('/api/ia/chat', verifyCesaToken, async (req, res) => {
  try {
    const { message, heavyProcessing = false } = req.body;
    const user = req.user;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Mensaje requerido' });
    }
    
    // Inyectar el contexto de sesión en el Prompt para personalización
    const contextStr = user.role !== 'anonymous' 
      ? `El usuario logueado es: ${user.name || 'Estudiante'} (ID: ${user.id}). Rol: ${user.role}.` 
      : 'El usuario es un visitante anónimo del portal público.';

    const fullPrompt = `Contexto del sistema: ${contextStr}\n\nEres Bob, el Asistente Virtual de CESA. Tienes una personalidad de nerd coqueto, muy amable y sumamente comprensivo con los estudiantes. Usa un tono inteligente pero juguetón y siempre busca ayudar.\n\nPregunta del usuario: ${message}`;
    
    // Rutear la petición al proveedor óptimo (Groq, Mistral o Mac Mini)
    const reply = await aiRouter.routeRequest(fullPrompt, { heavyProcessing });
    
    res.json({ reply });
  } catch (error) {
    console.error('Error procesando chat:', error.message);
    res.status(500).json({ error: 'No se pudo procesar tu solicitud en este momento.' });
  }
});

// Generación de exámenes de idiomas dinámicos por IA
app.post('/api/ia/generate-exam', verifyCesaToken, async (req, res) => {
  try {
    const { language, level = 'Básico' } = req.body;
    if (!language) {
      return res.status(400).json({ error: 'Idioma requerido' });
    }

    const prompt = `Actúa como un profesor de idiomas certificado en la UNISON. Genera un examen de práctica de opción múltiple para el idioma ${language} en nivel ${level}. 
Genera exactamente 10 preguntas de opción múltiple.
Cada pregunta debe tener exactamente 3 opciones y explicar por qué la respuesta es correcta de manera clara y didáctica.
Responde estrictamente con un JSON con el siguiente formato, sin bloques de código markdown ni texto adicional:
{
  "preguntas": [
    {
      "id": 1,
      "pregunta": "...",
      "opciones": ["opción A", "opción B", "opción C"],
      "respuesta_correcta": "...",
      "explicacion": "..."
    }
  ]
}`;

    const reply = await aiRouter.routeRequest(prompt, { heavyProcessing: true });
    
    // Extraer JSON limpio de la respuesta
    const jsonStart = reply.indexOf('{');
    const jsonEnd = reply.lastIndexOf('}') + 1;
    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error('La IA no devolvió un formato JSON válido');
    }
    const cleanJson = reply.substring(jsonStart, jsonEnd);
    const data = JSON.parse(cleanJson);
    
    res.json({ success: true, ...data });
  } catch (error) {
    console.error('Error generando examen de idioma:', error.message);
    res.status(500).json({ error: 'No se pudo generar el examen en este momento.' });
  }
});

// Endpoint administrativo para verificar cuotas y consumo de RAM
app.get('/api/ia/admin/status', verifyCesaToken, (req, res) => {
  // Solo administradores pueden ver el estado
  if (req.user.role !== 'admin' && req.user.role !== 'master' && req.user.role !== 'mesa_directiva') {
    return res.status(403).json({ error: 'Acceso denegado' });
  }

  const memoryUsage = process.memoryUsage();
  res.json({
    status: 'ok',
    memory: {
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB',
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + 'MB'
    },
    ...aiRouter.getStatus()
  });
});

// Webhook de validación de Meta para WhatsApp Business
app.get('/api/social/webhook', (req, res) => {
  const verify_token = process.env.WHATSAPP_VERIFY_TOKEN || 'cesa_unison_2026';
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  if (mode === 'subscribe' && token === verify_token) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Inicio seguro
const server = app.listen(PORT, () => {
  console.log(`🚀 Motor IA Híbrido CESA corriendo en el puerto ${PORT}`);
  console.log(`   Límites aplicados: ${process.env.NODE_OPTIONS || 'Ninguno'}`);
});

// Cierre elegante para evitar corrupción
process.on('SIGINT', () => {
  console.log('Apagando microservicio...');
  server.close(() => process.exit(0));
});
