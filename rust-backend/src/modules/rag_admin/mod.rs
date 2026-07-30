// ==============================================================================
// MÓDULO DE ADMINISTRACIÓN RAG KNOWLEDGE BASE — CESA UNISON (RUST BACKEND)
// ==============================================================================

use crate::{
    middleware::auth::AuthUser,
    state::AppState,
    utils::response::ApiResponse,
};
use axum::{
    extract::{Extension, State},
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct RagDocument {
    pub id: u64,
    pub titulo: String,
    pub categoria: Option<String>,
    pub contenido: String,
    pub activo: Option<bool>,
    pub creado_en: Option<chrono::NaiveDateTime>,
}

#[derive(Debug, Deserialize)]
pub struct GuardarRagDocRequest {
    pub id: Option<u64>,
    pub titulo: String,
    pub categoria: Option<String>,
    pub contenido: String,
}

/// Handler para listar todos los documentos de conocimiento RAG (Admin)
pub async fn get_rag_documents(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
) -> impl IntoResponse {
    let role = auth_user.claims.rol.clone().unwrap_or_default();
    if role != "admin" && role != "mesa_directiva" {
        return ApiResponse::<()>::error(StatusCode::FORBIDDEN, "Acceso denegado a la administración RAG.").into_response();
    }

    let docs = sqlx::query_as::<_, RagDocument>(
        "SELECT id, titulo, categoria, contenido, activo, creado_en FROM ia_conocimiento_rag ORDER BY id DESC",
    )
    .fetch_all(&state.db)
    .await;

    match docs {
        Ok(list) => ApiResponse::success(list).into_response(),
        Err(err) => {
            tracing::error!("Error al listar documentos RAG: {:?}", err);
            ApiResponse::<()>::error(StatusCode::INTERNAL_SERVER_ERROR, "Error al cargar documentos RAG.").into_response()
        }
    }
}

/// Handler para crear o actualizar un documento RAG Markdown
pub async fn guardar_rag_doc(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Json(payload): Json<GuardarRagDocRequest>,
) -> impl IntoResponse {
    let role = auth_user.claims.rol.clone().unwrap_or_default();
    if role != "admin" {
        return ApiResponse::<()>::error(StatusCode::FORBIDDEN, "Solo administradores pueden modificar el conocimiento de IA.").into_response();
    }

    let result = if let Some(doc_id) = payload.id {
        sqlx::query(
            "UPDATE ia_conocimiento_rag SET titulo = ?, categoria = ?, contenido = ? WHERE id = ?",
        )
        .bind(&payload.titulo)
        .bind(&payload.categoria)
        .bind(&payload.contenido)
        .bind(doc_id)
        .execute(&state.db)
        .await
    } else {
        sqlx::query(
            "INSERT INTO ia_conocimiento_rag (titulo, categoria, contenido, activo, creado_en) VALUES (?, ?, ?, 1, NOW())",
        )
        .bind(&payload.titulo)
        .bind(&payload.categoria)
        .bind(&payload.contenido)
        .execute(&state.db)
        .await
    };

    match result {
        Ok(_) => ApiResponse::success("Documento RAG guardado correctamente.").into_response(),
        Err(err) => {
            tracing::error!("Error al guardar doc RAG: {:?}", err);
            ApiResponse::<()>::error(StatusCode::INTERNAL_SERVER_ERROR, "Error al guardar el documento RAG.").into_response()
        }
    }
}

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/admin/rag", get(get_rag_documents))
        .route("/admin/rag", post(guardar_rag_doc))
}
