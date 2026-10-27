// ==============================================================================
// SERVIDOR PRINCIPAL RUST (Axum + Tokio + SQLx) — CESA UNISON v7.5
// ==============================================================================

mod config;
mod middleware;
mod modules;
mod state;
mod utils;

use axum::{routing::get, Router};
use config::Config;
use state::AppState;
use std::net::SocketAddr;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Inicializar sistema de logs (tracing)
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            std::env::var("RUST_LOG").unwrap_or_else(|_| "info,cesa_rust_backend=debug".into()),
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();

    tracing::info!("🚀 Iniciando servidor Rust de CESA UNISON (100% Rust Backend)...");

    // 1. Cargar configuración y variables de entorno
    let config = Config::from_env();

    // 2. Conectar a MariaDB mediante SQLx Pool
    tracing::info!("🔌 Conectando a MariaDB en: {}", config.database_url);
    let pool = sqlx::mysql::MySqlPoolOptions::new()
        .max_connections(50)
        .min_connections(5)
        .idle_timeout(std::time::Duration::from_secs(600))
        .connect(&config.database_url)
        .await
        .unwrap_or_else(|err| {
            tracing::warn!("⚠️ No se pudo conectar a MariaDB local ({:?}), continuando en modo standalone/dry-run.", err);
            sqlx::mysql::MySqlPoolOptions::new()
                .connect_lazy(&config.database_url)
                .expect("Error al crear pool diferido")
        });

    // Bus de eventos del Bazar en tiempo real (SSE)
    let (bazar_tx, _) = tokio::sync::broadcast::channel::<modules::bazar_stream::BazarEvento>(256);
    modules::bazar_stream::start_poller(pool.clone(), bazar_tx.clone());
    let app_state = AppState::new(pool.clone(), config.clone(), bazar_tx);

    // 3. Configurar Rutas de la API v1 (100% de la plataforma en Rust)
    let api_routes = Router::new()
        .route("/health", get(|| async { "OK - CESA UNISON Rust Backend v1.0 (100% Native)" }))
        .merge(modules::auth::router())
        .merge(modules::noticias::router())
        .merge(modules::ai_engine::router())
        .merge(modules::votaciones::router())
        .merge(modules::bazar::router())
        .merge(modules::bazar_stream::router())
        .merge(modules::expedientes::router())
        .merge(modules::empleos::router())
        .merge(modules::reportes::router())
        .merge(modules::social::router())
        .merge(modules::admin::router())
        .merge(modules::skills::router())
        .merge(modules::rag_admin::router())
        .merge(modules::publicidad::router())
        .merge(modules::canva::router())
        .merge(modules::telegram::router())
        .merge(modules::ocean::router())
        .merge(modules::social_media::router());

    let app = Router::new()
        .nest("/api/v1", api_routes)
        .layer(middleware::cors::cors_layer())
        .with_state(app_state);

    // 4. Iniciar Listener HTTP en el puerto 8080
    let addr = SocketAddr::from(([0, 0, 0, 0], config.port));
    tracing::info!("🟢 Servidor 100% Rust listo escuchando en http://{}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}
