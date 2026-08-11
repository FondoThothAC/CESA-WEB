# 📘 DOCUMENTO MAESTRO DE HANDOFF Y RESUMEN EJECUTIVO DEL PROYECTO CESA UNISON
> **Preparado para su lectura y continuidad en OpenCode, MimoCode, Claude Code, Codex u otros asistentes IA.**  
> **Fecha de Sincronización:** 24 de Julio de 2026  
> **Versión de Producción:** v6.8 (Ollama Multi-Key Pool, RAG Markdown, OCEAN Psychometrics & Unified Auth)

---

## 📑 TABLA DE CONTENIDOS
1. [Resumen General del Proyecto](#1-resumen-general-del-proyecto)
2. [Rieles y Reglas Globales de Código (SDD / TDD / BDD)](#2-rieles-y-reglas-globales-de-código-sdd--tdd--bdd)
3. [Entorno de Producción, SSH Keys y Usuarios Maestros](#3-entorno-de-producción-ssh-keys-y-usuarios-maestros)
4. [Flujos de Despliegue y Comandos Exactos VPS](#4-flujos-de-despliegue-y-comandos-exactos-vps)
5. [Stack Tecnológico y Arquitectura](#5-stack-tecnológico-y-arquitectura)
6. [Ecosistema de IA: Bob Assistant & Motor Psicométrico OCEAN](#6-ecosistema-de-ia-bob-assistant--motor-psicométrico-ocean)
7. [Módulo de Bazar Emprendedor & Marketplace](#7-módulo-de-bazar-emprendedor--marketplace)
8. [Autenticación Unificada y Seguridad](#8-autenticación-unificada-y-seguridad)
9. [Bot de Monitoreo de Telegram (ZeroClaw)](#9-bot-de-monitoreo-de-telegram-zeroclaw)
10. [Registro de Migraciones SQL (v1.0 a v6.8)](#10-registro-de-migraciones-sql-v10-a-v68)
11. [Mapa de Archivos Principales del Proyecto](#11-mapa-de-archivos-principales-del-proyecto)
12. [Guía Paso a Paso para Continuar en OpenCode / Claude Code / Codex](#12-guía-paso-a-paso-para-continuar)

---

## 1. 🌐 RESUMEN GENERAL DEL PROYECTO

El portal **CESA UNISON** ([`https://cesaunison.fondothoth.com`](https://cesaunison.fondothoth.com)) es la plataforma digital oficial del **Consejo Estudiantil de Sociedades de Alumnos de la Universidad de Sonora**. Integra gobernanza universitaria, elecciones digitales encriptadas, directorio holístico de estudiantes, bazar emprendedor interactivo con mini-tiendas marketplace, un ecosistema social y el asistente de inteligencia artificial **Bob**, impulsado por **Ollama Cloud (Nemotron-3 Super)** con análisis psicométrico OCEAN.

---

## 2. 🛡️ RIELES Y REGLAS GLOBALES DE CÓDIGO (SDD / TDD / BDD)

> **REGLAS ESTRICTAS DE DESARROLLO (MANDATORIAS PARA CUALQUIER AGENTE O DESARROLLADOR):**

1. **🧩 Código Completo de Principio a Fin (Sin Fragmentar):**
   - Cuando sugieras o realices modificaciones en un archivo existente, debes proporcionar **SIEMPRE el componente, hook o función COMPLETA de principio a fin** (desde su declaración `function...` / `const...` hasta su llave de cierre `}`).
   - **PROHIBIDO FRAGMENTAR:** NUNCA entregues fragmentos sueltos, recortes ni comentarios del tipo `// ... resto del código` dentro de funciones o bloques lógicos complejos para evitar errores de sintaxis o pérdida de llaves al copiar y pegar.

2. **🌐 Idioma y Estilo:**
   - **Comentarios y Documentación:** Todos los comentarios de código, docstrings y explicaciones técnicas en archivos fuente (`.js`, `.jsx`, `.ts`, `.tsx`, `.php`, `.sql`, `.sh`) deben escribirse única y exclusivamente en **ESPAÑOL**.
   - **Textos de Interfaz (Frontend):** Todos los textos de cara al usuario final (etiquetas, botones, alertas, descripciones y tooltips) deben estar redactados en **español neutro premium** con estética hiper-cuidada.

3. **🎯 Spec-Driven Development (SDD) & Economía de Tokens:**
   - Al iniciar nuevos módulos o refactorizaciones, generar la especificación viva (SDD), escenarios BDD (Gherkin) y plan de verificación (TDD).
   - Documentar los avances en la carpeta del proyecto y limpiar el hilo de conversación archivando detalles redundantes.

---

## 3. 🔐 ENTORNO DE PRODUCCIÓN, SSH KEYS Y USUARIOS MAESTROS

### A. Información del Servidor VPS (Oracle Cloud Infrastructure)
- **URL de Producción:** `https://cesaunison.fondothoth.com`
- **PWA Shell:** `https://cesaunison.fondothoth.com/pwa/`
- **IP del VPS:** `129.146.150.123`
- **Usuario SSH:** `ubuntu`
- **Ruta Local de la Llave SSH (Mac):**  
  `/Users/robertoeduardocelisrobles/Documents/FT Apps/Web/CESA-WEB/unison keys/ssh-key-2026-05-12.key`
- **Ruta del Proyecto en el Servidor:** `/var/www/cesa-web`

### B. Comando de Conexión Manual por Terminal
```bash
ssh -i "/Users/robertoeduardocelisrobles/Documents/FT Apps/Web/CESA-WEB/unison keys/ssh-key-2026-05-12.key" ubuntu@129.146.150.123
```

### C. Cuentas Maestras / Admin Supremo
- `software@fondothoth.com` (Master Owner - Acceso Modo Dios & Ads)
- `a213203453@unison.mx` (Master Owner - Auditoría & Sentiment IA)

### D. Credenciales y Acceso a Base de Datos en VPS
- **Motor:** MariaDB / MySQL
- **Nombre BD:** `cesa_web`
- **Acceso directo vía SSH:** `sudo mysql cesa_web`

---

## 4. 🚀 FLUJOS DE DESPLIEGUE Y COMANDOS EXACTOS VPS

Ante cualquier modificación de código, se debe seguir estrictamente este orden de 3 pasos:

1. **Prueba Local:**
   ```bash
   # Probar sintaxis PHP de archivos modificados:
   php -l backend/api/chat.php
   php -l backend/api/auth.php
   
   # Levantar entorno dev frontend:
   npm run dev --prefix frontend
   ```

2. **Validación de Compilación de Producción:**
   ```bash
   npm run build --prefix frontend
   ```

3. **Ejecutar Despliegue Automatizado al VPS:**
   ```bash
   bash scripts/deploy_vps.sh
   ```

### ¿Qué ejecuta internamente `deploy_vps.sh`?
1. Realiza build local de Next.js (`npm run build`).
2. Sincroniza los estáticos creados hacia `/var/www/cesa-web/frontend/out` mediante `rsync`.
3. Copia el backend PHP e imágen de migración SQL a `/tmp/`.
4. Corre los scripts SQL pendientes en MariaDB mediante `sudo mysql cesa_web < /tmp/vX.X.sql`.
5. Valida la sintaxis de Nginx (`sudo nginx -t`) y recarga el servicio (`sudo systemctl reload nginx`).
6. Ajusta permisos de archivos a `www-data:www-data`.
7. Reinicia el motor de IA en PM2 (`sudo -u www-data PM2_HOME=/var/www/home/.pm2 npx pm2 restart 0`).

---

## 5. 🛠️ STACK TECNOLÓGICO Y ARQUITECTURA

### Frontend
- **Framework:** Next.js 14 (App Router) + React 18 + TypeScript.
- **Estilos & UI:** Vanilla CSS + Tailwind CSS + Glassmorphism UI + Lucide React Icons.
- **Geolocalización & Mapas:** Leaflet + React-Leaflet (Mapas esquemáticos radiales de Calle de la Cultura).

### Backend
- **Core:** PHP 8.3 en Nginx con PHP-FPM + PDO.
- **Base de Datos:** MariaDB / MySQL en VPS.
- **Seguridad:** JWT Helper (Tokens Bearer) + Encriptación AES-256 para API Keys + CSRF Protection.
- **Microservicio IA (Node.js/Express):** `ai-engine/src/server.js` gestionado por PM2 (`cesa-ai-engine`) en el puerto local 3001.

---

## 6. 🤖 ECOSISTEMA DE IA: BOB ASSISTANT & MOTOR PSICOMÉTRICO OCEAN

### A. Pool de Keys Ollama Cloud (Multi-API Failover)
- El sistema soporta un pool de 6 a 7 claves API de Ollama Cloud (`OLLAMA_API_KEYS=key1,key2,key3...`).
- Implementado en `backend/api/chat.php` (`callOllamaCloud`) y en `ai-engine/src/services/ai-router.js`.
- Si una clave falla por límite de cuota (HTTP 429 / 401), conmuta instantáneamente a la siguiente clave sin interrumpir la experiencia del alumno.

### B. Base de Conocimiento RAG en Markdown (`.md`)
- Endpoint: `/backend/api/admin/rag_knowledge.php`.
- Pestaña Admin: `AdminRagKnowledgeTab.tsx` para subir o redactar archivos `.txt`, `.md`, `.doc` o `.pdf`.
- Los documentos son convertidos automáticamente a formato Markdown (`.md`) sanitizado y almacenados en `ia_conocimiento_rag` calculando tokens.
- En cada interacción en `chat.php`, el backend realiza una búsqueda léxica inyectando bloques `.md` en el System Prompt de Bob.

### C. Persistencia de Sesión & Sincronización en Inbox
- Tablas: `ia_chat_sesiones` e `ia_chat_mensajes`.
- Sincronización total entre la ventana flotante (`CesaAssistant.tsx`) y la bandeja de entrada del usuario (`Inbox.tsx`).
- Endpoint: `/api/chat.php?action=history`.

### D. Compresión Automática de Hilo (`.md`)
- Cuando la conversación con Bob alcanza 10 mensajes, se genera automáticamente una síntesis en Markdown (`resumen_contexto_md`) con los puntos clave tratados.
- El hilo se compacta y se reinicia el contador de mensajes, inyectando el `.md` comprimido como memoria inicial para evitar el desbordamiento de contexto.

### E. Modelo Psicoemocional OCEAN (Big Five) & 7 Emociones Basales
- **Rasgos Evaluados:**
  1. 💡 **Apertura (Openness)**: Curiosidad intelectual e iniciativas.
  2. 📋 **Responsabilidad (Conscientiousness)**: Enfoque académico y avance de créditos.
  3. ⚡ **Extraversión (Extraversion)**: Sociabilidad.
  4. 🤝 **Amabilidad (Agreeableness)**: Empatía y tono colaborativo.
  5. ⚠️ **Neuroticismo / Tensión Académica (Neuroticism)**: Estrés o agobio.
- **7 Emociones Basales:** *Alegría, Confianza, Curiosidad, Neutral, Ansiedad/Estrés, Frustración, Agotamiento*.
- **Control de Privacidad Estricto:** La pestaña `🧠 Sentimiento Estudiantil` y la auditoría de chats están reservadas **exclusivamente para el Admin Supremo** (`software@fondothoth.com` / `a213203453@unison.mx`) y usuarios con `permiso_ia`.

---

## 7. 🏪 MÓDULO DE BAZAR EMPRENDEDOR & MARKETPLACE

- **Próxima Edición Oficial:** **12 de Agosto de 2026** (Bazar Edición ID 4 activa en MariaDB).
- **Categorías:** Accesorios (`accesorios`), Comida, Tech, Arte, Moda, Servicios.
- **Mapa Esquemático Radial ([`BazarSchematicMap.tsx`](file:///Users/robertoeduardocelisrobles/Documents/FT%20Apps/Web/CESA-WEB/frontend/src/components/BazarSchematicMap.tsx)):** Puestos de Calle de la Cultura. Puntos verdes (disponibles) y dorados con destello (ocupados). Despliega tarjeta con WhatsApp directo e Instagram al tocar.
- **Mini-Tienda Marketplace:** Tabla `bazar_productos` para que cada emprendedor pueda subir y vender su catálogo de productos en el portal.
- **Asignación Admin:** `/backend/api/bazar-admin.php` con `action=asignar_puesto`.

---

## 8. 🔑 AUTENTICACIÓN UNIFICADA Y SEGURIDAD

- **Triple Identidad Habilitada ([`auth.php`](file:///Users/robertoeduardocelisrobles/Documents/FT%20Apps/Web/CESA-WEB/backend/api/auth.php)):** Inicia sesión con Correo Institucional (`@unison.mx` / `@fondothoth.com`), Celular (10 dígitos) o CURP.
- **Modo Sin Contraseña (Passwordless):** Validación de identidad cruzando Correo + Celular + CURP para máxima seguridad en votaciones o trámites institucionales.

---

## 9. 🤖 BOT DE MONITOREO DE TELEGRAM (ZEROCLAW)

- **Webhook File:** `backend/api/zeroclaw_webhook.php`
- **Helper:** `backend/lib/TelegramBot.php`
- **Comandos en Vivo:**
  - `/status` o `/health`: Uptime, uso de memoria, estado Nginx y MariaDB.
  - `/bazar`: Total de puestos libres/ocupados para la edición del 12 de Agosto de 2026.
  - `/ia`: Proveedor activo (Ollama Cloud / Nemotron-3 Super) y latencia.
  - `/usuarios`: Total de identidades universitarias registradas.

---

## 10. 🗄️ REGISTRO DE MIGRACIONES SQL (v1.0 A v6.8)

Todas las migraciones residen en `database/migrations/`:

| Versión | Archivo SQL | Descripción |
|---|---|---|
| `v1.0` - `v3.5` | `schema.sql` | Estructura base de usuarios, noticias, reportes y publicaciones. |
| `v3.6` | `v3.6_admin_governance.sql` | Permisos administrativos y gobernanza. |
| `v3.7` - `v3.8` | `v3.7_karma_system.sql` & `v3.8_karma_expansion.sql` | Sistema de Karma y créditos de participación. |
| `v3.9` | `v3.9_tutorias_module.sql` | Módulo de tutorías y asesorías académicas. |
| `v4.1` | `v4.1_inbox_system.sql` & `v4.1_skills_vacantes.sql` | Mensajería privada Inbox y bolsa de trabajo. |
| `v4.2` - `v4.5` | `v4.2_bazar_expansion.sql` a `v4.5_bazar_spots_and_editions.sql` | Bazar esquemático radial e históricas ediciones. |
| `v4.6` - `v5.2` | `v4.6_psychometric_tests.sql` a `v5.2_seed_gestion_y_otros.sql` | Tests psicométricos e idiomas (Chino, Gestión). |
| `v5.3` - `v5.8` | `v5.3_admin_granular_roles...` a `v5.8_extended_permissions.sql` | Matriz de permisos granulares, votaciones encriptadas y padrón. |
| `v6.0` - `v6.5` | `v6.0_dynamic_providers.sql` a `v6.5_add_external_fields_to_vacantes.sql` | Proveedores dinámicos IA, candidaturas y vacantes externas. |
| `v6.6` | `v6.6_rag_bazar_marketplace_auth.sql` | RAG Markdown, Marketplace `bazar_productos`, `accesorios`, `telefono`, `curp` y edición 12 de Agosto. |
| `v6.7` | `v6.7_ollama_pool_and_chat_sessions.sql` | Persistencia de sesiones de chat, compresión `.md` e historial de conversación. |
| `v6.8` | `v6.8_ocean_psychometric_sentiment.sql` | Modelo psicométrico OCEAN Big Five (5 rasgos) y 7 Emociones Basales. |

---

## 11. 🗺️ MAPA DE ARCHIVOS PRINCIPALES DEL PROYECTO

```
CESA-WEB/
├── backend/
│   ├── api/
│   │   ├── auth.php                   # Autenticación unificada (Correo, Celular, CURP, Passwordless)
│   │   ├── chat.php                   # Motor de Chat IA, Pool Ollama Cloud, RAG .md, OCEAN & Compresión
│   │   ├── bazar.php                  # API del Bazar, reservaciones y productos Marketplace
│   │   ├── bazar-admin.php            # Administración de puestos radiales en Calle de la Cultura
│   │   ├── mensajes.php               # API de la bandeja de mensajes e Inbox privado
│   │   ├── zeroclaw_webhook.php       # Bot telemétrico de Telegram
│   │   └── admin/
│   │       ├── rag_knowledge.php      # CRUD de Conocimiento RAG y Conversor a Markdown (.md)
│   │       ├── sentiment_stats.php    # API de Métricas OCEAN y Sentimiento Estudiantil
│   │       └── dynamic_configs.php    # Gestión de proveedores de IA
│   ├── config/database.php            # Conexión PDO a MariaDB en VPS
│   └── lib/JWTHelper.php              # Generación y validación de tokens JWT
├── ai-engine/                         # Microservicio Node.js en PM2
│   ├── src/server.js
│   └── src/services/ai-router.js      # Enrutador inteligente con Pool de claves Ollama
├── database/migrations/               # Migraciones SQL numeradas (v1.0 a v6.8)
│   └── v6.8_ocean_psychometric_sentiment.sql
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── login/page.tsx         # UI de Login unificado (Correo, Celular, CURP)
│   │   │   └── dashboard/page.tsx     # Dashboard principal del estudiante
│   │   ├── components/
│   │   │   ├── AdminDashboard.tsx     # Misión Control Administrativo
│   │   │   ├── BazarGrid.tsx          # Cuadrícula y detalles del Bazar
│   │   │   ├── BazarSchematicMap.tsx  # Mapa Esquemático Radial interactivo
│   │   │   ├── CesaAssistant.tsx      # Widget flotante del Asistente BOB
│   │   │   ├── Inbox.tsx              # Bandeja de Entrada e historial unificado
│   │   │   └── organisms/
│   │   │       ├── AdminRagKnowledgeTab.tsx     # Pestaña Admin de RAG Markdown (.md)
│   │   │       └── AdminSentimentDashboardTab.tsx # Pestaña Admin de OCEAN & Sentimiento
│   │   └── lib/
│   │       ├── api.ts                 # Cliente API TypeScript
│   │       ├── AuthProvider.tsx       # Context de Autenticación React
│   │       └── useAuth.tsx            # Hook de uso de Auth
└── scripts/
    └── deploy_vps.sh                  # Script de despliegue automatizado SSH al VPS
```

---

## 12. 🚀 GUÍA PASO A PASO PARA CONTINUAR EN OPENCODE / CLAUDE CODE / CODEX

Si vas a abrir este repositorio en otro entorno de desarrollo (como OpenCode, MimoCode, Claude Code o Codex), sigue estas instrucciones directas:

1. **Clonar/Abrir el repositorio:**
   Asegúrate de estar en el directorio raíz de `CESA-WEB`.

2. **Validar sintaxis PHP:**
   ```bash
   php -l backend/api/chat.php
   php -l backend/api/auth.php
   php -l backend/api/admin/sentiment_stats.php
   ```

3. **Ejecutar o Compilar el Frontend:**
   ```bash
   # Para desarrollo local:
   npm run dev --prefix frontend

   # Para verificar compilación de producción:
   npm run build --prefix frontend
   ```

4. **Desplegar cambios al Servidor de Producción (VPS):**
   ```bash
   bash scripts/deploy_vps.sh
   ```

5. **Verificar Estado del VPS:**
   Puedes consultar en vivo el estado del portal y los servicios llamando al bot de Telegram `/status` o visitando `https://cesaunison.fondothoth.com/api/ia/admin/status`.

---
*Fin del Documento Maestro de Handoff CESA UNISON.*
