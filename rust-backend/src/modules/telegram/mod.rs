// ==============================================================================
// BOT DE TELEGRAM OFICIAL (@CesaUnisonBot) — CESA UNISON (RUST BACKEND)
// ==============================================================================
// Este módulo gestiona la interacción bidireccional con Telegram:
//   1. Filtro inteligente en Grupos: Solo responde cuando es citado (@) o interpelado
//   2. Modo Privado 1-a-1: Asistencia inmediata con Bob y los 9 agentes del Swarm
//   3. Previews con Botones Interactivos (Inline Keyboards): [ ✅ Aprobar ] [ ❌ Rechazar ]
//   4. Procesamiento de Callbacks para Human-in-the-Loop
// ==============================================================================

use crate::{
    modules::ai_engine::orquestar_agente,
    state::AppState,
    utils::response::ApiResponse,
};
use axum::{
    extract::State,
    response::IntoResponse,
    routing::post,
    Json, Router,
};
use serde_json::{json, Value};

// ─────────────────────────────────────────────────────────────────────────────
// ESTRUCTURAS AUXILIARES DEL PAYLOAD DE TELEGRAM
// ─────────────────────────────────────────────────────────────────────────────

struct TelegramMessage {
    pub message_id: i64,
    pub chat_id: i64,
    pub chat_type: String, // "private", "group", "supergroup"
    pub user_id: i64,
    pub username: String,
    pub texto: String,
    pub es_mencion_o_comando: bool,
}

/// Parsea un mensaje estándar de Telegram
fn extraer_mensaje(payload: &Value) -> Option<TelegramMessage> {
    let msg = payload.get("message")?;
    let message_id = msg["message_id"].as_i64()?;
    let chat_id = msg["chat"]["id"].as_i64()?;
    let chat_type = msg["chat"]["type"].as_str().unwrap_or("private").to_string();
    
    let from = &msg["from"];
    let user_id = from["id"].as_i64().unwrap_or(0);
    let username = from["username"]
        .as_str()
        .or_else(|| from["first_name"].as_str())
        .unwrap_or("Estudiante")
        .to_string();

    let texto = msg["text"].as_str().unwrap_or("").trim().to_string();
    let lower = texto.to_lowercase();

    // Detección de mención o comando
    let es_privado = chat_type == "private";
    let es_comando = texto.starts_with('/');
    let tiene_mencion_bot = lower.contains("@cesaunisonbot") 
        || lower.contains("@bob") 
        || lower.contains("@aria") 
        || lower.contains("@atlas") 
        || lower.contains("@minerva")
        || lower.contains("@orion")
        || lower.contains("@aurora")
        || lower.contains("@lyra")
        || lower.contains("@cleo")
        || lower.contains("@nova");

    // Verificar si es respuesta a un mensaje del bot
    let es_reply_al_bot = msg["reply_to_message"]["from"]["is_bot"].as_bool().unwrap_or(false);

    let es_mencion_o_comando = es_privado || es_comando || tiene_mencion_bot || es_reply_al_bot;

    Some(TelegramMessage {
        message_id,
        chat_id,
        chat_type,
        user_id,
        username,
        texto,
        es_mencion_o_comando,
    })
}

// ─────────────────────────────────────────────────────────────────────────────
// CLIENTE TELEGRAM API
// ─────────────────────────────────────────────────────────────────────────────

/// Envía un mensaje con soporte opcional de Inline Keyboards (Botones)
/// Si falla por formato Markdown (caracteres no escapados del LLM), reintenta automáticamente en texto plano.
async fn enviar_telegram_con_botones(
    http: &reqwest::Client,
    bot_token: &str,
    chat_id: i64,
    texto: &str,
    reply_to_msg_id: Option<i64>,
    botones: Option<Value>,
) {
    if bot_token.is_empty() {
        return;
    }

    let url = format!("https://api.telegram.org/bot{}/sendMessage", bot_token);
    
    // Intento 1: Con parse_mode Markdown
    let mut body = json!({
        "chat_id": chat_id,
        "text": texto,
        "parse_mode": "Markdown"
    });

    if let Some(msg_id) = reply_to_msg_id {
        body["reply_to_message_id"] = json!(msg_id);
    }

    if let Some(ref keyboard) = botones {
        body["reply_markup"] = keyboard.clone();
    }

    let res = http.post(&url).json(&body).send().await;
    match res {
        Ok(r) if r.status().is_success() => {
            tracing::info!("✅ Mensaje enviado a Telegram chat_id={}", chat_id);
            return;
        }
        Ok(r) => {
            let err = r.text().await.unwrap_or_default();
            tracing::warn!("⚠️  Telegram rechazó Markdown: {} — Reintentando en texto plano...", err);
        }
        Err(e) => {
            tracing::error!("❌ Error de conexión enviando a Telegram: {}", e);
        }
    }

    // Intento 2: Fallback en texto plano (sin parse_mode para evitar errores de sintaxis)
    let mut body_plain = json!({
        "chat_id": chat_id,
        "text": texto
    });

    if let Some(msg_id) = reply_to_msg_id {
        body_plain["reply_to_message_id"] = json!(msg_id);
    }

    if let Some(ref keyboard) = botones {
        body_plain["reply_markup"] = keyboard.clone();
    }

    let _ = http.post(&url).json(&body_plain).send().await;
}

/// Envía una fotografía con pie de foto y botones opcionales
async fn enviar_foto_con_botones(
    http: &reqwest::Client,
    bot_token: &str,
    chat_id: i64,
    imagen_url: &str,
    caption: &str,
    botones: Option<Value>,
) {
    if bot_token.is_empty() {
        return;
    }

    let url = format!("https://api.telegram.org/bot{}/sendPhoto", bot_token);
    let mut body = json!({
        "chat_id": chat_id,
        "photo": imagen_url,
        "caption": caption,
        "parse_mode": "Markdown"
    });

    if let Some(ref keyboard) = botones {
        body["reply_markup"] = keyboard.clone();
    }

    let res = http.post(&url).json(&body).send().await;
    match res {
        Ok(r) if r.status().is_success() => {
            tracing::info!("✅ Foto enviada a Telegram chat_id={}", chat_id);
            return;
        }
        Ok(r) => {
            let err = r.text().await.unwrap_or_default();
            tracing::warn!("⚠️  Telegram rechazó sendPhoto: {} — Enviando como mensaje con link...", err);
        }
        Err(e) => {
            tracing::error!("❌ Error enviando foto a Telegram: {}", e);
        }
    }

    // Fallback: Si la foto falla, enviar como mensaje de texto normal
    let texto_alternativo = format!("{}\n\n🖼️ Ver imagen: {}", caption, imagen_url);
    enviar_telegram_con_botones(http, bot_token, chat_id, &texto_alternativo, None, botones).await;
}

/// Responde a un callback_query (click en botón de Telegram)
async fn responder_callback_query(
    http: &reqwest::Client,
    bot_token: &str,
    callback_query_id: &str,
    notificacion: &str,
) {
    let url = format!("https://api.telegram.org/bot{}/answerCallbackQuery", bot_token);
    let body = json!({
        "callback_query_id": callback_query_id,
        "text": notificacion,
        "show_alert": false
    });
    let _ = http.post(&url).json(&body).send().await;
}

// ─────────────────────────────────────────────────────────────────────────────
// PROCESAMIENTO DE CALLBACKS (BOTONES DE APROBACIÓN)
// ─────────────────────────────────────────────────────────────────────────────

async fn procesar_callback_query(
    state: &AppState,
    cb: &Value,
) {
    let callback_id = cb["id"].as_str().unwrap_or("");
    let data = cb["data"].as_str().unwrap_or("");
    let from_user = cb["from"]["username"]
        .as_str()
        .or_else(|| cb["from"]["first_name"].as_str())
        .unwrap_or("Miembro Directivo");

    let chat_id = cb["message"]["chat"]["id"].as_i64().unwrap_or(0);
    let message_id = cb["message"]["message_id"].as_i64().unwrap_or(0);

    tracing::info!("🔘 Callback recibido de @{}: data='{}'", from_user, data);

    if data.starts_with("app_approve:") {
        let app_id_str = &data["app_approve:".len()..];
        if let Ok(app_id) = app_id_str.parse::<i64>() {
            let _ = sqlx::query(
                "UPDATE zeroclaw_pending_approvals SET estado = 'aprobado', feedback_humano = ? WHERE id = ?"
            )
            .bind(format!("Aprobado por @{}", from_user))
            .bind(app_id)
            .execute(&state.db)
            .await;

            responder_callback_query(&state.http_client, &state.config.telegram_bot_token, callback_id, "✅ Solicitud Aprobada").await;

            // Editar el mensaje en Telegram para mostrar estado final
            let edit_url = format!("https://api.telegram.org/bot{}/editMessageCaption", state.config.telegram_bot_token);
            let edit_body = json!({
                "chat_id": chat_id,
                "message_id": message_id,
                "caption": format!("✅ *APROBADO Y PUBLICADO*\n\n_Acción autorizada por @{}_", from_user),
                "parse_mode": "Markdown"
            });
            let _ = state.http_client.post(&edit_url).json(&edit_body).send().await;
        }
    } else if data.starts_with("app_reject:") {
        let app_id_str = &data["app_reject:".len()..];
        if let Ok(app_id) = app_id_str.parse::<i64>() {
            let _ = sqlx::query(
                "UPDATE zeroclaw_pending_approvals SET estado = 'rechazado', feedback_humano = ? WHERE id = ?"
            )
            .bind(format!("Rechazado por @{}", from_user))
            .bind(app_id)
            .execute(&state.db)
            .await;

            responder_callback_query(&state.http_client, &state.config.telegram_bot_token, callback_id, "❌ Solicitud Rechazada").await;

            let edit_url = format!("https://api.telegram.org/bot{}/editMessageCaption", state.config.telegram_bot_token);
            let edit_body = json!({
                "chat_id": chat_id,
                "message_id": message_id,
                "caption": format!("❌ *RECHAZADO*\n\n_Cancelado por @{}_", from_user),
                "parse_mode": "Markdown"
            });
            let _ = state.http_client.post(&edit_url).json(&edit_body).send().await;
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// HANDLER PRINCIPAL DEL WEBHOOK
// ─────────────────────────────────────────────────────────────────────────────

pub async fn handle_telegram_webhook(
    State(state): State<AppState>,
    Json(payload): Json<Value>,
) -> impl IntoResponse {
    let bot_token = &state.config.telegram_bot_token;

    // 1. Manejar Clics en Botones (callback_query)
    if let Some(cb) = payload.get("callback_query") {
        procesar_callback_query(&state, cb).await;
        return ApiResponse::success("OK").into_response();
    }

    // 2. Extraer y validar mensaje
    let msg = match extraer_mensaje(&payload) {
        Some(m) => m,
        None => return ApiResponse::success("OK").into_response(),
    };

    // 3. Regla en Grupos: Si no es privado y no tiene mención ni comando, SILENCIO ABSOLUTO
    if !msg.es_mencion_o_comando {
        tracing::debug!("🔇 Mensaje en grupo sin mención a agentes. Omitiendo respuesta.");
        return ApiResponse::success("OK").into_response();
    }

    // Mostrar estado "escribiendo..." en Telegram
    let typing_url = format!("https://api.telegram.org/bot{}/sendChatAction", bot_token);
    let _ = state.http_client
        .post(&typing_url)
        .json(&json!({ "chat_id": msg.chat_id, "action": "typing" }))
        .send()
        .await;

    // Limpiar menciones de texto para que el LLM reciba la instrucción limpia
    let prompt_limpio = msg.texto
        .replace("@CesaUnisonBot", "")
        .replace("@cesaunisonbot", "")
        .replace("@Bob", "")
        .replace("@bob", "")
        .replace("@Aria", "")
        .replace("@aria", "")
        .replace("@Atlas", "")
        .replace("@atlas", "")
        .replace("@Minerva", "")
        .replace("@minerva", "")
        .trim()
        .to_string();

    let session_id = format!("tg-{}", msg.chat_id);

    // 4. Invocación al Swarm de Agentes
    let respuesta = orquestar_agente(
        &state,
        &session_id,
        if prompt_limpio.is_empty() { "Hola" } else { &prompt_limpio },
        Some(msg.user_id),
        "telegram",
        Some(msg.chat_id),
        None,
    )
    .await;

    // 5. Construir Botones de Aprobación si la acción lo amerita
    let botones_aprobacion = if respuesta.requiere_aprobacion {
        let app_id = respuesta.approval_id.unwrap_or(0);
        Some(json!({
            "inline_keyboard": [
                [
                    { "text": "✅ Aprobar", "callback_data": format!("app_approve:{}", app_id) },
                    { "text": "❌ Rechazar", "callback_data": format!("app_reject:{}", app_id) }
                ]
            ]
        }))
    } else {
        None
    };

    // 6. Enviar Respuesta
    if let Some(img_url) = &respuesta.imagen_url {
        enviar_foto_con_botones(
            &state.http_client,
            bot_token,
            msg.chat_id,
            img_url,
            &format!("🤖 *[{}]*\n\n{}", respuesta.agent_nombre, respuesta.reply),
            botones_aprobacion,
        )
        .await;
    } else {
        enviar_telegram_con_botones(
            &state.http_client,
            bot_token,
            msg.chat_id,
            &format!("🤖 *[{}]*\n\n{}", respuesta.agent_nombre, respuesta.reply),
            Some(msg.message_id),
            botones_aprobacion,
        )
        .await;
    }

    ApiResponse::success("OK").into_response()
}

pub fn router() -> Router<AppState> {
    Router::new().route("/telegram/webhook", post(handle_telegram_webhook))
}
