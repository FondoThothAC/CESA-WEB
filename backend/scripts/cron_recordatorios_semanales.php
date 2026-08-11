<?php
/**
 * cron_recordatorios_semanales.php - Notificaciones de Seguimiento Semanal
 * CESA Institutional Suite v3.6
 * Ubicación: /backend/scripts/cron_recordatorios_semanales.php
 * 
 * Envía recordatorios semanales a alumnos que no han completado:
 * 1. Foto de perfil
 * 2. Evaluación psicométrica / vocacional
 * 3. Curriculum Vitae / Biografía
 */

require_once __DIR__ . '/../config/database.php';

// Permitir ejecución por CLI (Cron) o petición HTTP con clave secreta
if (php_sapi_name() !== 'cli' && ($_GET['key'] ?? '') !== (getenv('APP_SECRET_KEY') ?: 'admin')) {
    http_response_code(403);
    die("Acceso denegado.");
}

header('Content-Type: application/json; charset=utf-8');

try {
    $pdo = getDBConnection();
    echo "🚀 Iniciando cron de recordatorios semanales CESA...\n";

    // Obtener todos los estudiantes y miembros de mesa directiva activos
    $users = $pdo->query("
        SELECT id, nombre_completo, email, avatar_path, bio 
        FROM usuarios 
        WHERE activo = 1 AND rol IN ('estudiante', 'mesa_directiva')
    ")->fetchAll(PDO::FETCH_ASSOC);

    $notificacionesEnviadas = 0;

    foreach ($users as $u) {
        $userId = (int)$u['id'];

        // ========================================================
        // 1. VERIFICAR FOTO DE PERFIL
        // ========================================================
        $missingPhoto = empty($u['avatar_path']);
        if ($missingPhoto) {
            $stmtCheck = $pdo->prepare("
                SELECT COUNT(*) FROM notificaciones_enviadas 
                WHERE usuario_id = ? AND categoria = 'foto_perfil' 
                AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            ");
            $stmtCheck->execute([$userId]);
            if ((int)$stmtCheck->fetchColumn() === 0) {
                $stmtIns = $pdo->prepare("
                    INSERT INTO notificaciones_enviadas (usuario_id, titulo, cuerpo, icono, url, categoria, status, created_at)
                    VALUES (?, '📸 Actualiza tu foto de perfil', 'Mantén tu perfil institucional completo agregando tu fotografía oficial.', 'fa-camera', '/dashboard', 'foto_perfil', 'enviada', NOW())
                ");
                $stmtIns->execute([$userId]);
                $notificacionesEnviadas++;
            }
        }

        // ========================================================
        // 2. VERIFICAR EVALUACIÓN PSICOMÉTRICA
        // ========================================================
        $stmtPsico = $pdo->prepare("SELECT COUNT(*) FROM tests_resultados WHERE usuario_id = ?");
        $stmtPsico->execute([$userId]);
        $hasPsico = ((int)$stmtPsico->fetchColumn()) > 0;

        if (!$hasPsico) {
            $stmtCheck = $pdo->prepare("
                SELECT COUNT(*) FROM notificaciones_enviadas 
                WHERE usuario_id = ? AND categoria = 'psicometria' 
                AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            ");
            $stmtCheck->execute([$userId]);
            if ((int)$stmtCheck->fetchColumn() === 0) {
                $stmtIns = $pdo->prepare("
                    INSERT INTO notificaciones_enviadas (usuario_id, titulo, cuerpo, icono, url, categoria, status, created_at)
                    VALUES (?, '🧠 Realiza tu Test Psico-Vocacional', 'Descubre tus fortalezas y perfil profesional completando la evaluación psicométrica en tu cuenta.', 'fa-brain', '/dashboard', 'psicometria', 'enviada', NOW())
                ");
                $stmtIns->execute([$userId]);
                $notificacionesEnviadas++;
            }
        }

        // ========================================================
        // 3. VERIFICAR CURRICULUM VITAE / BIOGRAFÍA
        // ========================================================
        $missingBio = empty($u['bio']);
        $stmtCert = $pdo->prepare("SELECT COUNT(*) FROM certificados_digitales WHERE usuario_id = ?");
        $stmtCert->execute([$userId]);
        $hasCerts = ((int)$stmtCert->fetchColumn()) > 0;

        if ($missingBio && !$hasCerts) {
            $stmtCheck = $pdo->prepare("
                SELECT COUNT(*) FROM notificaciones_enviadas 
                WHERE usuario_id = ? AND categoria = 'cv_estudiantil' 
                AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            ");
            $stmtCheck->execute([$userId]);
            if ((int)$stmtCheck->fetchColumn() === 0) {
                $stmtIns = $pdo->prepare("
                    INSERT INTO notificaciones_enviadas (usuario_id, titulo, cuerpo, icono, url, categoria, status, created_at)
                    VALUES (?, '📄 Completa tu Curriculum Vitae', 'Destaca ante reclutadores y empresas completando la biografía y habilidades de tu perfil.', 'fa-file-alt', '/dashboard', 'cv_estudiantil', 'enviada', NOW())
                ");
                $stmtIns->execute([$userId]);
                $notificacionesEnviadas++;
            }
        }
    }

    echo "✅ Proceso completado. Notificaciones semanales generadas: {$notificacionesEnviadas}\n";

} catch (Exception $e) {
    echo "❌ Error procesando recordatorios: " . $e->getMessage() . "\n";
}
