// ==============================================================================
// MÓDULO DE BAZAR EMPRENDEDOR & MARKETPLACE — CESA UNISON (RUST BACKEND)
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
pub struct Emprendimiento {
    pub id: u64,
    pub usuario_id: u64,
    pub edicion_id: Option<u64>,
    pub nombre_negocio: String,
    pub descripcion: Option<String>,
    pub categoria: String,
    pub ubicacion: Option<String>, // "lugar de bazar"
    pub instagram: Option<String>,
    pub whatsapp: Option<String>,
    pub logo_path: Option<String>,
    pub dueno: Option<String>,
    pub matricula: Option<String>,
    pub verificado: Option<bool>,
    pub activo: Option<bool>,
    pub featured: Option<bool>,
    pub score: Option<i32>,
    pub views: Option<i32>,
}

#[derive(Debug, Deserialize)]
pub struct BazarQueryParams {
    pub categoria: Option<String>,
    pub q: Option<String>,
    pub edicion_id: Option<u64>,
}

#[derive(Debug, Deserialize)]
pub struct CrearEmprendimientoRequest {
    pub nombre_negocio: String,
    pub descripcion: String,
    pub categoria: Option<String>,
    pub ubicacion: Option<String>, // Lugar de Bazar
    pub instagram: Option<String>,
    pub whatsapp: Option<String>,
    pub edicion_id: Option<u64>,
}

/// Handler para listar emprendimientos activos del Bazar
pub async fn get_bazar_negocios(
    State(state): State<AppState>,
    Query(params): Query<BazarQueryParams>,
) -> impl IntoResponse {
    let cat_filter = params.categoria.unwrap_or_else(|| "todas".to_string());
    let search_q = params.q.unwrap_or_default();
    let search_pattern = format!("%{}%", search_q);

    let result = if cat_filter != "todas" && !search_q.is_empty() {
        sqlx::query_as::<_, Emprendimiento>(
            r#"
            SELECT e.id, e.usuario_id, e.edicion_id, e.nombre_negocio, e.descripcion, 
                   e.categoria, e.ubicacion, e.instagram, e.whatsapp, e.logo_path, 
                   u.nombre_completo as dueno, u.matricula, e.verificado, e.active as activo, 
                   e.featured, e.score, CAST(COALESCE(e.views, 0) as SIGNED) as views
            FROM emprendimientos e
            JOIN usuarios u ON e.usuario_id = u.id
            WHERE e.active = 1 AND (e.nombre_negocio LIKE ? OR e.descripcion LIKE ?)
            ORDER BY e.featured DESC, e.id DESC
            LIMIT 50
            "#,
        )
        .bind(&search_pattern)
        .bind(&search_pattern)
        .fetch_all(&state.db)
        .await
    } else {
        sqlx::query_as::<_, Emprendimiento>(
            r#"
            SELECT e.id, e.usuario_id, e.edicion_id, e.nombre_negocio, e.descripcion, 
                   e.categoria, e.ubicacion, e.instagram, e.whatsapp, e.logo_path, 
                   u.nombre_completo as dueno, u.matricula, e.verificado, e.active as activo, 
                   e.featured, e.score, CAST(COALESCE(e.views, 0) as SIGNED) as views
            FROM emprendimientos e
            JOIN usuarios u ON e.usuario_id = u.id
            WHERE e.active = 1
            ORDER BY e.featured DESC, e.id DESC
            LIMIT 50
            "#,
        )
        .fetch_all(&state.db)
        .await
    };

    match result {
        Ok(tiendas) => ApiResponse::success(tiendas).into_response(),
        Err(err) => {
            tracing::error!("Error al consultar bazar: {:?}", err);
            ApiResponse::<()>::error(
                StatusCode::INTERNAL_SERVER_ERROR,
                "Error al cargar las tiendas del bazar",
            )
            .into_response()
        }
    }
}

/// Handler para registrar / publicar un negocio o stand de bazar
pub async fn crear_emprendimiento(
    State(state): State<AppState>,
    axum::http::request::Parts { headers, .. }: axum::http::request::Parts,
    Json(payload): Json<CrearEmprendimientoRequest>,
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
    let cat = payload.categoria.unwrap_or_else(|| "otro".to_string());
    let slug = format!("{}-{}", payload.nombre_negocio.to_lowercase().replace(' ', "-"), user_id);

    let res = sqlx::query(
        r#"
        INSERT INTO emprendimientos 
        (usuario_id, nombre_negocio, slug, descripcion, categoria, ubicacion, whatsapp, instagram, edicion_id, active, verificado, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, NOW())
        "#,
    )
    .bind(user_id)
    .bind(&payload.nombre_negocio)
    .bind(&slug)
    .bind(&payload.descripcion)
    .bind(&cat)
    .bind(&payload.ubicacion)
    .bind(&payload.whatsapp)
    .bind(&payload.instagram)
    .bind(payload.edicion_id.unwrap_or(1))
    .execute(&state.db)
    .await;

    match res {
        Ok(r) => {
            let new_id = r.last_insert_id();
            ApiResponse::success(serde_json::json!({
                "id": new_id,
                "mensaje": "Publicación de Bazar registrada exitosamente con ubicación.",
                "ubicacion": payload.ubicacion
            })).into_response()
        }
        Err(err) => {
            tracing::error!("Error al publicar en bazar: {:?}", err);
            ApiResponse::<()>::error(
                StatusCode::INTERNAL_SERVER_ERROR,
                "Error al registrar la publicación en el Bazar",
            )
            .into_response()
        }
    }
}

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/bazar/tiendas", get(get_bazar_negocios))
        .route("/bazar/crear", post(crear_emprendimiento))
        .route("/bazar/tiendas", post(crear_emprendimiento))
}
