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

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct AdsenseConfig {
    pub id: Option<i32>,
    pub activo: Option<i8>, // MySQL TINYINT
    pub publisher_id: Option<String>,
    pub banner_slot_id: Option<String>,
    pub interstitial_slot_id: Option<String>,
    pub frecuencia_diaria: Option<i32>,
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

/// Handler público para obtener la configuración de Google AdSense
pub async fn get_adsense_config(State(state): State<AppState>) -> impl IntoResponse {
    let result = sqlx::query_as::<_, AdsenseConfig>(
        "SELECT id, activo, publisher_id, banner_slot_id, interstitial_slot_id, frecuencia_diaria FROM publicidad_config WHERE id = 1",
    )
    .fetch_optional(&state.db)
    .await;

    match result {
        Ok(Some(config)) => ApiResponse::success(config).into_response(),
        Ok(None) => {
            // Retornar configuración por defecto inactiva si no existe
            let default_config = AdsenseConfig {
                id: Some(1),
                activo: Some(0),
                publisher_id: None,
                banner_slot_id: None,
                interstitial_slot_id: None,
                frecuencia_diaria: Some(2),
            };
            ApiResponse::success(default_config).into_response()
        }
        Err(err) => {
            tracing::error!("Error al consultar config AdSense: {:?}", err);
            ApiResponse::<()>::error(StatusCode::INTERNAL_SERVER_ERROR, "Error al cargar config AdSense").into_response()
        }
    }
}

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/publicidad", get(get_publicidad))
        .route("/publicidad/adsense", get(get_adsense_config))
}
