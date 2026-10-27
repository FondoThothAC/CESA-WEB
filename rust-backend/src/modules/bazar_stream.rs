// ==============================================================================
// STREAM DE EVENTOS DEL BAZAR EN TIEMPO REAL (SSE) — CESA UNISON v8.0
// ==============================================================================
// El endpoint PHP (backend/api/bazar-*.php) escribe cada transacción relevante
// del Bazar en la tabla `bazar_eventos`. Este módulo:
//   1. Arranca un poller único (1 Hz) que vigila esa tabla.
//   2. Difunde los eventos nuevos por un canal broadcast de Tokio.
//   3. Expone GET /api/v1/bazar/events/stream (text/event-stream) para el
//      público general (mapa del Bazar) y el panel de administración.
//
// Consumo: ~0 MB extra y una consulta trivial por segundo en MySQL.
// ==============================================================================

use axum::extract::State;
use axum::response::sse::{Event, KeepAlive, Sse};
use axum::routing::get;
use axum::Router;
use serde::Serialize;
use sqlx::MySqlPool;
use std::convert::Infallible;
use tokio::sync::{broadcast, mpsc};
use tokio_stream::wrappers::ReceiverStream;

use crate::state::AppState;

/// Evento tal cual lo escribe el PHP: {id, tipo, payload}
#[derive(Clone, Debug, Serialize)]
pub struct BazarEvento {
    pub id: i64,
    pub tipo: String,
    pub payload: serde_json::Value,
    pub creado_en: Option<String>,
}

/// Rutas: GET /api/v1/bazar/events/stream
pub fn router() -> Router<AppState> {
    Router::new().route("/bazar/events/stream", get(stream_bazar))
}

/// Poller global: lee bazar_eventos cada segundo y difunde los todos nuevos.
/// Se crea UNA sola tarea a lo largo de la vida del proceso (costo ~0 MB).
pub fn start_poller(pool: MySqlPool, tx: broadcast::Sender<BazarEvento>) {
    tokio::spawn(async move {
        // Empezamos en el MAX(id) actual: los eventos ya registrados no se re-replayen.
        let mut last_id: i64 = match sqlx::query_scalar::<_, i64>(
            "SELECT COALESCE(CAST(MAX(id) AS SIGNED), 0) FROM bazar_eventos",
        )
        .fetch_one(&pool)
        .await
        {
            Ok(v) => v,
            Err(_) => {
                // La tabla puede no existir aún (migración pendiente). Reintentamos silenciosamente.
                0
            }
        };

        loop {
            tokio::time::sleep(std::time::Duration::from_millis(1000)).await;

            // Si la tabla no existe todavía, MAX falla; último id se queda y reintenta.
            let max_id = match sqlx::query_scalar::<_, i64>(
                "SELECT COALESCE(CAST(MAX(id) AS SIGNED), 0) FROM bazar_eventos",
            )
            .fetch_one(&pool)
            .await
            {
                Ok(v) => v,
                Err(_) => {
                    tracing::warn!("⚠️ bazar_eventos inaccesible (¿faltó la migración v8.0?). Reintentando...");
                    continue;
                }
            };

            if max_id <= last_id {
                continue;
            }

            // CAST(...) AS CHAR para que sqlx lea VARCHAR/TEXT en MySQL y MariaDB
            let rows = sqlx::query_as::<_, (i64, String, String, Option<String>)>(
                "SELECT CAST(id AS SIGNED) AS id, tipo,
                        CAST(COALESCE(payload, '{}') AS CHAR) AS payload,
                        DATE_FORMAT(creado_en, '%Y-%m-%dT%H:%i:%sZ')
                 FROM bazar_eventos WHERE id > ? ORDER BY id ASC LIMIT 200",
            )
            .bind(last_id)
            .fetch_all(&pool)
            .await;

            match rows {
                Ok(filas) => {
                    for (id, tipo, payload_raw, creado_en) in filas {
                        let payload: serde_json::Value = serde_json::from_str(&payload_raw)
                            .unwrap_or(serde_json::json!({ "raw": payload_raw }));
                        let evento = BazarEvento {
                            id,
                            tipo,
                            payload,
                            creado_en,
                        };
                        let _ = tx.send(evento); // Sin suscriptores = no importa
                    }
                    last_id = max_id;
                }
                Err(err) => {
                    tracing::warn!("⚠️ Error leyendo bazar_eventos: {:?}", err);
                    // No avanzamos last_id: reintentamos el mismo rango.
                }
            }
        }
    });
}

/// GET /api/v1/bazar/events/stream — text/event-stream.
/// Cada suscriptor recibe: un "hello" inicial y después eventos `bazar`.
/// Keep-alive de Axum responde con pings comentados cada 15 s para atravesar
/// proxies y no despertar timeouts inactivos.
async fn stream_bazar(State(state): State<AppState>) -> Sse<ReceiverStream<Result<Event, Infallible>>> {
    let (resp_tx, resp_rx) = mpsc::channel::<Result<Event, Infallible>>(32);
    let mut rx = state.bazar_eventos.subscribe();

    // Saludo inicial (permite al front verificar que el stream abrió bien)
    tokio::spawn(async move {
        if resp_tx
            .send(Ok(Event::default()
                .event("hello")
                .data(r#"{"ok":true,"stream":"bazar","v":1}"#)))
            .await
            .is_err()
        {
            return;
        }
        loop {
            match rx.recv().await {
                Ok(ev) => {
                    let json = serde_json::to_string(&ev).unwrap_or_else(|_| "{}".to_string());
                    if resp_tx.send(Ok(Event::default().event("bazar").data(json))).await.is_err() {
                        return; // Cliente se desconectó
                    }
                }
                Err(broadcast::error::RecvError::Lagged(n)) => {
                    // El cliente va tarde; le avisamos para que haga refresco completo
                    if resp_tx
                        .send(Ok(Event::default().event("lagged").data(format!(r#"{{"desfasado":{}}}"#, n))))
                        .await
                        .is_err()
                    {
                        return;
                    }
                }
                Err(broadcast::error::RecvError::Closed) => return,
            }
        }
    });

    Sse::new(ReceiverStream::new(resp_rx)).keep_alive(KeepAlive::default())
}
