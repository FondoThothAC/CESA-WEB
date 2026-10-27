// ==============================================================================
// MÓDULO DE EXPEDIENTES, CRÉDITOS Y TUTORÍAS — CESA UNISON (RUST BACKEND)
// ==============================================================================

use crate::{
    state::AppState,
    utils::response::ApiResponse,
};
use axum::{
    extract::State,
    http::StatusCode,
    response::IntoResponse,
    routing::get,
    Router,
};
use jsonwebtoken::{decode, DecodingKey, Validation};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Deserialize)]
pub struct Claims {
    pub sub: Option<String>,
    pub id: Option<u64>,
    pub expediente: Option<String>,
    pub email: Option<String>,
    pub rol: Option<String>,
    pub exp: usize,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct ExpedienteDb {
    pub id: u64,
    pub nombre_completo: String,
    pub expediente: Option<String>,
    pub matricula: Option<String>,
    pub carrera: Option<String>,
    pub avatar_path: Option<String>,
    pub creditos_acumulados: Option<i32>,
    pub creditos_totales_carrera: Option<i32>,
    pub semestre_calculado: Option<i32>,
}

#[derive(Debug, Serialize)]
pub struct ProgresoAcademico {
    pub semestre_real: i32,
    pub creditos_acumulados: i32,
    pub porcentaje_semestre_actual: i32,
    pub creditos_faltantes_siguiente_sem: i32,
    pub es_irregular: bool,
}

#[derive(Debug, Serialize)]
pub struct ExpedienteResponse {
    pub id: u64,
    pub nombre_completo: String,
    pub expediente: String,
    pub carrera: String,
    pub avatar_path: Option<String>,
    pub progreso_academico: ProgresoAcademico,
    pub skills: Vec<serde_json::Value>,
}

/// Handler para consultar el expediente y kardex del alumno autenticado
pub async fn get_expediente(
    State(state): State<AppState>,
    axum::http::request::Parts { headers, .. }: axum::http::request::Parts,
) -> impl IntoResponse {
    let token_str = match headers
        .get(axum::http::header::AUTHORIZATION)
        .and_then(|v| v.to_str().ok())
        .and_then(|s| s.strip_prefix("Bearer "))
    {
        Some(t) => t.to_string(),
        None => {
            return ApiResponse::<()>::error(StatusCode::UNAUTHORIZED, "Token requerido.").into_response();
        }
    };

    let key = DecodingKey::from_secret(state.config.jwt_secret.as_bytes());
    let mut validation = Validation::default();
    validation.validate_exp = true;

    let claims = match decode::<Claims>(&token_str, &key, &validation) {
        Ok(data) => data.claims,
        Err(_) => {
            return ApiResponse::<()>::error(StatusCode::UNAUTHORIZED, "Token inválido.").into_response();
        }
    };

    let user_id = claims.id.unwrap_or(0);

    let res = sqlx::query_as::<_, ExpedienteDb>(
        r#"
        SELECT id, nombre_completo, expediente, matricula, carrera, avatar_path,
               creditos_acumulados, creditos_totales_carrera, semestre_calculado
        FROM usuarios
        WHERE id = ? AND activo = 1
        "#,
    )
    .bind(user_id)
    .fetch_optional(&state.db)
    .await;

    match res {
        Ok(Some(u)) => {
            let exp_code = u.expediente.clone().or(u.matricula.clone()).unwrap_or_else(|| "213203453".to_string());
            let carrera_name = u.carrera.clone().unwrap_or_else(|| "Ingeniería en Sistemas de Información".to_string());
            let creditos = u.creditos_acumulados.unwrap_or(0);
            let total = u.creditos_totales_carrera.unwrap_or(400);
            let semestre = u.semestre_calculado.unwrap_or_else(|| {
                if total > 0 { ((creditos as f64 / total as f64) * 8.0).floor() as i32 + 1 } else { 1 }
            }).clamp(1, 8);
            let faltantes = (total - creditos).max(0);
            // Porcentaje dentro del semestre actual (aprox. 50 créditos por semestre si total 400)
            let creditos_por_sem = if total > 0 { total as f64 / 8.0 } else { 50.0 };
            let creditos_en_sem = creditos as f64 - ((semestre - 1) as f64 * creditos_por_sem);
            let porcentaje = ((creditos_en_sem / creditos_por_sem) * 100.0).clamp(0.0, 100.0) as i32;

            let response_data = ExpedienteResponse {
                id: u.id,
                nombre_completo: u.nombre_completo,
                expediente: exp_code,
                carrera: carrera_name,
                avatar_path: u.avatar_path,
                progreso_academico: ProgresoAcademico {
                    semestre_real: semestre,
                    creditos_acumulados: creditos,
                    porcentaje_semestre_actual: porcentaje,
                    creditos_faltantes_siguiente_sem: faltantes.min(50),
                    es_irregular: false,
                },
                skills: vec![],
            };
            ApiResponse::success(response_data).into_response()
        }
        Ok(None) => ApiResponse::<()>::error(StatusCode::NOT_FOUND, "Expediente no encontrado.").into_response(),
        Err(err) => {
            tracing::error!("Error al consultar expediente: {:?}", err);
            ApiResponse::<()>::error(StatusCode::INTERNAL_SERVER_ERROR, "Error al cargar expediente.").into_response()
        }
    }
}

pub fn router() -> Router<AppState> {
    Router::new().route("/expediente", get(get_expediente))
}
