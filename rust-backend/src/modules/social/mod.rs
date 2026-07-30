// ==============================================================================
// MÓDULO DE MURO SOCIAL TIMELINE & MENSAJERÍA DIRECTA — CESA UNISON (RUST BACKEND)
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
pub struct SocialPost {
    pub id: u64,
    pub usuario_id: u64,
    pub autor_nombre: Option<String>,
    pub autor_avatar: Option<String>,
    pub contenido: String,
    pub imagen_url: Option<String>,
    pub likes_count: Option<i32>,
    pub created_at: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct CrearPostRequest {
    pub contenido: String,
    pub imagen_url: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct MensajePrivadoDto {
    pub id: u64,
    pub emisor_id: u64,
    pub receptor_id: u64,
    pub emisor_nombre: Option<String>,
    pub receptor_nombre: Option<String>,
    pub contenido: String,
    pub leido: Option<bool>,
    pub created_at: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct EnviarMensajeRequest {
    pub receptor_id: Option<u64>,
    pub receptor_expediente: Option<String>,
    pub contenido: String,
}

#[derive(Debug, Deserialize)]
pub struct MensajesQueryParams {
    pub con_usuario_id: Option<u64>,
    pub con_expediente: Option<String>,
}

/// Handler para consultar el feed del Muro Social
pub async fn get_social_feed(State(state): State<AppState>) -> impl IntoResponse {
    let result = sqlx::query_as::<_, SocialPost>(
        r#"
        SELECT p.id, p.usuario_id, u.nombre_completo as autor_nombre, u.avatar_path as autor_avatar,
               p.contenido, p.imagen_path as imagen_url, COALESCE(p.likes_count, 0) as likes_count,
               DATE_FORMAT(p.created_at, '%Y-%m-%d %H:%i:%s') as created_at
        FROM publicaciones_muro p
        JOIN usuarios u ON p.usuario_id = u.id
        WHERE p.activo = 1
        ORDER BY p.created_at DESC
        LIMIT 50
        "#,
    )
    .fetch_all(&state.db)
    .await;

    match result {
        Ok(posts) => ApiResponse::success(posts).into_response(),
        Err(err) => {
            tracing::error!("Error al consultar muro social: {:?}", err);
            ApiResponse::<()>::error(
                StatusCode::INTERNAL_SERVER_ERROR,
                "Error al cargar la línea de tiempo social",
            )
            .into_response()
        }
    }
}

/// Handler para publicar en el Muro Social
pub async fn crear_post(
    State(state): State<AppState>,
    axum::http::request::Parts { headers, .. }: axum::http::request::Parts,
    Json(payload): Json<CrearPostRequest>,
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

    let res = sqlx::query(
        r#"
        INSERT INTO publicaciones_muro (usuario_id, contenido, imagen_path, activo, created_at)
        VALUES (?, ?, ?, 1, NOW())
        "#,
    )
    .bind(user_id)
    .bind(&payload.contenido)
    .bind(&payload.imagen_url)
    .execute(&state.db)
    .await;

    match res {
        Ok(r) => {
            let new_id = r.last_insert_id();
            ApiResponse::success(serde_json::json!({
                "id": new_id,
                "mensaje": "Publicación realizada exitosamente en el Muro Social."
            })).into_response()
        }
        Err(err) => {
            tracing::error!("Error al crear publicación social: {:?}", err);
            ApiResponse::<()>::error(
                StatusCode::INTERNAL_SERVER_ERROR,
                "Error al publicar en el muro",
            )
            .into_response()
        }
    }
}

/// Handler para enviar mensaje directo entre usuarios (compatible con expediente 213203453)
pub async fn enviar_mensaje_privado(
    State(state): State<AppState>,
    axum::http::request::Parts { headers, .. }: axum::http::request::Parts,
    Json(payload): Json<EnviarMensajeRequest>,
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

    let emisor_id = claims.id;

    // Resolver receptor_id si se pasó expediente (ej. 213203453)
    let receptor_id = if let Some(target_id) = payload.receptor_id {
        target_id
    } else if let Some(ref exp) = payload.receptor_expediente {
        let rec: Option<(u64,)> = sqlx::query_as("SELECT id FROM usuarios WHERE expediente = ? OR matricula = ?")
            .bind(exp)
            .bind(exp)
            .fetch_optional(&state.db)
            .await
            .unwrap_or(None);
        
        match rec {
            Some((id,)) => id,
            None => return ApiResponse::<()>::error(StatusCode::NOT_FOUND, "Usuario destinatario no encontrado.").into_response(),
        }
    } else {
        return ApiResponse::<()>::error(StatusCode::BAD_REQUEST, "Debe especificar un usuario o expediente destinatario.").into_response();
    };

    let res = sqlx::query(
        r#"
        INSERT INTO mensajes_privados (emisor_id, receptor_id, contenido, leido, created_at)
        VALUES (?, ?, ?, 0, NOW())
        "#,
    )
    .bind(emisor_id)
    .bind(receptor_id)
    .bind(&payload.contenido)
    .execute(&state.db)
    .await;

    match res {
        Ok(r) => ApiResponse::success(serde_json::json!({
            "id": r.last_insert_id(),
            "emisor_id": emisor_id,
            "receptor_id": receptor_id,
            "mensaje": "Mensaje privado entregado y guardado correctamente."
        })).into_response(),
        Err(err) => {
            tracing::error!("Error al enviar mensaje privado: {:?}", err);
            ApiResponse::<()>::error(
                StatusCode::INTERNAL_SERVER_ERROR,
                "Error al registrar mensaje privado en la base de datos",
            )
            .into_response()
        }
    }
}

/// Handler para consultar hilo de mensajes directos
pub async fn get_mensajes_privados(
    State(state): State<AppState>,
    axum::http::request::Parts { headers, .. }: axum::http::request::Parts,
    Query(params): Query<MensajesQueryParams>,
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

    let current_id = claims.id;

    let other_id = if let Some(target) = params.con_usuario_id {
        target
    } else if let Some(ref exp) = params.con_expediente {
        let rec: Option<(u64,)> = sqlx::query_as("SELECT id FROM usuarios WHERE expediente = ? OR matricula = ?")
            .bind(exp)
            .bind(exp)
            .fetch_optional(&state.db)
            .await
            .unwrap_or(None);
        rec.map(|(id,)| id).unwrap_or(0)
    } else {
        0
    };

    let result = sqlx::query_as::<_, MensajePrivadoDto>(
        r#"
        SELECT m.id, m.emisor_id, m.receptor_id,
               u1.nombre_completo as emisor_nombre,
               u2.nombre_completo as receptor_nombre,
               m.contenido, m.leido,
               DATE_FORMAT(m.created_at, '%Y-%m-%d %H:%i:%s') as created_at
        FROM mensajes_privados m
        JOIN usuarios u1 ON m.emisor_id = u1.id
        JOIN usuarios u2 ON m.receptor_id = u2.id
        WHERE (m.emisor_id = ? AND m.receptor_id = ?)
           OR (m.emisor_id = ? AND m.receptor_id = ?)
           OR (? = 0 AND (m.emisor_id = ? OR m.receptor_id = ?))
        ORDER BY m.created_at ASC
        LIMIT 100
        "#,
    )
    .bind(current_id)
    .bind(other_id)
    .bind(other_id)
    .bind(current_id)
    .bind(other_id)
    .bind(current_id)
    .bind(current_id)
    .fetch_all(&state.db)
    .await;

    match result {
        Ok(msgs) => ApiResponse::success(msgs).into_response(),
        Err(err) => {
            tracing::error!("Error al consultar mensajes privados: {:?}", err);
            ApiResponse::<()>::error(
                StatusCode::INTERNAL_SERVER_ERROR,
                "Error al cargar los mensajes",
            )
            .into_response()
        }
    }
}

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/social/feed", get(get_social_feed))
        .route("/social/post", post(crear_post))
        .route("/mensajes/enviar", post(enviar_mensaje_privado))
        .route("/mensajes/hilo", get(get_mensajes_privados))
        .route("/mensajes", get(get_mensajes_privados))
        .route("/mensajes", post(enviar_mensaje_privado))
}
