# CESA UNISON - Portal Institucional 🎓

> **"Tu voz, nuestra fuerza motriz"**
> *Gestión del Consejo Estudiantil de Sociedades de Alumnos (CESA) - Periodo 2026-2028*

![Version](https://img.shields.io/badge/Version-3.5-blue?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![IA](https://img.shields.io/badge/IA-Hybrid_Engine-orange?style=for-the-badge)

## 🏛️ Visión del Proyecto
**CESA WEB v3.5** es el ecosistema digital industrializado de la Universidad de Sonora. Diseñado bajo estándares de auditoría **CBIT-01**, el portal actúa como el vínculo principal entre la Mesa Directiva y la comunidad estudiantil, integrando servicios de alto impacto mediante inteligencia artificial híbrida.

## 🧠 Arquitectura de IA Híbrida
El portal utiliza una infraestructura única de inferencia:
1.  **Motor Local (Mac Mini M4)**: Procesamiento primario mediante Ollama (Llama 3.1 8B) para análisis de sentimientos y chatbot de soporte.
2.  **Cloud Fallbacks**: Integración con Groq (Mistral) y Google Gemini para asegurar disponibilidad del 100% ante picos de demanda.
3.  **Cloudflare Tunnel**: Conexión segura punto a punto entre el servidor doméstico/oficina y la nube.

## 🍱 Módulos Industrializados
- **Muro Social**: Feed institucional con noticias, eventos y avisos urgentes.
- **Bazar Emprendedor**: Marketplace exclusivo para negocios estudiantiles verificados.
- **Bolsa de Trabajo**: Matchmaking entre talento UNISON y empresas aliadas (Oracle, HostGator).
- **Buzón de Reportes**: Sistema anónimo con **Sentiment Analysis** para detectar urgencias institucionales.
- **Dashboard de Admin**: Analíticas avanzadas para la toma de decisiones de la Mesa Directiva.

## 🛠️ Stack Tecnológico
- **Frontend**: Next.js 14 (SSR) + Tailwind CSS + Glassmorphism UI.
- **Backend API**: PHP 8.2 compatible con hosting tradicional (HostGator).
- **Database**: MariaDB 10.6 optimizada para Oracle VPS.
- **Auth**: JWT (JSON Web Tokens) con validación estricta `@unison.mx`.

## 🚀 Instalación y Despliegue

### Requisitos
- PHP 8.1+
- Node.js 18+
- Ollama (opcional para IA local)

### Configuración
1.  **Backend**:
    - Clona el repositorio.
    - Configura el archivo `backend/.env.production`.
    - Importa `database/schema.sql` en tu servidor MariaDB.
2.  **Frontend**:
    - `cd frontend && npm install`
    - `npm run build`
3.  **Despliegue**:
    - Utiliza el script `scripts/deploy.sh` incluido para sincronizar con tu VPS.

## 🛡️ Seguridad
Cumplimos con el estándar **CBIT-01**:
- Las contraseñas nunca se almacenan en texto plano (Bcrypt cost 12).
- Los reportes anónimos no dejan traza de IP.
- Centralized CORS Security Engine.

---
**Desarrollado por [Fondo Thoth AC](https://github.com/FondoThothAC)** para la Universidad de Sonora.
*Coordinadación del proyecto: Roberto Eduardo Celis Robles.*
