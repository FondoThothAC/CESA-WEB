<?php
/**
 * API Gestión de Usuarios - CESA WEB v4.0
 * Acceso: Admin / Mesa Directiva
 * Sincronizado con schema.sql (activo, nombre_completo) y permisos granulares.
 */

declare(strict_types=1);

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../lib/Auth.php';
require_once __DIR__ . '/../../lib/cors.php';

header('Content-Type: application/json; charset=utf-8');

$auth = new Auth();
$userAdmin = $auth->getUser();

if (!$userAdmin || !in_array($userAdmin['rol'], ['admin', 'mesa_directiva'])) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Acceso denegado']);
    exit;
}

try {
    $pdo = getDBConnection();

    $method = $_SERVER['REQUEST_METHOD'];

    // 1. LISTAR USUARIOS (GET)
    if ($method === 'GET') {
        $search = $_GET['q'] ?? '';
        $role = $_GET['rol'] ?? 'todos';
        
        $query = "SELECT u.id, u.nombre_completo, u.email, u.rol, u.matricula, u.created_at, u.activo,
                         COALESCE(p.publicar_anuncios, 0) as publicar_anuncios,
                         COALESCE(p.bazar_y_reservaciones, 0) as bazar_y_reservaciones,
                         COALESCE(p.bolsa_trabajo, 0) as bolsa_trabajo,
                         COALESCE(p.roles_social, 0) as roles_social,
                         COALESCE(p.ver_denuncias, 0) as ver_denuncias,
                         COALESCE(p.rol_comunicacion, 0) as rol_comunicacion,
                         COALESCE(p.consejo_elecciones, 0) as consejo_elecciones,
                         COALESCE(p.permiso_ia, 0) as permiso_ia,
                         COALESCE(p.permiso_wifi, 0) as permiso_wifi,
                         COALESCE(p.tutorias_asesorias, 0) as tutorias_asesorias,
                         COALESCE(p.evaluaciones_psicometricas, 0) as evaluaciones_psicometricas,
                         COALESCE(p.skills_cursos, 0) as skills_cursos
                  FROM usuarios u
                  LEFT JOIN admin_permisos p ON u.id = p.usuario_id
                  WHERE 1=1";
        $params = [];
        
        if ($search) {
            $query .= " AND (u.nombre_completo LIKE ? OR u.email LIKE ? OR u.matricula LIKE ?)";
            $params[] = "%$search%";
            $params[] = "%$search%";
            $params[] = "%$search%";
        }
        
        if ($role !== 'todos') {
            $query .= " AND u.rol = ?";
            $params[] = $role;
        }
        
        $query .= " ORDER BY u.created_at DESC LIMIT 500";
        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        
        echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        exit;
    }

    // 2. ACTUALIZAR USUARIO (POST)
    if ($method === 'POST') {
        $userId = (int)($_POST['id'] ?? 0);
        $action = $_POST['action'] ?? '';

        if (!$userId) throw new Exception('ID de usuario requerido');

        switch ($action) {
            case 'update_role':
                $newRole = $_POST['rol'] ?? '';
                if (!in_array($newRole, ['estudiante', 'empresa', 'sociedad', 'mesa_directiva', 'admin'])) {
                    throw new Exception('Rol inválido');
                }
                $stmt = $pdo->prepare("UPDATE usuarios SET rol = ? WHERE id = ?");
                $stmt->execute([$newRole, $userId]);
                break;
                
            case 'toggle_active':
                if (!Auth::isMasterEmail($userAdmin['email'] ?? null)) {
                    throw new Exception('No autorizado. Solo el Administrador Maestro puede activar o desactivar usuarios.');
                }
                $status = (int)($_POST['activo'] ?? 0);
                $stmt = $pdo->prepare("UPDATE usuarios SET activo = ? WHERE id = ?");
                $stmt->execute([$status, $userId]);
                break;
                
            case 'update_permissions':
                if (!Auth::isMasterEmail($userAdmin['email'] ?? null)) {
                    throw new Exception('No autorizado. Solo el Administrador Maestro puede cambiar permisos.');
                }
                $pub = (int)($_POST['publicar_anuncios'] ?? 0);
                $bazar = (int)($_POST['bazar_y_reservaciones'] ?? 0);
                $bolsa = (int)($_POST['bolsa_trabajo'] ?? 0);
                $social = (int)($_POST['roles_social'] ?? 0);
                $denuncias = (int)($_POST['ver_denuncias'] ?? 0);
                $comunicacion = (int)($_POST['rol_comunicacion'] ?? 0);
                $consejo = (int)($_POST['consejo_elecciones'] ?? 0);
                $permiso_ia = (int)($_POST['permiso_ia'] ?? 0);
                $permiso_wifi = (int)($_POST['permiso_wifi'] ?? 0);
                $tutorias = (int)($_POST['tutorias_asesorias'] ?? 0);
                $evaluaciones = (int)($_POST['evaluaciones_psicometricas'] ?? 0);
                $skills = (int)($_POST['skills_cursos'] ?? 0);

                $stmt = $pdo->prepare("
                    INSERT INTO admin_permisos (usuario_id, publicar_anuncios, bazar_y_reservaciones, bolsa_trabajo, roles_social, ver_denuncias, rol_comunicacion, consejo_elecciones, permiso_ia, permiso_wifi, tutorias_asesorias, evaluaciones_psicometricas, skills_cursos)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                        publicar_anuncios = VALUES(publicar_anuncios),
                        bazar_y_reservaciones = VALUES(bazar_y_reservaciones),
                        bolsa_trabajo = VALUES(bolsa_trabajo),
                        roles_social = VALUES(roles_social),
                        ver_denuncias = VALUES(ver_denuncias),
                        rol_comunicacion = VALUES(rol_comunicacion),
                        consejo_elecciones = VALUES(consejo_elecciones),
                        permiso_ia = VALUES(permiso_ia),
                        permiso_wifi = VALUES(permiso_wifi),
                        tutorias_asesorias = VALUES(tutorias_asesorias),
                        evaluaciones_psicometricas = VALUES(evaluaciones_psicometricas),
                        skills_cursos = VALUES(skills_cursos)
                ");
                $stmt->execute([$userId, $pub, $bazar, $bolsa, $social, $denuncias, $comunicacion, $consejo, $permiso_ia, $permiso_wifi, $tutorias, $evaluaciones, $skills]);
                break;

            case 'upload_padron':
                if (!Auth::isMasterEmail($userAdmin['email'] ?? null)) {
                    throw new Exception('No autorizado para subir padrón electoral.');
                }
                
                if (!isset($_FILES['csv_file']) || $_FILES['csv_file']['error'] !== UPLOAD_ERR_OK) {
                    throw new Exception('Error al subir el archivo CSV.');
                }

                $file = fopen($_FILES['csv_file']['tmp_name'], 'r');
                if ($file === false) throw new Exception('No se pudo leer el archivo CSV.');

                // Limpiar padrón anterior
                $pdo->query("TRUNCATE TABLE estudiantes_activos");
                
                // Formato esperado: Expediente, Carrera, Semestre
                $stmtInsert = $pdo->prepare("INSERT INTO estudiantes_activos (expediente, carrera, semestre) VALUES (?, ?, ?)");
                
                $row = 0;
                $inserted = 0;
                $pdo->beginTransaction();
                while (($data = fgetcsv($file, 1000, ",")) !== false) {
                    $row++;
                    // Saltar header si la primera fila no son números (el expediente debe ser número)
                    if ($row === 1 && !is_numeric(trim($data[0]))) continue; 
                    
                    if (count($data) >= 2) {
                        $expediente = trim($data[0]);
                        $carrera = trim($data[1]);
                        $semestre = isset($data[2]) ? trim($data[2]) : '';
                        
                        if (!empty($expediente) && !empty($carrera)) {
                            $stmtInsert->execute([$expediente, $carrera, $semestre]);
                            $inserted++;
                        }
                    }
                }
                $pdo->commit();
                fclose($file);
                echo json_encode(['success' => true, 'message' => "Padrón actualizado. $inserted estudiantes cargados."]);
                exit;

            default:
                throw new Exception('Acción no reconocida');
        }

        echo json_encode(['success' => true, 'message' => 'Usuario actualizado correctamente']);
        exit;
    }

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

