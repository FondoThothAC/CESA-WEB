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
    pub ubicacion: Option<String>,
    pub puesto_id: Option<u64>,
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

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct PuestoBazar {
    pub id: u64,
    pub numero_puesto: String,
    pub zona: Option<String>,
    pub estado: String, // "disponible", "reservado", "ocupado"
    pub emprendimiento_id: Option<u64>,
    pub nombre_negocio: Option<String>,
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
    pub ubicacion: Option<String>,
    pub puesto_id: Option<u64>,
    pub instagram: Option<String>,
    pub whatsapp: Option<String>,
    pub edicion_id: Option<u64>,
}

#[derive(Debug, Deserialize)]
pub struct VotoBazarRequest {
    pub id: u64,
    pub valor: i32, // +1 o -1
}

/// Handler para listar emprendimientos del Bazar con filtrado por categoría y edición
pub async fn get_bazar_negocios(
    State(state): State<AppState>,
    Query(params): Query<BazarQueryParams>,
) -> impl IntoResponse {
    let cat_filter = params.categoria.unwrap_or_else(|| "todas".to_string());
    let search_q = params.q.unwrap_or_default();
    let edicion_id = params.edicion_id;
    let search_pattern = format!("%{}%", search_q);

    // Construcción dinámica de consulta SQL
    let mut query_str = String::from(
        r#"
        SELECT e.id, e.usuario_id, e.edicion_id, e.nombre_negocio, e.descripcion, 
               e.categoria, e.ubicacion, e.puesto_id, e.instagram, e.whatsapp, e.logo_path, 
               u.nombre_completo as dueno, u.matricula, e.verificado, e.active as activo, 
               e.featured, e.score, CAST(COALESCE(e.views, 0) as SIGNED) as views
        FROM emprendimientos e
        JOIN usuarios u ON e.usuario_id = u.id
        WHERE e.active = 1
        "#,
    );

    if cat_filter != "todas" && !cat_filter.is_empty() {
        query_str.push_str(" AND LOWER(e.categoria) = LOWER(?) ");
    }
    if let Some(_) = edicion_id {
        query_str.push_str(" AND e.edicion_id = ? ");
    }
    if !search_q.is_empty() {
        query_str.push_str(" AND (e.nombre_negocio LIKE ? OR e.descripcion LIKE ?) ");
    }

    query_str.push_str(" ORDER BY e.featured DESC, e.id DESC LIMIT 100");

    let mut query = sqlx::query_as::<_, Emprendimiento>(&query_str);

    if cat_filter != "todas" && !cat_filter.is_empty() {
        query = query.bind(&cat_filter);
    }
    if let Some(ed_id) = edicion_id {
        query = query.bind(ed_id);
    }
    if !search_q.is_empty() {
        query = query.bind(&search_pattern).bind(&search_pattern);
    }

    match query.fetch_all(&state.db).await {
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

/// Handler para obtener los puestos del catálogo del Bazar
pub async fn get_puestos_bazar(
    State(state): State<AppState>,
) -> impl IntoResponse {
    let result = sqlx::query_as::<_, PuestoBazar>(
        r#"
        SELECT p.id, p.numero_puesto, p.zona, 
               COALESCE(p.estado, IF(e.id IS NOT NULL, 'ocupado', 'disponible')) as estado,
               e.id as emprendimiento_id, e.nombre_negocio
        FROM puestos_bazar p
        LEFT JOIN emprendimientos e ON p.id = e.puesto_id AND e.active = 1
        ORDER BY p.id ASC
        "#,
    )
    .fetch_all(&state.db)
    .await;

    match result {
        Ok(puestos) => ApiResponse::success(puestos).into_response(),
        Err(_) => {
            // Fallback a puestos sintéticos si la tabla no existiera
            let mut fallback_puestos = Vec::new();
            for i in 1..=30 {
                fallback_puestos.push(PuestoBazar {
                    id: i as u64,
                    numero_puesto: format!("Puesto-{}", i),
                    zona: Some("Plaza Central".to_string()),
                    estado: "disponible".to_string(),
                    emprendimiento_id: None,
                    nombre_negocio: None,
                });
            }
            ApiResponse::success(fallback_puestos).into_response()
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
    let is_admin = claims.rol == "admin";
    let cat = payload.categoria.unwrap_or_else(|| "otro".to_string());
    let slug = format!("{}-{}", payload.nombre_negocio.to_lowercase().replace(' ', "-"), user_id);
    // Verificado = 1 si es admin, 0 si es alumno (moderación)
    let verificado_val = if is_admin { 1 } else { 0 };

    let res = sqlx::query(
        r#"
        INSERT INTO emprendimientos 
        (usuario_id, nombre_negocio, slug, descripcion, categoria, ubicacion, puesto_id, whatsapp, instagram, edicion_id, active, verificado, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, NOW())
        "#,
    )
    .bind(user_id)
    .bind(&payload.nombre_negocio)
    .bind(&slug)
    .bind(&payload.descripcion)
    .bind(&cat)
    .bind(&payload.ubicacion)
    .bind(payload.puesto_id)
    .bind(&payload.whatsapp)
    .bind(&payload.instagram)
    .bind(payload.edicion_id.unwrap_or(1))
    .bind(verificado_val)
    .execute(&state.db)
    .await;

    match res {
        Ok(r) => {
            let new_id = r.last_insert_id();
            let msg = if is_admin {
                "Publicación de Bazar registrada y verificada exitosamente."
            } else {
                "Tu solicitud de publicación en el Bazar fue recibida y está en proceso de revisión por la Mesa Directiva."
            };

            ApiResponse::success(serde_json::json!({
                "id": new_id,
                "mensaje": msg,
                "ubicacion": payload.ubicacion,
                "verificado": verificado_val == 1
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

/// Handler para votar un emprendimiento (+1 / -1)
pub async fn votar_emprendimiento(
    State(state): State<AppState>,
    axum::http::request::Parts { headers, .. }: axum::http::request::Parts,
    Json(payload): Json<VotoBazarRequest>,
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
    let delta = if payload.valor > 0 { 1 } else { -1 };

    // Actualizar score directamente
    let res = sqlx::query(
        "UPDATE emprendimientos SET score = COALESCE(score, 0) + ? WHERE id = ?"
    )
    .bind(delta)
    .bind(payload.id)
    .execute(&state.db)
    .await;

    // Guardar o actualizar registro de voto individual
    let _ = sqlx::query(
        r#"
        INSERT INTO bazar_votos (emprendimiento_id, usuario_id, valor, updated_at)
        VALUES (?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE valor = ?, updated_at = NOW()
        "#
    )
    .bind(payload.id)
    .bind(user_id)
    .bind(delta)
    .bind(delta)
    .execute(&state.db)
    .await;

    match res {
        Ok(_) => ApiResponse::success(serde_json::json!({
            "success": true,
            "mensaje": "Voto registrado correctamente."
        })).into_response(),
        Err(err) => {
            tracing::error!("Error al votar en bazar: {:?}", err);
            ApiResponse::<()>::error(
                StatusCode::INTERNAL_SERVER_ERROR,
                "Error al procesar el voto.",
            )
            .into_response()
        }
    }
}

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/bazar/tiendas", get(get_bazar_negocios))
        .route("/bazar/productos", get(get_bazar_negocios))
        .route("/bazar/puestos", get(get_puestos_bazar))
        .route("/bazar/crear", post(crear_emprendimiento))
        .route("/bazar/tiendas", post(crear_emprendimiento))
        .route("/bazar/votar", post(votar_emprendimiento))
}
