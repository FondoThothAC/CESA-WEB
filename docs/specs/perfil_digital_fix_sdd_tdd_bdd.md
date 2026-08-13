# 📋 Especificación Técnica: Corrección y Blindaje del Perfil Digital (SDD, TDD, BDD)

## 1. 🏗️ SDD (Software Design Document)

### 1.1. Contexto y Problema
Al hacer clic en la pestaña "Perfil" en `https://cesaunison.fondothoth.com`, Next.js sufre una excepción en tiempo de ejecución del lado del cliente (`client-side exception`). 
La causa raíz identificada es el acceso inseguro a propiedades nulas o no definidas:
- `{profile.nombre_completo[0]}` cuando el usuario tiene almacenado el campo `nombre` en lugar de `nombre_completo` o cuando `nombre_completo` es `undefined`.
- Acceso directo a subcampos de `profile.progreso_academico` sin defensas contra valores nulos.
- Manipulación de arrays (`myCerts`, `catalog`, `reservas`) sin asegurar estructura de lista.
- Deserialización de `selectedResult.resultados_json` en `PsychometricTests.tsx` si viene como string JSON.

### 1.2. Arquitectura de la Solución
```
┌────────────────────────────────────────────────────────┐
│               Frontend: page.tsx (Tab Perfil)          │
│  - Sanitización y fallback en effectiveProfile         │
│  - Soporte de campos unificados (nombre / nombre_compl)│
└───────────────────────────┬────────────────────────────┘
                            │ (profile defensivo garantizado)
                            ▼
┌────────────────────────────────────────────────────────┐
│          Componente: AcademicProfile.tsx               │
│  - Guard de avatar/inicial seguro                      │
│  - Objeto de respaldo para progreso_academico          │
│  - Blindaje en fetchCatalog, fetchReservas y Carnet    │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│          Componente: PsychometricTests.tsx             │
│  - Parse seguro de resultados_json (string u objeto)   │
│  - Manejo robusto de loading sin token                 │
└────────────────────────────────────────────────────────┘
```

### 1.3. Cambios en Backend (`backend/api/auth.php`)
- Unificar la respuesta del login y del token JWT para incluir de manera simétrica:
  - `nombre_completo`
  - `nombre`
  - `expediente`
  - `matricula`
  - `carrera`

---

## 2. 🧪 TDD (Test-Driven Development)

### 2.1. Casos de Prueba Unitarios y de Integración

1. **Test Perfil con Usuario Autenticado estándar (`nombre_completo` definido):**
   - Entrada: `profile = { nombre_completo: "Roberto Celis", expediente: "213203453", carrera: "ISI", progreso_academico: { ... } }`
   - Salida esperada: Renderizado correcto del avatar ("R"), nombre completo, barra de créditos y métricas.

2. **Test Perfil con Usuario con datos mínimos (`nombre` en lugar de `nombre_completo`):**
   - Entrada: `profile = { nombre: "Juan Perez", email: "juan@unison.mx" }` (sin `nombre_completo` ni `progreso_academico`)
   - Salida esperada: Fallback sin errores: Inicial "J", créditos por defecto en 0/450, semestres óptimos y catálogo cargable sin excepciones.

3. **Test Perfil sin sesión (Usuario Anónimo):**
   - Entrada: `profile = null`
   - Salida esperada: Tarjeta elegante de "Acceso restringido: Inicia sesión con tu cuenta UNISON", sin spinners colgados ni excepciones JS.

4. **Test Catálogo de Certificaciones y Mis Certificados:**
   - Entrada: `data.my_certs = null` o `undefined`
   - Salida esperada: `myCerts` manejado como `[]`, renderizado de tarjeta "No hay certificaciones vigentes" sin fallar en `.some()`.

5. **Test Desglose de Pruebas Psicométricas:**
   - Entrada: `resultados_json = "{\"Apertura\": 80, \"Responsabilidad\": 90}"` (string) o `{ "Apertura": 80 }` (objeto)
   - Salida esperada: `Object.entries` se ejecuta sobre el objeto parseado sin error de tipo.

---

## 3. 🎯 BDD (Behavior-Driven Development)

### Escenario 1: Estudiante autenticado consulta su perfil
- **Dado que** el estudiante ha iniciado sesión en la plataforma CESA UNISON
- **Cuando** hace clic en el botón "Perfil" en la barra de navegación o en el dock
- **Entonces** el sistema muestra su expediente digital con su nombre, avatar o inicial, barra de avance de créditos y catálogo de certificaciones sin ningún error de cliente.

### Escenario 2: Usuario anónimo visita la pestaña de perfil
- **Dado que** un visitante no autenticado navega a la plataforma
- **Cuando** hace clic en "Perfil"
- **Entonces** se presenta el mensaje de seguridad informando que debe iniciar sesión, manteniendo la estabilidad de la aplicación.

### Escenario 3: Estudiante consulta sus resultados psicométricos
- **Dado que** el estudiante completó un test psicométrico previamente
- **Cuando** hace clic en "Ver Perfil" dentro de la sección de Psicometría
- **Entonces** se visualiza el desglose dimensional con barras de porcentaje independientemente del formato de serialización del backend.
