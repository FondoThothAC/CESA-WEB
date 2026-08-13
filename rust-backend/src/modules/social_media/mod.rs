// ==============================================================================
// MÓDULO DE PUBLICACIÓN EN REDES SOCIALES — CESA UNISON (RUST BACKEND)
// ==============================================================================
// Soporta publicación automática en:
//   - Instagram Business (Graph API v20.0) — Imagen + Caption
//   - Facebook Page (Graph API v20.0) — Link Post o Foto
// Flujo OAuth Meta para obtener tokens de larga duración (60 días, auto-renovable).
// ==============================================================================

use axum::{
    extract::{Query, State},
    response::{Html, IntoResponse, Redirect},
    routing::get,
    Router,
};
use reqwest::Client as HttpClient;
use serde::{Deserialize, Serialize};
use serde_json::Value;

use crate::AppState;

// ─────────────────────────────────────────────────────────────────────────────
// ESTRUCTURAS DE DATOS
// ─────────────────────────────────────────────────────────────────────────────

#[derive(Debug, Deserialize)]
pub struct MetaCallbackQuery {
    pub code: Option<String>,
    pub error: Option<String>,
    pub error_description: Option<String>,
    pub state: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MetaTokenResponse {
    pub access_token: String,
    pub token_type: Option<String>,
    pub expires_in: Option<i64>,
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. PUBLICAR EN INSTAGRAM BUSINESS (GRAPH API v20.0)
// ─────────────────────────────────────────────────────────────────────────────

/// Publica una imagen en Instagram Business Account usando la Graph API de Meta.
/// Requiere: `instagram_account_id` (IG Business Account ID), token de larga duración.
/// Retorna el ID de la publicación creada o un error descriptivo.
pub async fn publicar_en_instagram(
    http: &HttpClient,
    access_token: &str,
    instagram_account_id: &str,
    imagen_url: &str,
    caption: &str,
) -> Result<String, String> {
    tracing::info!(
        "📸 [Instagram] Subiendo imagen a cuenta '{}': {}",
        instagram_account_id, imagen_url
    );

    // Paso 1: Crear el contenedor de media (imagen) en Instagram
    let crear_media_url = format!(
        "https://graph.facebook.com/v20.0/{}/media",
        instagram_account_id
    );

    let crear_body = serde_json::json!({
        "image_url": imagen_url,
        "caption": caption,
        "access_token": access_token
    });

    let res_media = http
        .post(&crear_media_url)
        .json(&crear_body)
        .send()
        .await
        .map_err(|e| format!("Error de red al crear media en Instagram: {}", e))?;

    if !res_media.status().is_success() {
        let err = res_media.text().await.unwrap_or_default();
        return Err(format!("Error creando media en Instagram: {}", err));
    }

    let media_data: Value = res_media.json().await
        .map_err(|e| format!("Error parseando respuesta de Instagram media: {}", e))?;

    let creation_id = media_data["id"]
        .as_str()
        .ok_or_else(|| format!("Instagram no retornó un ID de media válido: {:?}", media_data))?
        .to_string();

    tracing::info!("✅ [Instagram] Media container creado: {}", creation_id);

    // Paso 2: Publicar el contenedor (hacer el post real)
    let publicar_url = format!(
        "https://graph.facebook.com/v20.0/{}/media_publish",
        instagram_account_id
    );

    let publicar_body = serde_json::json!({
        "creation_id": creation_id,
        "access_token": access_token
    });

    let res_publish = http
        .post(&publicar_url)
        .json(&publicar_body)
        .send()
        .await
        .map_err(|e| format!("Error de red al publicar en Instagram: {}", e))?;

    if !res_publish.status().is_success() {
        let err = res_publish.text().await.unwrap_or_default();
        return Err(format!("Error publicando en Instagram: {}", err));
    }

    let publish_data: Value = res_publish.json().await
        .map_err(|e| format!("Error parseando respuesta de publicación Instagram: {}", e))?;

    let post_id = publish_data["id"]
        .as_str()
        .unwrap_or(&creation_id)
        .to_string();

    tracing::info!("✅ [Instagram] Publicación exitosa. Post ID: {}", post_id);
    Ok(post_id)
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. PUBLICAR EN FACEBOOK PAGE (GRAPH API v20.0)
// ─────────────────────────────────────────────────────────────────────────────

/// Publica una foto con mensaje en una Página de Facebook.
/// Requiere: `page_id` de la Página de Facebook + Page Access Token.
pub async fn publicar_en_facebook(
    http: &HttpClient,
    page_access_token: &str,
    page_id: &str,
    imagen_url: &str,
    mensaje: &str,
) -> Result<String, String> {
    tracing::info!("📘 [Facebook] Publicando foto en página '{}'", page_id);

    let url = format!("https://graph.facebook.com/v20.0/{}/photos", page_id);

    let body = serde_json::json!({
        "url": imagen_url,
        "message": mensaje,
        "access_token": page_access_token
    });

    let res = http
        .post(&url)
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Error de red al publicar en Facebook: {}", e))?;

    if !res.status().is_success() {
        let err = res.text().await.unwrap_or_default();
        return Err(format!("Error publicando en Facebook: {}", err));
    }

    let data: Value = res.json().await
        .map_err(|e| format!("Error parseando respuesta de Facebook: {}", e))?;

    let post_id = data["post_id"]
        .as_str()
        .or_else(|| data["id"].as_str())
        .unwrap_or("unknown")
        .to_string();

    tracing::info!("✅ [Facebook] Publicación exitosa. Post ID: {}", post_id);
    Ok(post_id)
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. OAUTH META — INICIAR AUTORIZACIÓN
// ─────────────────────────────────────────────────────────────────────────────

/// Redirige al flujo de autorización OAuth2 de Meta (Facebook/Instagram).
/// Solicita permisos para: publicar en páginas, gestionar Instagram, leer métricas.
pub async fn meta_auth_start(State(state): State<AppState>) -> impl IntoResponse {
    let client_id = &state.config.facebook_app_id;
    let redirect_uri_str = "https://cesaunison.fondothoth.com/api/v1/social/meta/callback";
    let redirect_uri = urlencoding::encode(redirect_uri_str);

    // Permisos necesarios para Instagram Business + Facebook Pages
    let scope = urlencoding::encode(
        "pages_show_list,pages_read_engagement,pages_manage_posts,instagram_basic,instagram_content_publish,instagram_manage_comments,public_profile"
    );

    let auth_url = format!(
        "https://www.facebook.com/v20.0/dialog/oauth?client_id={}&redirect_uri={}&scope={}&response_type=code&state=cesa_meta_oauth",
        client_id, redirect_uri, scope
    );

    if client_id.is_empty() {
        return Html(r#"<!DOCTYPE html>
        <html><head><meta charset="utf-8"><title>Meta OAuth | CESA UNISON</title>
        <style>body{font-family:sans-serif;background:#0b0f19;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;}
        .card{background:#1e293b;padding:2rem;border-radius:1rem;border:1px solid #ef4444;text-align:center;max-width:480px;}</style>
        </head><body><div class="card">
        <h1 style="color:#ef4444">⚠️ App de Meta no configurada</h1>
        <p>El administrador debe configurar <code>FACEBOOK_APP_ID</code> y <code>FACEBOOK_APP_SECRET</code> en las variables de entorno del servidor.</p>
        <p style="color:#94a3b8;font-size:.875rem">Crea tu App en <a href="https://developers.facebook.com" style="color:#60a5fa">developers.facebook.com</a> y activa los permisos de Instagram Business.</p>
        </div></body></html>"#.to_string()).into_response()
    }

    Redirect::to(&auth_url).into_response()
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. OAUTH META — CALLBACK Y GUARDADO DE TOKEN
// ─────────────────────────────────────────────────────────────────────────────

/// Recibe el código de autorización de Meta, lo intercambia por un token de larga duración
/// y guarda los tokens de Instagram y Facebook en `social_tokens`.
pub async fn meta_auth_callback(
    State(state): State<AppState>,
    Query(params): Query<MetaCallbackQuery>,
) -> impl IntoResponse {
    // Manejo de error de autorización
    if let Some(err) = params.error {
        let desc = params.error_description.unwrap_or_default();
        return Html(format!(
            r#"<!DOCTYPE html><html><head><meta charset="utf-8"><title>Error Meta OAuth</title>
            <style>body{{font-family:sans-serif;background:#0b0f19;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;}}
            .card{{background:#1e293b;padding:2rem;border-radius:1rem;border:1px solid #ef4444;text-align:center;max-width:480px;}}</style>
            </head><body><div class="card">
            <h1 style="color:#ef4444">❌ Error de Autorización Meta</h1>
            <p>{}</p><p style="color:#94a3b8">{}</p>
            </div></body></html>"#,
            err, desc
        )).into_response();
    }

    let code = match params.code {
        Some(c) => c,
        None => return Html("<h1>Error: Falta el código de autorización de Meta.</h1>".to_string()).into_response(),
    };

    // Paso 1: Intercambiar code por short-lived token
    let token_url = "https://graph.facebook.com/v20.0/oauth/access_token";
    let redirect_uri = "https://cesaunison.fondothoth.com/api/v1/social/meta/callback";

    let token_res = state.http_client
        .get(token_url)
        .query(&[
            ("client_id", state.config.facebook_app_id.as_str()),
            ("client_secret", state.config.facebook_app_secret.as_str()),
            ("redirect_uri", redirect_uri),
            ("code", &code),
        ])
        .send()
        .await;

    let short_token = match token_res {
        Ok(r) if r.status().is_success() => {
            match r.json::<MetaTokenResponse>().await {
                Ok(t) => t.access_token,
                Err(e) => return Html(format!("<h1>Error parseando token Meta: {}</h1>", e)).into_response(),
            }
        }
        Ok(r) => {
            let err = r.text().await.unwrap_or_default();
            return Html(format!("<h1>Error obteniendo token de Meta: {}</h1><pre>{}</pre>", code, err)).into_response();
        }
        Err(e) => return Html(format!("<h1>Error de red con Meta: {}</h1>", e)).into_response(),
    };

    // Paso 2: Intercambiar por long-lived token (60 días)
    let long_token_res = state.http_client
        .get(token_url)
        .query(&[
            ("grant_type", "fb_exchange_token"),
            ("client_id", state.config.facebook_app_id.as_str()),
            ("client_secret", state.config.facebook_app_secret.as_str()),
            ("fb_exchange_token", &short_token),
        ])
        .send()
        .await;

    let (long_token, expires_in) = match long_token_res {
        Ok(r) if r.status().is_success() => {
            match r.json::<Value>().await {
                Ok(data) => {
                    let token = data["access_token"].as_str().unwrap_or(&short_token).to_string();
                    let exp = data["expires_in"].as_i64().unwrap_or(5184000); // 60 días default
                    (token, exp)
                }
                Err(_) => (short_token.clone(), 5184000),
            }
        }
        _ => (short_token.clone(), 5184000),
    };

    // Paso 3: Obtener las Páginas de Facebook del usuario
    let pages_res = state.http_client
        .get("https://graph.facebook.com/v20.0/me/accounts")
        .query(&[("access_token", long_token.as_str())])
        .send()
        .await;

    let mut paginas_guardadas = Vec::<String>::new();

    if let Ok(r) = pages_res {
        if let Ok(data) = r.json::<Value>().await {
            if let Some(pages) = data["data"].as_array() {
                for page in pages {
                    let page_id = page["id"].as_str().unwrap_or("").to_string();
                    let page_name = page["name"].as_str().unwrap_or("Página CESA").to_string();
                    let page_token = page["access_token"].as_str().unwrap_or(&long_token).to_string();

                    // Guardar token de Facebook Page
                    let _ = sqlx::query(
                        r#"INSERT INTO social_tokens (plataforma, account_id, account_name, access_token, expires_at, is_active)
                           VALUES ('facebook', ?, ?, ?, DATE_ADD(NOW(), INTERVAL ? SECOND), 1)
                           ON DUPLICATE KEY UPDATE access_token = VALUES(access_token), account_name = VALUES(account_name), expires_at = VALUES(expires_at), is_active = 1"#
                    )
                    .bind(&page_id)
                    .bind(&page_name)
                    .bind(&page_token)
                    .bind(expires_in)
                    .execute(&state.db)
                    .await;

                    // Obtener la cuenta de Instagram Business vinculada a esta página
                    let ig_res = state.http_client
                        .get(format!("https://graph.facebook.com/v20.0/{}/instagram_accounts", page_id))
                        .query(&[("fields", "id,username"), ("access_token", page_token.as_str())])
                        .send()
                        .await;

                    if let Ok(ig_r) = ig_res {
                        if let Ok(ig_data) = ig_r.json::<Value>().await {
                            if let Some(ig_accounts) = ig_data["data"].as_array() {
                                for ig in ig_accounts {
                                    let ig_id = ig["id"].as_str().unwrap_or("").to_string();
                                    let ig_user = ig["username"].as_str().unwrap_or("cesaunison").to_string();

                                    // Guardar token de Instagram Business
                                    let _ = sqlx::query(
                                        r#"INSERT INTO social_tokens (plataforma, account_id, account_name, access_token, expires_at, is_active)
                                           VALUES ('instagram', ?, ?, ?, DATE_ADD(NOW(), INTERVAL ? SECOND), 1)
                                           ON DUPLICATE KEY UPDATE access_token = VALUES(access_token), account_name = VALUES(account_name), expires_at = VALUES(expires_at), is_active = 1"#
                                    )
                                    .bind(&ig_id)
                                    .bind(&ig_user)
                                    .bind(&page_token) // Instagram usa el Page Token de la página vinculada
                                    .bind(expires_in)
                                    .execute(&state.db)
                                    .await;

                                    paginas_guardadas.push(format!("Instagram @{}", ig_user));
                                    tracing::info!("✅ [Meta OAuth] Instagram Business guardado: @{} ({})", ig_user, ig_id);
                                }
                            }
                        }
                    }

                    paginas_guardadas.push(format!("Facebook: {}", page_name));
                    tracing::info!("✅ [Meta OAuth] Facebook Page guardada: {} ({})", page_name, page_id);
                }
            }
        }
    }

    let cuentas_html = paginas_guardadas
        .iter()
        .map(|c| format!("<li>✅ {}</li>", c))
        .collect::<Vec<_>>()
        .join("\n");

    Html(format!(r#"<!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Meta Vinculado | CESA UNISON</title>
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0b0f19; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }}
            .card {{ background: rgba(30, 41, 59, 0.8); backdrop-filter: blur(16px); padding: 3rem; border-radius: 1.5rem; border: 1px solid rgba(59, 130, 246, 0.3); text-align: center; max-width: 520px; box-shadow: 0 25px 50px -12px rgba(0,0,0,.5); }}
            .badge {{ display: inline-block; background: linear-gradient(135deg, #1877f2, #e1306c); color: white; padding: .5rem 1.25rem; border-radius: 9999px; font-weight: 700; font-size: .875rem; margin-bottom: 1.5rem; }}
            h1 {{ font-size: 1.75rem; margin: 0 0 1rem 0; }}
            p {{ color: #94a3b8; line-height: 1.6; margin-bottom: 1.5rem; }}
            ul {{ text-align: left; color: #e2e8f0; list-style: none; padding: 0; margin-bottom: 2rem; }}
            li {{ padding: .5rem 0; border-bottom: 1px solid rgba(255,255,255,.05); }}
            .btn {{ display: inline-block; background: #2563eb; color: #fff; padding: .875rem 2rem; border-radius: .75rem; text-decoration: none; font-weight: 600; }}
        </style>
    </head>
    <body>
        <div class="card">
            <div class="badge">META BUSINESS API</div>
            <h1>📱 ¡Redes Sociales Vinculadas!</h1>
            <p>Las siguientes cuentas quedan conectadas al agente <strong>Aria (Diseño & Medios)</strong>:</p>
            <ul>{}</ul>
            <p style="font-size:.875rem">A partir de ahora, al aprobar un diseño en Telegram o en el Panel Admin, Aria publicará automáticamente en tus redes.</p>
            <a href="https://cesaunison.fondothoth.com/dashboard/ia-hub" class="btn">Ver Panel IA</a>
        </div>
    </body>
    </html>"#, cuentas_html)).into_response()
}

// ─────────────────────────────────────────────────────────────────────────────
// ROUTER
// ─────────────────────────────────────────────────────────────────────────────

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/social/meta/auth", get(meta_auth_start))
        .route("/social/meta/callback", get(meta_auth_callback))
}
