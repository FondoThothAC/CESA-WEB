<?php
/**
 * CSRF Protection - CESA WEB v3.6
 * Archivo: /backend/lib/CSRF.php
 * Tokens basados en sesión con comparación en tiempo constante.
 */

declare(strict_types=1);

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

/**
 * Obtiene (o genera) el token CSRF vigente para la sesión actual.
 */
function getCSRFToken(): string {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

// Alias de compatibilidad
function generateCSRFToken(): string {
    return getCSRFToken();
}

/**
 * Valida el token CSRF recibido contra el de la sesión.
 * Acepta el valor por POST ('csrf_token') o header 'X-CSRF-Token'.
 */
function validateCSRFToken(?string $token = null): bool {
    if ($token === null || $token === '') {
        $token = $_POST['csrf_token']
            ?? $_SERVER['HTTP_X_CSRF_TOKEN']
            ?? '';
    }

    $sessionToken = $_SESSION['csrf_token'] ?? '';
    if ($sessionToken === '' || !is_string($token) || $token === '') {
        return false;
    }

    return hash_equals($sessionToken, $token);
}
