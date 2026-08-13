// ==============================================================================
// MOTOR DE INFERENCIA Y SWARM DE AGENTES — CESA UNISON (RUST BACKEND)
// ==============================================================================
// Arquitectura de Swarm con Cascada Multi-Provider y Tool Calling:
//   1. Resolución dinámica del Agente (Bob Prime, Aria, Atlas, Minerva, etc.)
//   2. Contexto RAG Institucional de la Universidad de Sonora
//   3. Cascada LLM: Groq (Llama 3.1 70B) ➔ Google Gemini 2.0 Flash ➔ Ollama Cloud
//   4. Ejecución de herramientas (Canva, Gmail SMTP, Pollinations/Imagen, DB)
//   5. Cola de Human-in-the-Loop para aprobaciones sensibles
//   6. Persistencia de sesiones en MariaDB (`ia_agentes_sesiones`)
// ==============================================================================

pub mod tools;

use crate::{state::AppState, utils::response::ApiResponse};
use axum::{
    extract::{Path, State},
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use sqlx::FromRow;

// ─────────────────────────────────────────────────────────────────────────────
// ESTRUCTURAS DE DATOS
// ─────────────────────────────────────────────────────────────────────────────

#[derive(Debug, Deserialize)]
pub struct ChatRequest {
    pub session_id: Option<String>,
    pub message: String,
    pub user_id: Option<i64>,
    pub canal: Option<String>,
    pub telegram_chat_id: Option<i64>,
    pub agent_id: Option<i32>,
}

#[derive(Debug, Serialize)]
pub struct ChatResponse {
    pub session_id: String,
    pub reply: String,
    pub model_used: String,
    pub agent_nombre: String,
    pub herramientas_usadas: Vec<String>,
    pub imagen_url: Option<String>,
    pub requiere_aprobacion: bool,
    pub approval_id: Option<i64>,
}

#[derive(Debug, FromRow, Serialize, Deserialize, Clone)]
pub struct SubAgentDb {
    pub id: i32,
    pub nombre_agente: String,
    pub encargado_nombre: String,
    pub eje_trabajo: String,
    pub color_hex: Option<String>,
    pub avatar_sprite: Option<String>,
    pub prompt_personalidad: Option<String>,
    pub req_aprobacion: Option<i8>,
    pub activo: Option<i8>,
}

#[derive(Debug, FromRow)]
pub struct RagBlock {
    pub titulo: String,
    pub contenido: String,
}

// ─────────────────────────────────────────────────────────────────────────────
// ESQUEMA DE HERRAMIENTAS PARA EL LLM
// ─────────────────────────────────────────────────────────────────────────────

pub fn definicion_herramientas() -> Value {
    json!([
        {
            "type": "function",
            "function": {
                "name": "generar_diseño_canva",
                "description": "Genera un flyer oficial o diseño para redes sociales con el Brand Kit de CESA UNISON usando la Canva Connect API. Úsala SOLO cuando ya tengas confirmados todos los detalles: formato, título, subtítulo, fecha/lugar y estilo. Si el usuario no los proporcionó, pregunta primero con el flujo de preguntas.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "formato": {
                            "type": "string",
                            "enum": ["instagram_cuadrado", "instagram_vertical", "historia", "banner_web", "cartel_campus"],
                            "description": "Formato de salida del diseño. Usa 'instagram_cuadrado' (1080x1080, 1:1) por defecto para Instagram. 'instagram_vertical' (1080x1350, 4:5), 'historia' (1080x1920, 9:16), 'banner_web' (1200x628), 'cartel_campus' (700x1000)."
                        },
                        "plantilla": {
                            "type": "string",
                            "enum": ["boletin_semanal", "bazar_anuncio", "torneo_deportivo", "aviso_academico", "gaceta_cultural"],
                            "description": "Tipo de plantilla del Brand Kit CESA: 'aviso_academico' para convocatorias, 'torneo_deportivo' para deportes, 'gaceta_cultural' para cultura, 'boletin_semanal' para noticias, 'bazar_anuncio' para el bazar."
                        },
                        "titulo": {
                            "type": "string",
                            "description": "Título principal en mayúsculas impactantes (máx. 60 caracteres)"
                        },
                        "subtitulo": {
                            "type": "string",
                            "description": "Subtítulo explicativo del evento o aviso (máx. 100 caracteres)"
                        },
                        "fecha_lugar": {
                            "type": "string",
                            "description": "Fecha, hora y lugar en el campus de la UNISON"
                        }
                    },
                    "required": ["formato", "plantilla", "titulo", "subtitulo", "fecha_lugar"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "enviar_correo_gmail",
                "description": "Envía un correo electrónico institucional a través de la cuenta oficial de Gmail/Google Workspace de CESA UNISON. Úsala cuando pidan redactar o mandar correos a alumnos o coordinadores.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "destinatario": {
                            "type": "string",
                            "description": "Correo del destinatario (ej: alumno@unison.mx)"
                        },
                        "asunto": {
                            "type": "string",
                            "description": "Asunto oficial del correo"
                        },
                        "cuerpo_html": {
                            "type": "string",
                            "description": "Cuerpo del correo en formato HTML limpio y profesional"
                        }
                    },
                    "required": ["destinatario", "asunto", "cuerpo_html"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "generar_imagen_ia",
                "description": "Genera una ilustración o imagen libre usando inteligencia artificial. Úsala cuando pidan arte conceptual, fotos de estudiantes o imágenes ilustrativas.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "descripcion": {
                            "type": "string",
                            "description": "Prompt detallado en inglés describiendo la composición, iluminación y estilo."
                        }
                    },
                    "required": ["descripcion"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "crear_post_bazar",
                "description": "Publica un artículo o servicio en el Bazar Estudiantil de CESA UNISON.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "titulo": {
                            "type": "string",
                            "description": "Título del producto en venta"
                        },
                        "descripcion": {
                            "type": "string",
                            "description": "Descripción y estado del artículo"
                        },
                        "precio": {
                            "type": "number",
                            "description": "Precio en pesos mexicanos (MXN)"
                        }
                    },
                    "required": ["titulo", "descripcion", "precio"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "buscar_info_db",
                "description": "Consulta en la base de datos de CESA UNISON alumnos, noticias o productos del bazar.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "tipo": {
                            "type": "string",
                            "enum": ["alumno", "noticia", "bazar"],
                            "description": "Tipo de entidad a buscar"
                        },
                        "termino": {
                            "type": "string",
                            "description": "Término de búsqueda o matrícula"
                        }
                    },
                    "required": ["tipo", "termino"]
                }
            }
        }
    ])
}

// ─────────────────────────────────────────────────────────────────────────────
// CASCADA DE INFERENCIA MULTI-PROVIDER
// ─────────────────────────────────────────────────────────────────────────────

/// 1. Proveedor Primario: Groq Cloud con Auto-Switch Inteligente (Compound / 70B / 8B)
async fn intentar_groq(
    http: &reqwest::Client,
    api_key: &str,
    mensajes: &[Value],
    con_herramientas: bool,
) -> Result<(Value, String), String> {
    if api_key.is_empty() {
        return Err("GROQ_API_KEY no configurada".into());
    }

    // Calcular longitud total del contexto para decidir el modelo óptimo
    let total_caracteres: usize = mensajes
        .iter()
        .filter_map(|m| m["content"].as_str())
        .map(|s| s.len())
        .sum();

    // Regla 1: Si es un documento masivo (>12,000 caracteres), usar Compound para aprovechar tokens ilimitados
    let modelo_objetivo = if total_caracteres > 12000 {
        "groq/compound"
    } else {
        "llama-3.3-70b-versatile"
    };

    let mut body = json!({
        "model": modelo_objetivo,
        "messages": mensajes,
        "temperature": 0.6,
        "max_tokens": 1500
    });

    if con_herramientas {
        body["tools"] = definicion_herramientas();
        body["tool_choice"] = json!("auto");
    }

    let res = http
        .post("https://api.groq.com/openai/v1/chat/completions")
        .header("Authorization", format!("Bearer {}", api_key))
        .header("Content-Type", "application/json")
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Error conexión Groq: {}", e))?;

    if res.status().is_success() {
        let data: Value = res.json().await.map_err(|e| format!("Error parseando Groq: {}", e))?;
        return Ok((data, format!("groq/{}", modelo_objetivo)));
    }

    let status_code = res.status().as_u16();
    let err_txt = res.text().await.unwrap_or_default();
    tracing::warn!("⚠️  Aviso en Groq (HTTP {}): {} — Intentando Auto-Switch a Llama 3.1 8B Instant...", status_code, err_txt);

    // Regla 2: Si el modelo 70B alcanza rate limit o cuota (429), auto-switch instantáneo a Llama 3.1 8B Instant (14,400 req/día)
    let mut body_8b = json!({
        "model": "llama-3.1-8b-instant",
        "messages": mensajes,
        "temperature": 0.6,
        "max_tokens": 1200
    });

    if con_herramientas {
        body_8b["tools"] = definicion_herramientas();
        body_8b["tool_choice"] = json!("auto");
    }

    let res_8b = http
        .post("https://api.groq.com/openai/v1/chat/completions")
        .header("Authorization", format!("Bearer {}", api_key))
        .header("Content-Type", "application/json")
        .json(&body_8b)
        .send()
        .await
        .map_err(|e| format!("Error conexión Groq (8B Fallback): {}", e))?;

    if res_8b.status().is_success() {
        let data: Value = res_8b.json().await.map_err(|e| format!("Error parseando Groq 8B: {}", e))?;
        tracing::info!("🔄 Auto-Switch exitoso a Llama 3.1 8B Instant.");
        return Ok((data, "groq/llama-3.1-8b-instant (auto-switch)".to_string()));
    }

    let err_8b_txt = res_8b.text().await.unwrap_or_default();
    Err(format!("Groq Error HTTP {}: {}", status_code, err_8b_txt))
}

/// 2. Fallback 1: Google Gemini 2.0 Flash
async fn intentar_gemini(
    http: &reqwest::Client,
    api_key: &str,
    mensajes: &[Value],
) -> Result<(Value, String), String> {
    if api_key.is_empty() {
        return Err("GEMINI_API_KEY no configurada".into());
    }

    // Convertir mensajes al formato de Google Gemini
    let mut contents: Vec<Value> = Vec::new();
    for m in mensajes {
        let role = match m["role"].as_str().unwrap_or("user") {
            "assistant" => "model",
            "system" => "user",
            _ => "user",
        };
        let text = m["content"].as_str().unwrap_or("");
        contents.push(json!({
            "role": role,
            "parts": [{ "text": text }]
        }));
    }

    let url = format!(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={}",
        api_key
    );

    let body = json!({
        "contents": contents,
        "generationConfig": {
            "temperature": 0.6,
            "maxOutputTokens": 1200
        }
    });

    let res = http
        .post(&url)
        .header("Content-Type", "application/json")
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Error conexión Gemini: {}", e))?;

    if !res.status().is_success() {
        let err_txt = res.text().await.unwrap_or_default();
        return Err(format!("Gemini HTTP Error: {}", err_txt));
    }

    let raw: Value = res.json().await.map_err(|e| format!("Error parseando Gemini: {}", e))?;
    let reply_text = raw["candidates"][0]["content"]["parts"][0]["text"]
        .as_str()
        .unwrap_or("Respuesta generada por Gemini.");

    // Normalizar a estructura tipo OpenAI para compatibilidad interna
    let normalized = json!({
        "choices": [{
            "message": {
                "role": "assistant",
                "content": reply_text
            },
            "finish_reason": "stop"
        }]
    });

    Ok((normalized, "google/gemini-2.0-flash".to_string()))
}

/// Orquestador de la Cascada LLM: Groq ➔ Gemini ➔ Fallback Offline
pub async fn llamar_llm_cascada(
    http: &reqwest::Client,
    state: &AppState,
    mensajes: &[Value],
    con_herramientas: bool,
) -> (Value, String) {
    // Intento 1: Groq Cloud
    match intentar_groq(http, &state.config.groq_api_key, mensajes, con_herramientas).await {
        Ok((res, model)) => return (res, model),
        Err(e) => tracing::warn!("⚠️  Fallo en Groq Cloud (intentando Gemini 2.0 Flash): {}", e),
    }

    // Intento 2: Google Gemini 2.0 Flash
    match intentar_gemini(http, &state.config.gemini_api_key, mensajes).await {
        Ok((res, model)) => return (res, model),
        Err(e) => tracing::warn!("⚠️  Fallo en Gemini 2.0 Flash: {}", e),
    }

    // Fallback de Contingencia
    (
        json!({
            "choices": [{
                "message": {
                    "role": "assistant",
                    "content": "Hola, soy el asistente del CESA UNISON. Los servicios de IA en la nube están en mantenimiento momentáneo. Por favor, reintenta tu mensaje en un momento."
                },
                "finish_reason": "stop"
            }]
        }),
        "offline/contingency".to_string(),
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// RESOLUCIÓN DE IDENTIDAD DEL SUB-AGENTE
// ─────────────────────────────────────────────────────────────────────────────

pub async fn resolver_agente(
    db: &sqlx::MySqlPool,
    agent_id_opt: Option<i32>,
    mensaje: &str,
) -> SubAgentDb {
    let lower = mensaje.to_lowercase();

    // 1. Si viene un agent_id explícito
    if let Some(id) = agent_id_opt {
        if let Ok(agent) = sqlx::query_as::<_, SubAgentDb>("SELECT * FROM zeroclaw_agents WHERE id = ?").bind(id).fetch_one(db).await {
            return agent;
        }
    }

    // 2. Detección por mención en el texto (@Aria, @Atlas, etc.) o palabras clave
    let target_name = if lower.contains("aria") || lower.contains("canva") || lower.contains("diseño") || lower.contains("diseno") || lower.contains("flyer") || lower.contains("post") || lower.contains("redes") || lower.contains("instagram") || lower.contains("cartel") || lower.contains("banner") {
        "Aria"
    } else if lower.contains("atlas") || lower.contains("bazar") || lower.contains("vender") || lower.contains("negocio") || lower.contains("emprendimiento") {
        "Atlas"
    } else if lower.contains("minerva") || lower.contains("tutoría") || lower.contains("tutoria") || lower.contains("exani") || lower.contains("apuntes") || lower.contains("materia") {
        "Minerva"
    } else if lower.contains("orion") || lower.contains("orión") || lower.contains("deporte") || lower.contains("torneo") || lower.contains("futbol") || lower.contains("basquet") {
        "Orión"
    } else if lower.contains("aurora") || lower.contains("salud") || lower.contains("bienestar") || lower.contains("beca") || lower.contains("psicolog") {
        "Aurora"
    } else if lower.contains("lyra") || lower.contains("gaceta") || lower.contains("cultura") || lower.contains("evento") || lower.contains("musica") {
        "Lyra"
    } else if lower.contains("cleo") || lower.contains("finanzas") || lower.contains("tesoreria") || lower.contains("presupuesto") {
        "Cleo"
    } else if lower.contains("nova") || lower.contains("convenio") || lower.contains("descuento") || lower.contains("alianza") {
        "Nova"
    } else {
        "Bob Prime"
    };

    if let Ok(agent) = sqlx::query_as::<_, SubAgentDb>(
        "SELECT * FROM zeroclaw_agents WHERE nombre_agente LIKE ? AND activo = 1 LIMIT 1"
    )
    .bind(format!("%{}%", target_name))
    .fetch_one(db)
    .await {
        return agent;
    }

    // Default: Bob Prime
    SubAgentDb {
        id: 1,
        nombre_agente: "Bob Prime".to_string(),
        encargado_nombre: "Mesa Directiva".to_string(),
        eje_trabajo: "Presidencia & Coordinación Swarm".to_string(),
        color_hex: Some("#6366f1".to_string()),
        avatar_sprite: Some("agent_leader".to_string()),
        prompt_personalidad: Some("Eres Bob Prime, el agente líder del CESA UNISON. Coordinas a los agentes y asistes a los alumnos en español con profesionalismo y amabilidad.".to_string()),
        req_aprobacion: Some(1),
        activo: Some(1),
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// ORQUESTADOR PRINCIPAL DEL SWARM
// ─────────────────────────────────────────────────────────────────────────────

pub async fn orquestar_agente(
    state: &AppState,
    session_id: &str,
    mensaje_usuario: &str,
    user_id: Option<i64>,
    canal: &str,
    telegram_chat_id: Option<i64>,
    agent_id_opt: Option<i32>,
) -> ChatResponse {
    let agente = resolver_agente(&state.db, agent_id_opt, mensaje_usuario).await;
    tracing::info!("🤖 Invocando al agente: {} ({}) para sesión '{}'", agente.nombre_agente, agente.eje_trabajo, session_id);

    // 1. Contexto RAG de la base de conocimiento
    let rag_docs = sqlx::query_as::<_, RagBlock>(
        "SELECT titulo, contenido FROM ia_conocimiento_rag WHERE activo = TRUE ORDER BY id DESC LIMIT 5"
    )
    .fetch_all(&state.db)
    .await
    .unwrap_or_default();

    let mut context_str = String::from("Contexto Institucional de la Universidad de Sonora (UNISON):\n");
    for doc in rag_docs {
        context_str.push_str(&format!("\n--- {}\n{}\n", doc.titulo, doc.contenido));
    }

    // 2. Historial de sesión reciente
    let historial = sqlx::query_as::<_, (String, String)>(
        "SELECT rol, mensaje FROM ia_agentes_sesiones WHERE session_id = ? ORDER BY creado_en DESC LIMIT 8"
    )
    .bind(session_id)
    .fetch_all(&state.db)
    .await
    .unwrap_or_default();

    // Instrucción especial para el flujo de diseño Grill-Me de Aria
    let instruccion_aria = if agente.nombre_agente.to_lowercase().contains("aria") {
        "REGLA CRÍTICA DE DISEÑO (Aria): Cuando el usuario pida crear un flyer, diseño, banner, cartel o publicación para redes, \
        PRIMERO verifica si ya te proporcionó todos estos 4 datos en su mensaje: (1) Formato de red social, (2) Título exacto, (3) Fecha y lugar, (4) Estilo visual. \
        Si FALTA alguno de esos datos, responde ÚNICAMENTE con este mensaje de preguntas (sin invocar ninguna herramienta todavía):\n\
        '🎨 *¡Listo! Antes de diseñar, necesito confirmar algunos detalles:*\n\
        1️⃣ *Formato:* ¿Instagram cuadrado 1:1 (por defecto), Instagram vertical 4:5, Historia 9:16, Banner web o Cartel campus?\n\
        2️⃣ *Título exacto:* ¿Cuál es el texto principal que debe aparecer en el diseño?\n\
        3️⃣ *Fecha y lugar:* ¿Cuándo y dónde es el evento o actividad?\n\
        4️⃣ *Estilo:* ¿Formal académico, festivo/colorido, minimalista o impactante/deportivo?\n\
        _(Si ya me diste todos los datos anteriores, procedo directamente al diseño. 🚀)_'\n\
        Si YA tienes todos los datos, invoca generar_diseño_canva directamente con formato='instagram_cuadrado' como default si no especificaron. \
        NUNCA uses generar_imagen_ia para diseños institucionales, SIEMPRE usa generar_diseño_canva para flyers y posts de CESA."
    } else {
        ""
    };

    let system_prompt = format!(
        "Identidad: Eres {} ({}), encargado de {}. {}\n\
        Institución: CESA UNISON (Consejo Estudiantil de la Universidad de Sonora).\n\
        Reglas: Responde en español neutro, claro, empático y estructurado con Markdown.\n\
        Herramientas disponibles: Diseños oficiales con Canva Connect API (generar_diseño_canva), Envíos institucionales Gmail (enviar_correo_gmail), Arte conceptual libre (generar_imagen_ia — NO para posts institucionales), Publicar en Bazar (crear_post_bazar) y Búsqueda en Base de Datos (buscar_info_db).\n\
        {}\n\
        {}\n",
        agente.nombre_agente,
        agente.encargado_nombre,
        agente.eje_trabajo,
        agente.prompt_personalidad.as_deref().unwrap_or(""),
        context_str,
        instruccion_aria
    );

    let mut mensajes: Vec<Value> = vec![json!({ "role": "system", "content": system_prompt })];
    for (rol, msg) in historial.iter().rev() {
        mensajes.push(json!({ "role": rol, "content": msg }));
    }
    mensajes.push(json!({ "role": "user", "content": mensaje_usuario }));

    // 3. Ejecución con Cascada LLM
    let (llm_res, model_used) = llamar_llm_cascada(&state.http_client, state, &mensajes, true).await;

    let mut respuesta_final = String::from("Acción procesada.");
    let mut herramientas_usadas: Vec<String> = Vec::new();
    let mut imagen_url_final: Option<String> = None;
    let mut requiere_aprobacion = false;
    let mut approval_id_final: Option<i64> = None;

    let choice = &llm_res["choices"][0]["message"];
    let finish_reason = llm_res["choices"][0]["finish_reason"].as_str().unwrap_or("");

    // 4. Verificación y Ejecución de Herramientas
    if finish_reason == "tool_calls" {
        if let Some(tool_calls) = choice["tool_calls"].as_array() {
            for tool_call in tool_calls {
                let fn_name = tool_call["function"]["name"].as_str().unwrap_or("");
                let args_str = tool_call["function"]["arguments"].as_str().unwrap_or("{}");
                let args: Value = serde_json::from_str(args_str).unwrap_or(json!({}));

                herramientas_usadas.push(fn_name.to_string());
                tracing::info!("🔧 Ejecutando herramienta '{}' con parámetros: {}", fn_name, args_str);

                let res_tool = match fn_name {
                    "generar_diseño_canva" => {
                        // Extraer todos los parámetros incluyendo el nuevo campo `formato`
                        let formato    = args["formato"].as_str().unwrap_or("instagram_cuadrado");
                        let plantilla  = args["plantilla"].as_str().unwrap_or("aviso_academico");
                        let titulo     = args["titulo"].as_str().unwrap_or("AVISO CESA UNISON");
                        let subtitulo  = args["subtitulo"].as_str().unwrap_or("");
                        let fecha_lugar = args["fecha_lugar"].as_str().unwrap_or("Campus Hermosillo, UNISON");

                        // Invocar la Canva Connect API real con token OAuth2 desde MariaDB
                        let res = tools::generar_diseño_canva(
                            &state.http_client,
                            &state.db,
                            &state.config.canva_client_id,
                            &state.config.canva_client_secret,
                            plantilla,
                            titulo,
                            subtitulo,
                            fecha_lugar,
                            formato,
                        ).await;

                        if let Some(url) = &res.imagen_url {
                            imagen_url_final = Some(url.clone());
                        }
                        requiere_aprobacion = true;

                        // Registrar en la cola de aprobaciones Human-in-the-Loop
                        if let Ok(app_id) = tools::crear_solicitud_aprobacion(
                            &state.db,
                            agente.id,
                            "flyer_canva",
                            titulo,
                            &res.resultado,
                            imagen_url_final.as_deref(),
                        ).await {
                            approval_id_final = Some(app_id);
                        }

                        res.resultado
                    }
                    "enviar_correo_gmail" => {
                        let dest = args["destinatario"].as_str().unwrap_or("");
                        let asunto = args["asunto"].as_str().unwrap_or("Comunicado CESA UNISON");
                        let cuerpo = args["cuerpo_html"].as_str().unwrap_or("");

                        let res = tools::enviar_correo_gmail(
                            &state.config.smtp_gmail_user,
                            &state.config.smtp_gmail_pass,
                            dest,
                            asunto,
                            cuerpo,
                        ).await;
                        res.resultado
                    }
                    "generar_imagen_ia" => {
                        let desc = args["descripcion"].as_str().unwrap_or("estudiantes universidad de sonora");
                        let res = tools::generar_imagen_ia(&state.http_client, desc).await;
                        if let Some(url) = &res.imagen_url {
                            imagen_url_final = Some(url.clone());
                        }
                        res.resultado
                    }
                    "crear_post_bazar" => {
                        let tit = args["titulo"].as_str().unwrap_or("Producto");
                        let desc = args["descripcion"].as_str().unwrap_or("");
                        let precio = args["precio"].as_f64().unwrap_or(0.0);
                        let uid = user_id.unwrap_or(1);

                        let res = tools::crear_post_bazar(&state.db, tit, desc, precio, uid, imagen_url_final.as_deref()).await;
                        res.resultado
                    }
                    "buscar_info_db" => {
                        let tipo = args["tipo"].as_str().unwrap_or("noticia");
                        let termino = args["termino"].as_str().unwrap_or("");
                        let res = tools::buscar_info_db(&state.db, tipo, termino).await;
                        res.resultado
                    }
                    _ => format!("Herramienta `{}` no reconocida.", fn_name),
                };

                // Segunda llamada al LLM para formular respuesta natural
                mensajes.push(choice.clone());
                mensajes.push(json!({
                    "role": "tool",
                    "tool_call_id": tool_call["id"],
                    "content": res_tool
                }));
            }

            let (synth_res, _) = llamar_llm_cascada(&state.http_client, state, &mensajes, false).await;
            respuesta_final = synth_res["choices"][0]["message"]["content"]
                .as_str()
                .unwrap_or("Acción ejecutada correctamente.")
                .to_string();
        }
    } else {
        respuesta_final = choice["content"]
            .as_str()
            .unwrap_or("No se pudo obtener respuesta.")
            .to_string();
    }

    // 5. Persistencia en `ia_agentes_sesiones`
    let tools_csv = herramientas_usadas.join(",");
    let _ = sqlx::query(
        r#"
        INSERT INTO ia_agentes_sesiones 
        (session_id, user_id, canal, rol, mensaje, herramientas_usadas, imagen_url, creado_en)
        VALUES (?, ?, ?, 'user', ?, '', NULL, NOW()),
               (?, ?, ?, 'assistant', ?, ?, ?, NOW())
        "#
    )
    .bind(session_id)
    .bind(user_id)
    .bind(canal)
    .bind(mensaje_usuario)
    .bind(session_id)
    .bind(user_id)
    .bind(canal)
    .bind(&respuesta_final)
    .bind(&tools_csv)
    .bind(imagen_url_final.as_deref())
    .execute(&state.db)
    .await;

    ChatResponse {
        session_id: session_id.to_string(),
        reply: respuesta_final,
        model_used,
        agent_nombre: agente.nombre_agente,
        herramientas_usadas,
        imagen_url: imagen_url_final,
        requiere_aprobacion,
        approval_id: approval_id_final,
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTROLADORES Y RUTAS AXUM
// ─────────────────────────────────────────────────────────────────────────────

pub async fn handle_chat(
    State(state): State<AppState>,
    Json(payload): Json<ChatRequest>,
) -> impl IntoResponse {
    let session_id = payload.session_id.unwrap_or_else(|| uuid::Uuid::new_v4().to_string());
    let canal = payload.canal.unwrap_or_else(|| "web".to_string());

    let res = orquestar_agente(
        &state,
        &session_id,
        &payload.message,
        payload.user_id,
        &canal,
        payload.telegram_chat_id,
        payload.agent_id,
    )
    .await;

    ApiResponse::success(res).into_response()
}

pub async fn handle_list_agents(
    State(state): State<AppState>,
) -> impl IntoResponse {
    let agents = sqlx::query_as::<_, SubAgentDb>(
        "SELECT * FROM zeroclaw_agents WHERE activo = 1 ORDER BY id ASC"
    )
    .fetch_all(&state.db)
    .await
    .unwrap_or_default();

    ApiResponse::success(agents).into_response()
}

pub async fn handle_get_agent(
    State(state): State<AppState>,
    Path(agent_id): Path<i32>,
) -> impl IntoResponse {
    match sqlx::query_as::<_, SubAgentDb>(
        "SELECT * FROM zeroclaw_agents WHERE id = ?"
    )
    .bind(agent_id)
    .fetch_one(&state.db)
    .await {
        Ok(agent) => ApiResponse::success(agent).into_response(),
        Err(_) => ApiResponse::<()>::error(axum::http::StatusCode::NOT_FOUND, "Agente no encontrado").into_response(),
    }
}

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/chat", post(handle_chat))
        .route("/agents", get(handle_list_agents))
        .route("/agents/:id", get(handle_get_agent))
}
