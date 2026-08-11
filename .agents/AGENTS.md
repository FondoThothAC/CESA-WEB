# 🤖 AGENTS.md — Reglas y Especificaciones del Proyecto CESA UNISON

Este archivo centraliza las reglas del proyecto aplicables a todos los agentes de IA y desarrolladores.

## 📜 Reglas Incluidas

1. **[vps-deploy-rules.md](file:///Users/robertoeduardocelisrobles/Documents/FT%20Apps/Web/CESA-WEB/.agents/rules/vps-deploy-rules.md)**: Rieles de despliegue al VPS de producción (`129.146.150.123`, `https://cesaunison.fondothoth.com`).
2. **[go-rust-rules.md](file:///Users/robertoeduardocelisrobles/Documents/FT%20Apps/Web/CESA-WEB/.agents/rules/go-rust-rules.md)**: Estándares de desarrollo para Go (1.22-1.25) y Rust (Edición 2024 / Axum + Tokio + SQLx).

---

## 🎯 Directivas Principales

- **Idioma:** Todos los comentarios de código, docstrings y explicaciones deben escribirse en **ESPAÑOL**.
- **Calidad:** Entregar funciones y componentes COMPLETO(S) de principio a fin sin fragmentar.
- **Validación:** Validar siempre con `cargo check` y `npm run build` antes de realizar despliegues al VPS.
