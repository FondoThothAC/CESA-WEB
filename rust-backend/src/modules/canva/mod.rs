use axum::{
    extract::{Query, State},
    response::{Html, IntoResponse, Redirect},
    routing::{get, post},
    Json, Router,
};
use base64::{engine::general_purpose::STANDARD as BASE64, Engine as _};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use sqlx::Row;

use crate::{utils::response::ApiResponse, AppState};

const CANVA_PKCE_VERIFIER: &str = "cesa_unison_canva_verifier_2026_secure_pkce_token_9876543210";
const CANVA_PKCE_CHALLENGE: &str = "5kIKO3UYYS1Wk8DcqhD4e8VFofNeq-NMaA39YCVBjqg";

#[derive(Debug, Deserialize)]
pub struct CanvaCallbackQuery {
    pub code: Option<String>,
    pub error: Option<String>,
    pub error_description: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CanvaTokenResponse {
    pub access_token: String,
    pub token_type: String,
    pub expires_in: i64,
    pub refresh_token: Option<String>,
    pub scope: Option<String>,
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. INICIAR AUTENTICACIÓN CANVA (OAuth2 PKCE)
// ─────────────────────────────────────────────────────────────────────────────

pub async fn canva_auth_start(State(state): State<AppState>) -> impl IntoResponse {
    let client_id = &state.config.canva_client_id;
    let redirect_uri = urlencoding::encode(&state.config.canva_redirect_uri);
    let scope = urlencoding::encode(
        "brandtemplate:content:read brandtemplate:meta:read design:content:read design:content:write design:meta:read asset:read asset:write folder:read folder:write profile:read"
    );

    let auth_url = format!(
        "https://www.canva.com/api/oauth/authorize?code_challenge_method=s256&response_type=code&client_id={}&redirect_uri={}&scope={}&code_challenge={}",
        client_id, redirect_uri, scope, CANVA_PKCE_CHALLENGE
    );

    Redirect::to(&auth_url)
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. CALLBACK DE CANVA (Intercambio de Code por Access Token)
// ─────────────────────────────────────────────────────────────────────────────

pub async fn canva_auth_callback(
    State(state): State<AppState>,
    Query(params): Query<CanvaCallbackQuery>,
) -> impl IntoResponse {
    if let Some(err) = params.error {
        let desc = params.error_description.unwrap_or_default();
        return Html(format!(
            r#"<!DOCTYPE html>
            <html>
            <head><meta charset="utf-8"><title>Error Canva</title>
            <style>body {{ font-family: sans-serif; background: #0f172a; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }}
            .card {{ background: #1e293b; padding: 2.5rem; border-radius: 1rem; border: 1px solid #ef4444; text-align: center; max-width: 480px; }}</style>
            </head>
            <body>
            <div class="card">
                <h1 style="color: #ef4444;">❌ Error de Autorización</h1>
                <p>Canva rechazó la vinculación: <strong>{}</strong></p>
                <p style="color: #94a3b8; font-size: 0.875rem;">{}</p>
            </div>
            </body>
            </html>"#,
            err, desc
        ));
    }

    let code = match params.code {
        Some(c) => c,
        None => return Html(r#"<h1>Error: Falta el código de autorización</h1>"#.to_string()),
    };

    // Preparar intercambio de token con Canva
    let client_id = &state.config.canva_client_id;
    let client_secret = &state.config.canva_client_secret;
    let basic_auth = BASE64.encode(format!("{}:{}", client_id, client_secret));

    let form_params = [
        ("grant_type", "authorization_code"),
        ("code_verifier", CANVA_PKCE_VERIFIER),
        ("code", &code),
        ("redirect_uri", &state.config.canva_redirect_uri),
    ];

    let token_res = state
        .http_client
        .post("https://api.canva.com/rest/v1/oauth/token")
        .header("Authorization", format!("Basic {}", basic_auth))
        .header("Content-Type", "application/x-www-form-urlencoded")
        .form(&form_params)
        .send()
        .await;

    match token_res {
        Ok(res) if res.status().is_success() => {
            if let Ok(token_data) = res.json::<CanvaTokenResponse>().await {
                let refresh_token = token_data.refresh_token.unwrap_or_default();
                
                // Guardar o actualizar en MariaDB
                let expires_at_query = "DATE_ADD(NOW(), INTERVAL ? SECOND)";
                let insert_sql = format!(
                    "INSERT INTO ia_canva_tokens (user_id, access_token, refresh_token, token_type, expires_at)
                     VALUES ('admin_cesa', ?, ?, ?, {})
                     ON DUPLICATE KEY UPDATE access_token = VALUES(access_token), refresh_token = VALUES(refresh_token), expires_at = VALUES(expires_at)",
                    expires_at_query
                );

                let _ = sqlx::query(&insert_sql)
                    .bind(&token_data.access_token)
                    .bind(&refresh_token)
                    .bind(&token_data.token_type)
                    .bind(token_data.expires_in)
                    .execute(&state.db)
                    .await;

                tracing::info!("🎨 [Canva API] Token OAuth2 guardado con éxito.");

                Html(r#"<!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <title>Canva Vinculado | CESA UNISON</title>
                    <style>
                        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0b0f19; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
                        .card { background: rgba(30, 41, 59, 0.8); backdrop-filter: blur(16px); padding: 3rem; border-radius: 1.5rem; border: 1px solid rgba(59, 130, 246, 0.3); text-align: center; max-width: 520px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
                        .badge { display: inline-block; background: linear-gradient(135deg, #00c4cc, #7d2ae8); color: white; padding: 0.5rem 1.25rem; border-radius: 9999px; font-weight: 700; font-size: 0.875rem; margin-bottom: 1.5rem; }
                        h1 { font-size: 1.75rem; margin: 0 0 1rem 0; color: #fff; }
                        p { color: #94a3b8; font-size: 1rem; line-height: 1.6; margin-bottom: 2rem; }
                        .btn { display: inline-block; background: #2563eb; color: #fff; padding: 0.875rem 2rem; border-radius: 0.75rem; text-decoration: none; font-weight: 600; transition: all 0.2s; }
                        .btn:hover { background: #1d4ed8; transform: translateY(-2px); }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <div class="badge">CANVA CONNECT API</div>
                        <h1>🎨 ¡Canva Vinculado con Éxito!</h1>
                        <p>La cuenta de Canva ha sido conectada al agente <strong>Aria (Diseño & Medios)</strong> del CESA UNISON. A partir de ahora, los flyers y carteles se generarán con las plantillas de tu Brand Kit.</p>
                        <a href="https://t.me/CesaUnisonBot" class="btn">Volver a Telegram</a>
                    </div>
                </body>
                </html>"#.to_string())
            } else {
                Html("<h1>Error parseando respuesta de tokens de Canva</h1>".to_string())
            }
        }
        Ok(res) => {
            let err_txt = res.text().await.unwrap_or_default();
            tracing::error!("❌ Error al canjear token de Canva: {}", err_txt);
            Html(format!("<h1>Error en Canva Token Exchange</h1><pre>{}</pre>", err_txt))
        }
        Err(e) => {
            tracing::error!("❌ Error de red con Canva: {}", e);
            Html(format!("<h1>Error de conexión con Canva</h1><p>{}</p>", e))
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. ESTADO DE LA CONEXIÓN DE CANVA
// ─────────────────────────────────────────────────────────────────────────────

pub async fn canva_status(State(state): State<AppState>) -> impl IntoResponse {
    let row = sqlx::query("SELECT id, expires_at, updated_at FROM ia_canva_tokens WHERE user_id = 'admin_cesa' ORDER BY id DESC LIMIT 1")
        .fetch_optional(&state.db)
        .await;

    match row {
        Ok(Some(r)) => {
            let expires_at: chrono::NaiveDateTime = r.try_get("expires_at").unwrap_or_default();
            ApiResponse::success(json!({
                "conectado": true,
                "expires_at": expires_at.to_string(),
                "mensaje": "Canva Connect API vinculado y activo."
            }))
        }
        _ => ApiResponse::success(json!({
            "conectado": false,
            "mensaje": "Canva no vinculado. Accede a /api/v1/canva/auth para conectar."
        })),
    }
}

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/canva/auth", get(canva_auth_start))
        .route("/canva/callback", get(canva_auth_callback))
        .route("/canva/status", get(canva_status))
}
