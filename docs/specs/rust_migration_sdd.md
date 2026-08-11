# 🦀 ESPECIFICACIÓN TÉCNICA: MIGRACIÓN DEL BACKEND A RUST (Axum + Tokio + SQLx)
> **Documento Oficial de Especificación (SDD / TDD / BDD)**  
> **Proyecto:** CESA UNISON — Transición a Backend Unificado en Rust  
> **Fecha:** Julio 2026  
> **Objetivo:** Incrementar la capacidad de alumnos simultáneos de 1,000 a 25,000+ con consumo de RAM ultra mínimo (< 15 MB) y latencia sub-milisegundo.

---

## 1. 📐 SDD (Spec-Driven Development) — Arquitectura y Especificación del Sistema

### A. Visión General de la Arquitectura
El nuevo backend en Rust se alojará en el directorio `rust-backend/`. Reemplazará progresivamente el `ai-engine` (Node.js) y las APIs de `backend/api/` (PHP 8.3) mediante un único binario ejecutable de alto rendimiento gestionado por `systemd` en el puerto `8080` del VPS.

```
                  ┌────────────────────────────────────────┐
                  │          Nginx Reverse Proxy           │
                  └───────────────────┬────────────────────┘
                                      │
                 ┌────────────────────┴────────────────────┐
                 │                                         │
        [Paso 1: Transición]                      [Paso 2: Final]
        /api/v1/* (Rust Port 8080)               /api/* (Rust Port 8080)
                 │                                         │
                 ▼                                         ▼
   ┌─────────────────────────────────────────────────────────────┐
   │                  Rust Backend (Axum Server)                 │
   │  ┌──────────────┬──────────────┬──────────────┬───────────┐ │
   │  │ Module: Auth │ Module: AI   │ Module: News │ Module:   │ │
   │  │ (JWT/AES)    │ Engine (RAG) │ & Bazar      │ Elections │ │
   │  └──────┬───────┴──────┬───────┴──────┬───────┴─────┬─────┘ │
   │         │              │              │             │       │
   │         └──────────────┼──────────────┴─────────────┘       │
   │                        ▼                                    │
   │            SQLx Connection Pool (MariaDB)                   │
   └────────────────────────┬────────────────────────────────────┘
                            ▼
               MariaDB Database (`cesa_web`)
```

### B. Módulos y Estructura del Código (`rust-backend/`)
```
rust-backend/
├── Cargo.toml
├── src/
│   ├── main.rs                   # Punto de entrada (Axum listener & graceful shutdown)
│   ├── config.rs                 # Variables de entorno (.env.production)
│   ├── state.rs                  # AppState (SQLx pool, HTTP client, reqwest pool)
│   ├── middleware/
│   │   ├── auth.rs               # Verificación de JWT Bearer tokens & roles
│   │   ├── cors.rs               # Cabeceras CORS hiper-seguras
│   │   └── rate_limit.rs         # Governor / Leaky bucket rate limiter
│   ├── modules/
│   │   ├── auth/                 # Login UNISON, JWT, AES-256
│   │   ├── ai_engine/            # Multi-API Key Ollama Cloud pool & RAG (.md)
│   │   ├── noticias/             # Feed de noticias, categorías y vistas
│   │   ├── bazar/                # Tiendas, productos y reserva de spots
│   │   ├── votaciones/           # Votos encriptados de elecciones
│   │   └── expedientes/          # Créditos, materias y perfil estudiantil
│   ├── db/
│   │   └── pool.rs               # Configuración de MySqlPool de SQLx
│   └── utils/
│       ├── crypto.rs             # Desencriptación AES-256 idéntica a PHP
│       └── response.rs           # Estructura de respuesta JSON estandarizada
```

### C. Dependencias Clave (`Cargo.toml`)
```toml
[package]
name = "cesa-rust-backend"
version = "1.0.0"
edition = "2024"

[dependencies]
axum = { version = "0.7", features = ["macros"] }
tokio = { version = "1.40", features = ["full"] }
sqlx = { version = "0.8", features = ["runtime-tokio", "tls-native-tls", "mysql", "chrono"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
jsonwebtoken = "9.3"
aes-gcm = "0.10"
reqwest = { version = "0.12", features = ["json"] }
tracing = "0.1"
tracing-subscriber = "0.3"
dotenvy = "0.15"
tower-http = { version = "0.5", features = ["cors", "trace"] }
```

---

## 2. 🥒 BDD (Behavior-Driven Development) — Escenarios de Comportamiento

```gherkin
# language: es
Característica: Alta Concurrencia Estudiantil en Backend Rust
  Como estudiante del CESA UNISON
  Quiero que la plataforma responda instantáneamente en momentos de alta demanda (votaciones/noticias)
  Para tener una experiencia fluida sin errores 502 o caídas del servidor.

  Escenario: 25,000 peticiones simultáneas durante votaciones estudiantiles
    Dado que el backend en Rust está ejecutándose en el puerto 8080 con 20 conexiones a MariaDB
    Cuando 25,000 alumnos envían sus votos encriptados en un intervalo de 60 segundos
    Entonces el tiempo medio de respuesta del servidor debe ser menor a 5 milisegundos
    Y la utilización de memoria RAM del servidor Rust no debe exceder los 25 Megabytes
    Y MariaDB no debe presentar errores de conexión rechazada.

  Escenario: Consulta al Asistente Bob con RAG y failover de clave Ollama
    Dado que una clave de Ollama Cloud devuelve un error HTTP 429 (Cuota excedida)
    Cuando el módulo `ai_engine` de Rust procesa la pregunta del alumno
    Entonces el cliente asíncrono de Rust debe conmutar a la siguiente clave del pool en menos de 50 milisegundos
    Y debe inyectar el contexto RAG Markdown correspondiente sin bloquear otros hilos de ejecución.

  Escenario: Compatibilidad total de JWT con la autenticación previa
    Dado un token JWT válido generado previamente durante la sesión del alumno
    Cuando la PWA realiza una petición a `/api/v1/expediente` con el encabezado `Authorization: Bearer <token>`
    Entonces el middleware de Rust debe validar la firma HS256 correctamente
    Y debe permitir el acceso a los datos del expediente del usuario.
```

---

## 3. 🧪 TDD (Test-Driven Development) — Plan de Pruebas y Validación

### A. Pruebas Unitarias e Integración (`cargo test`)
1. **Módulo Crypto & JWT:**
   - Verificar la desencriptación de claves AES-256 generadas por PHP.
   - Probar decodificación de JWTs válidos y expirados.
2. **Módulo AI Router:**
   - Mockear respuestas de Ollama Cloud y probar la rotación de API keys (`Multi-API Failover`).
3. **Módulo de DB (SQLx):**
   - Ejecutar pruebas integradas con `sqlx::test` sobre una base de datos MariaDB de prueba.

### B. Pruebas de Carga y Estrés (Benchmark)
- **Herramienta:** `k6` / `wrk`
- **Comando de prueba local:**
  ```bash
  wrk -t12 -c400 -d30s http://localhost:8080/api/v1/noticias
  ```
- **Criterio de Aprobación (P99):** 0% de errores, > 30,000 req/sec en máquinas de desarrollo y > 15,000 req/sec en el VPS Oracle.
