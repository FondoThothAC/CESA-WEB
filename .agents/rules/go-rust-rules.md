# 🦀 🐹 Reglas de Desarrollo Backend en Go & Rust

Este documento establece los estándares de programación, optimización de recursos y guías de desarrollo para los componentes backend en **Go (1.22 - 1.25)** y **Rust (Edición 2024 / Axum + Tokio + SQLx)** en el proyecto CESA UNISON.

---

## 1. ⚡ Estándares de Rendimiento y Memoria (VPS)
- **Consumo de RAM Objetivo:** El backend unificado en Rust (`rust-backend/`) debe mantener un footprint de memoria RAM menor a **15 MB** en reposo y menor a **35 MB** bajo carga intensiva.
- **Concurrencia:** Aprovechar el modelo de tareas asíncronas de Tokio (`tokio::spawn`) en Rust y Goroutines en Go para soportar **25,000+ alumnos simultáneos** sin bloqueos del hilo principal.
- **Connection Pooling:** Mantener un pool configurado en SQLx (`MySqlPool`) con límites explícitos (`max_connections = 50`, `idle_timeout = 600s`) para proteger MariaDB en el VPS.

---

## 2. 🛠️ Reglas del Compilador y Verificación
1. **Compilación Limpia OBLIGATORIA:** Antes de desplegar o declarar una tarea como finalizada, se DEBE ejecutar `cargo check` o `cargo build` verificando cero errores y resolviendo todas las advertencias (`warnings`).
2. **Cero Fragmentación de Funciones:** Cumplir estrictamente con la regla global del proyecto: entregar handlers, estructuras o funciones de Rust/Go COMPLETAS de principio a fin, evitando recortes o comentarios `// ... resto del código`.
3. **Manejo de Errores Estricto:** Evitar `.unwrap()` o `.expect()` en código de producción durante el manejo de peticiones HTTP. Retornar siempre respuestas estandarizadas `ApiResponse::error(StatusCode::..., "Mensaje en español")`.

---

## 3. 🌐 Formato de Respuestas e Idioma
- **Documentación y Comentarios:** Todos los docstrings, comentarios dentro de archivos `.rs` / `.go` y mensajes de log (`tracing::info!`) deben estar escritos en **ESPAÑOL**.
- **Esquema de API JSON:** Todos los endpoints bajo `/api/v1/` deben retornar la estructura unificada:
  ```json
  {
    "success": true,
    "data": { ... },
    "error": null
  }
  ```

---

## 4. 🔒 Seguridad y Compatibilidad JWT
- **Compatibilidad con PHP:** La firma de tokens JWT debe utilizar la clave `JWT_SECRET` definida en `.env.production` con algoritmo **HS256**.
- **Desencriptación AES-256:** Cualquier valor sensible (como votos o llaves API) debe seguir el estándar de encriptación AES-256 de la plataforma.
