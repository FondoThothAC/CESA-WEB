// ==============================================================================
// MÓDULO DE BOLSA DE TRABAJO Y VACANTES — CESA UNISON (RUST BACKEND)
// ==============================================================================

use crate::{state::AppState, utils::response::ApiResponse};
use axum::{
    extract::{Query, State},
    http::StatusCode,
    response::IntoResponse,
    routing::get,
    Router,
};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Vacante {
    pub id: u64,
    pub titulo: String,
    pub empresa_nombre: String,
    pub descripcion: Option<String>,
    pub ubicacion: Option<String>,
    pub tipo: Option<String>,
    pub modalidad: Option<String>,
    pub sueldo_estimado: Option<String>,
    pub carreras_target: Option<String>,
    pub verificada: Option<bool>,
    pub activo: Option<bool>,
    pub fecha_publicacion: Option<chrono::NaiveDateTime>,
}

#[derive(Debug, Deserialize)]
pub struct VacantesQueryParams {
    pub modalidad: Option<String>,
    pub carrera: Option<String>,
    pub tipo: Option<String>,
}

/// Handler para listar vacantes disponibles en la bolsa de trabajo
pub async fn get_vacantes(
    State(state): State<AppState>,
    Query(params): Query<VacantesQueryParams>,
) -> impl IntoResponse {
    let mod_filter = params.modalidad.unwrap_or_else(|| "todas".to_string());
    let tipo_filter = params.tipo.unwrap_or_default();
    let carrera_filter = params.carrera.unwrap_or_default();
    let carrera_pattern = format!("%{}%", carrera_filter);

    let result = if mod_filter != "todas" && !tipo_filter.is_empty() {
        sqlx::query_as::<_, Vacante>(
            r#"
            SELECT id, titulo, empresa_nombre, descripcion, ubicacion, tipo, 
                   modalidad, sueldo_estimado, carreras_target, verificada, activo, created_at as fecha_publicacion
            FROM bolsa_vacantes
            WHERE activo = 1 AND verificada = 1 AND modalidad = ? AND tipo = ?
            ORDER BY created_at DESC
            LIMIT 50
            "#,
        )
        .bind(mod_filter)
        .bind(tipo_filter)
        .fetch_all(&state.db)
        .await
    } else if !carrera_filter.is_empty() {
        sqlx::query_as::<_, Vacante>(
            r#"
            SELECT id, titulo, empresa_nombre, descripcion, ubicacion, tipo, 
                   modalidad, sueldo_estimado, carreras_target, verificada, activo, created_at as fecha_publicacion
            FROM bolsa_vacantes
            WHERE activo = 1 AND verificada = 1 AND (carreras_target LIKE ? OR carreras_target = 'todas')
            ORDER BY created_at DESC
            LIMIT 50
            "#,
        )
        .bind(carrera_pattern)
        .fetch_all(&state.db)
        .await
    } else {
        sqlx::query_as::<_, Vacante>(
            r#"
            SELECT id, titulo, empresa_nombre, descripcion, ubicacion, tipo, 
                   modalidad, sueldo_estimado, carreras_target, verificada, activo, created_at as fecha_publicacion
            FROM bolsa_vacantes
            WHERE activo = 1 AND verificada = 1
            ORDER BY created_at DESC
            LIMIT 50
            "#,
        )
        .fetch_all(&state.db)
        .await
    };

    match result {
        Ok(vacantes) => ApiResponse::success(vacantes).into_response(),
        Err(err) => {
            tracing::error!("Error al consultar vacantes: {:?}", err);
            ApiResponse::<()>::error(
                StatusCode::INTERNAL_SERVER_ERROR,
                "Error al cargar las vacantes de trabajo",
            )
            .into_response()
        }
    }
}

pub fn router() -> Router<AppState> {
    Router::new().route("/empleos", get(get_vacantes))
}
