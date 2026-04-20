# Manual de Operación - CESA WEB v3.5
## Para la Mesa Directiva y Sociedades de Alumnos

¡Bienvenido al centro de mando digital del CESA! Esta plataforma ha sido diseñada para industrializar la gestión estudiantil mediante Inteligencia Artificial y datos en tiempo real.

---

### 1. Gestión de la IA (OWL / Búho)
El chatbot no solo responde dudas, sino que ejecuta acciones.
- **Moderación**: Puedes ver todas las interacciones en el **Admin Dashboard > Actividad del Búho**.
- **Casos Críticos**: Si el sistema detecta sentimientos negativos extremos o palabras clave de riesgo (seguridad/salud), aparecerá una alerta roja en tu panel. **Acción requerida**: Revisar el buzón de reportes de inmediato.
- **Gobernanza**: En la sección de **Configuración IA**, puedes rotar las API Keys si alguna expira o cambiar el modelo de lenguaje (ej: de Groq a Gemini) sin ayuda técnica.

### 2. Muro Social y Reportes
- **Moderación del Muro**: Como Mesa Directiva, tienes la facultad de eliminar posts que violen el reglamento institucional.
- **Reportes Anónimos**: Los reportes llegan cifrados. Puedes cambiar su estado a "En Proceso" o "Resuelto". El estudiante será notificado automáticamente por correo y vía el Chatbot.

### 3. Bazar y Bolsa de Trabajo
- **Validación**: Antes de que un emprendimiento aparezca en el Bazar, debe ser validado por la coordinación correspondiente.
- **WhatsApp Leads**: El sistema genera un link automático para que los interesados contacten al emprendedor con un mensaje profesional pre-llenado.

### 4. Invitaciones Masivas
Para agregar a nuevos miembros de sociedades:
1. Ve a **Panel Admin > Invitaciones**.
2. Sube el archivo CSV (Nombre, Correo, Rol, Carrera).
3. El sistema les enviará su contraseña temporal y link de acceso.

---

### 5. Soporte de Infraestructura
En el Dashboard verás 4 indicadores de salud:
- **Database**: Debe estar siempre en verde.
- **Mac Mini**: Es tu motor de IA local. Si aparece en rojo, verifica que la Mac Mini en la oficina del CESA esté encendida y el túnel de Cloudflare activo.
- **Inferencia**: Muestra la latencia. Lo ideal es debajo de 500ms.

---
*Desarrollado por Roberto Celis - Gestión 2026-2028*
