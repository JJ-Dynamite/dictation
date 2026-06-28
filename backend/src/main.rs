use axum::{
    routing::{get, post},
    Router, Json, response::IntoResponse,
};
use tower_http::cors::{CorsLayer, Any};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Serialize)]
struct HealthResponse { status: String, service: String, version: String }
#[derive(Serialize)]
struct RootResponse { service: String, version: String, description: String, endpoints: Vec<String> }
#[derive(Serialize)]
struct TranscribeResponse { id: String, text: String, confidence: f64, language: String }

async fn health() -> impl IntoResponse {
    Json(HealthResponse { status: "healthy".into(), service: "dictation".into(), version: "0.1.0".into() })
}

async fn root() -> impl IntoResponse {
    Json(RootResponse {
        service: "dictation".into(), version: "0.1.0".into(),
        description: "Browser speech-to-text".into(),
        endpoints: vec!["GET /health".into(), "POST /transcribe".into()],
    })
}

async fn transcribe_speech(axum::extract::Json(payload): axum::extract::Json<serde_json::Value>) -> impl IntoResponse {
    let text = payload.get("text").and_then(|v| v.as_str()).unwrap_or("");
    Json(TranscribeResponse {
        id: Uuid::new_v4().to_string(),
        text: text.to_string(),
        confidence: 0.95,
        language: "en".into(),
    })
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();
    let cors = CorsLayer::new().allow_origin(Any).allow_methods(Any).allow_headers(Any);
    let app = Router::new()
        .route("/", get(root)).route("/health", get(health))
        .route("/transcribe", post(transcribe_speech))
        .layer(cors);
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3001").await.unwrap();
    tracing::info!("dictation backend running on port 3001");
    axum::serve(listener, app).await.unwrap();
}
