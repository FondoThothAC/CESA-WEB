// ==============================================================================
// MIDDLEWARE DE CONFIGURACIÓN CORS — CESA UNISON
// ==============================================================================

use axum::http::Method;
use tower_http::cors::{CorsLayer, AllowOrigin};

pub fn cors_layer() -> CorsLayer {
    CorsLayer::new()
        // Permitir que el frontend envíe credenciales (cookies/tokens)
        .allow_credentials(true)
        // Reflejar cualquier origin (necesario cuando credentials = true, ya que no se permite '*')
        .allow_origin(AllowOrigin::predicate(|_, _| true))
        .allow_methods([
            Method::GET,
            Method::POST,
            Method::PUT,
            Method::DELETE,
            Method::OPTIONS,
        ])
        .allow_headers(tower_http::cors::Any)
}
