# CESA WEB - Directorio Institucional UNISON

Portal moderno y premium para el **Consejo Estudiantil de Sociedades de Alumnos (CESA)** de la Universidad de Sonora. Desarrollado bajo la metodología **Spec-Driven Development (SDD)**.

## 🚀 Tecnologías
- **Frontend**: React 18 + Vite
- **Estética**: Glassmorphism / Vanilla CSS (Rich Aesthetics)
- **Metodología**: SDD (Spec-Driven Development)
- **Data**: JSON estructurado a partir del directorio oficial de UNISON

## 📂 Estructura
- `/docs`: Contiene la especificación `cesa_sdd.yaml`.
- `/src/data`: Directorio de sociedades en formato JSON.
- `/src/components`: Componentes modulares (Hero, SocietyCard, etc).

## 🛠️ Instalación y Uso
Para correr el proyecto localmente:

```bash
npm install
npm run dev
```

Para generar la versión de producción:
```bash
npm run build
```

## 🌐 Despliegue en GitHub
Para subir este proyecto a GitHub Público:
1. Crea un repositorio llamado `CESA WEB` en tu cuenta de GitHub.
2. Ejecuta los siguientes comandos:
```bash
git remote add origin https://github.com/TU_USUARIO/CESA-WEB.git
git branch -M main
git push -u origin main
```
