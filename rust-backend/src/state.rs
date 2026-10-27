// ==============================================================================
// ESTADO GLOBAL DE LA APLICACIÓN (AppState) — CESA UNISON
// ==============================================================================
// Mantiene el pool de conexiones de SQLx a MariaDB y el cliente HTTP para Ollama
// ==============================================================================

use crate::config::Config;
use crate::modules::bazar_stream::BazarEvento;
use reqwest::Client as HttpClient;
use sqlx::MySqlPool;
use std::sync::Arc;
use tokio::sync::broadcast;

#[derive(Clone)]
pub struct AppState {
    pub db: MySqlPool,
    pub http_client: HttpClient,
    pub config: Arc<Config>,
    /// Bus de eventos del Bazar para streaming en tiempo real (SSE)
    pub bazar_eventos: broadcast::Sender<BazarEvento>,
}

impl AppState {
    /// Inicializa el estado compartido con el pool de conexiones a la base de datos
    pub fn new(db: MySqlPool, config: Config, bazar_eventos: broadcast::Sender<BazarEvento>) -> Self {
        let http_client = HttpClient::builder()
            .timeout(std::time::Duration::from_secs(30))
            .build()
            .expect("Error al construir el cliente HTTP de reqwest");

        AppState {
            db,
            http_client,
            config: Arc::new(config),
            bazar_eventos,
        }
    }
}
