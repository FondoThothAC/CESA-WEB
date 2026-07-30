// ==============================================================================
// MÓDULO DE PUBLICIDAD Y BANNERS INSTITUCIONALES — CESA UNISON (RUST BACKEND)
// ==============================================================================

use crate::{state::AppState, utils::response::ApiResponse};
use axum::{
    extract::State,
    http::StatusCode,
    response::IntoResponse,
    routing::get,
    Router,
};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct BannerPublicitario {
    pub id: u64,
    pub titulo: String,
    pub imagen_url: String,
    pub enlace_destino: Option<String>,
    pub posicion: Option<String>,
    pub activo: Option<bool>,
}

/// Handler público para listar banners publicitarios activos
pub async fn get_publicidad(State(state): State<AppState>) -> impl IntoResponse {
    let result = sqlx::query_as::<_, BannerPublicitario>(
        "SELECT id, titulo, imagen_url, enlace_destino, posicion, activo FROM banners_publicitarios WHERE activo = 1 ORDER BY id DESC",
    )
    .fetch_all(&state.db)
    .await;

    match result {
        Ok(banners) => ApiResponse::success(banners).into_response(),
        Err(err) => {
            tracing::error!("Error al consultar publicidad: {:?}", err);
            ApiResponse::<()>::error(StatusCode::INTERNAL_SERVER_ERROR, "Error al cargar la publicidad").into_response()
        }
    }
}

pub fn router() -> Router<AppState> {
    Router::new().route("/publicidad", get(get_publicidad))
}
