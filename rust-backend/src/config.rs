// ==============================================================================
// CONFIGURACIÓN DE VARIABLES DE ENTORNO — CESA UNISON (RUST BACKEND)
// ==============================================================================
// Este módulo lee las variables de entorno del sistema o del archivo `.env`.
// Gestiona credenciales de base de datos, seguridad JWT, LLMs y herramientas
// del Swarm de Agentes IA de CESA UNISON.
// ==============================================================================

use std::env;

#[derive(Clone, Debug)]
pub struct Config {
    pub database_url: String,
    pub jwt_secret: String,
    pub port: u16,
    pub ollama_api_keys: Vec<String>,
    pub environment: String,
    // --- Proveedores LLM ---
    pub groq_api_key: String,
    pub gemini_api_key: String,
    pub mistral_api_key: String,
    // --- Canales de Comunicación ---
    pub telegram_bot_token: String,
    // --- Herramientas de Correo (Gmail SMTP) ---
    pub smtp_gmail_user: String,
    pub smtp_gmail_pass: String,
    // --- Herramientas Gráficas y Diseño ---
    pub canva_api_key: String,
    pub canva_client_id: String,
    pub canva_client_secret: String,
    pub canva_redirect_uri: String,
    pub replicate_api_key: String,
    // --- Redes Sociales (Meta Business API) ---
    pub facebook_app_id: String,
    pub facebook_app_secret: String,
}

impl Config {
    /// Carga y normaliza todas las variables de entorno requeridas por el backend
    pub fn from_env() -> Self {
        // Cargar `.env` local si existe
        let _ = dotenvy::dotenv();

        let db_user = env::var("DB_USER").expect("DB_USER no configurada");
        let db_pass = env::var("DB_PASS").expect("DB_PASS no configurada");
        let db_host = env::var("DB_HOST").expect("DB_HOST no configurada");
        let db_name = env::var("DB_NAME").expect("DB_NAME no configurada");

        let database_url = env::var("DATABASE_URL").unwrap_or_else(|_| {
            format!("mysql://{}:{}@{}:3306/{}", db_user, db_pass, db_host, db_name)
        });

        let jwt_secret = env::var("JWT_SECRET").expect("JWT_SECRET no configurada");

        let port = env::var("PORT")
            .ok()
            .and_then(|p| p.parse::<u16>().ok())
            .unwrap_or(8080);

        let ollama_api_keys_str = env::var("OLLAMA_API_KEY")
            .or_else(|_| env::var("OLLAMA_API_KEYS"))
            .unwrap_or_else(|_| "ecf947216af742ad83980686f4b96098.bWYMi2Ag1G7ZWP4UZnoi4DHl".to_string());

        let ollama_api_keys = ollama_api_keys_str
            .split(',')
            .map(|s| s.trim().to_string())
            .filter(|s| !s.is_empty())
            .collect();

        let environment = env::var("NODE_ENV").unwrap_or_default();

        // Proveedores LLM
        let groq_api_key = env::var("GROQ_API_KEY").unwrap_or_default();

        let gemini_api_key = env::var("GEMINI_API_KEY").unwrap_or_default();

        let mistral_api_key = env::var("MISTRAL_API_KEY").unwrap_or_default();

        // Token de Telegram Oficial (@CesaUnisonBot)
        let telegram_bot_token = env::var("TELEGRAM_BOT_TOKEN").unwrap_or_default();

        // Credenciales SMTP Gmail
        let smtp_gmail_user = env::var("SMTP_GMAIL_USER").unwrap_or_default();

        let smtp_gmail_pass = env::var("SMTP_GMAIL_PASS").unwrap_or_default();

        // Herramientas de Diseño Canva Connect API
        let canva_api_key = env::var("CANVA_API_KEY").unwrap_or_default();

        let canva_client_id = env::var("CANVA_CLIENT_ID").unwrap_or_default();

        let canva_client_secret = env::var("CANVA_CLIENT_SECRET").unwrap_or_default();

        let canva_redirect_uri = env::var("CANVA_REDIRECT_URI").unwrap_or_default();

        let replicate_api_key = env::var("REPLICATE_API_KEY").unwrap_or_default();

        // Meta Business API (Instagram + Facebook)
        let facebook_app_id = env::var("FACEBOOK_APP_ID").unwrap_or_default();

        let facebook_app_secret = env::var("FACEBOOK_APP_SECRET").unwrap_or_default();

        Config {
            database_url,
            jwt_secret,
            port,
            ollama_api_keys,
            environment,
            groq_api_key,
            gemini_api_key,
            mistral_api_key,
            telegram_bot_token,
            smtp_gmail_user,
            smtp_gmail_pass,
            canva_api_key,
            canva_client_id,
            canva_client_secret,
            canva_redirect_uri,
            replicate_api_key,
            facebook_app_id,
            facebook_app_secret,
        }
    }
}
