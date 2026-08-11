// ==============================================================================
// RESPUESTAS JSON ESTANDARIZADAS — CESA UNISON
// ==============================================================================

use axum::{http::StatusCode, Json};
use serde::Serialize;

#[derive(Serialize)]
pub struct ApiResponse<T: Serialize> {
    pub success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data: Option<T>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}

impl<T: Serialize> ApiResponse<T> {
    /// Respuesta exitosa con datos
    pub fn success(data: T) -> (StatusCode, Json<ApiResponse<T>>) {
        (
            StatusCode::OK,
            Json(ApiResponse {
                success: true,
                data: Some(data),
                error: None,
            }),
        )
    }

    /// Respuesta de error con mensaje
    pub fn error(status: StatusCode, message: &str) -> (StatusCode, Json<ApiResponse<()>>) {
        (
            status,
            Json(ApiResponse {
                success: false,
                data: None,
                error: Some(message.to_string()),
            }),
        )
    }
}
