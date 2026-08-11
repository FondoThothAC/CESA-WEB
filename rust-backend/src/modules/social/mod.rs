// ==============================================================================
// MÓDULO DE MURO SOCIAL TIMELINE & MENSAJERÍA DIRECTA — CESA UNISON (RUST BACKEND)
// ==============================================================================

use crate::{state::AppState, utils::response::ApiResponse};
use axum::{
    extract::{Query, State},
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use jsonwebtoken::{decode, DecodingKey, Validation};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
pub struct CommentDto {
    pub id: u64,
    pub autor_nombre: String,
    pub contenido: String,
    pub likes_count: i32,
    pub created_at: String,
    pub parent_id: Option<u64>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CommentThread {
    pub id: u64,
    pub autor_nombre: String,
    pub contenido: String,
    pub likes_count: i32,
    pub created_at: String,
    pub respuestas: Vec<CommentThread>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct SocialPostDto {
    pub id: u64,
    pub usuario_id: u64,
    pub nombre_completo: String,
    pub alias_autor: Option<String>,
    pub rol: String,
    pub contenido: String,
    pub url_externa: Option<String>,
    pub upvotes_count: i32,
    pub downvotes_count: i32,
    pub comentarios_count: i32,
    pub coordinacion_destino: String,
    pub created_at: String,
    pub user_vote: Option<i32>,
    pub comentarios: Option<Vec<CommentThread>>,
}

#[derive(Debug, Deserialize)]
pub struct CrearPostRequest {
    pub contenido: String,
    pub url_externa: Option<String>,
    pub imagen_url: Option<String>,
    pub coordinacion_destino: Option<String>,
    pub usar_alias: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct FeedQueryParams {
    pub coordinacion: Option<String>,
    pub limite: Option<i64>,
}

#[derive(Debug, Deserialize)]
pub struct VotarPostRequest {
    pub publicacion_id: u64,
    pub valor: i32, // +1 o -1
}

#[derive(Debug, Deserialize)]
pub struct ComentarPostRequest {
    pub publicacion_id: u64,
    pub contenido: String,
    pub parent_id: Option<u64>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct MensajePrivadoDto {
    pub id: u64,
    pub emisor_id: u64,
    pub receptor_id: u64,
    pub emisor_nombre: Option<String>,
    pub receptor_nombre: Option<String>,
    pub contenido: String,
    pub leido: Option<bool>,
    pub created_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct ThreadDto {
    pub id: u64,
    pub nombre: String,
    pub lastMessage: Option<String>,
    pub last_time: Option<String>,
    pub unread: i64,
    pub rol: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct EnviarMensajeRequest {
    pub receptor_id: Option<u64>,
    pub receptor_expediente: Option<String>,
    pub contact_id: Option<u64>,
    pub contenido: String,
}

#[derive(Debug, Deserialize)]
pub struct MensajesQueryParams {
    pub con_usuario_id: Option<u64>,
    pub con_expediente: Option<String>,
    pub contact_id: Option<u64>,
}

/// Extrae opcionalmente los datos del usuario autenticado si el token está presente
fn extract_user_id_optional(headers: &axum::http::HeaderMap, jwt_secret: &str) -> Option<u64> {
    let token_str = headers
        .get(axum::http::header::AUTHORIZATION)
        .and_then(|v| v.to_str().ok())
        .and_then(|s| s.strip_prefix("Bearer "))?;

    let key = DecodingKey::from_secret(jwt_secret.as_bytes());
    let mut validation = Validation::default();
    validation.validate_exp = true;

    decode::<crate::modules::auth::Claims>(token_str, &key, &validation)
        .ok()
        .map(|d| d.claims.id)
}

/// Handler para consultar el Muro Social
pub async fn get_social_feed(
    State(state): State<AppState>,
    axum::http::request::Parts { headers, .. }: axum::http::request::Parts,
    Query(params): Query<FeedQueryParams>,
) -> impl IntoResponse {
    let coordinacion = params.coordinacion.unwrap_or_else(|| "general".to_string());
    let limite = params.limite.unwrap_or(50);
    let current_user_id = extract_user_id_optional(&headers, &state.config.jwt_secret);

    // Consulta SQL con conteo de votos positivos, negativos, comentarios y voto del usuario actual
    let query_str = r#"
        SELECT p.id, p.usuario_id,
               IF(p.usar_alias = 1, COALESCE(p.alias_autor, 'Estudiante Anónimo'), u.nombre_completo) as nombre_completo,
               p.alias_autor,
               COALESCE(u.rol, 'estudiante') as rol,
               p.contenido,
               COALESCE(p.imagen_path, p.url_externa) as url_externa,
               CAST(COALESCE(p.upvotes_count, 0) as SIGNED) as upvotes_count,
               CAST(COALESCE(p.downvotes_count, 0) as SIGNED) as downvotes_count,
               CAST(COALESCE(p.comentarios_count, 0) as SIGNED) as comentarios_count,
               COALESCE(p.coordinacion_destino, 'general') as coordinacion_destino,
               DATE_FORMAT(p.created_at, '%Y-%m-%d %H:%i:%s') as created_at,
               (SELECT valor FROM publicaciones_votos WHERE publicacion_id = p.id AND usuario_id = ?) as user_vote
        FROM publicaciones_muro p
        JOIN usuarios u ON p.usuario_id = u.id
        WHERE p.activo = 1 AND (? = 'general' OR ? = 'todos' OR p.coordinacion_destino = ?)
        ORDER BY p.created_at DESC
        LIMIT ?
    "#;

    let posts_res = sqlx::query_as::<_, (u64, u64, String, Option<String>, String, String, Option<String>, i64, i64, i64, String, String, Option<i32>)>(query_str)
        .bind(current_user_id.unwrap_or(0))
        .bind(&coordinacion)
        .bind(&coordinacion)
        .bind(&coordinacion)
        .bind(limite)
        .fetch_all(&state.db)
        .await;

    match posts_res {
        Ok(rows) => {
            let mut result_posts: Vec<SocialPostDto> = Vec::new();
            for r in rows {
                // Obtener comentarios de esta publicación
                let comments_res = sqlx::query_as::<_, (u64, String, String, i32, String, Option<u64>)>(
                    r#"
                    SELECT c.id, 
                           IF(c.usar_alias = 1, 'Estudiante Anónimo', u.nombre_completo) as autor_nombre,
                           c.contenido, COALESCE(c.likes_count, 0) as likes_count,
                           DATE_FORMAT(c.created_at, '%Y-%m-%d %H:%i:%s') as created_at,
                           c.parent_id
                    FROM publicaciones_comentarios c
                    JOIN usuarios u ON c.usuario_id = u.id
                    WHERE c.publicacion_id = ? AND c.activo = 1
                    ORDER BY c.created_at ASC
                    "#,
                )
                .bind(r.0)
                .fetch_all(&state.db)
                .await;

                let comments_threads = match comments_res {
                    Ok(c_rows) => {
                        let mut root_comments: Vec<CommentThread> = Vec::new();
                        for c in c_rows {
                            root_comments.push(CommentThread {
                                id: c.0,
                                autor_nombre: c.1,
                                contenido: c.2,
                                likes_count: c.3,
                                created_at: c.4,
                                respuestas: Vec::new(),
                            });
                        }
                        root_comments
                    }
                    Err(_) => Vec::new(),
                };

                result_posts.push(SocialPostDto {
                    id: r.0,
                    usuario_id: r.1,
                    nombre_completo: r.2,
                    alias_autor: r.3,
                    rol: r.4,
                    contenido: r.5,
                    url_externa: r.6,
                    upvotes_count: r.7 as i32,
                    downvotes_count: r.8 as i32,
                    comentarios_count: r.9 as i32,
                    coordinacion_destino: r.10,
                    created_at: r.11,
                    user_vote: r.12,
                    comentarios: Some(comments_threads),
                });
            }
            ApiResponse::success(result_posts).into_response()
        }
        Err(err) => {
            tracing::error!("Error al consultar muro social: {:?}", err);
            ApiResponse::<()>::error(
                StatusCode::INTERNAL_SERVER_ERROR,
                "Error al cargar la línea de tiempo social",
            )
            .into_response()
        }
    }
}

/// Handler para publicar en el Muro Social
pub async fn crear_post(
    State(state): State<AppState>,
    axum::http::request::Parts { headers, .. }: axum::http::request::Parts,
    Json(payload): Json<CrearPostRequest>,
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

    let user_id = claims.id;
    let coordinacion = payload.coordinacion_destino.clone().unwrap_or_else(|| "general".to_string());
    let imagen = payload.imagen_url.clone().or(payload.url_externa.clone());
    let usar_alias_val = if payload.usar_alias.unwrap_or(false) { 1 } else { 0 };
    let alias_str = if usar_alias_val == 1 { Some("Estudiante Anónimo".to_string()) } else { None };

    let res = sqlx::query(
        r#"
        INSERT INTO publicaciones_muro (usuario_id, contenido, imagen_path, url_externa, coordinacion_destino, usar_alias, alias_autor, activo, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1, NOW())
        "#,
    )
    .bind(user_id)
    .bind(&payload.contenido)
    .bind(&imagen)
    .bind(&payload.url_externa)
    .bind(&coordinacion)
    .bind(usar_alias_val)
    .bind(&alias_str)
    .execute(&state.db)
    .await;

    match res {
        Ok(r) => {
            let new_id = r.last_insert_id();
            ApiResponse::success(serde_json::json!({
                "id": new_id,
                "mensaje": "Publicación realizada exitosamente en el Muro Social."
            })).into_response()
        }
        Err(err) => {
            tracing::error!("Error al crear publicación social: {:?}", err);
            ApiResponse::<()>::error(
                StatusCode::INTERNAL_SERVER_ERROR,
                "Error al publicar en el muro",
            )
            .into_response()
        }
    }
}

/// Handler para votar una publicación social (+1 / -1)
pub async fn votar_post(
    State(state): State<AppState>,
    axum::http::request::Parts { headers, .. }: axum::http::request::Parts,
    Json(payload): Json<VotarPostRequest>,
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

    let user_id = claims.id;
    let vote_val = if payload.valor > 0 { 1 } else { -1 };

    // Insertar o actualizar voto
    let _ = sqlx::query(
        r#"
        INSERT INTO publicaciones_votos (publicacion_id, usuario_id, valor, created_at)
        VALUES (?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE valor = ?, created_at = NOW()
        "#
    )
    .bind(payload.publicacion_id)
    .bind(user_id)
    .bind(vote_val)
    .bind(vote_val)
    .execute(&state.db)
    .await;

    // Recalcular conteos de votos en la publicación
    let _ = sqlx::query(
        r#"
        UPDATE publicaciones_muro
        SET upvotes_count = (SELECT COUNT(*) FROM publicaciones_votos WHERE publicacion_id = ? AND valor = 1),
            downvotes_count = (SELECT COUNT(*) FROM publicaciones_votos WHERE publicacion_id = ? AND valor = -1)
        WHERE id = ?
        "#
    )
    .bind(payload.publicacion_id)
    .bind(payload.publicacion_id)
    .bind(payload.publicacion_id)
    .execute(&state.db)
    .await;

    ApiResponse::success(serde_json::json!({
        "success": true,
        "mensaje": "Voto en la publicación procesado."
    })).into_response()
}

/// Handler para agregar un comentario a un post
pub async fn comentar_post(
    State(state): State<AppState>,
    axum::http::request::Parts { headers, .. }: axum::http::request::Parts,
    Json(payload): Json<ComentarPostRequest>,
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

    let user_id = claims.id;

    let res = sqlx::query(
        r#"
        INSERT INTO publicaciones_comentarios (publicacion_id, usuario_id, parent_id, contenido, activo, created_at)
        VALUES (?, ?, ?, ?, 1, NOW())
        "#
    )
    .bind(payload.publicacion_id)
    .bind(user_id)
    .bind(payload.parent_id)
    .bind(&payload.contenido)
    .execute(&state.db)
    .await;

    match res {
        Ok(r) => {
            // Actualizar conteo de comentarios
            let _ = sqlx::query("UPDATE publicaciones_muro SET comentarios_count = COALESCE(comentarios_count, 0) + 1 WHERE id = ?")
                .bind(payload.publicacion_id)
                .execute(&state.db)
                .await;

            ApiResponse::success(serde_json::json!({
                "id": r.last_insert_id(),
                "mensaje": "Comentario publicado."
            })).into_response()
        }
        Err(err) => {
            tracing::error!("Error al comentar: {:?}", err);
            ApiResponse::<()>::error(StatusCode::INTERNAL_SERVER_ERROR, "Error al guardar el comentario.").into_response()
        }
    }
}

// ==============================================================================
// MENSAJERÍA DIRECTA / INBOX
// ==============================================================================

/// Handler para obtener la lista de conversaciones (Threads) de mensajería del usuario
pub async fn get_conversaciones(
    State(state): State<AppState>,
    axum::http::request::Parts { headers, .. }: axum::http::request::Parts,
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

    let current_id = claims.id;

    // Obtener los interlocutores únicos con el último mensaje y contador de no leídos
    let threads_res = sqlx::query_as::<_, (u64, String, Option<String>, Option<String>, i64, Option<String>)>(
        r#"
        SELECT 
            u.id, 
            u.nombre_completo as nombre,
            (SELECT contenido FROM mensajes_privados WHERE (emisor_id = u.id AND receptor_id = ?) OR (emisor_id = ? AND receptor_id = u.id) ORDER BY created_at DESC LIMIT 1) as lastMessage,
            (SELECT DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') FROM mensajes_privados WHERE (emisor_id = u.id AND receptor_id = ?) OR (emisor_id = ? AND receptor_id = u.id) ORDER BY created_at DESC LIMIT 1) as last_time,
            (SELECT COUNT(*) FROM mensajes_privados WHERE emisor_id = u.id AND receptor_id = ? AND leido = 0) as unread,
            u.rol
        FROM usuarios u
        WHERE u.id IN (
            SELECT DISTINCT IF(emisor_id = ?, receptor_id, emisor_id)
            FROM mensajes_privados
            WHERE emisor_id = ? OR receptor_id = ?
        )
        ORDER BY last_time DESC
        "#
    )
    .bind(current_id)
    .bind(current_id)
    .bind(current_id)
    .bind(current_id)
    .bind(current_id)
    .bind(current_id)
    .bind(current_id)
    .bind(current_id)
    .fetch_all(&state.db)
    .await;

    match threads_res {
        Ok(rows) => {
            let mut threads: Vec<ThreadDto> = Vec::new();
            for r in rows {
                threads.push(ThreadDto {
                    id: r.0,
                    nombre: r.1,
                    lastMessage: r.2,
                    last_time: r.3,
                    unread: r.4,
                    rol: r.5,
                });
            }
            ApiResponse::success(threads).into_response()
        }
        Err(err) => {
            tracing::error!("Error al obtener conversaciones: {:?}", err);
            ApiResponse::<()>::error(StatusCode::INTERNAL_SERVER_ERROR, "Error al cargar conversaciones.").into_response()
        }
    }
}

/// Handler para consultar hilo de mensajes con un contacto específico (`contact_id` o `con_usuario_id`)
pub async fn get_mensajes_privados(
    State(state): State<AppState>,
    axum::http::request::Parts { headers, .. }: axum::http::request::Parts,
    Query(params): Query<MensajesQueryParams>,
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

    let current_id = claims.id;

    let other_id = if let Some(c_id) = params.contact_id {
        c_id
    } else if let Some(target) = params.con_usuario_id {
        target
    } else if let Some(ref exp) = params.con_expediente {
        let rec: Option<(u64,)> = sqlx::query_as("SELECT id FROM usuarios WHERE expediente = ? OR matricula = ?")
            .bind(exp)
            .bind(exp)
            .fetch_optional(&state.db)
            .await
            .unwrap_or(None);
        rec.map(|(id,)| id).unwrap_or(0)
    } else {
        0
    };

    // Marcar como leídos los mensajes recibidos de este contacto
    if other_id > 0 {
        let _ = sqlx::query("UPDATE mensajes_privados SET leido = 1 WHERE emisor_id = ? AND receptor_id = ?")
            .bind(other_id)
            .bind(current_id)
            .execute(&state.db)
            .await;
    }

    let result = sqlx::query_as::<_, MensajePrivadoDto>(
        r#"
        SELECT m.id, m.emisor_id, m.receptor_id,
               u1.nombre_completo as emisor_nombre,
               u2.nombre_completo as receptor_nombre,
               m.contenido, m.leido,
               DATE_FORMAT(m.created_at, '%Y-%m-%d %H:%i:%s') as created_at
        FROM mensajes_privados m
        JOIN usuarios u1 ON m.emisor_id = u1.id
        JOIN usuarios u2 ON m.receptor_id = u2.id
        WHERE (m.emisor_id = ? AND m.receptor_id = ?)
           OR (m.emisor_id = ? AND m.receptor_id = ?)
        ORDER BY m.created_at ASC
        LIMIT 100
        "#,
    )
    .bind(current_id)
    .bind(other_id)
    .bind(other_id)
    .bind(current_id)
    .fetch_all(&state.db)
    .await;

    match result {
        Ok(msgs) => ApiResponse::success(msgs).into_response(),
        Err(err) => {
            tracing::error!("Error al consultar mensajes privados: {:?}", err);
            ApiResponse::<()>::error(
                StatusCode::INTERNAL_SERVER_ERROR,
                "Error al cargar los mensajes",
            )
            .into_response()
        }
    }
}

/// Handler para enviar un mensaje privado
pub async fn enviar_mensaje_privado(
    State(state): State<AppState>,
    axum::http::request::Parts { headers, .. }: axum::http::request::Parts,
    Json(payload): Json<EnviarMensajeRequest>,
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

    let emisor_id = claims.id;

    let receptor_id = if let Some(c_id) = payload.contact_id {
        c_id
    } else if let Some(target_id) = payload.receptor_id {
        target_id
    } else if let Some(ref exp) = payload.receptor_expediente {
        let rec: Option<(u64,)> = sqlx::query_as("SELECT id FROM usuarios WHERE expediente = ? OR matricula = ?")
            .bind(exp)
            .bind(exp)
            .fetch_optional(&state.db)
            .await
            .unwrap_or(None);
        
        match rec {
            Some((id,)) => id,
            None => return ApiResponse::<()>::error(StatusCode::NOT_FOUND, "Usuario destinatario no encontrado.").into_response(),
        }
    } else {
        return ApiResponse::<()>::error(StatusCode::BAD_REQUEST, "Debe especificar un usuario destinatario.").into_response();
    };

    let res = sqlx::query(
        r#"
        INSERT INTO mensajes_privados (emisor_id, receptor_id, contenido, leido, created_at)
        VALUES (?, ?, ?, 0, NOW())
        "#,
    )
    .bind(emisor_id)
    .bind(receptor_id)
    .bind(&payload.contenido)
    .execute(&state.db)
    .await;

    match res {
        Ok(r) => {
            let msg_id = r.last_insert_id();
            ApiResponse::success(serde_json::json!({
                "id": msg_id,
                "emisor_id": emisor_id,
                "receptor_id": receptor_id,
                "contenido": payload.contenido,
                "created_at": chrono::Utc::now().to_rfc3339(),
                "mensaje": "Mensaje privado entregado correctamente."
            })).into_response()
        }
        Err(err) => {
            tracing::error!("Error al enviar mensaje privado: {:?}", err);
            ApiResponse::<()>::error(
                StatusCode::INTERNAL_SERVER_ERROR,
                "Error al registrar mensaje privado",
            )
            .into_response()
        }
    }
}

pub fn router() -> Router<AppState> {
    Router::new()
        // Red Social Feed / Publicaciones
        .route("/social/feed", get(get_social_feed))
        .route("/social/post", post(crear_post))
        .route("/social/publicaciones", get(get_social_feed))
        .route("/social/publicar", post(crear_post))
        .route("/social/votar", post(votar_post))
        .route("/social/comentarios", get(get_social_feed))
        .route("/social/comentar", post(comentar_post))
        // Mensajería Directa (Inbox)
        .route("/social/mensajes/conversaciones", get(get_conversaciones))
        .route("/social/mensajes/chat", get(get_mensajes_privados))
        .route("/social/mensajes/enviar", post(enviar_mensaje_privado))
        .route("/mensajes/threads", get(get_conversaciones))
        .route("/mensajes/chat", get(get_mensajes_privados))
        .route("/mensajes/enviar", post(enviar_mensaje_privado))
        .route("/mensajes/hilo", get(get_mensajes_privados))
        .route("/mensajes", get(get_mensajes_privados))
        .route("/mensajes", post(enviar_mensaje_privado))
}
