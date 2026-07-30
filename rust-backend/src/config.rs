// ==============================================================================
// CONFIGURACIÓN DE VARIABLES DE ENTORNO — CESA UNISON (RUST BACKEND)
// ==============================================================================
// Este módulo lee las variables del archivo `.env.production` o `.env`
// ==============================================================================

use std::env;

#[derive(Clone, Debug)]
pub struct Config {
    pub database_url: String,
    pub jwt_secret: String,
    pub port: u16,
    pub ollama_api_keys: Vec<String>,
    pub environment: String,
}

impl Config {
    /// Carga las variables de entorno desde el entorno o archivo `.env`
    pub fn from_env() -> Self {
        // Cargar `.env` si existe
        let _ = dotenvy::dotenv();

        let db_user = env::var("DB_USER").unwrap_or_else(|_| "cesa_admin".to_string());
        let db_pass = env::var("DB_PASS").unwrap_or_else(|_| "cesa_pw_20ff8077e040".to_string());
        let db_host = env::var("DB_HOST").unwrap_or_else(|_| "127.0.0.1".to_string());
        let db_name = env::var("DB_NAME").unwrap_or_else(|_| "cesa_web".to_string());

        let database_url = env::var("DATABASE_URL").unwrap_or_else(|_| {
            format!("mysql://{}:{}@{}:3306/{}", db_user, db_pass, db_host, db_name)
        });

        let jwt_secret = env::var("JWT_SECRET")
            .unwrap_or_else(|_| "cesa_unison_master_secret_key_2026".to_string());

        let port = env::var("PORT")
            .ok()
            .and_then(|p| p.parse::<u16>().ok())
            .unwrap_or(8080);

        let ollama_api_keys_str = env::var("OLLAMA_API_KEYS")
            .unwrap_or_else(|_| "".to_string());

        let ollama_api_keys = ollama_api_keys_str
            .split(',')
            .map(|s| s.trim().to_string())
            .filter(|s| !s.is_empty())
            .collect();

        let environment = env::var("NODE_ENV")
            .unwrap_or_else(|_| "production".to_string());

        Config {
            database_url,
            jwt_secret,
            port,
            ollama_api_keys,
            environment,
        }
    }
}
