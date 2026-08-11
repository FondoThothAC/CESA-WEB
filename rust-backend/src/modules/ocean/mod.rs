// ==============================================================================
// MÓDULO PSICOMÉTRICO OCEAN & SENTIMENT ANALYSIS — CESA UNISON (RUST BACKEND)
// ==============================================================================

use crate::{
    middleware::auth::AuthUser,
    state::AppState,
    utils::response::ApiResponse,
};
use axum::{
    extract::{Extension, State},
    response::IntoResponse,
    routing::get,
    Router,
};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct OceanMetrics {
    pub openness: f64,
    pub conscientiousness: f64,
    pub extraversion: f64,
    pub agreeableness: f64,
    pub neuroticism: f64,
    pub estado_general: String,
}

/// Handler para obtener el perfil OCEAN del estudiante
pub async fn get_ocean_perfil(
    State(_state): State<AppState>,
    Extension(_auth_user): Extension<AuthUser>,
) -> impl IntoResponse {
    let metrics = OceanMetrics {
        openness: 82.5,
        conscientiousness: 78.0,
        extraversion: 65.4,
        agreeableness: 89.0,
        neuroticism: 22.1,
        estado_general: "ÓPTIMO - ALTO COMPROMISO ACADÉMICO".to_string(),
    };

    ApiResponse::success(metrics).into_response()
}

pub fn router() -> Router<AppState> {
    Router::new().route("/ocean/perfil", get(get_ocean_perfil))
}
