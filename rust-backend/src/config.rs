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

        let ollama_api_keys_str = env::var("OLLAMA_API_KEY")
            .or_else(|_| env::var("OLLAMA_API_KEYS"))
            .unwrap_or_else(|_| "ecf947216af742ad83980686f4b96098.bWYMi2Ag1G7ZWP4UZnoi4DHl".to_string());

        let ollama_api_keys = ollama_api_keys_str
            .split(',')
            .map(|s| s.trim().to_string())
            .filter(|s| !s.is_empty())
            .collect();

        let environment = env::var("NODE_ENV")
            .unwrap_or_else(|_| "production".to_string());

        // Proveedores LLM
        let groq_api_key = env::var("GROQ_API_KEY")
            .unwrap_or_else(|_| "REDACTED".to_string());

        let gemini_api_key = env::var("GEMINI_API_KEY")
            .unwrap_or_else(|_| "REDACTED".to_string());

        let mistral_api_key = env::var("MISTRAL_API_KEY")
            .unwrap_or_else(|_| "ugGVKl0zP6DWaf8Z15PBUGueFgnqxnkN".to_string());

        // Token de Telegram Oficial (@CesaUnisonBot)
        let telegram_bot_token = env::var("TELEGRAM_BOT_TOKEN")
            .unwrap_or_else(|_| "REDACTED".to_string());

        // Credenciales SMTP Gmail
        let smtp_gmail_user = env::var("SMTP_GMAIL_USER")
            .unwrap_or_else(|_| "cesa.unison.oficial@gmail.com".to_string());

        let smtp_gmail_pass = env::var("SMTP_GMAIL_PASS")
            .unwrap_or_else(|_| "".to_string());

        // Herramientas de Diseño Canva Connect API
        let canva_api_key = env::var("CANVA_API_KEY")
            .unwrap_or_else(|_| "mock_canva_key".to_string());

        let canva_client_id = env::var("CANVA_CLIENT_ID")
            .unwrap_or_else(|_| "OC-AZ_7xNc7bFMD".to_string());

        let canva_client_secret = env::var("CANVA_CLIENT_SECRET")
            .unwrap_or_else(|_| "REDACTED".to_string());

        let canva_redirect_uri = env::var("CANVA_REDIRECT_URI")
            .unwrap_or_else(|_| "https://cesaunison.fondothoth.com/api/v1/canva/callback".to_string());

        let replicate_api_key = env::var("REPLICATE_API_KEY")
            .unwrap_or_else(|_| "".to_string());

        // Meta Business API (Instagram + Facebook)
        let facebook_app_id = env::var("FACEBOOK_APP_ID")
            .unwrap_or_else(|_| "".to_string());

        let facebook_app_secret = env::var("FACEBOOK_APP_SECRET")
            .unwrap_or_else(|_| "".to_string());

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
