# Novedades y Guía de Referencia: Go & Rust (2024 - 2026)

Este documento resume las características más importantes, mejoras de rendimiento, sintaxis nueva y herramientas introducidas en **Go (versiones 1.22 a 1.25)** y **Rust (versiones 1.75 a 1.85 y Edición 2024)**.

---

## 🐹 Go (Golang) - Novedades Principales

### 1. Go 1.22 (Febrero 2024)
* **Corrección del alcance de variables en bucles (`for`)**: Cada iteración ahora crea una instancia única de la variable del bucle, eliminando los clásicos bugs de goroutines que capturaban la misma variable.
* **Iteración directa sobre enteros**:
  ```go
  for i := range 10 { // 0 a 9
      fmt.Println(i)
  }
  ```
* **Nuevo enrutador HTTP (`net/http.ServeMux`)**: Soporte nativo para métodos HTTP y comodines en rutas:
  ```go
  mux.HandleFunc("GET /users/{id}", handleGetUser)
  mux.HandleFunc("POST /items", handleCreateItem)
  ```
* **`math/rand/v2`**: Primera API versión 2 en la librería estándar. Algoritmos más rápidos (ChaCha8, PCG) y mejor concurrencia sin cerrojos globales.

### 2. Go 1.23 (Agosto 2024)
* **Iteradores (`range-over-func`) y paquete `iter`**: Soporte nativo para iteradores personalizados con la sintaxis `for ... range`.
  ```go
  package main

  import (
      "fmt"
      "iter"
  )

  func ContarPares(max int) iter.Seq[int] {
      return func(yield func(int) bool) {
          for i := 0; i <= max; i += 2 {
              if !yield(i) {
                  return
              }
          }
      }
  }

  func main() {
      for n := range ContarPares(10) {
          fmt.Println(n) // 0, 2, 4, 6, 8, 10
      }
  }
  ```
* **Paquete `unique`**: Permite la internación de valores comparables (*interning*), reduciendo drásticamente el consumo de memoria al compartir instancias idénticas.
* **Funciones de Iteración en `slices` y `maps`**: Adición de utilidades como `slices.All()`, `slices.Values()`, `maps.Keys()`, `maps.Values()`.

### 3. Go 1.24 (Febrero 2025)
* **Alias de Tipos Genéricos**: Soporte completo para alias con parámetros de tipo:
  ```go
  type Vector[T any] = []T
  ```
* **Directiva `tool` en `go.mod`**: Permite rastrear dependencias de herramientas ejecutables en el archivo `go.mod` de forma nativa.
* **Criptografía Post-Cuántica (`crypto/mlkem`)**: Inclusión de algoritmos ML-KEM (FIPS 203) resistentes a computación cuántica, además de `crypto/hkdf`, `crypto/pbkdf2` y `crypto/sha3`.
* **Mejoras del Runtime**: Nuevo mapa interno con menores colisiones, menor sobrecarga en asignaciones pequeñas y cerrojos `sync.Mutex` más eficientes.

### 4. Go 1.25 (Agosto 2025)
* **`GOMAXPROCS` Automático en Contenedores**: El runtime detecta los límites de CPU asignados en Kubernetes/Docker y ajusta `GOMAXPROCS` sin requerir librerías externas.
* **`testing/synctest` Estable**: Paquete para probar código concurrente mediante "burbujas" aisladas y relojes simulados.
* **Vista previa de `encoding/json/v2`**: Nueva implementación con mejor rendimiento, soporte para streaming y opciones personalizables.
* **Nuevos analizadores `go vet`**: Diagnóstico para llamadas incorrectas a `WaitGroup.Add` y recomendaciones para `net.JoinHostPort`.

---

## 🦀 Rust - Novedades Principales

### 1. Rust Edición 2024 (Rust 1.85.0 - Febrero 2025)
La Edición 2024 representa una gran actualización de compatibilidad y sintaxis moderna:
* **Async Closures**: Sintaxis nativa para cierres asíncronos y los traits asociados (`AsyncFn`, `AsyncFnMut`, `AsyncFnOnce`):
  ```rust
  let fetch_data = async || {
      reqwest::get("https://api.example.com").await
  };
  ```
* **Mejoras de Seguridad (*Unsafe Rules*)**:
  * Bloques `unsafe extern` explícitos.
  * Atributos como `#[no_mangle]` ahora deben marcarse como `unsafe`.
  * Validación más estricta con `unsafe_op_in_unsafe_fn`.
* **Reglas de Captura de Lifetimes en `impl Trait` (RPIT)**: Uso explicativo del modificador `use<..>` para controlar la captura de parámetros de tipo y lifetime en valores devueltos.
* **Palabra reservada `gen`**: Reservada para la futura estabilización de generadores (`gen fn`).
* **Resolver MSRV en Cargo**: Cargo selecciona automáticamente versiones de dependencias compatibles con el `rust-version` declarado en `Cargo.toml`.

### 2. Rust 1.75 - 1.84 (Puntos Clave del Compilador)

| Versión | Novedades Clave |
| :--- | :--- |
| **1.75.0** | Estabilización de `async fn` y `impl Trait` en Traits (AFIT/RPITIT). Métodos con desplazamiento de bytes en punteros (`byte_add`, `byte_sub`). |
| **1.80.0** | `LazyCell` y `LazyLock` en la librería estándar (reemplaza el uso de `once_cell` o `lazy_static`). Patrones de rangos exclusivos (`a..b`). |
| **1.82.0** | Subcomando `cargo info`, nueva sintaxis para punteros crudos (`&raw const` / `&raw mut`), bloques `unsafe extern`. |
| **1.84.0** | Resolver MSRV consciente en Cargo y diagnósticos mejorados para coincidencias de tipos. |

#### Ejemplo: `LazyLock` en Rust 1.80+ (Sin librerías externas)
```rust
use std::sync::LazyLock;
use std::collections::HashMap;

// Inicialización diferida segura entre hilos sin lazy_static
static CONFIG: LazyLock<HashMap<&'static str, &'static str>> = LazyLock::new(|| {
    let mut m = HashMap::new();
    m.insert("host", "localhost");
    m.insert("port", "8080");
    m
});

fn main() {
    println!("Servidor en: {}:{}", CONFIG["host"], CONFIG["port"]);
}
```

#### Ejemplo: Punteros Crudos en Rust 1.82+
```rust
struct Data {
    val: i32,
}

fn main() {
    let d = Data { val: 42 };
    // Sintaxis clara sin necesidad de macros como addr_of!
    let ptr: *const i32 = &raw const d.val;
    unsafe {
        println!("Valor: {}", *ptr);
    }
}
```

---

## ⚡ Cuadro Comparativo de Tendencias

| Característica | Go (1.22 - 1.25) | Rust (1.75 - 1.85 / Edición 2024) |
| :--- | :--- | :--- |
| **Concurrencia** | `testing/synctest`, `GOMAXPROCS` dinámico | Async Closures (`async \|\| {}`), AFIT (`async fn` en traits) |
| **Iteración** | `range-over-func` (iteradores `iter.Seq`) | Iteradores maduros, extensión de expresiones `gen` |
| **Inicialización / Memoria** | Paquete `unique` (*interning*), nuevos GCs | `LazyLock` / `LazyCell` en `std` |
| **Seguridad / Tipado** | Alias genéricos, verificación ampliada | `unsafe extern`, atributos `unsafe`, MSRV-resolver |
| **Enrutamiento / Herramientas** | `net/http.ServeMux` avanzado, `go.mod tool` | `cargo info`, MSRV-aware Cargo |

---

## 💡 Lista de Comprobación para Proyectos Nuevos

- [ ] **En Go**: Utilizar `range-over-func` para procesar flujos de datos grandes, migrar a `math/rand/v2`, estructurar rutas HTTP con `net/http.ServeMux` sin frameworks externos innecesarios y usar `go.mod tool` para utilidades de CLI.
- [ ] **En Rust**: Adoptar **Rust Edición 2024**, reemplazar `lazy_static`/`once_cell` por `std::sync::LazyLock`, usar `async fn` directamente en Traits y definir `rust-version` en `Cargo.toml` para resolución MSRV limpia.
