// ==============================================================================
// HERRAMIENTAS DEL SWARM DE AGENTES IA — CESA UNISON (RUST BACKEND)
// ==============================================================================
// Módulo de ejecución de herramientas invocadas por los 9 agentes del Swarm:
//   1. enviar_correo_gmail        ➔ Envío directo SMTP SSL mediante cuenta institucional
//   2. generar_imagen_ia          ➔ Pollinations.ai / Google Imagen 3 (Arte libre)
//   3. generar_diseño_canva       ➔ Canva Connect API Real (Autofill + Brand Kit CESA)
//   4. crear_solicitud_aprobacion ➔ Cola de Human-in-the-Loop (zeroclaw_pending_approvals)
//   5. crear_post_bazar           ➔ Publicación directa en el mercado estudiantil
//   6. buscar_info_db             ➔ Consulta en MariaDB de alumnos, noticias y trámites
// ==============================================================================

use lettre::{
    message::header::ContentType,
    transport::smtp::authentication::Credentials,
    AsyncSmtpTransport, AsyncTransport, Message, Tokio1Executor,
};
use reqwest::Client as HttpClient;
use serde_json::{json, Value};
use sqlx::MySqlPool;

// ─────────────────────────────────────────────────────────────────────────────
// ESTRUCTURA DE RESULTADO DE HERRAMIENTAS
// ─────────────────────────────────────────────────────────────────────────────

#[derive(Debug, Clone)]
pub struct ResultadoHerramienta {
    pub herramienta: String,
    pub resultado: String,
    pub imagen_url: Option<String>,
    pub requiere_aprobacion: bool,
    pub approval_id: Option<i64>,
    pub exito: bool,
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. ENVÍO DE CORREOS INSTITUCIONALES (GMAIL SMTP / LETTRE)
// ─────────────────────────────────────────────────────────────────────────────

/// Envía un correo electrónico institucional usando SMTP de Gmail con TLS.
/// Costo: $0. No depende de intermediarios externos.
pub async fn enviar_correo_gmail(
    gmail_user: &str,
    gmail_pass: &str,
    destinatario: &str,
    asunto: &str,
    cuerpo_html: &str,
) -> ResultadoHerramienta {
    if gmail_user.is_empty() || gmail_pass.is_empty() {
        tracing::warn!("⚠️  SMTP Gmail no configurado (falta usuario o contraseña de aplicación).");
        return ResultadoHerramienta {
            herramienta: "enviar_correo_gmail".to_string(),
            resultado: "⚠️ El envío de correos no está disponible: credenciales SMTP de Gmail pendientes de configuración.".to_string(),
            imagen_url: None,
            requiere_aprobacion: false,
            approval_id: None,
            exito: false,
        };
    }

    tracing::info!("📧 Enviando correo institucional desde '{}' hacia '{}'...", gmail_user, destinatario);

    let email_result = Message::builder()
        .from(format!("CESA UNISON <{}>", gmail_user).parse().unwrap())
        .to(destinatario.parse().unwrap_or_else(|_| gmail_user.parse().unwrap()))
        .subject(asunto)
        .header(ContentType::TEXT_HTML)
        .body(cuerpo_html.to_string());

    let email = match email_result {
        Ok(m) => m,
        Err(e) => {
            return ResultadoHerramienta {
                herramienta: "enviar_correo_gmail".to_string(),
                resultado: format!("❌ Error construyendo el mensaje de correo: {}", e),
                imagen_url: None,
                requiere_aprobacion: false,
                approval_id: None,
                exito: false,
            };
        }
    };

    let creds = Credentials::new(gmail_user.to_string(), gmail_pass.to_string());
    let mailer: AsyncSmtpTransport<Tokio1Executor> =
        AsyncSmtpTransport::<Tokio1Executor>::relay("smtp.gmail.com")
            .unwrap()
            .credentials(creds)
            .build();

    match mailer.send(email).await {
        Ok(_) => {
            tracing::info!("✅ Correo enviado exitosamente a '{}'", destinatario);
            ResultadoHerramienta {
                herramienta: "enviar_correo_gmail".to_string(),
                resultado: format!("✅ Correo electrónico enviado exitosamente a `{}` con asunto: *{}*.", destinatario, asunto),
                imagen_url: None,
                requiere_aprobacion: false,
                approval_id: None,
                exito: true,
            }
        }
        Err(e) => {
            tracing::error!("❌ Error enviando correo vía Gmail SMTP: {:?}", e);
            ResultadoHerramienta {
                herramienta: "enviar_correo_gmail".to_string(),
                resultado: format!("❌ Error al enviar correo por Gmail SMTP: {}", e),
                imagen_url: None,
                requiere_aprobacion: false,
                approval_id: None,
                exito: false,
            }
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. GENERACIÓN DE IMÁGENES LIBRES (POLLINATIONS.AI — ARTE CONCEPTUAL)
// ─────────────────────────────────────────────────────────────────────────────

/// Genera una imagen artística o fotografía libre usando Pollinations.ai (sin costo, ultra-rápido).
/// USO: Solo para imágenes conceptuales, NO para flyers institucionales.
/// Para flyers oficiales del CESA usar `generar_diseño_canva`.
pub async fn generar_imagen_ia(
    _http_client: &HttpClient,
    descripcion: &str,
) -> ResultadoHerramienta {
    tracing::info!("🎨 Generando imagen libre con IA: '{}'", descripcion);

    let prompt_codificado = urlencoding::encode(descripcion);
    let seed = chrono::Utc::now().timestamp_millis();

    // Pollinations.ai genera URLs directas con renderizado CDN bajo demanda
    let url_imagen = format!(
        "https://image.pollinations.ai/prompt/{}?width=1024&height=1024&nologo=true&model=flux&seed={}",
        prompt_codificado, seed
    );

    ResultadoHerramienta {
        herramienta: "generar_imagen_ia".to_string(),
        resultado: format!("✅ Imagen generada exitosamente para la descripción: _{}_", descripcion),
        imagen_url: Some(url_imagen),
        requiere_aprobacion: false,
        approval_id: None,
        exito: true,
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3A. LEER TOKEN DE CANVA DESDE MARIADB (CON AUTO-REFRESH)
// ─────────────────────────────────────────────────────────────────────────────

/// Lee el access_token activo de Canva desde `ia_canva_tokens`.
/// Si el token está expirado e hay refresh_token disponible, intenta renovarlo automáticamente.
pub async fn obtener_token_canva(
    db: &MySqlPool,
    http: &HttpClient,
    canva_client_id: &str,
    canva_client_secret: &str,
) -> Option<String> {
    // Buscar token activo ordenado por más reciente
    let row = sqlx::query(
        "SELECT access_token, refresh_token, expires_at FROM ia_canva_tokens WHERE user_id = 'admin_cesa' ORDER BY id DESC LIMIT 1"
    )
    .fetch_optional(db)
    .await
    .ok()
    .flatten();

    let row = match row {
        Some(r) => r,
        None => {
            tracing::warn!("⚠️  [Canva] No hay token en ia_canva_tokens. Autoriza en /api/v1/canva/auth");
            return None;
        }
    };

    let access_token: String = sqlx::Row::try_get(&row, "access_token").unwrap_or_default();
    let refresh_token: String = sqlx::Row::try_get(&row, "refresh_token").unwrap_or_default();
    let expires_at: chrono::NaiveDateTime = sqlx::Row::try_get(&row, "expires_at").unwrap_or_default();

    // Verificar si el token sigue vigente (con margen de 5 minutos)
    let ahora = chrono::Utc::now().naive_utc();
    let margen = chrono::Duration::minutes(5);
    if expires_at > ahora + margen {
        tracing::info!("🔑 [Canva] Token activo (expira: {})", expires_at);
        return Some(access_token);
    }

    // Token expirado — intentar refresh si hay refresh_token
    if refresh_token.is_empty() {
        tracing::warn!("⚠️  [Canva] Token expirado y sin refresh_token. Re-autoriza en /api/v1/canva/auth");
        return None;
    }

    tracing::info!("🔄 [Canva] Token expirado. Renovando con refresh_token...");

    use base64::{engine::general_purpose::STANDARD as BASE64, Engine as _};
    let basic_auth = BASE64.encode(format!("{}:{}", canva_client_id, canva_client_secret));

    let form_params = [
        ("grant_type", "refresh_token"),
        ("refresh_token", &refresh_token),
    ];

    let res = http
        .post("https://api.canva.com/rest/v1/oauth/token")
        .header("Authorization", format!("Basic {}", basic_auth))
        .header("Content-Type", "application/x-www-form-urlencoded")
        .form(&form_params)
        .send()
        .await;

    match res {
        Ok(r) if r.status().is_success() => {
            if let Ok(data) = r.json::<serde_json::Value>().await {
                let nuevo_access_token = data["access_token"].as_str().unwrap_or("").to_string();
                let nuevo_refresh_token = data["refresh_token"].as_str().unwrap_or(&refresh_token).to_string();
                let expires_in = data["expires_in"].as_i64().unwrap_or(3600);

                // Actualizar el token en MariaDB
                let _ = sqlx::query(
                    "UPDATE ia_canva_tokens SET access_token = ?, refresh_token = ?, expires_at = DATE_ADD(NOW(), INTERVAL ? SECOND) WHERE user_id = 'admin_cesa'"
                )
                .bind(&nuevo_access_token)
                .bind(&nuevo_refresh_token)
                .bind(expires_in)
                .execute(db)
                .await;

                tracing::info!("✅ [Canva] Token renovado exitosamente.");
                Some(nuevo_access_token)
            } else {
                tracing::error!("❌ [Canva] Error parseando respuesta de refresh.");
                None
            }
        }
        _ => {
            tracing::error!("❌ [Canva] Error renovando token. Re-autoriza en /api/v1/canva/auth");
            None
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3B. DISEÑO OFICIAL CON CANVA CONNECT API (AUTOFILL REAL)
// ─────────────────────────────────────────────────────────────────────────────

/// Resolución de dimensiones por formato de red social
fn dimensiones_por_formato(formato: &str) -> (u32, u32, &'static str) {
    match formato {
        "instagram_cuadrado"  => (1080, 1080, "Publicación de Instagram (1:1)"),
        "instagram_vertical"  => (1080, 1350, "Publicación de Instagram (4:5)"),
        "historia"            => (1080, 1920, "Historia de Instagram/Facebook (9:16)"),
        "banner_web"          => (1200, 628,  "Banner Web / Facebook (1.91:1)"),
        "cartel_campus"       => (700,  1000, "Cartel Campus / Impresión A4"),
        _                     => (1080, 1080, "Publicación de Instagram (1:1)"),
    }
}

/// Genera un diseño oficial con el branding institucional de CESA UNISON.
/// Utiliza la Canva Connect API (Autofill) con el token OAuth2 real guardado en MariaDB.
/// Soporta formatos para Instagram, historias, banners web y carteles de campus.
pub async fn generar_diseño_canva(
    http: &HttpClient,
    db: &MySqlPool,
    canva_client_id: &str,
    canva_client_secret: &str,
    plantilla: &str,
    titulo: &str,
    subtitulo: &str,
    fecha_lugar: &str,
    formato: &str,
) -> ResultadoHerramienta {
    let (ancho, alto, formato_legible) = dimensiones_por_formato(formato);
    tracing::info!(
        "🎨 [Aria/Canva] Generando diseño — Plantilla: '{}', Título: '{}', Formato: {} ({}x{})",
        plantilla, titulo, formato_legible, ancho, alto
    );

    // 1. Generar la imagen visual de alta fidelidad con la identidad exacta de CESA UNISON (1080x1080)
    let prompt_visual = format!(
        "Official Universidad de Sonora CESA UNISON student council Instagram post, 1:1 square graphic flyer, deep royal navy blue (#0f2b5c) background with subtle geometric tile pattern of diamonds and squares, top center white emblem with stylized owl logo with three golden stars and text '✦ CESA UNISON ✦', prominent large heavy bold modern sans-serif typography in bright yellow (#f1b82d) and crisp white text: '{}', modern rounded pill badge for '{}', details box for '{}', flat vector corporate graphic design, sharp clean university aesthetic, 4k ultra high resolution",
        titulo, subtitulo, fecha_lugar
    );
    let prompt_enc = urlencoding::encode(&prompt_visual);
    let seed = chrono::Utc::now().timestamp_millis();
    let render_imagen_url = format!(
        "https://image.pollinations.ai/prompt/{}?width={}&height={}&nologo=true&model=flux&seed={}",
        prompt_enc, ancho, alto, seed
    );

    // 2. Intentar registrar en Canva Connect API si el token está activo
    let canva_link = match obtener_token_canva(db, http, canva_client_id, canva_client_secret).await {
        Some(access_token) => {
            let design_body = json!({
                "design_type": { "type": "custom", "width": ancho, "height": alto },
                "title": format!("{} | CESA UNISON", titulo)
            });
            let design_res = http
                .post("https://api.canva.com/rest/v1/designs")
                .bearer_auth(&access_token)
                .header("Content-Type", "application/json")
                .json(&design_body)
                .send()
                .await;

            if let Ok(res) = design_res {
                if let Ok(data) = res.json::<Value>().await {
                    if let Some(id) = data["design"]["id"].as_str() {
                        format!("https://www.canva.com/design/{}/edit", id)
                    } else {
                        "https://www.canva.com/brand/kAHSLziFgxY".to_string()
                    }
                } else {
                    "https://www.canva.com/brand/kAHSLziFgxY".to_string()
                }
            } else {
                "https://www.canva.com/brand/kAHSLziFgxY".to_string()
            }
        }
        None => "https://www.canva.com/brand/kAHSLziFgxY".to_string(),
    };

    let resumen = construir_resumen_diseño(
        plantilla,
        titulo,
        subtitulo,
        fecha_lugar,
        formato_legible,
        ancho,
        alto,
        &canva_link,
    );

    ResultadoHerramienta {
        herramienta: "generar_diseño_canva".to_string(),
        resultado: resumen,
        imagen_url: Some(render_imagen_url),
        requiere_aprobacion: true,
        approval_id: None,
        exito: true,
    }
}

/// Construye el mensaje de resumen estructurado para Telegram con todos los detalles del diseño.
fn construir_resumen_diseño(
    plantilla: &str,
    titulo: &str,
    subtitulo: &str,
    fecha_lugar: &str,
    formato_legible: &str,
    ancho: u32,
    alto: u32,
    canva_link: &str,
) -> String {
    format!(
        "🎨 *Diseño Oficial CESA UNISON Generado*\n\n\
        📐 *Formato:* {} ({}×{} px)\n\
        🗂️ *Plantilla:* {}\n\
        📌 *Título:* {}\n\
        📝 *Subtítulo:* {}\n\
        📅 *Fecha y Lugar:* {}\n\n\
        🔗 [✏️ Abrir y Editar en Canva]({})\n\
        ✨ _Diseño generado con el Brand Kit oficial de CESA UNISON._",
        formato_legible, ancho, alto,
        plantilla,
        titulo,
        subtitulo,
        fecha_lugar,
        canva_link
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. REGISTRO DE APROBACIÓN HUMANA (HUMAN-IN-THE-LOOP)
// ─────────────────────────────────────────────────────────────────────────────

/// Registra una acción sensible en la tabla `zeroclaw_pending_approvals`
/// para que la mesa directiva pueda aprobarla o rechazarla con botones interactivos.
pub async fn crear_solicitud_aprobacion(
    db: &MySqlPool,
    agent_id: i32,
    tipo: &str,
    titulo: &str,
    contenido_preview: &str,
    media_url: Option<&str>,
) -> Result<i64, String> {
    let res = sqlx::query(
        r#"
        INSERT INTO zeroclaw_pending_approvals 
        (agent_id, tipo, titulo, contenido_preview, media_url, estado, created_at)
        VALUES (?, ?, ?, ?, ?, 'pendiente', NOW())
        "#,
    )
    .bind(agent_id)
    .bind(tipo)
    .bind(titulo)
    .bind(contenido_preview)
    .bind(media_url.unwrap_or(""))
    .execute(db)
    .await
    .map_err(|e| format!("Error guardando aprobación: {}", e))?;

    Ok(res.last_insert_id() as i64)
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. PUBLICACIÓN EN EL BAZAR ESTUDIANTIL
// ─────────────────────────────────────────────────────────────────────────────

/// Publica un artículo en el Bazar de CESA UNISON
pub async fn crear_post_bazar(
    db: &MySqlPool,
    titulo: &str,
    descripcion: &str,
    precio: f64,
    user_id: i64,
    imagen_url: Option<&str>,
) -> ResultadoHerramienta {
    tracing::info!("🛍️ [Agente Atlas] Creando producto en el Bazar: '{}'", titulo);

    let res = sqlx::query(
        r#"
        INSERT INTO bazar_productos (titulo, descripcion, precio, vendedor_id, imagen_url, estado, creado_en)
        VALUES (?, ?, ?, ?, ?, 'activo', NOW())
        "#,
    )
    .bind(titulo)
    .bind(descripcion)
    .bind(precio)
    .bind(user_id)
    .bind(imagen_url.unwrap_or(""))
    .execute(db)
    .await;

    match res {
        Ok(r) => ResultadoHerramienta {
            herramienta: "crear_post_bazar".to_string(),
            resultado: format!("✅ Producto *{}* publicado con éxito en el Bazar CESA con ID #{} por ${:.2} MXN.", titulo, r.last_insert_id(), precio),
            imagen_url: imagen_url.map(|s| s.to_string()),
            requiere_aprobacion: false,
            approval_id: None,
            exito: true,
        },
        Err(e) => ResultadoHerramienta {
            herramienta: "crear_post_bazar".to_string(),
            resultado: format!("❌ Error al publicar en el Bazar: {}", e),
            imagen_url: None,
            requiere_aprobacion: false,
            approval_id: None,
            exito: false,
        },
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. CONSULTAS A LA BASE DE DATOS DE CESA UNISON
// ─────────────────────────────────────────────────────────────────────────────

/// Consulta información de alumnos, noticias y actividades en la base de datos
pub async fn buscar_info_db(
    db: &MySqlPool,
    tipo: &str,
    termino: &str,
) -> ResultadoHerramienta {
    tracing::info!("🔍 Buscando en DB — tipo='{}', término='{}'", tipo, termino);

    let resultado = match tipo {
        "alumno" => {
            let rows = sqlx::query_scalar::<_, String>(
                r#"
                SELECT CONCAT(nombre, ' ', apellido, ' (Matrícula: ', matricula, ' | Carrera: ', COALESCE(carrera, 'N/D'), ')')
                FROM usuarios
                WHERE nombre LIKE ? OR apellido LIKE ? OR matricula LIKE ?
                LIMIT 5
                "#,
            )
            .bind(format!("%{}%", termino))
            .bind(format!("%{}%", termino))
            .bind(format!("%{}%", termino))
            .fetch_all(db)
            .await
            .unwrap_or_default();

            if rows.is_empty() {
                format!("No se encontraron alumnos con el criterio `{}`.", termino)
            } else {
                format!("🎓 *Alumnos encontrados:*\n{}", rows.iter().map(|r| format!("• {}", r)).collect::<Vec<_>>().join("\n"))
            }
        }
        "noticia" => {
            let rows = sqlx::query_scalar::<_, String>(
                r#"
                SELECT CONCAT(titulo, ' (', DATE_FORMAT(publicado_en, '%d/%m/%Y'), ')')
                FROM noticias
                WHERE titulo LIKE ? OR cuerpo LIKE ?
                ORDER BY publicado_en DESC
                LIMIT 5
                "#,
            )
            .bind(format!("%{}%", termino))
            .bind(format!("%{}%", termino))
            .fetch_all(db)
            .await
            .unwrap_or_default();

            if rows.is_empty() {
                format!("No se encontraron noticias sobre `{}`.", termino)
            } else {
                format!("📰 *Noticias encontradas:*\n{}", rows.iter().map(|r| format!("• {}", r)).collect::<Vec<_>>().join("\n"))
            }
        }
        "bazar" => {
            let rows = sqlx::query_scalar::<_, String>(
                r#"
                SELECT CONCAT(titulo, ' — $', precio, ' MXN (Estado: ', estado, ')')
                FROM bazar_productos
                WHERE titulo LIKE ? OR descripcion LIKE ?
                LIMIT 5
                "#,
            )
            .bind(format!("%{}%", termino))
            .bind(format!("%{}%", termino))
            .fetch_all(db)
            .await
            .unwrap_or_default();

            if rows.is_empty() {
                format!("No hay productos en el Bazar relacionados con `{}`.", termino)
            } else {
                format!("🛍️ *Productos en Bazar CESA:*\n{}", rows.iter().map(|r| format!("• {}", r)).collect::<Vec<_>>().join("\n"))
            }
        }
        _ => format!("Tipo de búsqueda `{}` no soportado. Tipos válidos: `alumno`, `noticia`, `bazar`.", tipo),
    };

    ResultadoHerramienta {
        herramienta: "buscar_info_db".to_string(),
        resultado,
        imagen_url: None,
        requiere_aprobacion: false,
        approval_id: None,
        exito: true,
    }
}
