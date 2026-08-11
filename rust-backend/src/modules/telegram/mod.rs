// ==============================================================================
// WEBHOOK TELEGRAM BOT (@CesaUnisonBot) — CESA UNISON (RUST BACKEND)
// ==============================================================================

use crate::{state::AppState, utils::response::ApiResponse};
use axum::{
    extract::State,
    response::IntoResponse,
    routing::post,
    Json, Router,
};
use serde_json::Value;

/// Handler para procesar actualizaciones del Webhook de Telegram
pub async fn handle_telegram_webhook(
    State(_state): State<AppState>,
    Json(payload): Json<Value>,
) -> impl IntoResponse {
    tracing::info!("📩 Mensaje recibido en Webhook Telegram @CesaUnisonBot: {:?}", payload);
    ApiResponse::success("OK").into_response()
}

pub fn router() -> Router<AppState> {
    Router::new().route("/telegram/webhook", post(handle_telegram_webhook))
}
