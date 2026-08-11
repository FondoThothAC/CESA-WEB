// ==============================================================================
// MIDDLEWARE DE AUTENTICACIÓN JWT — CESA UNISON (RUST BACKEND)
// ==============================================================================

use crate::state::AppState;
use axum::{
    async_trait,
    extract::{FromRef, FromRequestParts, Request, State},
    http::{header, request::Parts, StatusCode},
    middleware::Next,
    response::Response,
};
use jsonwebtoken::{decode, DecodingKey, Validation};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Claims {
    pub sub: Option<String>,
    pub id: Option<u64>,
    pub expediente: Option<String>,
    pub email: Option<String>,
    pub rol: Option<String>,
    pub exp: usize,
}

/// Extractor nativo para obtener los Claims autenticados en cualquier Handler de Axum
#[derive(Clone, Debug)]
pub struct AuthUser {
    pub claims: Claims,
}

#[async_trait]
impl<S> FromRequestParts<S> for AuthUser
where
    S: Send + Sync,
    AppState: FromRef<S>,
{
    type Rejection = StatusCode;

    async fn from_request_parts(parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        // 1. Si ya se inyectó en extensions, reutilizarlo
        if let Some(user) = parts.extensions.get::<AuthUser>() {
            return Ok(user.clone());
        }

        // 2. Extraer token del header Authorization
        let app_state = AppState::from_ref(state);
        let auth_header = parts
            .headers
            .get(header::AUTHORIZATION)
            .and_then(|h| h.to_str().ok());

        let token = match auth_header {
            Some(h) if h.starts_with("Bearer ") => &h[7..],
            _ => return Err(StatusCode::UNAUTHORIZED),
        };

        let key = DecodingKey::from_secret(app_state.config.jwt_secret.as_bytes());
        let mut validation = Validation::default();
        validation.validate_exp = true;

        match decode::<Claims>(token, &key, &validation) {
            Ok(token_data) => {
                let user = AuthUser {
                    claims: token_data.claims,
                };
                parts.extensions.insert(user.clone());
                Ok(user)
            }
            Err(_) => Err(StatusCode::UNAUTHORIZED),
        }
    }
}

pub async fn require_auth(
    State(state): State<AppState>,
    mut req: Request,
    next: Next,
) -> Result<Response, StatusCode> {
    let auth_header = req
        .headers()
        .get(header::AUTHORIZATION)
        .and_then(|header| header.to_str().ok());

    let token = match auth_header {
        Some(auth_header) if auth_header.starts_with("Bearer ") => {
            &auth_header[7..]
        }
        _ => return Err(StatusCode::UNAUTHORIZED),
    };

    let key = DecodingKey::from_secret(state.config.jwt_secret.as_bytes());
    let mut validation = Validation::default();
    validation.validate_exp = true;

    match decode::<Claims>(token, &key, &validation) {
        Ok(token_data) => {
            req.extensions_mut().insert(AuthUser {
                claims: token_data.claims,
            });
            Ok(next.run(req).await)
        }
        Err(_) => Err(StatusCode::UNAUTHORIZED),
    }
}
