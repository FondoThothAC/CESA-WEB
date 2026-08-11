// ==============================================================================
// MÓDULO DE AUTENTICACIÓN Y PERFIL — CESA UNISON (RUST BACKEND)
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
use bcrypt::verify;
use jsonwebtoken::{encode, EncodingKey, Header};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Deserialize)]
pub struct LoginRequest {
    pub email: Option<String>,
    pub identifier: Option<String>,
    pub password: Option<String>,
    pub telefono: Option<String>,
    pub curp: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct LoginResponse {
    pub token: String,
    pub user: UserDto,
}

#[derive(Debug, Serialize, FromRow, Clone)]
pub struct UserDto {
    pub id: u64,
    pub nombre_completo: String,
    pub email: String,
    pub expediente: Option<String>,
    pub matricula: Option<String>,
    pub rol: String,
    pub carrera: Option<String>,
    pub avatar_path: Option<String>,
    pub activo: Option<bool>,
}

#[derive(Debug, FromRow)]
pub struct UserDb {
    pub id: u64,
    pub nombre_completo: String,
    pub email: String,
    pub expediente: Option<String>,
    pub matricula: Option<String>,
    pub password_hash: Option<String>,
    pub telefono: Option<String>,
    pub celular: Option<String>,
    pub curp: Option<String>,
    pub rol: String,
    pub carrera: Option<String>,
    pub avatar_path: Option<String>,
    pub activo: Option<bool>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub id: u64,
    pub email: String,
    pub rol: String,
    pub nombre: String,
    pub exp: usize,
}

/// Handler de Login Unificado (Autenticación flexible por Correo, Expediente o Teléfono)
pub async fn login(
    State(state): State<AppState>,
    Json(payload): Json<LoginRequest>,
) -> impl IntoResponse {
    let raw_identifier = payload
        .email
        .or(payload.identifier)
        .unwrap_or_default()
        .trim()
        .to_string();

    if raw_identifier.is_empty() {
        return ApiResponse::<()>::error(
            StatusCode::BAD_REQUEST,
            "Por favor ingresa tu Número de Expediente o Correo.",
        )
        .into_response();
    }

    let identifier = raw_identifier.to_lowercase();
    let clean_num: String = identifier.chars().filter(|c| c.is_ascii_digit()).collect();
    let clean_email = if identifier.contains('@') {
        identifier.clone()
    } else if !clean_num.is_empty() {
        format!("a{}@unison.mx", clean_num)
    } else {
        identifier.clone()
    };

    let user_res = sqlx::query_as::<_, UserDb>(
        r#"
        SELECT id, nombre_completo, email, expediente, matricula, password_hash, 
               telefono, celular, curp, rol, carrera, avatar_path, activo
        FROM usuarios
        WHERE (
            LOWER(email) = ? OR LOWER(email) = ? OR expediente = ? OR matricula = ?
        ) AND activo = 1
        LIMIT 1
        "#,
    )
    .bind(&identifier)
    .bind(&clean_email)
    .bind(&clean_num)
    .bind(&clean_num)
    .fetch_optional(&state.db)
    .await;

    let user = match user_res {
        Ok(Some(u)) => u,
        Ok(None) => {
            return ApiResponse::<()>::error(
                StatusCode::UNAUTHORIZED,
                "Credenciales incorrectas o usuario inactivo.",
            )
            .into_response();
        }
        Err(err) => {
            tracing::error!("Error SQL en login: {:?}", err);
            return ApiResponse::<()>::error(
                StatusCode::INTERNAL_SERVER_ERROR,
                "Error al procesar el inicio de sesión.",
            )
            .into_response();
        }
    };

    // Verificación de credenciales
    let input_pass = payload.password.unwrap_or_default();
    let mut auth_success = false;

    if let Some(ref hash) = user.password_hash {
        if !input_pass.is_empty() && verify(&input_pass, hash).unwrap_or(false) {
            auth_success = true;
        }
    }

    // Backup: Teléfono
    if !auth_success {
        let input_phone = payload.telefono.unwrap_or(input_pass.clone());
        let clean_phone_input: String = input_phone.chars().filter(|c| c.is_ascii_digit()).collect();
        let db_phone: String = user.telefono.clone().unwrap_or_default().chars().filter(|c| c.is_ascii_digit()).collect();
        let db_cel: String = user.celular.clone().unwrap_or_default().chars().filter(|c| c.is_ascii_digit()).collect();

        if !clean_phone_input.is_empty() && clean_phone_input.len() >= 7 {
            if clean_phone_input == db_phone || clean_phone_input == db_cel {
                auth_success = true;
            }
        }
    }

    if !auth_success {
        return ApiResponse::<()>::error(
            StatusCode::UNAUTHORIZED,
            "Contraseña o teléfono incorrectos.",
        )
        .into_response();
    }

    // Role override para master accounts
    let role = if user.email == "software@fondothoth.com" || user.email == "a213203453@unison.mx" {
        "admin".to_string()
    } else {
        user.rol.clone()
    };

    let exp = (chrono::Utc::now() + chrono::Duration::days(30)).timestamp() as usize;

    let claims = Claims {
        sub: user.id.to_string(),
        id: user.id,
        email: user.email.clone(),
        rol: role.clone(),
        nombre: user.nombre_completo.clone(),
        exp,
    };

    let token = match encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(state.config.jwt_secret.as_bytes()),
    ) {
        Ok(t) => t,
        Err(err) => {
            tracing::error!("Error al generar JWT: {:?}", err);
            return ApiResponse::<()>::error(
                StatusCode::INTERNAL_SERVER_ERROR,
                "Error al generar el token de sesión.",
            )
            .into_response();
        }
    };

    let user_dto = UserDto {
        id: user.id,
        nombre_completo: user.nombre_completo,
        email: user.email,
        expediente: user.expediente,
        matricula: user.matricula,
        rol: role,
        carrera: user.carrera,
        avatar_path: user.avatar_path,
        activo: user.activo,
    };

    ApiResponse::success(LoginResponse {
        token,
        user: user_dto,
    })
    .into_response()
}

/// Handler para obtener el perfil del usuario autenticado (`/api/v1/auth/me`)
/// Decodifica el JWT directamente desde el header Authorization (sin depender del Extension layer)
pub async fn get_me(
    State(state): State<AppState>,
    axum::http::request::Parts { headers, .. }: axum::http::request::Parts,
) -> impl IntoResponse {
    use jsonwebtoken::{decode, DecodingKey, Validation};

    // Extraer token del header Authorization: Bearer <token>
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

    // Decodificar y validar JWT
    let key = DecodingKey::from_secret(state.config.jwt_secret.as_bytes());
    let mut validation = Validation::default();
    validation.validate_exp = true;

    let claims = match decode::<Claims>(&token_str, &key, &validation) {
        Ok(data) => data.claims,
        Err(_) => {
            return ApiResponse::<()>::error(StatusCode::UNAUTHORIZED, "Token inválido o expirado.").into_response();
        }
    };

    let user_id = claims.id;

    let user_res = sqlx::query_as::<_, UserDto>(
        r#"
        SELECT id, nombre_completo, email, expediente, matricula, rol, carrera, avatar_path, activo
        FROM usuarios
        WHERE id = ? AND activo = 1
        "#,
    )
    .bind(user_id)
    .fetch_optional(&state.db)
    .await;

    match user_res {
        Ok(Some(user)) => ApiResponse::success(user).into_response(),
        Ok(None) => ApiResponse::<()>::error(StatusCode::NOT_FOUND, "Usuario no encontrado.").into_response(),
        Err(err) => {
            tracing::error!("Error al consultar perfil: {:?}", err);
            ApiResponse::<()>::error(StatusCode::INTERNAL_SERVER_ERROR, "Error al obtener perfil.").into_response()
        }
    }
}

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/auth/login", post(login))
        .route("/auth/me", get(get_me))
}
