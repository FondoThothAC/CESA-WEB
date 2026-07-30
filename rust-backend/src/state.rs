// ==============================================================================
// ESTADO GLOBAL DE LA APLICACIÓN (AppState) — CESA UNISON
// ==============================================================================
// Mantiene el pool de conexiones de SQLx a MariaDB y el cliente HTTP para Ollama
// ==============================================================================

use crate::config::Config;
use reqwest::Client as HttpClient;
use sqlx::MySqlPool;
use std::sync::Arc;

#[derive(Clone)]
pub struct AppState {
    pub db: MySqlPool,
    pub http_client: HttpClient,
    pub config: Arc<Config>,
}

impl AppState {
    /// Inicializa el estado compartido con el pool de conexiones a la base de datos
    pub fn new(db: MySqlPool, config: Config) -> Self {
        let http_client = HttpClient::builder()
            .timeout(std::time::Duration::from_secs(30))
            .build()
            .expect("Error al construir el cliente HTTP de reqwest");

        AppState {
            db,
            http_client,
            config: Arc::new(config),
        }
    }
}
