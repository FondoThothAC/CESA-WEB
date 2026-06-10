const jwt = require('jsonwebtoken');

// El secreto DEBE ser exactamente el mismo que usas en tu backend PHP
const JWT_SECRET = process.env.PHP_JWT_SECRET || 'cesa2026_secreto_temporal'; 

const verifyCesaToken = (req, res, next) => {
  // Extraer el token de las cookies o del header de autorización o header personalizado
  const authHeader = req.headers.authorization;
  const cesaHeader = req.headers['cesa-jwt'];
  
  let token = cesaHeader;
  
  if (!token && authHeader) {
    token = authHeader.split(' ')[1]; // Formato: Bearer <token>
  }

  if (!token) {
    // Si no hay token, podemos dejarlo pasar como "usuario anónimo" 
    // o bloquearlo. Para la PWA, lo ideal es permitir un acceso limitado.
    req.user = { role: 'anonymous' };
    return next();
  }

  try {
    // Decodifica usando el mismo secreto de PHP
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Inyectamos el payload decodificado en la petición (ej. matrícula, carrera)
    req.user = decoded;
    
    next();
  } catch (error) {
    console.error('Error verificando token JWT:', error.message);
    // Si el token expiró, lo tratamos como anónimo
    req.user = { role: 'anonymous' };
    next();
  }
};

module.exports = verifyCesaToken;
