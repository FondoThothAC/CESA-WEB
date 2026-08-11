<?php
/**
 * RAG Knowledge Base Manager - CESA WEB
 * Archivo: /backend/api/admin/rag_knowledge.php
 * Permite cargar, convertir a .md y administrar documentos de conocimiento institucional para la IA.
 */

declare(strict_types=1);

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../lib/JWTHelper.php';

header('Content-Type: application/json; charset=utf-8');

// Verificar JWT
$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
$token = str_replace('Bearer ', '', $authHeader);
$payload = JWTHelper::verify($token);

if (!$payload || !in_array($payload['rol'] ?? '', ['admin', 'mesa_directiva'])) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Acceso denegado. Se requiere rol administrativo.']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? 'list';

try {
    $pdo = new PDO("mysql:host=".getenv('DB_HOST').";dbname=".getenv('DB_NAME'), getenv('DB_USER'), getenv('DB_PASS'));
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 1. LISTAR DOCUMENTOS RAG
    if ($method === 'GET' && $action === 'list') {
        $stmt = $pdo->query("SELECT id, titulo, categoria, archivo_original, tokens_estimados, activo, created_at FROM ia_conocimiento_rag ORDER BY id DESC");
        $docs = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['success' => true, 'data' => $docs]);
        exit;
    }

    // 2. CREAR / SUBIR CONOCIMIENTO Y CONVERTIR A MARKDOWN (.md)
    if ($method === 'POST' && ($action === 'create' || $action === 'save')) {
        $titulo = trim($_POST['titulo'] ?? '');
        $categoria = trim($_POST['categoria'] ?? 'general');
        $rawText = trim($_POST['contenido_texto'] ?? '');
        $originalFileName = null;

        // Procesar archivo adjunto si existe (.txt, .md, .doc, .pdf)
        if (isset($_FILES['archivo']) && $_FILES['archivo']['error'] === UPLOAD_ERR_OK) {
            $originalFileName = $_FILES['archivo']['name'];
            $tmpPath = $_FILES['archivo']['tmp_name'];
            $fileExt = strtolower(pathinfo($originalFileName, PATHINFO_EXTENSION));

            if (in_array($fileExt, ['txt', 'md'])) {
                $rawText = file_get_contents($tmpPath);
            } else {
                // Sanitizar texto extraído
                $fileContent = file_get_contents($tmpPath);
                $rawText = preg_replace('/[^\x20-\x7E\x0A\x0D]/', '', $fileContent);
            }
        }

        if (empty($titulo) || empty($rawText)) {
            throw new Exception('El título y el contenido del documento no pueden estar vacíos.');
        }

        // Convertir y estructurar contenido a Markdown (.md) limpio para ahorro de tokens
        $markdownContent = "# " . mb_strtoupper($titulo) . "\n\n";
        $markdownContent .= "> **Categoría Institucional**: " . ucfirst($categoria) . "\n";
        $markdownContent .= "> **Fecha de Carga**: " . date('Y-m-d H:i:s') . "\n\n";
        $markdownContent .= "---\n\n";
        
        // Limpieza de líneas en blanco repetidas
        $cleanLines = array_filter(array_map('trim', explode("\n", $rawText)));
        foreach ($cleanLines as $line) {
            if (strpos($line, ':') !== false && strlen($line) < 80) {
                $markdownContent .= "### " . $line . "\n";
            } else {
                $markdownContent .= $line . "\n\n";
            }
        }

        // Estimación aproximada de tokens (1 token ≈ 4 caracteres)
        $tokensEstimados = (int)ceil(mb_strlen($markdownContent) / 4);

        $stmt = $pdo->prepare("
            INSERT INTO ia_conocimiento_rag 
            (titulo, categoria, archivo_original, contenido_md, tokens_estimados) 
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->execute([$titulo, $categoria, $originalFileName, $markdownContent, $tokensEstimados]);

        echo json_encode([
            'success' => true, 
            'id' => $pdo->lastInsertId(),
            'message' => 'Documento RAG convertido a Markdown (.md) y almacenado exitosamente.',
            'tokens' => $tokensEstimados
        ]);
        exit;
    }

    // 3. ELIMINAR DOCUMENTO RAG
    if ($method === 'POST' && $action === 'delete') {
        $id = (int)($_POST['id'] ?? 0);
        if ($id <= 0) throw new Exception('ID de documento inválido.');

        $stmt = $pdo->prepare("DELETE FROM ia_conocimiento_rag WHERE id = ?");
        $stmt->execute([$id]);

        echo json_encode(['success' => true, 'message' => 'Documento RAG eliminado.']);
        exit;
    }

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
