# 🛠️ Workflow: Compilación y Validación del Backend en Rust

Este workflow describe los pasos para verificar, compilar y probar el backend de Rust (`rust-backend/`) localmente.

## Pasos de Ejecución

1. **Asegurar variables de entorno y PATH de Cargo:**
   ```bash
   export PATH="$HOME/.cargo/bin:$PATH"
   ```

2. **Verificar sintaxis y tipado (`cargo check`):**
   ```bash
   cd rust-backend
   cargo check
   ```

3. **Ejecutar pruebas unitarias (`cargo test`):**
   ```bash
   cd rust-backend
   cargo test
   ```

4. **Compilar binario de producción local:**
   ```bash
   cd rust-backend
   cargo build --release
   ```
