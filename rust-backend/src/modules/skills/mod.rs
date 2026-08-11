// ==============================================================================
// MÓDULO DE SKILLS & CERTIFICADOS DIGITALES — CESA UNISON (RUST BACKEND)
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
use sha2::{Digest, Sha256};
use sqlx::FromRow;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Habilidad {
    pub id: i32,
    pub nombre: String,
    pub descripcion: Option<String>,
    pub categoria: String,
    pub nivel_minimo_aprobatorio: Option<i32>,
    pub icono: Option<String>,
    pub total_preguntas: Option<i64>,
    pub certificados_emitidos: Option<i64>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct PreguntaDb {
    pub id: i32,
    pub habilidad_id: i32,
    pub pregunta: String,
    pub tipo: String,
    pub opciones: Option<Vec<u8>>,
    pub respuesta_correcta: String,
    pub explicacion: Option<Vec<u8>>,
    pub dificultad: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PreguntaDto {
    pub id: i32,
    pub habilidad_id: i32,
    pub pregunta: String,
    pub tipo: String,
    pub opciones: Option<String>,
    pub respuesta_correcta: String,
    pub explicacion: Option<String>,
    pub dificultad: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct CertificadoDigital {
    pub id: i32,
    pub usuario_id: i64,
    pub habilidad_id: i32,
    pub uuid: String,
    pub codigo_verificacion: String,
    pub puntaje: i32,
    pub fecha_emision: Option<chrono::NaiveDateTime>,
}

#[derive(Debug, Deserialize)]
pub struct PreguntasQueryParams {
    pub habilidad_id: Option<i32>,
}

#[derive(Debug, Deserialize)]
pub struct GenerarCertificadoRequest {
    pub habilidad_id: i32,
    pub puntaje: i32,
}

/// Handler para listar el catálogo de habilidades y certificados del alumno
pub async fn get_skills_catalog(
    State(state): State<AppState>,
    auth_user_opt: Option<Extension<AuthUser>>,
) -> impl IntoResponse {
    let result = sqlx::query_as::<_, Habilidad>(
        r#"
        SELECT h.id, h.nombre, h.descripcion, h.categoria, h.nivel_minimo_aprobatorio, h.icono,
               (SELECT COUNT(*) FROM preguntas WHERE habilidad_id = h.id AND activo = 1) as total_preguntas,
               (SELECT COUNT(*) FROM certificados_digitales WHERE habilidad_id = h.id) as certificados_emitidos
        FROM habilidades h
        WHERE h.activo = 1
        ORDER BY h.categoria, h.nombre
        "#,
    )
    .fetch_all(&state.db)
    .await;

    let mut certs = vec![];
    if let Some(Extension(auth_user)) = auth_user_opt {
        let user_id = auth_user.claims.id.unwrap_or(0);
        let certs_res = sqlx::query_as::<_, CertificadoDigital>(
            "SELECT id, usuario_id, habilidad_id, uuid, codigo_verificacion, puntaje, fecha_emision FROM certificados_digitales WHERE usuario_id = ?",
        )
        .bind(user_id)
        .fetch_all(&state.db)
        .await;

        if let Ok(c) = certs_res {
            certs = c;
        }
    }

    match result {
        Ok(catalog) => {
            let res_data = serde_json::json!({
                "catalog": catalog,
                "mis_certificados": certs
            });
            ApiResponse::success(res_data).into_response()
        }
        Err(err) => {
            tracing::error!("Error al consultar catálogo de habilidades: {:?}", err);
            ApiResponse::<()>::error(
                StatusCode::INTERNAL_SERVER_ERROR,
                "Error al cargar las habilidades",
            )
            .into_response()
        }
    }
}

/// Handler para obtener el banco de preguntas ordenadas correctamente (Nivel 1: básico, Nivel 2: intermedio, Nivel 3: avanzado)
pub async fn get_preguntas(
    State(state): State<AppState>,
    Query(params): Query<PreguntasQueryParams>,
) -> impl IntoResponse {
    let habilidad_id = params.habilidad_id.unwrap_or(1);

    let raw_result = sqlx::query_as::<_, PreguntaDb>(
        r#"
        SELECT id, habilidad_id, pregunta, tipo, opciones, respuesta_correcta, explicacion, dificultad
        FROM preguntas
        WHERE habilidad_id = ? AND activo = 1
        ORDER BY FIELD(dificultad, 'basico', 'intermedio', 'avanzado') ASC, id ASC
        "#,
    )
    .bind(habilidad_id)
    .fetch_all(&state.db)
    .await;

    match raw_result {
        Ok(raw_preguntas) => {
            let preguntas: Vec<PreguntaDto> = raw_preguntas
                .into_iter()
                .map(|p| PreguntaDto {
                    id: p.id,
                    habilidad_id: p.habilidad_id,
                    pregunta: p.pregunta,
                    tipo: p.tipo,
                    opciones: p.opciones.map(|b| String::from_utf8_lossy(&b).to_string()),
                    respuesta_correcta: p.respuesta_correcta,
                    explicacion: p.explicacion.map(|b| String::from_utf8_lossy(&b).to_string()),
                    dificultad: p.dificultad,
                })
                .collect();
            ApiResponse::success(preguntas).into_response()
        }
        Err(err) => {
            tracing::error!("Error al consultar preguntas: {:?}", err);
            ApiResponse::<()>::error(
                StatusCode::INTERNAL_SERVER_ERROR,
                "Error al obtener el examen de preguntas",
            )
            .into_response()
        }
    }
}

/// Handler para generar un certificado digital al aprobar un examen
pub async fn generar_certificado(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Json(payload): Json<GenerarCertificadoRequest>,
) -> impl IntoResponse {
    let user_id = auth_user.claims.id.unwrap_or(0);
    let uuid_str = uuid::Uuid::new_v4().to_string();

    let mut hasher = Sha256::new();
    hasher.update(format!("{}{}", uuid_str, user_id).as_bytes());
    let verification_code = hex::encode(hasher.finalize());

    let res = sqlx::query(
        r#"
        INSERT INTO certificados_digitales (usuario_id, habilidad_id, uuid, codigo_verificacion, puntaje, fecha_emision)
        VALUES (?, ?, ?, ?, ?, NOW())
        "#,
    )
    .bind(user_id)
    .bind(payload.habilidad_id)
    .bind(&uuid_str)
    .bind(&verification_code)
    .bind(payload.puntaje)
    .execute(&state.db)
    .await;

    match res {
        Ok(_) => ApiResponse::success(serde_json::json!({
            "uuid": uuid_str,
            "codigo_verificacion": verification_code,
            "puntaje": payload.puntaje
        }))
        .into_response(),
        Err(err) => {
            tracing::error!("Error al emitir certificado: {:?}", err);
            ApiResponse::<()>::error(
                StatusCode::INTERNAL_SERVER_ERROR,
                "Error al generar el certificado digital",
            )
            .into_response()
        }
    }
}

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/skills", get(get_skills_catalog))
        .route("/skills/preguntas", get(get_preguntas))
        .route("/skills/certificado", post(generar_certificado))
}
