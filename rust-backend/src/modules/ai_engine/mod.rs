// ==============================================================================
// MOTOR DE IA BOB ASSISTANT & RAG KNOWLEDGE — CESA UNISON (RUST BACKEND)
// ==============================================================================

use crate::{state::AppState, utils::response::ApiResponse};
use axum::{
    extract::State,
    response::IntoResponse,
    routing::post,
    Json, Router,
};
use serde::{Deserialize, Serialize};
use serde_json::json;
use sqlx::FromRow;

#[derive(Debug, Deserialize)]
pub struct ChatRequest {
    pub session_id: Option<String>,
    pub message: String,
    pub user_id: Option<u64>,
}

#[derive(Debug, Serialize)]
pub struct ChatResponse {
    pub session_id: String,
    pub reply: String,
    pub model_used: String,
}

#[derive(Debug, FromRow)]
pub struct RagBlock {
    pub titulo: String,
    pub contenido: String,
}

/// Handler principal para interactuar con Bob Assistant
pub async fn handle_chat(
    State(state): State<AppState>,
    Json(payload): Json<ChatRequest>,
) -> impl IntoResponse {
    let session_id = payload
        .session_id
        .unwrap_or_else(|| uuid::Uuid::new_v4().to_string());

    // 1. Búsqueda RAG en MariaDB
    let rag_docs = sqlx::query_as::<_, RagBlock>(
        r#"
        SELECT titulo, contenido 
        FROM ia_conocimiento_rag 
        WHERE activo = TRUE 
        ORDER BY id DESC 
        LIMIT 5
        "#,
    )
    .fetch_all(&state.db)
    .await
    .unwrap_or_default();

    let mut context_str = String::from("Contexto Institucional de la Universidad de Sonora (UNISON):\n");
    for doc in rag_docs {
        context_str.push_str(&format!("\n--- {}\n{}\n", doc.titulo, doc.contenido));
    }

    let system_prompt = format!(
        "Eres Bob, el asistente de inteligencia artificial oficial del CESA UNISON. Respond al alumno en español neutro, amable, conciso y preciso.\n{}",
        context_str
    );

    // 2. Pool Multi-API Failover para Ollama Cloud
    let api_keys = &state.config.ollama_api_keys;
    let mut final_reply = String::from("Lo siento, el servicio de IA está temporalmente en mantenimiento.");
    let mut model_used = String::from("ollama-cloud-failover");

    if !api_keys.is_empty() {
        for key in api_keys {
            let req_body = json!({
                "model": "nemotron-3-super",
                "messages": [
                    { "role": "system", "content": system_prompt },
                    { "role": "user", "content": payload.message }
                ],
                "temperature": 0.6
            });

            let res = state
                .http_client
                .post("https://api.ollama.cloud/v1/chat/completions")
                .header("Authorization", format!("Bearer {}", key))
                .json(&req_body)
                .send()
                .await;

            if let Ok(response) = res {
                if response.status().is_success() {
                    if let Ok(json_res) = response.json::<serde_json::Value>().await {
                        if let Some(reply_text) = json_res["choices"][0]["message"]["content"].as_str() {
                            final_reply = reply_text.to_string();
                            model_used = String::from("nemotron-3-super");
                            break;
                        }
                    }
                }
            }
        }
    } else {
        final_reply = format!(
            "Hola! Soy Bob Assistant (Modo Offline). Recibí tu mensaje: '{}'. ¿En qué te puedo ayudar hoy con CESA UNISON?",
            payload.message
        );
    }

    // 3. Registrar mensaje en la base de datos (Persistencia en ia_chat_mensajes)
    let _ = sqlx::query(
        r#"
        INSERT INTO ia_chat_mensajes (session_id, user_id, rol, mensaje, creado_en)
        VALUES (?, ?, 'user', ?, NOW()), (?, ?, 'assistant', ?, NOW())
        "#,
    )
    .bind(&session_id)
    .bind(payload.user_id)
    .bind(&payload.message)
    .bind(&session_id)
    .bind(payload.user_id)
    .bind(&final_reply)
    .execute(&state.db)
    .await;

    ApiResponse::success(ChatResponse {
        session_id,
        reply: final_reply,
        model_used,
    })
    .into_response()
}

pub fn router() -> Router<AppState> {
    Router::new().route("/chat", post(handle_chat))
}
