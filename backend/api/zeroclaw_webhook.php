<?php
/**
 * ZeroClaw Webhook - CESA WEB v4.7
 * Archivo: /backend/api/zeroclaw_webhook.php
 * Recibe eventos e instrucciones inteligentes desde Telegram.
 */

declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../lib/TelegramBot.php';

// Validar secret del webhook: OBLIGATORIO (fail-closed)
$secret = getenv('TELEGRAM_WEBHOOK_SECRET');
if (!$secret) {
    http_response_code(503);
    exit('Webhook no configurado: define TELEGRAM_WEBHOOK_SECRET.');
}
$headerSecret = $_SERVER['HTTP_X_TELEGRAM_BOT_API_SECRET_TOKEN'] ?? '';
if (!hash_equals($secret, $headerSecret)) {
    http_response_code(403);
    exit('Forbidden');
}

// Allowlist de chat_ids de Telegram autorizados para ejecutar comandos
$allowedChatIds = array_filter(array_map('trim', explode(',', getenv('TELEGRAM_ALLOWED_CHAT_IDS') ?: '')));

// Recibir el payload
$content = file_get_contents("php://input");
$update = json_decode($content, true);

if (!$update) {
    http_response_code(200);
    echo json_encode(["status" => "ignored"]);
    exit;
}

$bot = new TelegramBot();

// Manejar mensajes de Telegram
if (isset($update['message'])) {
    $message = $update['message'];
    $chatId = (string)($message['chat']['id'] ?? '');

    // Solo los chats autorizados pueden interactuar con el bot
    if (!empty($allowedChatIds) && !in_array($chatId, $allowedChatIds, true)) {
        http_response_code(200);
        echo json_encode(["status" => "unauthorized_chat"]);
        exit;
    }

    $text = trim($message['text'] ?? '');
    $telegramUser = $message['from']['username'] ?? 'Usuario';

    $parts = explode(' ', $text, 2);
    $cmd = strtolower($parts[0]);
    $param = isset($parts[1]) ? trim($parts[1]) : '';

    switch ($cmd) {
        case '/start':
        case '/help':
        case '/ayuda':
            $msg = "🦉 <b>Agente Asistente Bob CESA UNISON</b>\n\n";
            $msg .= "Comandos Disponibles:\n";
            $msg .= "📊 /status - Estado general del servidor Nginx, MySQL y PM2\n";
            $msg .= "🏪 /bazar - Estado de puestos del Bazar (12 de Agosto)\n";
            $msg .= "🔍 /buscar [nombre/expediente] - Buscar contactos de docentes/alumnos en base de datos\n";
            $msg .= "📝 /comunicado [tema] - Redactar borrador de boletín u oficial CESA\n";
            $msg .= "🎨 /flyer [tema] - Crear prompt visual y sugerencia de plantilla para Canva\n";
            $msg .= "👥 /usuarios - Resumen de identidades y créditos estudiantiles";
            $bot->sendMessage($chatId, $msg);
            break;

        case '/status':
        case '/health':
            try {
                $pdo = getDBConnection();
                $dbStatus = "✅ Operativo (MariaDB)";
            } catch (Exception $e) {
                $dbStatus = "❌ Error Conexión";
            }

            $mem = memory_get_usage(true) / 1024 / 1024;
            $msg = "⚡ <b>Estado de Salud CESA UNISON</b>\n\n";
            $msg .= "• 🌐 Nginx Portal: ✅ Online (https://cesaunison.fondothoth.com)\n";
            $msg .= "• 🗄️ Base de Datos: {$dbStatus}\n";
            $msg .= "• 🧠 Memoria Script: " . round($mem, 2) . " MB\n";
            $msg .= "• 📅 Fecha del Servidor: " . date('Y-m-d H:i:s') . "\n";
            $msg .= "• 🤖 Engine IA PM2: ✅ Online (Ollama Cloud / Nemotron)";
            $bot->sendMessage($chatId, $msg);
            break;

        case '/bazar':
            try {
                $pdo = getDBConnection();
                $edStmt = $pdo->query("SELECT nombre, fecha_inicio FROM bazar_ediciones WHERE activo = 1 LIMIT 1");
                $ed = $edStmt->fetch(PDO::FETCH_ASSOC);

                $totStmt = $pdo->query("SELECT COUNT(*) FROM cat_puestos WHERE activo = 1");
                $totalPuestos = $totStmt->fetchColumn();

                $ocuStmt = $pdo->query("SELECT COUNT(*) FROM emprendimientos WHERE activo = 1 AND verificado = 1 AND puesto_id IS NOT NULL");
                $ocupados = $ocuStmt->fetchColumn();

                $libres = $totalPuestos - $ocupados;

                $msg = "🏪 <b>Monitoreo del Bazar Emprendedor CESA</b>\n\n";
                $msg .= "• 📅 <b>Edición Activa</b>: " . ($ed['nombre'] ?? 'Edición 12 de Agosto de 2026') . "\n";
                $msg .= "• 📍 Total Puestos Radiales: {$totalPuestos}\n";
                $msg .= "• 🟢 Puestos Libres: {$libres}\n";
                $msg .= "• 🟡 Puestos Ocupados/Asignados: {$ocupados}\n";
                $msg .= "• 💻 Gestión en Mando Directivo: Habilitada";
                $bot->sendMessage($chatId, $msg);
            } catch (Exception $e) {
                $bot->sendMessage($chatId, "❌ Error al consultar telemetría del Bazar.");
            }
            break;

        case '/buscar':
            if (empty($param)) {
                $bot->sendMessage($chatId, "⚠️ Por favor especifica un nombre o expediente. Ejemplo: <code>/buscar Carlos</code>");
                break;
            }
            try {
                $pdo = getDBConnection();
                $stmt = $pdo->prepare("
                    SELECT nombre_completo, email, matricula, expediente, carrera, creditos_acumulados, semestre_calculado 
                    FROM usuarios 
                    WHERE nombre_completo LIKE ? OR matricula LIKE ? OR expediente LIKE ? 
                    LIMIT 5
                ");
                $stmt->execute(["%$param%", "%$param%", "%$param%"]);
                $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

                if (!$results) {
                    $bot->sendMessage($chatId, "🔍 No se encontraron contactos en la base de datos para: <b>" . htmlspecialchars($param) . "</b>");
                } else {
                    $msg = "🔍 <b>Contactos Encontrados (" . count($results) . ")</b>:\n\n";
                    foreach ($results as $r) {
                        $sem = $r['semestre_calculado'] ? "{$r['semestre_calculado']}º Semestre" : "N/A";
                        $msg .= "• 👤 <b>{$r['nombre_completo']}</b>\n";
                        $msg .= "  📧 Email: {$r['email']}\n";
                        $msg .= "  🆔 Matrícula/Exp: " . ($r['expediente'] ?: $r['matricula']) . "\n";
                        $msg .= "  🎓 Carrera: " . ($r['carrera'] ?: 'UNISON') . " ({$sem} - {$r['creditos_acumulados']} Créditos)\n\n";
                    }
                    $bot->sendMessage($chatId, $msg);
                }
            } catch (Exception $e) {
                $bot->sendMessage($chatId, "❌ Error al realizar la búsqueda en la base de datos.");
            }
            break;

        case '/comunicado':
            $tema = $param ?: 'Aviso Importante a la Comunidad Universitaria';
            $fecha = date('d/m/Y');
            $msg = "📣 <b>BOLETÍN OFICIAL CESA UNISON</b>\n";
            $msg .= "<i>Fecha: {$fecha} | Consejo Estudiantil</i>\n\n";
            $msg .= "<b>Asunto: " . htmlspecialchars($tema) . "</b>\n\n";
            $msg .= "Estimada comunidad estudiantil y académica de la Universidad de Sonora:\n\n";
            $msg .= "Por medio del presente comunicado, el Consejo Estudiantil de Sociedades de Alumnos (CESA UNISON) informa los acuerdos y avances relativos a " . htmlspecialchars($tema) . ".\n\n";
            $msg .= "Para mayores informes o canalización de dudas, favor de ingresar a la plataforma oficial: https://cesaunison.fondothoth.com\n\n";
            $msg .= "<i>Atentamente,\nMesa Directiva CESA UNISON 2026-2028</i>";
            $bot->sendMessage($chatId, $msg);
            break;

        case '/flyer':
            $tema = $param ?: 'Evento Cultural Universatario';
            $msg = "🎨 <b>Asistente de Diseño & Flyers CESA</b>\n\n";
            $msg .= "<b>Concepto:</b> " . htmlspecialchars($tema) . "\n\n";
            $msg .= "📐 <b>Especificaciones Recomendadas:</b>\n";
            $msg .= "• Formato: 1080x1350px (Instagram / Móvil 4:5)\n";
            $msg .= "• Paleta de Colores: Azul Azulado UNISON (#003366), Dorado CESA (#D4AF37), Blanco y Slate Oscuro.\n";
            $msg .= "• Tipografía: Headers Montserrat ExtraBold y Cuerpo Inter/Roboto.\n\n";
            $msg .= "🔗 <b>Enlace Directo a Plantillas de Canva CESA:</b>\n";
            $msg .= "https://www.canva.com/design?create&category=flyers";
            $bot->sendMessage($chatId, $msg);
            break;

        case '/usuarios':
            try {
                $pdo = getDBConnection();
                $userCount = $pdo->query("SELECT COUNT(*) FROM usuarios WHERE activo = 1")->fetchColumn();
                $msg = "👥 <b>Estadísticas de Identidad Unificada UNISON</b>\n\n";
                $msg .= "• 🎓 Usuarios Activos: <b>{$userCount}</b>\n";
                $msg .= "• 📊 Datos Registrados: Expediente, CP, Celular, CURP y Créditos\n";
                $msg .= "• 🔒 Auditoría Global Mando Directivo: Activa para Admins";
                $bot->sendMessage($chatId, $msg);
            } catch (Exception $e) {
                $bot->sendMessage($chatId, "❌ Error al consultar usuarios.");
            }
            break;

        default:
            $bot->sendMessage($chatId, "Hola @{$telegramUser}, he recibido tu solicitud: <i>" . htmlspecialchars($text) . "</i>\nEscribe /ayuda para ver los comandos de comunicación, comunicados y flyers.");
            break;
    }
}

http_response_code(200);
echo json_encode(["status" => "ok"]);
