// ==============================================================================
// MÓDULO DE ADMINISTRACIÓN & MODO DIOS — CESA UNISON (RUST BACKEND)
// ==============================================================================
// Incluye endpoints de:
//   - Panel de usuarios (lista, rol, activo)
//   - Telemetría general (estadísticas de la plataforma)
//   - Hub IA: historial de sesiones, cola de aprobaciones, estado de integraciones
//   - Redes Sociales: OAuth Meta callback y estado de conexión
// ==============================================================================

use crate::{
    state::AppState,
    utils::response::ApiResponse,
};
use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::IntoResponse,
    routing::{get, patch, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

use jsonwebtoken::{decode, DecodingKey, Validation};

// ─────────────────────────────────────────────────────────────────────────────
// ESTRUCTURAS DE DATOS
// ─────────────────────────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct AdminUserRecord {
    pub id: u64,
    pub nombre_completo: String,
    pub email: String,
    pub expediente: Option<String>,
    pub matricula: Option<String>,
    pub rol: String,
    pub carrera: Option<String>,
    pub activo: Option<bool>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TelemetriaStats {
    pub total_usuarios: i64,
    pub total_noticias: i64,
    pub total_emprendimientos: i64,
    pub total_votos: i64,
    pub total_mensajes_ia: i64,
    pub godmode_status: String,
}

#[derive(Debug, Deserialize)]
pub struct AdminUsersQueryParams {
    pub rol: Option<String>,
    pub q: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct CambiarRolRequest {
    pub usuario_id: u64,
    pub nuevo_rol: String,
}

// ─────────────────────────────────────────────────────────────────────────────
// STRUCTS PARA EL HUB DE IA
// ─────────────────────────────────────────────────────────────────────────────

/// Registro de sesión del swarm de agentes IA para el historial del super admin
#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct IaSesionRecord {
    pub id: i64,
    pub session_id: String,
    pub canal: String,
    pub rol: String,
    pub mensaje: String,
    pub herramientas_usadas: Option<String>,
    pub imagen_url: Option<String>,
    pub creado_en: String,
}

/// Registro de aprobación pendiente (flyer, correo, etc.)
#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct AprobacionRecord {
    pub id: i64,
    pub agent_id: i32,
    pub tipo: String,
    pub titulo: String,
    pub contenido_preview: String,
    pub media_url: Option<String>,
    pub estado: String,
    pub feedback_humano: Option<String>,
    pub created_at: String,
}

/// Estado de una integración de red social o servicio externo
#[derive(Debug, Serialize, Deserialize)]
pub struct IntegracionEstado {
    pub plataforma: String,
    pub conectado: bool,
    pub cuenta: Option<String>,
    pub expires_at: Option<String>,
    pub accion_url: Option<String>,
}

/// Estadísticas específicas del Hub IA
#[derive(Debug, Serialize, Deserialize)]
pub struct IaHubStats {
    pub total_sesiones: i64,
    pub sesiones_telegram: i64,
    pub sesiones_web: i64,
    pub aprobaciones_pendientes: i64,
    pub aprobaciones_aprobadas: i64,
    pub aprobaciones_rechazadas: i64,
    pub canva_conectado: bool,
    pub instagram_conectado: bool,
    pub facebook_conectado: bool,
}

#[derive(Debug, Deserialize)]
pub struct IaHistorialParams {
    pub page: Option<i64>,
    pub limit: Option<i64>,
    pub canal: Option<String>,
    pub session_id: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct AprobacionFeedbackRequest {
    pub feedback: Option<String>,
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: Verificar JWT y rol admin/mesa_directiva
// ─────────────────────────────────────────────────────────────────────────────

fn verificar_admin(headers: &axum::http::HeaderMap, jwt_secret: &str) -> Result<String, &'static str> {
    let token_str = headers
        .get(axum::http::header::AUTHORIZATION)
        .and_then(|v| v.to_str().ok())
        .and_then(|s| s.strip_prefix("Bearer "))
        .ok_or("Token requerido.")?;

    let key = DecodingKey::from_secret(jwt_secret.as_bytes());
    let mut validation = Validation::default();
    validation.validate_exp = true;

    let claims = decode::<crate::modules::auth::Claims>(token_str, &key, &validation)
        .map_err(|_| "Token inválido.")?
        .claims;

    let rol = claims.rol;
    if rol != "admin" && rol != "mesa_directiva" {
        return Err("Acceso denegado. Se requieren permisos de administrador.");
    }
    Ok(rol)
}

// ─────────────────────────────────────────────────────────────────────────────
// HANDLERS DE USUARIOS (YA EXISTENTES)
// ─────────────────────────────────────────────────────────────────────────────

/// Listar usuarios en el panel de administración
pub async fn list_admin_users(
    State(state): State<AppState>,
    axum::http::request::Parts { headers, .. }: axum::http::request::Parts,
    Query(params): Query<AdminUsersQueryParams>,
) -> impl IntoResponse {
    if let Err(e) = verificar_admin(&headers, &state.config.jwt_secret) {
        return ApiResponse::<()>::error(StatusCode::UNAUTHORIZED, e).into_response();
    }

    let search_pattern = format!("%{}%", params.q.unwrap_or_default());

    let result = if let Some(ref r) = params.rol {
        sqlx::query_as::<_, AdminUserRecord>(
            r#"
            SELECT id, nombre_completo, email, expediente, matricula, rol, carrera, activo
            FROM usuarios
            WHERE rol = ? AND (nombre_completo LIKE ? OR email LIKE ? OR expediente LIKE ?)
            ORDER BY nombre_completo ASC
            "#,
        )
        .bind(r)
        .bind(&search_pattern)
        .bind(&search_pattern)
        .bind(&search_pattern)
        .fetch_all(&state.db)
        .await
    } else {
        sqlx::query_as::<_, AdminUserRecord>(
            r#"
            SELECT id, nombre_completo, email, expediente, matricula, rol, carrera, activo
            FROM usuarios
            WHERE nombre_completo LIKE ? OR email LIKE ? OR expediente LIKE ?
            ORDER BY nombre_completo ASC
            "#,
        )
        .bind(&search_pattern)
        .bind(&search_pattern)
        .bind(&search_pattern)
        .fetch_all(&state.db)
        .await
    };

    match result {
        Ok(users) => ApiResponse::success(users).into_response(),
        Err(err) => {
            tracing::error!("Error al listar usuarios admin: {:?}", err);
            ApiResponse::<()>::error(StatusCode::INTERNAL_SERVER_ERROR, "Error al consultar el directorio de usuarios").into_response()
        }
    }
}

/// Telemetría general del sistema para Modo Dios
pub async fn get_telemetria_stats(
    State(state): State<AppState>,
    axum::http::request::Parts { headers, .. }: axum::http::request::Parts,
) -> impl IntoResponse {
    if let Err(e) = verificar_admin(&headers, &state.config.jwt_secret) {
        return ApiResponse::<()>::error(StatusCode::FORBIDDEN, e).into_response();
    }

    let total_usuarios: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM usuarios")
        .fetch_one(&state.db).await.unwrap_or(0);
    let total_noticias: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM noticias")
        .fetch_one(&state.db).await.unwrap_or(0);
    let total_emprendimientos: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM emprendimientos")
        .fetch_one(&state.db).await.unwrap_or(0);
    let total_votos: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM votos_anonimos")
        .fetch_one(&state.db).await.unwrap_or(0);
    let total_mensajes_ia: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM ia_agentes_sesiones")
        .fetch_one(&state.db).await.unwrap_or(0);

    ApiResponse::success(TelemetriaStats {
        total_usuarios,
        total_noticias,
        total_emprendimientos,
        total_votos,
        total_mensajes_ia,
        godmode_status: "ACTIVO - CESA UNISON GODMODE v8.0".to_string(),
    }).into_response()
}

/// Cambiar rol de usuario (solo admin maestro)
pub async fn cambiar_rol(
    State(state): State<AppState>,
    axum::http::request::Parts { headers, .. }: axum::http::request::Parts,
    Json(payload): Json<CambiarRolRequest>,
) -> impl IntoResponse {
    let token_str = match headers
        .get(axum::http::header::AUTHORIZATION)
        .and_then(|v| v.to_str().ok())
        .and_then(|s| s.strip_prefix("Bearer "))
    {
        Some(t) => t.to_string(),
        None => return ApiResponse::<()>::error(StatusCode::UNAUTHORIZED, "Token requerido.").into_response(),
    };

    let key = DecodingKey::from_secret(state.config.jwt_secret.as_bytes());
    let mut validation = Validation::default();
    validation.validate_exp = true;

    let claims = match decode::<crate::modules::auth::Claims>(&token_str, &key, &validation) {
        Ok(d) => d.claims,
        Err(_) => return ApiResponse::<()>::error(StatusCode::UNAUTHORIZED, "Token inválido.").into_response(),
    };

    if claims.rol != "admin" {
        return ApiResponse::<()>::error(StatusCode::FORBIDDEN, "Solo los Administradores Maestros pueden modificar roles.").into_response();
    }

    match sqlx::query("UPDATE usuarios SET rol = ? WHERE id = ?")
        .bind(&payload.nuevo_rol)
        .bind(payload.usuario_id)
        .execute(&state.db)
        .await
    {
        Ok(_) => ApiResponse::success("Rol de usuario actualizado correctamente.").into_response(),
        Err(err) => {
            tracing::error!("Error al actualizar rol: {:?}", err);
            ApiResponse::<()>::error(StatusCode::INTERNAL_SERVER_ERROR, "Error al modificar el rol de usuario").into_response()
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// HUB IA — ESTADÍSTICAS
// ─────────────────────────────────────────────────────────────────────────────

/// Estadísticas completas del Hub de IA para el super admin
pub async fn get_ia_hub_stats(
    State(state): State<AppState>,
    axum::http::request::Parts { headers, .. }: axum::http::request::Parts,
) -> impl IntoResponse {
    if let Err(e) = verificar_admin(&headers, &state.config.jwt_secret) {
        return ApiResponse::<()>::error(StatusCode::FORBIDDEN, e).into_response();
    }

    // Conteos de sesiones por canal
    let total_sesiones: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM ia_agentes_sesiones WHERE rol = 'user'")
        .fetch_one(&state.db).await.unwrap_or(0);
    let sesiones_telegram: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM ia_agentes_sesiones WHERE canal = 'telegram' AND rol = 'user'")
        .fetch_one(&state.db).await.unwrap_or(0);
    let sesiones_web: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM ia_agentes_sesiones WHERE canal = 'web' AND rol = 'user'")
        .fetch_one(&state.db).await.unwrap_or(0);

    // Conteos de aprobaciones
    let aprobaciones_pendientes: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM zeroclaw_pending_approvals WHERE estado = 'pendiente'")
        .fetch_one(&state.db).await.unwrap_or(0);
    let aprobaciones_aprobadas: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM zeroclaw_pending_approvals WHERE estado = 'aprobado'")
        .fetch_one(&state.db).await.unwrap_or(0);
    let aprobaciones_rechazadas: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM zeroclaw_pending_approvals WHERE estado = 'rechazado'")
        .fetch_one(&state.db).await.unwrap_or(0);

    // Estado de integraciones
    let canva_conectado: bool = sqlx::query_scalar::<_, i64>(
        "SELECT COUNT(*) FROM ia_canva_tokens WHERE user_id = 'admin_cesa' AND expires_at > NOW()"
    )
    .fetch_one(&state.db).await.unwrap_or(0) > 0;

    let instagram_conectado: bool = sqlx::query_scalar::<_, i64>(
        "SELECT COUNT(*) FROM social_tokens WHERE plataforma = 'instagram' AND is_active = 1"
    )
    .fetch_one(&state.db).await.unwrap_or(0) > 0;

    let facebook_conectado: bool = sqlx::query_scalar::<_, i64>(
        "SELECT COUNT(*) FROM social_tokens WHERE plataforma = 'facebook' AND is_active = 1"
    )
    .fetch_one(&state.db).await.unwrap_or(0) > 0;

    ApiResponse::success(IaHubStats {
        total_sesiones,
        sesiones_telegram,
        sesiones_web,
        aprobaciones_pendientes,
        aprobaciones_aprobadas,
        aprobaciones_rechazadas,
        canva_conectado,
        instagram_conectado,
        facebook_conectado,
    }).into_response()
}

// ─────────────────────────────────────────────────────────────────────────────
// HUB IA — HISTORIAL DE CHATS PAGINADO
// ─────────────────────────────────────────────────────────────────────────────

/// Historial paginado de todas las conversaciones con los agentes IA
pub async fn get_ia_historial(
    State(state): State<AppState>,
    axum::http::request::Parts { headers, .. }: axum::http::request::Parts,
    Query(params): Query<IaHistorialParams>,
) -> impl IntoResponse {
    if let Err(e) = verificar_admin(&headers, &state.config.jwt_secret) {
        return ApiResponse::<()>::error(StatusCode::FORBIDDEN, e).into_response();
    }

    let page = params.page.unwrap_or(1).max(1);
    let limit = params.limit.unwrap_or(30).min(100);
    let offset = (page - 1) * limit;

    // Construir query dinámico según filtros opcionales
    let (query_str, canal_filter) = if let Some(ref canal) = params.canal {
        (
            "SELECT id, session_id, canal, rol, mensaje, herramientas_usadas, imagen_url, DATE_FORMAT(creado_en, '%Y-%m-%d %H:%i:%s') as creado_en FROM ia_agentes_sesiones WHERE canal = ? ORDER BY creado_en DESC LIMIT ? OFFSET ?",
            Some(canal.clone()),
        )
    } else if let Some(ref sid) = params.session_id {
        (
            "SELECT id, session_id, canal, rol, mensaje, herramientas_usadas, imagen_url, DATE_FORMAT(creado_en, '%Y-%m-%d %H:%i:%s') as creado_en FROM ia_agentes_sesiones WHERE session_id = ? ORDER BY creado_en ASC LIMIT ? OFFSET ?",
            Some(sid.clone()),
        )
    } else {
        (
            "SELECT id, session_id, canal, rol, mensaje, herramientas_usadas, imagen_url, DATE_FORMAT(creado_en, '%Y-%m-%d %H:%i:%s') as creado_en FROM ia_agentes_sesiones ORDER BY creado_en DESC LIMIT ? OFFSET ?",
            None,
        )
    };

    // Ejecutar query con o sin filtro de canal/session_id
    let result = if let Some(filtro) = canal_filter {
        sqlx::query_as::<_, IaSesionRecord>(query_str)
            .bind(&filtro)
            .bind(limit)
            .bind(offset)
            .fetch_all(&state.db)
            .await
    } else {
        sqlx::query_as::<_, IaSesionRecord>(query_str)
            .bind(limit)
            .bind(offset)
            .fetch_all(&state.db)
            .await
    };

    let total: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM ia_agentes_sesiones")
        .fetch_one(&state.db).await.unwrap_or(0);

    match result {
        Ok(registros) => ApiResponse::success(serde_json::json!({
            "data": registros,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "pages": (total as f64 / limit as f64).ceil() as i64
            }
        })).into_response(),
        Err(err) => {
            tracing::error!("Error al consultar historial IA: {:?}", err);
            ApiResponse::<()>::error(StatusCode::INTERNAL_SERVER_ERROR, "Error al cargar el historial de IA").into_response()
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// HUB IA — COLA DE APROBACIONES (HUMAN-IN-THE-LOOP)
// ─────────────────────────────────────────────────────────────────────────────

/// Lista la cola de aprobaciones pendientes (flyers, correos, publicaciones)
pub async fn get_aprobaciones(
    State(state): State<AppState>,
    axum::http::request::Parts { headers, .. }: axum::http::request::Parts,
    Query(params): Query<std::collections::HashMap<String, String>>,
) -> impl IntoResponse {
    if let Err(e) = verificar_admin(&headers, &state.config.jwt_secret) {
        return ApiResponse::<()>::error(StatusCode::FORBIDDEN, e).into_response();
    }

    let estado = params.get("estado").map(|s| s.as_str()).unwrap_or("pendiente");

    let rows = sqlx::query_as::<_, AprobacionRecord>(
        r#"
        SELECT id, agent_id, tipo, titulo, contenido_preview, media_url,
               estado, feedback_humano,
               DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at
        FROM zeroclaw_pending_approvals
        WHERE estado = ?
        ORDER BY created_at DESC
        LIMIT 50
        "#,
    )
    .bind(estado)
    .fetch_all(&state.db)
    .await;

    match rows {
        Ok(r) => ApiResponse::success(r).into_response(),
        Err(err) => {
            tracing::error!("Error al cargar aprobaciones: {:?}", err);
            ApiResponse::<()>::error(StatusCode::INTERNAL_SERVER_ERROR, "Error al cargar la cola de aprobaciones").into_response()
        }
    }
}

/// Aprobar un diseño/acción pendiente (y opcionalmente disparar publicación en redes)
pub async fn aprobar_aprobacion(
    State(state): State<AppState>,
    axum::http::request::Parts { headers, .. }: axum::http::request::Parts,
    Path(id): Path<i64>,
) -> impl IntoResponse {
    if let Err(e) = verificar_admin(&headers, &state.config.jwt_secret) {
        return ApiResponse::<()>::error(StatusCode::FORBIDDEN, e).into_response();
    }

    // Obtener el registro para poder publicar en redes si hay token activo
    let registro = sqlx::query_as::<_, AprobacionRecord>(
        "SELECT id, agent_id, tipo, titulo, contenido_preview, media_url, estado, feedback_humano, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at FROM zeroclaw_pending_approvals WHERE id = ?"
    )
    .bind(id)
    .fetch_optional(&state.db)
    .await
    .unwrap_or(None);

    // Actualizar estado a 'aprobado'
    let _ = sqlx::query("UPDATE zeroclaw_pending_approvals SET estado = 'aprobado' WHERE id = ?")
        .bind(id)
        .execute(&state.db)
        .await;

    // Si es un flyer de Canva y hay token de Instagram activo, intentar publicar
    let mut publicado_en = Vec::<String>::new();
    if let Some(ref reg) = registro {
        if reg.tipo == "flyer_canva" {
            if let Some(ref media_url) = reg.media_url {
                // Verificar token de Instagram
                let ig_token: Option<String> = sqlx::query_scalar(
                    "SELECT access_token FROM social_tokens WHERE plataforma = 'instagram' AND is_active = 1 LIMIT 1"
                )
                .fetch_optional(&state.db)
                .await
                .unwrap_or(None);

                let ig_page_id: Option<String> = sqlx::query_scalar(
                    "SELECT account_id FROM social_tokens WHERE plataforma = 'instagram' AND is_active = 1 LIMIT 1"
                )
                .fetch_optional(&state.db)
                .await
                .unwrap_or(None);

                if let (Some(token), Some(page_id)) = (ig_token, ig_page_id) {
                    // Intentar publicar en Instagram via Graph API
                    let caption = format!(
                        "{}\n\n{}\n\n#CESAUNISON #UNISON #Hermosillo #VidaEstudiantil",
                        reg.titulo, reg.contenido_preview
                    );

                    match crate::modules::social_media::publicar_en_instagram(
                        &state.http_client,
                        &token,
                        &page_id,
                        media_url,
                        &caption,
                    ).await {
                        Ok(post_id) => {
                            tracing::info!("✅ [Instagram] Publicación exitosa: {}", post_id);
                            publicado_en.push(format!("Instagram (post_id: {})", post_id));
                        }
                        Err(e) => {
                            tracing::warn!("⚠️  [Instagram] Error al publicar: {}", e);
                        }
                    }
                }
            }
        }
    }

    ApiResponse::success(serde_json::json!({
        "mensaje": "Aprobación procesada exitosamente.",
        "id": id,
        "publicado_en": publicado_en
    })).into_response()
}

/// Rechazar un diseño/acción con feedback opcional
pub async fn rechazar_aprobacion(
    State(state): State<AppState>,
    axum::http::request::Parts { headers, .. }: axum::http::request::Parts,
    Path(id): Path<i64>,
    Json(payload): Json<AprobacionFeedbackRequest>,
) -> impl IntoResponse {
    if let Err(e) = verificar_admin(&headers, &state.config.jwt_secret) {
        return ApiResponse::<()>::error(StatusCode::FORBIDDEN, e).into_response();
    }

    let _ = sqlx::query(
        "UPDATE zeroclaw_pending_approvals SET estado = 'rechazado', feedback_humano = ? WHERE id = ?"
    )
    .bind(payload.feedback.as_deref().unwrap_or(""))
    .bind(id)
    .execute(&state.db)
    .await;

    ApiResponse::success(serde_json::json!({
        "mensaje": "Aprobación rechazada.",
        "id": id
    })).into_response()
}

// ─────────────────────────────────────────────────────────────────────────────
// HUB IA — ESTADO DE INTEGRACIONES
// ─────────────────────────────────────────────────────────────────────────────

/// Retorna el estado de todas las integraciones (Canva, Instagram, Facebook, Gmail, X)
pub async fn get_integraciones_estado(
    State(state): State<AppState>,
    axum::http::request::Parts { headers, .. }: axum::http::request::Parts,
) -> impl IntoResponse {
    if let Err(e) = verificar_admin(&headers, &state.config.jwt_secret) {
        return ApiResponse::<()>::error(StatusCode::FORBIDDEN, e).into_response();
    }

    let mut integraciones: Vec<IntegracionEstado> = Vec::new();

    // 1. Canva Connect API
    let canva = sqlx::query("SELECT expires_at FROM ia_canva_tokens WHERE user_id = 'admin_cesa' ORDER BY id DESC LIMIT 1")
        .fetch_optional(&state.db).await.unwrap_or(None);
    let (canva_ok, canva_exp) = if let Some(row) = canva {
        let exp: chrono::NaiveDateTime = sqlx::Row::try_get(&row, "expires_at").unwrap_or_default();
        let activo = exp > chrono::Utc::now().naive_utc();
        (activo, Some(exp.to_string()))
    } else {
        (false, None)
    };
    integraciones.push(IntegracionEstado {
        plataforma: "canva".to_string(),
        conectado: canva_ok,
        cuenta: Some("Brand Kit CESA UNISON".to_string()),
        expires_at: canva_exp,
        accion_url: if canva_ok { None } else { Some("/api/v1/canva/auth".to_string()) },
    });

    // 2. Instagram
    let ig = sqlx::query("SELECT account_name, expires_at FROM social_tokens WHERE plataforma = 'instagram' AND is_active = 1 LIMIT 1")
        .fetch_optional(&state.db).await.unwrap_or(None);
    let (ig_ok, ig_cuenta, ig_exp) = if let Some(row) = ig {
        let cuenta: Option<String> = sqlx::Row::try_get(&row, "account_name").ok();
        let exp: Option<chrono::NaiveDateTime> = sqlx::Row::try_get(&row, "expires_at").ok();
        (true, cuenta, exp.map(|e| e.to_string()))
    } else {
        (false, None, None)
    };
    integraciones.push(IntegracionEstado {
        plataforma: "instagram".to_string(),
        conectado: ig_ok,
        cuenta: ig_cuenta,
        expires_at: ig_exp,
        accion_url: if ig_ok { None } else { Some("/api/v1/social/meta/auth".to_string()) },
    });

    // 3. Facebook
    let fb = sqlx::query("SELECT account_name, expires_at FROM social_tokens WHERE plataforma = 'facebook' AND is_active = 1 LIMIT 1")
        .fetch_optional(&state.db).await.unwrap_or(None);
    let (fb_ok, fb_cuenta, fb_exp) = if let Some(row) = fb {
        let cuenta: Option<String> = sqlx::Row::try_get(&row, "account_name").ok();
        let exp: Option<chrono::NaiveDateTime> = sqlx::Row::try_get(&row, "expires_at").ok();
        (true, cuenta, exp.map(|e| e.to_string()))
    } else {
        (false, None, None)
    };
    integraciones.push(IntegracionEstado {
        plataforma: "facebook".to_string(),
        conectado: fb_ok,
        cuenta: fb_cuenta,
        expires_at: fb_exp,
        accion_url: if fb_ok { None } else { Some("/api/v1/social/meta/auth".to_string()) },
    });

    // 4. Gmail (verificamos solo si la variable de entorno está configurada)
    let gmail_ok = !state.config.smtp_gmail_user.is_empty() && !state.config.smtp_gmail_pass.is_empty();
    integraciones.push(IntegracionEstado {
        plataforma: "gmail".to_string(),
        conectado: gmail_ok,
        cuenta: if gmail_ok { Some(state.config.smtp_gmail_user.clone()) } else { None },
        expires_at: None,
        accion_url: None,
    });

    ApiResponse::success(integraciones).into_response()
}

// ─────────────────────────────────────────────────────────────────────────────
// ROUTER DE RUTAS
// ─────────────────────────────────────────────────────────────────────────────

pub fn router() -> Router<AppState> {
    Router::new()
        // Rutas ya existentes de administración de usuarios
        .route("/admin/users", get(list_admin_users))
        .route("/admin/telemetry", get(get_telemetria_stats))
        .route("/admin/stats", get(get_telemetria_stats))
        .route("/admin/role", post(cambiar_rol))
        // Hub IA — Estadísticas y historial
        .route("/admin/ia/stats", get(get_ia_hub_stats))
        .route("/admin/ia/historial", get(get_ia_historial))
        // Hub IA — Cola de aprobaciones Human-in-the-Loop
        .route("/admin/ia/aprobaciones", get(get_aprobaciones))
        .route("/admin/ia/aprobaciones/:id/aprobar", patch(aprobar_aprobacion))
        .route("/admin/ia/aprobaciones/:id/rechazar", patch(rechazar_aprobacion))
        // Hub IA — Estado de integraciones
        .route("/admin/ia/integraciones", get(get_integraciones_estado))
}
