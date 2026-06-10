const cron = require('node-cron');
const db = require('./db');
const { aiRouter } = require('./ai-router');

/**
 * Procesa todos los reportes con estado = 'nuevo' y los delega usando IA
 */
const delegateNewReports = async () => {
  let connection;
  try {
    connection = await db.getConnection();
    
    // Obtener reportes nuevos
    const [rows] = await connection.query("SELECT * FROM reportes WHERE estado = 'nuevo'");
    if (rows.length === 0) {
      return;
    }
    
    console.log(`🤖 [DELEGACION IA] Procesando ${rows.length} reportes nuevos...`);
    
    const validCoordinaciones = ['integral', 'la_red', 'librx', 'raices', 'impulso', 'humano', 'mesa_directiva'];
    const validPrioridades = ['baja', 'media', 'alta', 'urgente', 'critica'];
    
    for (const report of rows) {
      const systemPrompt = `Eres un asistente inteligente del Consejo Estudiantil CESA UNISON. Tu tarea es clasificar reportes estudiantiles.
Clasifica el siguiente reporte en base a su asunto y descripción.
Retorna estrictamente un objeto JSON con las siguientes claves y nada más:
{
  "coordinacion_asignada": "uno de los siguientes comités: 'integral', 'la_red', 'librx', 'raices', 'impulso', 'humano', 'mesa_directiva'",
  "prioridad": "uno de los siguientes niveles: 'baja', 'media', 'alta', 'urgente', 'critica'",
  "requiere_atencion_humana": true/false (pon true si el reporte contiene acoso de cualquier tipo, bullying, violencia física o de género, amenazas graves, o problemas de salud/seguridad física/mental urgente)",
  "analisis_ia": "una explicación muy breve de 1 o 2 frases en español justificando por qué se asignó a esta coordinación y si amerita atención especial."
}
Devuelve ÚNICAMENTE el código JSON. No agregues texto introductorio, explicaciones, ni bloques de código como \`\`\`json.

Reporte a clasificar:
ID: #${report.id}
Tipo: ${report.tipo}
Categoría original: ${report.categoria}
Asunto: ${report.asunto}
Descripción: ${report.descripcion}`;

      try {
        console.log(`🤖 [DELEGACION IA] Evaluando reporte #${report.id}...`);
        
        // Llamar a la IA a través del router híbrido
        let response = await aiRouter.routeRequest(systemPrompt, { skipTrim: true });
        
        // Limpiar bloques de código markdown si los hay
        let cleanResponse = response.trim();
        if (cleanResponse.startsWith('```')) {
          cleanResponse = cleanResponse.replace(/^```(json)?/, '').replace(/```$/, '').trim();
        }
        
        // Valores por defecto en caso de fallo
        let parsed = {
          coordinacion_asignada: 'mesa_directiva',
          prioridad: 'media',
          requiere_atencion_humana: false,
          analisis_ia: 'Fallo al procesar estructuración del análisis con IA.'
        };
        
        try {
          const data = JSON.parse(cleanResponse);
          if (data.coordinacion_asignada && validCoordinaciones.includes(data.coordinacion_asignada)) {
            parsed.coordinacion_asignada = data.coordinacion_asignada;
          }
          if (data.prioridad && validPrioridades.includes(data.prioridad)) {
            parsed.prioridad = data.prioridad;
          }
          if (data.requiere_atencion_humana !== undefined) {
            parsed.requiere_atencion_humana = !!data.requiere_atencion_humana;
          }
          if (data.analisis_ia) {
            parsed.analisis_ia = data.analisis_ia;
          }
        } catch (jsonErr) {
          console.error(`❌ [DELEGACION IA] Error al parsear JSON para reporte #${report.id}:`, jsonErr.message, 'Respuesta:', response);
          // Intentar un parseo parcial o manual si el JSON falló
          if (response.toLowerCase().includes('humano')) parsed.coordinacion_asignada = 'humano';
          if (response.toLowerCase().includes('la_red')) parsed.coordinacion_asignada = 'la_red';
          if (response.toLowerCase().includes('librx')) parsed.coordinacion_asignada = 'librx';
          if (response.toLowerCase().includes('raices')) parsed.coordinacion_asignada = 'raices';
          if (response.toLowerCase().includes('impulso')) parsed.coordinacion_asignada = 'impulso';
          if (response.toLowerCase().includes('integral')) parsed.coordinacion_asignada = 'integral';
          
          if (response.toLowerCase().includes('true') || response.toLowerCase().includes('sí') || response.toLowerCase().includes('si')) {
            parsed.requiere_atencion_humana = true;
          }
          parsed.analisis_ia = `Clasificación de emergencia: ${response.substring(0, 150)}`;
        }
        
        // Actualizar reporte en la base de datos
        await connection.query(
          `UPDATE reportes 
           SET estado = 'asignado', 
               coordinacion_asignada = ?, 
               prioridad = ?, 
               requiere_atencion_humana = ?, 
               analisis_ia = ? 
           WHERE id = ?`,
          [
            parsed.coordinacion_asignada,
            parsed.prioridad,
            parsed.requiere_atencion_humana ? 1 : 0,
            parsed.analisis_ia,
            report.id
          ]
        );
        
        console.log(`✅ [DELEGACION IA] Reporte #${report.id} delegado a '${parsed.coordinacion_asignada}' con prioridad '${parsed.prioridad}'. Atención humana: ${parsed.requiere_atencion_humana}`);
        
        // Generar notificación a administradores si requiere atención humana o es urgente/crítico
        if (parsed.requiere_atencion_humana || parsed.prioridad === 'urgente' || parsed.prioridad === 'critica') {
          const notificacionMsg = `El reporte #${report.id} (${report.asunto}) fue detectado como crítico/urgente por la IA y requiere atención humana.`;
          await connection.query(
            `INSERT INTO notificaciones (usuario_id, tipo, titulo, mensaje, url_action, icono)
             SELECT id, 'reporte', '🚨 REPORTE CRÍTICO (IA)', ?, '/admin/moderacion', 'fa-exclamation-triangle'
             FROM usuarios 
             WHERE rol IN ('admin', 'mesa_directiva') AND activo = 1`,
            [notificacionMsg]
          );
          console.log(`🔔 [DELEGACION IA] Notificación enviada a la Mesa Directiva para reporte #${report.id}`);
        }
        
      } catch (innerErr) {
        console.error(`❌ [DELEGACION IA] Error procesando reporte #${report.id}:`, innerErr.message);
      }
    }
    
  } catch (err) {
    console.error('❌ [DELEGACION IA] Error general del worker de delegación:', err.message);
  } finally {
    if (connection) connection.release();
  }
};

/**
 * Inicializador del worker de delegación
 */
const initDelegationWorker = () => {
  // Correr inmediatamente al iniciar para procesar reportes en cola
  delegateNewReports();
  
  // Ejecutar cron cada 1 minuto
  cron.schedule('*/1 * * * *', () => {
    delegateNewReports();
  }, {
    scheduled: true,
    timezone: "America/Hermosillo"
  });
  
  console.log('⏱️  Worker de Delegación IA de Reportes inicializado (frecuencia: 1 min).');
};

module.exports = { initDelegationWorker, delegateNewReports };
