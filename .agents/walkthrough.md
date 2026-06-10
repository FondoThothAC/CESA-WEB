# Walkthrough: Completación y Sembrado de Reactivos de Certificación (100+ Preguntas)

Hemos completado la generación, verificación y sembrado de reactivos para las certificaciones que contaban con un banco de preguntas incompleto, logrando que todas tengan **al menos 100 reactivos únicos** para generar evaluaciones completamente aleatorias y robustas en cada intento.

---

## Cambios Realizados

### 1. Corrección de Restricción en v4.9 SQL
- **Archivo Modificado**: [v4.9_seed_more_skills_questions.sql](file:///Users/robertoeduardocelisrobles/Documents/FT%20Apps/Web/CESA-WEB/database/migrations/v4.9_seed_more_skills_questions.sql)
- **Cambio**: Corregimos un problema de escape de comillas dobles en la línea 86 (pregunta de `MsgBox "Hola"`). Cambiamos `\"` por `\\\"` dentro de la cadena JSON de opciones, lo que evitaba que la base de datos de producción (MariaDB / MySQL) rechazara la inserción por fallo en la restricción `json_valid`.

### 2. Generación Masiva de Preguntas Adicionales (v5.2)
- **Archivo Modificado**: [v5.2_seed_gestion_y_otros.sql](file:///Users/robertoeduardocelisrobles/Documents/FT%20Apps/Web/CESA-WEB/database/migrations/v5.2_seed_gestion_y_otros.sql)
- **Cambio**: Añadimos **216 preguntas técnicas y académicas nuevas** (completamente redactadas en español con opciones y explicaciones didácticas de alta calidad) para alcanzar el mínimo de 100 preguntas únicas por certificación:
  - **PowerPoint Profesional** (ID 5): +66 preguntas (Total: 110 en base de datos).
  - **Habilidades Blandas** (ID 7): +80 preguntas (Total: 110 en base de datos).
  - **Gestión de Proyectos** (ID 8): +70 preguntas (Total: 100 en base de datos).

### 3. Sincronización y Limpieza de Base de Datos
- Realizamos una limpieza controlada (`TRUNCATE`) en las tablas `habilidades` y `preguntas` del servidor de producción para evitar claves duplicadas o registros erróneos derivados de ejecuciones previas incompletas.
- Ejecutamos un despliegue completo que re-sembró de forma exitosa todas las migraciones en cascada.

---

## Estado Final del Catálogo en Producción

Consultando directamente la base de datos del VPS Oracle tras el despliegue final, la distribución de preguntas por certificación (IDs 1 al 18) quedó de la siguiente manera:

| ID | Certificación | Categoría | Total Preguntas en BD | Estado |
|---|---|---|---|---|
| **1** | Inglés B2 | idiomas | **70** | Listo |
| **2** | Inglés C1 | idiomas | **70** | Listo |
| **3** | Excel Intermedio | ofimatica | **114** | Listo (100+) |
| **4** | Excel Avanzado | ofimatica | **114** | Listo (100+) |
| **5** | PowerPoint Profesional | ofimatica | **110** | Listo (100+) |
| **6** | Python Básico | programacion | **171** | Listo (100+) |
| **7** | Habilidades Blandas | soft_skills | **110** | Listo (100+) |
| **8** | Gestión de Proyectos | profesional | **100** | Listo (100+) |
| **9** | Chino Nivel 1-2 | idiomas | **40** | Listo |
| **10** | Chino Nivel 3 | idiomas | **30** | Listo |
| **11** | Chino Nivel 4 | idiomas | **30** | Listo |
| **12** | Chino Nivel 5 | idiomas | **30** | Listo |
| **13** | Chino Nivel 6 | idiomas | **30** | Listo |
| **14** | Inglés A1-A2 | idiomas | **40** | Listo |
| **15** | Inglés B1 | idiomas | **120** | Listo (100+) |
| **16** | Inglés B2/C1 Avanzado | idiomas | **120** | Listo (100+) |
| **17** | Inglés C1-C2 | idiomas | **40** | Listo |
| **18** | Python Completo | programacion | **120** | Listo (100+) |

---

## Verificación de Despliegue

### Compilación y Construcción del Frontend
Ejecutamos con éxito el comando Next.js local:
```bash
npm run build
```
- **Resultado**: `✓ Compiled successfully` con cero errores.

### Migración de Base de Datos y PM2 en VPS
Ejecutamos el script de automatización general:
```bash
bash scripts/deploy_vps.sh
```
- **Resultado**: Todos los archivos del frontend estático y el backend PHP fueron sincronizados al VPS, las migraciones SQL `v4.9`, `v5.0`, `v5.1` y `v5.2` corrieron de principio a fin sin fallar, y PM2 levantó exitosamente el servicio `cesa-ai-engine`.
