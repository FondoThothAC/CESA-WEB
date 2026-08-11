<?php
/**
 * API Tests Psicométricos y Vocacionales
 * Sistema CESA Conecta-T
 * Archivo: /backend/api/tests.php
 */
declare(strict_types=1);
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../lib/Auth.php';

header('Content-Type: application/json; charset=utf-8');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Authorization, Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$pdo = getDBConnection();
$auth = new Auth();

$isLoggedIn = $auth->isLoggedIn();
$user = $isLoggedIn ? $auth->getUser() : null;

$action = $_GET['action'] ?? $_POST['action'] ?? '';

switch ($action) {
    
    // === LISTAR TESTS DISPONIBLES ===
    case 'listar':
        $stmt = $pdo->query("SELECT * FROM tests_psicometricos WHERE activo = 1 ORDER BY id ASC");
        $tests = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $mis_resultados = [];
        if ($isLoggedIn) {
            $resStmt = $pdo->prepare("SELECT test_id, resultados_json, perfil_generado, fecha_realizacion FROM tests_resultados WHERE usuario_id = ? ORDER BY fecha_realizacion DESC");
            $resStmt->execute([$user['id']]);
            $resultadosRaw = $resStmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Agrupar el último resultado por test
            foreach ($resultadosRaw as $row) {
                if (!isset($mis_resultados[$row['test_id']])) {
                    $row['resultados_json'] = json_decode($row['resultados_json'], true);
                    $mis_resultados[$row['test_id']] = $row;
                }
            }
        }
        
        echo json_encode([
            'success' => true,
            'tests' => $tests,
            'mis_resultados' => $mis_resultados
        ]);
        break;

    // === INICIAR TEST (OBTENER PREGUNTAS) ===
    case 'iniciar':
        if (!$isLoggedIn) {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'Inicia sesión para realizar un test']);
            exit;
        }
        
        $testId = (int)($_GET['test_id'] ?? $_POST['test_id'] ?? 0);
        
        $testStmt = $pdo->prepare("SELECT * FROM tests_psicometricos WHERE id = ? AND activo = 1");
        $testStmt->execute([$testId]);
        $test = $testStmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$test) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Test no encontrado']);
            exit;
        }
        
        // Obtener preguntas en orden del ID (para mantener el cuestionario organizado según la estructura dada)
        $pregStmt = $pdo->prepare("SELECT id, dimension_id, pregunta, tipo_respuesta, opciones, inverso FROM tests_preguntas WHERE test_id = ? AND activo = 1 ORDER BY id ASC");
        $pregStmt->execute([$testId]);
        $preguntas = $pregStmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($preguntas as &$p) {
            if ($p['opciones']) {
                $p['opciones'] = json_decode($p['opciones'], true);
            }
        }
        
        // Obtener dimensiones
        $dimStmt = $pdo->prepare("SELECT id, nombre_dimension, clave, color_hex, descripcion FROM tests_dimensiones WHERE test_id = ?");
        $dimStmt->execute([$testId]);
        $dimensiones = $dimStmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'test' => $test,
            'dimensiones' => $dimensiones,
            'preguntas' => $preguntas
        ]);
        break;

    // === GUARDAR RESULTADO Y CALCULAR PERFILES ===
    case 'guardar':
        if (!$isLoggedIn) {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'Inicia sesión para guardar']);
            exit;
        }
        
        $testId = (int)($_POST['test_id'] ?? 0);
        $respuestasBrutas = json_decode($_POST['respuestas'] ?? '{}', true); // { pregunta_id: valor_1_a_5 }
        
        if (empty($respuestasBrutas)) {
            echo json_encode(['success' => false, 'error' => 'No se enviaron respuestas']);
            exit;
        }
        
        // Helper para obtener respuesta segura (escala 1 a 5, neutro = 3)
        $getVal = function(int $qId) use ($respuestasBrutas): int {
            if (isset($respuestasBrutas[$qId])) {
                return (int)$respuestasBrutas[$qId];
            }
            if (isset($respuestasBrutas[(string)$qId])) {
                return (int)$respuestasBrutas[(string)$qId];
            }
            return 3; // Neutro en escala de 5 puntos
        };

        // Helper para obtener respuesta invertida (escala 1 a 5)
        $getInv = function(int $qId) use ($getVal): int {
            return 6 - $getVal($qId);
        };
        
        $resultadosFinales = [];
        $perfilGenerado = "";

        if ($testId === 1) {
            // ==========================================
            // OCEAN / Big Five Scoring (10 items por factor, N=10)
            // ==========================================
            
            // O: Q61 a Q70. Inversos: 64, 66, 67, 70
            $O = $getVal(61) + $getVal(62) + $getVal(63) + $getInv(64) + $getVal(65) + $getInv(66) + $getInv(67) + $getVal(68) + $getVal(69) + $getInv(70);
            
            // C: Q71 a Q80. Inversos: 72, 74, 76, 78, 80
            $C = $getVal(71) + $getInv(72) + $getVal(73) + $getInv(74) + $getVal(75) + $getInv(76) + $getVal(77) + $getInv(78) + $getVal(79) + $getInv(80);
            
            // E: Q81 a Q90. Inversos: 82, 84, 86, 88, 90
            $E = $getVal(81) + $getInv(82) + $getVal(83) + $getInv(84) + $getVal(85) + $getInv(86) + $getVal(87) + $getInv(88) + $getVal(89) + $getInv(90);
            
            // A: Q91 a Q100. Inversos: 92, 94, 96, 98, 100
            $A = $getVal(91) + $getInv(92) + $getVal(93) + $getInv(94) + $getVal(95) + $getInv(96) + $getVal(97) + $getInv(98) + $getVal(99) + $getInv(100);
            
            // N: Q101 a Q110. Inversos: 102, 104, 106, 108, 110
            $N = $getVal(101) + $getInv(102) + $getVal(103) + $getInv(104) + $getVal(105) + $getInv(106) + $getVal(107) + $getInv(108) + $getVal(109) + $getInv(110);

            $resultadosFinales['O'] = round((($O - 10) / 40) * 100);
            $resultadosFinales['C'] = round((($C - 10) / 40) * 100);
            $resultadosFinales['E'] = round((($E - 10) / 40) * 100);
            $resultadosFinales['A'] = round((($A - 10) / 40) * 100);
            $resultadosFinales['N'] = round((($N - 10) / 40) * 100);

            // Obtener rasgo más alto para perfil
            $oceanSort = $resultadosFinales;
            arsort($oceanSort);
            $topClave = array_key_first($oceanSort);
            $trazoNombres = [
                'O' => 'Apertura a la Experiencia',
                'C' => 'Responsabilidad',
                'E' => 'Extraversión',
                'A' => 'Amabilidad',
                'N' => 'Neuroticismo'
            ];
            $perfilGenerado = $trazoNombres[$topClave] ?? 'Equilibrado';

        } else if ($testId === 2) {
            // ==========================================
            // MBTI-like Scoring (8 items por par, 4 por polo)
            // ==========================================
            
            // E vs I (183 a 190)
            $E_val = $getVal(183) + $getVal(185) + $getVal(187) + $getVal(189);
            $I_val = $getVal(184) + $getVal(186) + $getVal(188) + $getVal(190);
            
            // S vs N (191 a 198)
            $S_val = $getVal(191) + $getVal(193) + $getVal(195) + $getVal(197);
            $N_val = $getVal(192) + $getVal(194) + $getVal(196) + $getVal(198);
            
            // T vs F (199 a 206)
            $T_val = $getVal(199) + $getVal(201) + $getVal(203) + $getVal(205);
            $F_val = $getVal(200) + $getVal(202) + $getVal(204) + $getVal(206);
            
            // J vs P (207 a 214)
            $J_val = $getVal(207) + $getVal(209) + $getVal(211) + $getVal(213);
            $P_val = $getVal(208) + $getVal(210) + $getVal(212) + $getVal(214);

            $E_sum_I = max(1, $E_val + $I_val);
            $S_sum_N = max(1, $S_val + $N_val);
            $T_sum_F = max(1, $T_val + $F_val);
            $J_sum_P = max(1, $J_val + $P_val);

            $resultadosFinales['E'] = round(($E_val / $E_sum_I) * 100);
            $resultadosFinales['I'] = 100 - $resultadosFinales['E'];
            $resultadosFinales['S'] = round(($S_val / $S_sum_N) * 100);
            $resultadosFinales['N'] = 100 - $resultadosFinales['S'];
            $resultadosFinales['T'] = round(($T_val / $T_sum_F) * 100);
            $resultadosFinales['F'] = 100 - $resultadosFinales['T'];
            $resultadosFinales['J'] = round(($J_val / $J_sum_P) * 100);
            $resultadosFinales['P'] = 100 - $resultadosFinales['J'];

            // Construir tipo de 4 letras
            $perfilGenerado = ($E_val >= $I_val ? 'E' : 'I') . 
                              ($S_val >= $N_val ? 'S' : 'N') . 
                              ($T_val >= $F_val ? 'T' : 'F') . 
                              ($J_val >= $P_val ? 'J' : 'P');

        } else if ($testId === 3) {
            // ==========================================
            // DISC Scoring (6 items por factor, N=6)
            // ==========================================
            
            // D: 111 a 116. Inversos: 114, 116
            $D = $getVal(111) + $getVal(112) + $getVal(113) + $getInv(114) + $getVal(115) + $getInv(116);
            
            // I: 117 a 122. Inversos: 120, 122
            $I = $getVal(117) + $getVal(118) + $getVal(119) + $getInv(120) + $getVal(121) + $getInv(122);
            
            // S: 123 a 128. Inversos: 124, 126, 128
            $S = $getVal(123) + $getInv(124) + $getVal(125) + $getInv(126) + $getVal(127) + $getInv(128);
            
            // C: 129 a 134. Inversos: 130, 132, 134
            $C = $getVal(129) + $getInv(130) + $getVal(131) + $getInv(132) + $getVal(133) + $getInv(134);

            $resultadosFinales['D'] = round((($D - 6) / 24) * 100);
            $resultadosFinales['I'] = round((($I - 6) / 24) * 100);
            $resultadosFinales['S'] = round((($S - 6) / 24) * 100);
            $resultadosFinales['C'] = round((($C - 6) / 24) * 100);

            // Obtener dimensión dominante
            $discSort = $resultadosFinales;
            arsort($discSort);
            $topClave = array_key_first($discSort);
            $discNombres = [
                'D' => 'Dominancia',
                'I' => 'Influencia',
                'S' => 'Estabilidad',
                'C' => 'Cumplimiento'
            ];
            $perfilGenerado = $discNombres[$topClave] ?? 'Mixto';

        } else if ($testId === 4) {
            // ==========================================
            // HEXACO Scoring (10 items por factor, N=10)
            // ==========================================
            
            // H: 1 a 10. Inversos: 2, 4, 6, 8
            $H = $getVal(1) + $getInv(2) + $getVal(3) + $getInv(4) + $getVal(5) + $getInv(6) + $getVal(7) + $getInv(8) + $getVal(9) + $getVal(10);
            
            // E: 11 a 20. Inversos: 12, 14, 16, 18, 20
            $E = $getVal(11) + $getInv(12) + $getVal(13) + $getInv(14) + $getVal(15) + $getInv(16) + $getVal(17) + $getInv(18) + $getVal(19) + $getInv(20);
            
            // X: 21 a 30. Inversos: 22, 24, 26, 28, 30
            $X = $getVal(21) + $getInv(22) + $getVal(23) + $getInv(24) + $getVal(25) + $getInv(26) + $getVal(27) + $getInv(28) + $getVal(29) + $getInv(30);
            
            // A: 31 a 40. Inversos: 32, 34, 36, 38, 40
            $A = $getVal(31) + $getInv(32) + $getVal(33) + $getInv(34) + $getVal(35) + $getInv(36) + $getVal(37) + $getInv(38) + $getVal(39) + $getInv(40);
            
            // C: 41 a 50. Inversos: 42, 44, 46, 48, 50
            $C = $getVal(41) + $getInv(42) + $getVal(43) + $getInv(44) + $getVal(45) + $getInv(46) + $getVal(47) + $getInv(48) + $getVal(49) + $getInv(50);
            
            // O: 51 a 60. Inversos: 52, 54, 56, 58, 60
            $O = $getVal(51) + $getInv(52) + $getVal(53) + $getInv(54) + $getVal(55) + $getInv(56) + $getVal(57) + $getInv(58) + $getVal(59) + $getInv(60);

            $resultadosFinales['H'] = round((($H - 10) / 40) * 100);
            $resultadosFinales['E'] = round((($E - 10) / 40) * 100);
            $resultadosFinales['X'] = round((($X - 10) / 40) * 100);
            $resultadosFinales['A'] = round((($A - 10) / 40) * 100);
            $resultadosFinales['C'] = round((($C - 10) / 40) * 100);
            $resultadosFinales['O'] = round((($O - 10) / 40) * 100);

            // Obtener factor dominante
            $hexacoSort = $resultadosFinales;
            arsort($hexacoSort);
            $topClave = array_key_first($hexacoSort);
            $hexacoNombres = [
                'H' => 'Honestidad-Humildad',
                'E' => 'Emocionalidad',
                'X' => 'Extraversión',
                'A' => 'Afabilidad',
                'C' => 'Diligencia',
                'O' => 'Apertura'
            ];
            $perfilGenerado = $hexacoNombres[$topClave] ?? 'Equilibrado';

        } else if ($testId === 5) {
            // ==========================================
            // RIASEC / Holland Vocational Scoring (8 items por factor, N=8)
            // ==========================================
            
            // R: 135 a 142
            $R = $getVal(135) + $getVal(136) + $getVal(137) + $getVal(138) + $getVal(139) + $getVal(140) + $getVal(141) + $getVal(142);
            
            // I: 143 a 150
            $I = $getVal(143) + $getVal(144) + $getVal(145) + $getVal(146) + $getVal(147) + $getVal(148) + $getVal(149) + $getVal(150);
            
            // A: 151 a 158
            $A = $getVal(151) + $getVal(152) + $getVal(153) + $getVal(154) + $getVal(155) + $getVal(156) + $getVal(157) + $getVal(158);
            
            // S: 159 a 166
            $S = $getVal(159) + $getVal(160) + $getVal(161) + $getVal(162) + $getVal(163) + $getVal(164) + $getVal(165) + $getVal(166);
            
            // E: 167 a 174
            $E = $getVal(167) + $getVal(168) + $getVal(169) + $getVal(170) + $getVal(171) + $getVal(172) + $getVal(173) + $getVal(174);
            
            // C: 175 a 182
            $C = $getVal(175) + $getVal(176) + $getVal(177) + $getVal(178) + $getVal(179) + $getVal(180) + $getVal(181) + $getVal(182);

            $resultadosFinales['R'] = round((($R - 8) / 32) * 100);
            $resultadosFinales['I'] = round((($I - 8) / 32) * 100);
            $resultadosFinales['A'] = round((($A - 8) / 32) * 100);
            $resultadosFinales['S'] = round((($S - 8) / 32) * 100);
            $resultadosFinales['E'] = round((($E - 8) / 32) * 100);
            $resultadosFinales['C'] = round((($C - 8) / 32) * 100);

            // Código de Holland (tres letras más altas)
            $riasecSort = $resultadosFinales;
            arsort($riasecSort);
            $topKeys = array_keys($riasecSort);
            $perfilGenerado = $topKeys[0] . $topKeys[1] . $topKeys[2];
        } else {
            // Fallback genérico
            $resultadosFinales = ["Total" => 100];
            $perfilGenerado = "General";
        }
        
        $insert = $pdo->prepare("
            INSERT INTO tests_resultados (usuario_id, test_id, resultados_json, perfil_generado, respuestas_brutas)
            VALUES (?, ?, ?, ?, ?)
        ");
        $insert->execute([
            $user['id'], 
            $testId, 
            json_encode($resultadosFinales), 
            $perfilGenerado, 
            json_encode($respuestasBrutas)
        ]);
        
        echo json_encode([
            'success' => true,
            'resultados' => $resultadosFinales,
            'perfil' => $perfilGenerado
        ]);
        break;

    default:
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Acción no válida']);
        break;
}
