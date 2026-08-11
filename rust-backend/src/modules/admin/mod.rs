// ==============================================================================
// MÓDULO DE ADMINISTRACIÓN & MODO DIOS — CESA UNISON (RUST BACKEND)
// ==============================================================================

use crate::{
    middleware::auth::AuthUser,
    state::AppState,
    utils::response::ApiResponse,
};
use axum::{
    extract::{Extension, Query, State},
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct AdminUserRecord {
    pub id: u64,
    pub nombre_completo: String,
    pub email: String,
    pub expediente: Option<String>,
    pub matricula: Option<String>,
    pub rol: String,
    pub carrera: Option<String>,
    pub activo: Option<bool>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TelemetriaStats {
    pub total_usuarios: i64,
    pub total_noticias: i64,
    pub total_emprendimientos: i64,
    pub total_votos: i64,
    pub total_mensajes_ia: i64,
    pub godmode_status: String,
}

#[derive(Debug, Deserialize)]
pub struct AdminUsersQueryParams {
    pub rol: Option<String>,
    pub q: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct CambiarRolRequest {
    pub usuario_id: u64,
    pub nuevo_rol: String,
}

use jsonwebtoken::{decode, DecodingKey, Validation};

/// Handler para listar usuarios en el panel de administración
pub async fn list_admin_users(
    State(state): State<AppState>,
    axum::http::request::Parts { headers, .. }: axum::http::request::Parts,
    Query(params): Query<AdminUsersQueryParams>,
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

    let user_role = claims.rol;

    if user_role != "admin" && user_role != "mesa_directiva" {
        return ApiResponse::<()>::error(
            StatusCode::FORBIDDEN,
            "Acceso denegado. Se requieren permisos de administrador.",
        )
        .into_response();
    }

    let search_pattern = format!("%{}%", params.q.unwrap_or_default());

    let result = if let Some(ref r) = params.rol {
        sqlx::query_as::<_, AdminUserRecord>(
            r#"
            SELECT id, nombre_completo, email, expediente, matricula, rol, carrera, activo
            FROM usuarios
            WHERE rol = ? AND (nombre_completo LIKE ? OR email LIKE ? OR expediente LIKE ?)
            ORDER BY nombre_completo ASC
            "#,
        )
        .bind(r)
        .bind(&search_pattern)
        .bind(&search_pattern)
        .bind(&search_pattern)
        .fetch_all(&state.db)
        .await
    } else {
        sqlx::query_as::<_, AdminUserRecord>(
            r#"
            SELECT id, nombre_completo, email, expediente, matricula, rol, carrera, activo
            FROM usuarios
            WHERE nombre_completo LIKE ? OR email LIKE ? OR expediente LIKE ?
            ORDER BY nombre_completo ASC
            "#,
        )
        .bind(&search_pattern)
        .bind(&search_pattern)
        .bind(&search_pattern)
        .fetch_all(&state.db)
        .await
    };

    match result {
        Ok(users) => ApiResponse::success(users).into_response(),
        Err(err) => {
            tracing::error!("Error al listar usuarios admin: {:?}", err);
            ApiResponse::<()>::error(
                StatusCode::INTERNAL_SERVER_ERROR,
                "Error al consultar el directorio de usuarios",
            )
            .into_response()
        }
    }
}

/// Handler para obtener la telemetría general y estadísticas en Modo Dios
pub async fn get_telemetria_stats(
    State(state): State<AppState>,
    axum::http::request::Parts { headers, .. }: axum::http::request::Parts,
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

    let user_role = claims.rol;

    if user_role != "admin" && user_role != "mesa_directiva" {
        return ApiResponse::<()>::error(
            StatusCode::FORBIDDEN,
            "Acceso denegado. Modo Dios exclusivo para Administradores.",
        )
        .into_response();
    }

    let total_usuarios: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM usuarios")
        .fetch_one(&state.db)
        .await
        .unwrap_or(0);

    let total_noticias: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM noticias")
        .fetch_one(&state.db)
        .await
        .unwrap_or(0);

    let total_emprendimientos: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM emprendimientos")
        .fetch_one(&state.db)
        .await
        .unwrap_or(0);

    let total_votos: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM votos_anonimos")
        .fetch_one(&state.db)
        .await
        .unwrap_or(0);

    let total_mensajes_ia: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM ia_chat_mensajes")
        .fetch_one(&state.db)
        .await
        .unwrap_or(0);

    let stats = TelemetriaStats {
        total_usuarios,
        total_noticias,
        total_emprendimientos,
        total_votos,
        total_mensajes_ia,
        godmode_status: "ACTIVO - CESA UNISON GODMODE v7.5".to_string(),
    };

    ApiResponse::success(stats).into_response()
}

/// Handler para cambiar rol de usuario en la plataforma
pub async fn cambiar_rol(
    State(state): State<AppState>,
    axum::http::request::Parts { headers, .. }: axum::http::request::Parts,
    Json(payload): Json<CambiarRolRequest>,
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

    let user_role = claims.rol;

    if user_role != "admin" {
        return ApiResponse::<()>::error(
            StatusCode::FORBIDDEN,
            "Solo los Administradores Maestros pueden modificar roles.",
        )
        .into_response();
    }

    let res = sqlx::query("UPDATE usuarios SET rol = ? WHERE id = ?")
        .bind(&payload.nuevo_rol)
        .bind(payload.usuario_id)
        .execute(&state.db)
        .await;

    match res {
        Ok(_) => ApiResponse::success("Rol de usuario actualizado correctamente.").into_response(),
        Err(err) => {
            tracing::error!("Error al actualizar rol: {:?}", err);
            ApiResponse::<()>::error(
                StatusCode::INTERNAL_SERVER_ERROR,
                "Error al modificar el rol de usuario",
            )
            .into_response()
        }
    }
}

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/admin/users", get(list_admin_users))
        .route("/admin/telemetry", get(get_telemetria_stats))
        .route("/admin/stats", get(get_telemetria_stats))
        .route("/admin/role", post(cambiar_rol))
}
