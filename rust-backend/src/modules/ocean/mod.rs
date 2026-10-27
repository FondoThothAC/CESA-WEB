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
    pub is_demo: bool,
    pub sesiones_analizadas: i64,
}

#[derive(Debug, sqlx::FromRow)]
struct OceanRow {
    avg_openness: Option<f64>,
    avg_conscientiousness: Option<f64>,
    avg_extraversion: Option<f64>,
    avg_agreeableness: Option<f64>,
    avg_neuroticism: Option<f64>,
    total: i64,
}

/// Handler para obtener el perfil OCEAN del estudiante — intenta datos reales, si no hay cae a demo
pub async fn get_ocean_perfil(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
) -> impl IntoResponse {
    let user_id = auth_user.claims.id.unwrap_or(0);

    // Intentar promediar sesiones reales del usuario
    let row = sqlx::query_as::<_, OceanRow>(
        r#"
        SELECT
            AVG(ocean_openness) as avg_openness,
            AVG(ocean_conscientiousness) as avg_conscientiousness,
            AVG(ocean_extraversion) as avg_extraversion,
            AVG(ocean_agreeableness) as avg_agreeableness,
            AVG(ocean_neuroticism) as avg_neuroticism,
            COUNT(*) as total
        FROM ia_chat_sesiones
        WHERE usuario_id = ? AND ocean_openness IS NOT NULL
        "#,
    )
    .bind(user_id)
    .fetch_optional(&state.db)
    .await;

    let (metrics, is_demo, total) = match row {
        Ok(Some(r)) if r.total > 0 && r.avg_openness.is_some() => {
            let m = OceanMetrics {
                openness: r.avg_openness.unwrap_or(50.0),
                conscientiousness: r.avg_conscientiousness.unwrap_or(50.0),
                extraversion: r.avg_extraversion.unwrap_or(50.0),
                agreeableness: r.avg_agreeableness.unwrap_or(50.0),
                neuroticism: r.avg_neuroticism.unwrap_or(30.0),
                estado_general: if r.avg_neuroticism.unwrap_or(30.0) > 60.0 {
                    "ATENCIÓN — ESTRÉS ELEVADO DETECTADO".to_string()
                } else if r.avg_conscientiousness.unwrap_or(50.0) > 70.0 {
                    "ÓPTIMO - ALTO COMPROMISO ACADÉMICO".to_string()
                } else {
                    "ESTABLE — SEGUIMIENTO REGULAR".to_string()
                },
                is_demo: false,
                sesiones_analizadas: r.total,
            };
            return ApiResponse::success(m).into_response();
        }
        _ => {
            // Sin datos reales → demo claramente etiquetado
            (
                OceanMetrics {
                    openness: 82.5,
                    conscientiousness: 78.0,
                    extraversion: 65.4,
                    agreeableness: 89.0,
                    neuroticism: 22.1,
                    estado_general: "DEMO — SIN SUFICIENTES INTERACCIONES (usa Bob para generar tu perfil real)".to_string(),
                    is_demo: true,
                    sesiones_analizadas: 0,
                },
                true,
                0,
            )
        }
    };

    ApiResponse::success(metrics).into_response()
}

pub fn router() -> Router<AppState> {
    Router::new().route("/ocean/perfil", get(get_ocean_perfil))
}
