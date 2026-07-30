// ==============================================================================
// MÓDULO DE ELECCIONES Y VOTACIONES ESTUDIANTILES — CESA UNISON (RUST BACKEND)
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
pub struct Votacion {
    pub id: u64,
    pub titulo: String,
    pub descripcion: Option<String>,
    pub fecha_inicio: Option<chrono::NaiveDateTime>,
    pub fecha_fin: Option<chrono::NaiveDateTime>,
    pub estado: String,
    pub carrera_objetivo: Option<String>,
    pub ya_voto: Option<bool>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Candidato {
    pub id: u64,
    pub votacion_id: u64,
    pub nombre: String,
    pub descripcion: Option<String>,
    pub foto_path: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct VotarRequest {
    pub votacion_id: u64,
    pub candidato_id: u64,
    pub expediente: String,
}

/// Helper para cifrar el expediente de forma determinista (AES-256) evitando votos dobles
fn encrypt_expediente(expediente: &str, votacion_id: u64, secret_key: &str) -> String {
    use sha2::{Digest, Sha256};
    let mut hasher = Sha256::new();
    hasher.update(format!("{}{}", votacion_id, secret_key));
    let hash_result = hasher.finalize();
    let iv_str = format!("{:x}", hash_result);
    let iv = &iv_str.as_bytes()[..16];

    // Cifrado simple con hash para unicidad
    let mut key_hasher = Sha256::new();
    key_hasher.update(secret_key);
    let key = key_hasher.finalize();

    use aes_gcm::aead::{Aead, KeyInit};
    use aes_gcm::{Aes256Gcm, Nonce};

    let cipher = Aes256Gcm::new_from_slice(&key).unwrap();
    let nonce = Nonce::from_slice(&iv[..12]);
    
    match cipher.encrypt(nonce, expediente.as_bytes()) {
        Ok(ciphertext) => hex::encode(ciphertext),
        Err(_) => format!("{}_{}", votacion_id, expediente),
    }
}

/// Handler para listar votaciones activas disponibles para el alumno
pub async fn get_votaciones(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
) -> impl IntoResponse {
    let user_id = auth_user.claims.id.unwrap_or(0);

    // Obtener la matrícula del usuario
    let user_res = sqlx::query_scalar::<_, Option<String>>(
        "SELECT matricula FROM usuarios WHERE id = ?",
    )
    .bind(user_id)
    .fetch_one(&state.db)
    .await;

    let matricula = match user_res {
        Ok(Some(m)) => m,
        _ => {
            return ApiResponse::<()>::error(
                StatusCode::BAD_REQUEST,
                "No tienes matrícula registrada para votar.",
            )
            .into_response();
        }
    };

    // Obtener la carrera del padrón activo
    let carrera_res = sqlx::query_scalar::<_, String>(
        "SELECT carrera FROM estudiantes_activos WHERE expediente = ? LIMIT 1",
    )
    .bind(&matricula)
    .fetch_optional(&state.db)
    .await;

    let carrera = match carrera_res {
        Ok(Some(c)) => c,
        _ => {
            return ApiResponse::<Vec<Votacion>>::success(vec![]).into_response();
        }
    };

    // Consultar votaciones activas o finalizadas para la carrera
    let votaciones_res = sqlx::query_as::<_, Votacion>(
        r#"
        SELECT id, titulo, descripcion, fecha_inicio, fecha_fin, estado, carrera_objetivo, NULL as ya_voto
        FROM votaciones
        WHERE (estado = 'activa' OR estado = 'finalizada')
        AND (carrera_objetivo IS NULL OR carrera_objetivo = ?)
        ORDER BY fecha_inicio DESC
        "#,
    )
    .bind(&carrera)
    .fetch_all(&state.db)
    .await;

    match votaciones_res {
        Ok(mut list) => {
            for v in &mut list {
                let enc = encrypt_expediente(&matricula, v.id, &state.config.jwt_secret);
                let count: i64 = sqlx::query_scalar(
                    "SELECT COUNT(*) FROM votos_anonimos WHERE voto_encriptado = ?",
                )
                .bind(&enc)
                .fetch_one(&state.db)
                .await
                .unwrap_or(0);

                v.ya_voto = Some(count > 0);
            }
            ApiResponse::success(list).into_response()
        }
        Err(err) => {
            tracing::error!("Error al listar votaciones: {:?}", err);
            ApiResponse::<()>::error(
                StatusCode::INTERNAL_SERVER_ERROR,
                "Error al obtener votaciones.",
            )
            .into_response()
        }
    }
}

/// Handler para emitir voto de forma atómica y encriptada
pub async fn emitir_voto(
    State(state): State<AppState>,
    Extension(_auth_user): Extension<AuthUser>,
    Json(payload): Json<VotarRequest>,
) -> impl IntoResponse {
    // 1. Validar que la votación exista y esté activa
    let votacion = sqlx::query_as::<_, Votacion>(
        "SELECT id, titulo, descripcion, fecha_inicio, fecha_fin, estado, carrera_objetivo, NULL as ya_voto FROM votaciones WHERE id = ?",
    )
    .bind(payload.votacion_id)
    .fetch_optional(&state.db)
    .await;

    let v = match votacion {
        Ok(Some(v)) if v.estado == "activa" => v,
        _ => {
            return ApiResponse::<()>::error(
                StatusCode::BAD_REQUEST,
                "Esta elección no está activa o ya ha finalizado.",
            )
            .into_response();
        }
    };

    // 2. Cifrar expediente para evitar voto doble
    let enc_voto = encrypt_expediente(&payload.expediente, v.id, &state.config.jwt_secret);

    let ya_voto: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM votos_anonimos WHERE voto_encriptado = ?",
    )
    .bind(&enc_voto)
    .fetch_one(&state.db)
    .await
    .unwrap_or(0);

    if ya_voto > 0 {
        return ApiResponse::<()>::error(
            StatusCode::BAD_REQUEST,
            "Ya has emitido tu voto en esta elección.",
        )
        .into_response();
    }

    // 3. Registrar el voto en transacción de MariaDB
    let mut tx = match state.db.begin().await {
        Ok(t) => t,
        Err(_) => {
            return ApiResponse::<()>::error(
                StatusCode::INTERNAL_SERVER_ERROR,
                "Error al iniciar transacción de voto.",
            )
            .into_response();
        }
    };

    let res_voto = sqlx::query(
        "INSERT INTO votos_anonimos (votacion_id, candidato_id, voto_encriptado, fecha_voto) VALUES (?, ?, ?, NOW())",
    )
    .bind(v.id)
    .bind(payload.candidato_id)
    .bind(&enc_voto)
    .execute(&mut *tx)
    .await;

    if res_voto.is_err() {
        let _ = tx.rollback().await;
        return ApiResponse::<()>::error(
            StatusCode::INTERNAL_SERVER_ERROR,
            "Error al registrar el voto en la base de datos.",
        )
        .into_response();
    }

    if tx.commit().await.is_err() {
        return ApiResponse::<()>::error(
            StatusCode::INTERNAL_SERVER_ERROR,
            "Error al confirmar el voto.",
        )
        .into_response();
    }

    ApiResponse::success("¡Tu voto ha sido registrado con éxito de forma anónima y encriptada!").into_response()
}

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/votaciones", get(get_votaciones))
        .route("/votaciones/votar", post(emitir_voto))
}
