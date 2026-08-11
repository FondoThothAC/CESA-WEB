// ==============================================================================
// MÓDULO DE BUZÓN DE REPORTES E INCIDENCIAS — CESA UNISON (RUST BACKEND)
// ==============================================================================

use crate::{state::AppState, utils::response::ApiResponse};
use axum::{
    extract::{Query, State},
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use jsonwebtoken::{decode, DecodingKey, Validation};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct ReporteDto {
    pub id: u64,
    pub usuario_id: Option<u64>,
    pub usuario_nombre: Option<String>,
    pub tipo: String,
    pub categoria: Option<String>,
    pub asunto: String,
    pub descripcion: String,
    pub estado: String,
    pub anonimo: Option<bool>,
    pub created_at: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct CrearReporteRequest {
    pub tipo: Option<String>,
    pub categoria: Option<String>,
    pub asunto: String,
    pub descripcion: String,
    pub anonimo: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct ReportesQueryParams {
    pub modo: Option<String>,
}

/// Handler para listar reportes (mis reportes o panel de moderación directivo)
pub async fn get_reportes(
    State(state): State<AppState>,
    axum::http::request::Parts { headers, .. }: axum::http::request::Parts,
    Query(params): Query<ReportesQueryParams>,
) -> impl IntoResponse {
    let token_str = match headers
        .get(axum::http::header::AUTHORIZATION)
        .and_then(|v| v.to_str().ok())
        .and_then(|s| s.strip_prefix("Bearer "))
    {
        Some(t) => t.to_string(),
        None => return ApiResponse::<()>::error(StatusCode::UNAUTHORIZED, "Token requerido.").into_response(),
    };

    let key = DecodingKey::from_secret(state.config.jwt_secret.as_bytes());
    let mut validation = Validation::default();
    validation.validate_exp = true;

    let claims = match decode::<crate::modules::auth::Claims>(&token_str, &key, &validation) {
        Ok(d) => d.claims,
        Err(_) => return ApiResponse::<()>::error(StatusCode::UNAUTHORIZED, "Token inválido.").into_response(),
    };

    let user_id = claims.id;
    let user_role = claims.rol;
    let modo = params.modo.unwrap_or_else(|| "mis_reportes".to_string());

    let result = if modo == "comunidad" || modo == "moderacion" || user_role == "admin" || user_role == "mesa_directiva" {
        sqlx::query_as::<_, ReporteDto>(
            r#"
            SELECT r.id, r.usuario_id, u.nombre_completo as usuario_nombre, 
                   r.tipo, r.categoria, r.asunto, r.descripcion, r.estado, r.anonimo,
                   DATE_FORMAT(r.created_at, '%Y-%m-%d %H:%i:%s') as created_at
            FROM reportes r
            LEFT JOIN usuarios u ON r.usuario_id = u.id
            ORDER BY r.created_at DESC
            LIMIT 50
            "#,
        )
        .fetch_all(&state.db)
        .await
    } else {
        sqlx::query_as::<_, ReporteDto>(
            r#"
            SELECT r.id, r.usuario_id, u.nombre_completo as usuario_nombre, 
                   r.tipo, r.categoria, r.asunto, r.descripcion, r.estado, r.anonimo,
                   DATE_FORMAT(r.created_at, '%Y-%m-%d %H:%i:%s') as created_at
            FROM reportes r
            LEFT JOIN usuarios u ON r.usuario_id = u.id
            WHERE r.usuario_id = ?
            ORDER BY r.created_at DESC
            LIMIT 50
            "#,
        )
        .bind(user_id)
        .fetch_all(&state.db)
        .await
    };

    match result {
        Ok(reportes) => ApiResponse::success(reportes).into_response(),
        Err(err) => {
            tracing::error!("Error al consultar reportes: {:?}", err);
            ApiResponse::<()>::error(
                StatusCode::INTERNAL_SERVER_ERROR,
                "Error al cargar la lista de reportes",
            )
            .into_response()
        }
    }
}

/// Handler para enviar un reporte, queja o sugerencia
pub async fn crear_reporte(
    State(state): State<AppState>,
    axum::http::request::Parts { headers, .. }: axum::http::request::Parts,
    Json(payload): Json<CrearReporteRequest>,
) -> impl IntoResponse {
    let token_str = match headers
        .get(axum::http::header::AUTHORIZATION)
        .and_then(|v| v.to_str().ok())
        .and_then(|s| s.strip_prefix("Bearer "))
    {
        Some(t) => t.to_string(),
        None => return ApiResponse::<()>::error(StatusCode::UNAUTHORIZED, "Token requerido.").into_response(),
    };

    let key = DecodingKey::from_secret(state.config.jwt_secret.as_bytes());
    let mut validation = Validation::default();
    validation.validate_exp = true;

    let claims = match decode::<crate::modules::auth::Claims>(&token_str, &key, &validation) {
        Ok(d) => d.claims,
        Err(_) => return ApiResponse::<()>::error(StatusCode::UNAUTHORIZED, "Token inválido.").into_response(),
    };

    let user_id = claims.id;
    let is_anonimo = payload.anonimo.unwrap_or(false);
    let tipo = payload.tipo.unwrap_or_else(|| "queja".to_string());
    let categoria = payload.categoria.unwrap_or_else(|| "otro".to_string());

    let res = sqlx::query(
        r#"
        INSERT INTO reportes (tipo, categoria, asunto, descripcion, usuario_id, anonimo, estado, created_at)
        VALUES (?, ?, ?, ?, ?, ?, 'nuevo', NOW())
        "#,
    )
    .bind(&tipo)
    .bind(&categoria)
    .bind(&payload.asunto)
    .bind(&payload.descripcion)
    .bind(user_id)
    .bind(is_anonimo)
    .execute(&state.db)
    .await;

    match res {
        Ok(r) => ApiResponse::success(serde_json::json!({
            "id": r.last_insert_id(),
            "asunto": payload.asunto,
            "mensaje": "Reporte registrado y enviado a la bandeja de moderación."
        })).into_response(),
        Err(err) => {
            tracing::error!("Error al crear reporte: {:?}", err);
            ApiResponse::<()>::error(
                StatusCode::INTERNAL_SERVER_ERROR,
                "Error al registrar el reporte en la base de datos",
            )
            .into_response()
        }
    }
}

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/reportes", get(get_reportes))
        .route("/reportes", post(crear_reporte))
        .route("/reportes/crear", post(crear_reporte))
        .route("/reportes/listar", get(get_reportes))
}
