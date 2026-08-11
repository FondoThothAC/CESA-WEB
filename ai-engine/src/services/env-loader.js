const fs = require('fs');
const path = require('path');

/**
 * Carga variables de entorno desde el archivo .env del backend
 * de manera manual para evitar dependencias innecesarias en producción.
 */
function loadEnv() {
  const possiblePaths = [
    path.join(__dirname, '../../backend/.env'),
    path.join(__dirname, '../backend/.env'),
    path.join(__dirname, '../../../backend/.env'),
    path.join(process.cwd(), 'backend/.env'),
    path.join(process.cwd(), '../backend/.env'),
    path.join(process.cwd(), '.env'),
  ];

  for (const envPath of possiblePaths) {
    if (fs.existsSync(envPath)) {
      try {
        const content = fs.readFileSync(envPath, 'utf8');
        content.split('\n').forEach(line => {
          line = line.trim();
          if (!line || line.startsWith('#')) return;
          
          const index = line.indexOf('=');
          if (index > 0) {
            const key = line.substring(0, index).trim();
            const val = line.substring(index + 1).trim();
            
            // Limpiar comillas si existen
            let cleanVal = val;
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
              cleanVal = val.substring(1, val.length - 1);
            }
            
            if (!process.env[key]) {
              process.env[key] = cleanVal;
            }
          }
        });
        console.log(`[ENV] Variables de entorno cargadas desde ${envPath}`);
        return;
      } catch (err) {
        console.error(`[ENV] Error al leer ${envPath}:`, err);
      }
    }
  }
  console.log('[ENV] No se encontró archivo .env. Se usarán variables de entorno del sistema.');
}

module.exports = { loadEnv };
