// ==============================================================================
// MIDDLEWARE DE CONFIGURACIÓN CORS — CESA UNISON
// ==============================================================================

use axum::http::{
    header::{ACCEPT, AUTHORIZATION, CONTENT_TYPE, COOKIE, ORIGIN, SET_COOKIE},
    HeaderName, Method,
};
use tower_http::cors::{AllowOrigin, CorsLayer};

pub fn cors_layer() -> CorsLayer {
    CorsLayer::new()
        // Permitir que el frontend envíe credenciales (cookies/tokens)
        .allow_credentials(true)
        // Reflejar cualquier origin (necesario cuando credentials = true)
        .allow_origin(AllowOrigin::predicate(|_, _| true))
        .allow_methods([
            Method::GET,
            Method::POST,
            Method::PUT,
            Method::DELETE,
            Method::OPTIONS,
        ])
        .allow_headers([
            AUTHORIZATION,
            CONTENT_TYPE,
            ACCEPT,
            ORIGIN,
            COOKIE,
            SET_COOKIE,
            HeaderName::from_static("x-requested-with"),
            HeaderName::from_static("x-csrf-token"),
        ])
}
