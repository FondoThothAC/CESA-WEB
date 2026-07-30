// ==============================================================================
// MÓDULO DE NOTICIAS & FEED — CESA UNISON (RUST BACKEND)
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
pub struct Noticia {
    pub id: u64,
    pub titulo: String,
    pub resumen: Option<String>,
    pub contenido: String,
    pub categoria: Option<String>,
    pub imagen_path: Option<String>,
    pub imagen_url: Option<String>,
    pub autor_id: Option<u64>,
    pub autor_nombre: Option<String>,
    pub autor_avatar: Option<String>,
    pub fecha_publicacion: Option<chrono::NaiveDateTime>,
    pub activo: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct NoticiasParams {
    pub carrera_destino: Option<String>,
}

/// Handler para listar noticias principales
pub async fn get_noticias(
    State(state): State<AppState>,
    Query(params): Query<NoticiasParams>,
) -> impl IntoResponse {
    let result = if let Some(ref carrera) = params.carrera_destino {
        sqlx::query_as::<_, Noticia>(
            r#"
            SELECT n.id, n.titulo, n.resumen, n.contenido, n.categoria, 
                   n.imagen_path, n.imagen_path as imagen_url, n.autor_id, 
                   u.nombre_completo as autor_nombre, u.avatar_path as autor_avatar,
                   n.fecha_publicacion, n.activo
            FROM noticias n
            LEFT JOIN usuarios u ON n.autor_id = u.id
            WHERE n.activo = TRUE AND (n.carrera_destino IS NULL OR n.carrera_destino = ?)
            ORDER BY n.fecha_publicacion DESC
            LIMIT 50
            "#,
        )
        .bind(carrera)
        .fetch_all(&state.db)
        .await
    } else {
        sqlx::query_as::<_, Noticia>(
            r#"
            SELECT n.id, n.titulo, n.resumen, n.contenido, n.categoria, 
                   n.imagen_path, n.imagen_path as imagen_url, n.autor_id, 
                   u.nombre_completo as autor_nombre, u.avatar_path as autor_avatar,
                   n.fecha_publicacion, n.activo
            FROM noticias n
            LEFT JOIN usuarios u ON n.autor_id = u.id
            WHERE n.activo = TRUE
            ORDER BY n.fecha_publicacion DESC
            LIMIT 50
            "#,
        )
        .fetch_all(&state.db)
        .await
    };

    match result {
        Ok(noticias) => ApiResponse::success(noticias).into_response(),
        Err(err) => {
            tracing::error!("Error al consultar noticias: {:?}", err);
            ApiResponse::<()>::error(
                StatusCode::INTERNAL_SERVER_ERROR,
                "Error al cargar las noticias",
            )
            .into_response()
        }
    }
}

pub fn router() -> Router<AppState> {
    Router::new().route("/noticias", get(get_noticias))
}
