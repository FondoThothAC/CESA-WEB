<?php
/**
 * cron_scrape_gob.php - Sincronización automática de vacantes reales de empleo.gob.mx
 * CESA Institutional Suite v3.5
 * Ubicación: /backend/scripts/cron_scrape_gob.php
 */

require_once __DIR__ . '/../config/database.php';

// Solo ejecutar vía CLI (Cron) o con clave secreta
if (php_sapi_name() !== 'cli' && ($_GET['key'] ?? '') !== (getenv('APP_SECRET_KEY') ?: 'admin')) {
    die("Acceso denegado.");
}

$pdo = getDBConnection();

echo "🚀 Iniciando scraping de empleo.gob.mx para Sonora...\n";

function makePostRequest($url, $payload) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept: application/json, text/plain, */*',
        'Accept-Language: es-ES,es;q=0.9',
        'Origin: https://www.empleo.gob.mx',
        'Referer: https://www.empleo.gob.mx/vacantes/sonora',
        'Sec-Fetch-Dest: empty',
        'Sec-Fetch-Mode: cors',
        'Sec-Fetch-Site: same-origin'
    ]);
    
    // Configurar tiempo de espera razonable
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode === 200) {
        return json_decode($response, true);
    }
    return null;
}

// 1. Obtener lista de vacantes (Sonora = Entidad 26)
$searchUrl = "https://www.empleo.gob.mx/api/Login/busqueda/empleos";
$searchPayload = [
    "que" => "",
    "donde" => [
        "entidad" => "26",
        "municipio" => null,
        "colonia" => null,
        "ubicacion" => null
    ],
    "filter" => [
        "limpiarFiltros" => true
    ],
    "items" => 200, // Capturar todas las vacantes de Sonora de una sola vez (aprox. 178)
    "page" => 0,
    "orden" => "fecha_publicacion desc"
];

$results = makePostRequest($searchUrl, $searchPayload);

if (!$results || !isset($results['content'])) {
    die("❌ Error al obtener el listado de vacantes de la API oficial.\n");
}

$vacantes = $results['content'];
echo "   - Se obtuvieron " . count($vacantes) . " vacantes en la búsqueda.\n";

$inserted = 0;
$skipped = 0;

$detailUrl = "https://www.empleo.gob.mx/api/Login/detalleOfertaEmpleoElasticSearch";

foreach ($vacantes as $v) {
    $sneId = $v['id'];
    
    // Verificar si ya existe en la base de datos
    $checkStmt = $pdo->prepare("SELECT id FROM bolsa_vacantes WHERE enlace_externo LIKE ?");
    $checkStmt->execute(["%/vacante/{$sneId}-%"]);
    if ($checkStmt->fetch()) {
        $skipped++;
        continue;
    }
    
    echo "   - Descargando detalle de la vacante #{$sneId}... ";
    
    // 2. Obtener detalle completo
    $detailPayload = [
        "id" => $sneId,
        "treemapita" => false
    ];
    $d = makePostRequest($detailUrl, $detailPayload);
    
    if (!$d || !isset($d['puesto'])) {
        echo "❌ Error al descargar detalle.\n";
        continue;
    }
    
    // Limpiar campos
    $titulo = trim($d['puesto']);
    $empresa = trim($d['empleador'] ?? 'Empresa SNE');
    $ubicacion = trim($d['ubicacion'] ?? 'Sonora');
    
    // Descripcion combinando datos
    $desc = trim($d['descripcion'] ?? '');
    if (!empty($d['funcionesActividades'])) {
        $desc .= "\n\n**Funciones y actividades:**\n- " . implode("\n- ", $d['funcionesActividades']);
    }
    if (!empty($d['requisitos'])) {
        $desc .= "\n\n**Requisitos:**\n- " . implode("\n- ", $d['requisitos']);
    }
    if (!empty($d['listaBeneficios'])) {
        $desc .= "\n\n**Ofrecemos:**\n- " . implode("\n- ", $d['listaBeneficios']);
    }
    
    // Horario
    $horarioStr = "";
    if (!empty($d['horario'])) {
        $horarioStr = implode(", ", $d['horario']);
    }
    if (!empty($d['aclaracionHorario'])) {
        $horarioStr .= " (" . implode(", ", $d['aclaracionHorario']) . ")";
    }
    if (!empty($horarioStr)) {
        $desc .= "\n\n**Horario:** " . $horarioStr;
    }
    
    // Modalidad y Tipo
    $modalidad = 'presencial';
    $descLower = mb_strtolower($desc);
    if (strpos($descLower, 'home office') !== false || strpos($descLower, 'remoto') !== false || strpos($descLower, 'teletrabajo') !== false) {
        $modalidad = 'remoto';
    } elseif (strpos($descLower, 'hibrido') !== false || strpos($descLower, 'híbrido') !== false) {
        $modalidad = 'hibrido';
    }
    
    $tipo = 'tiempo_completo';
    if (strpos($descLower, 'medio tiempo') !== false || strpos($descLower, 'part time') !== false || strpos($descLower, 'parcial') !== false) {
        $tipo = 'medio_tiempo';
    } elseif (strpos($descLower, 'becario') !== false || strpos($descLower, 'practicante') !== false || strpos($descLower, 'prácticas') !== false) {
        $tipo = 'practicas';
    }
    
    // Salario
    $sueldo = trim($d['salarioMensualNeto'] ?? 'A convenir');
    if (!empty($d['salarioMensualNetoMaximo'])) {
        $sueldo .= " - " . trim($d['salarioMensualNetoMaximo']);
    }
    
    // Enlace externo
    $slug = strtolower(preg_replace('/[^a-zA-Z0-9-]+/', '-', $titulo));
    $slug = trim($slug, '-');
    $enlaceExterno = "https://www.empleo.gob.mx/puesto-de-trabajo/vacante/{$sneId}-{$slug}";
    
    // Contacto (Recortar o mapear)
    $contacto = 'Postulación en el portal de empleo original.';
    if (!empty($d['pasosRecluta'])) {
        $contacto = implode(" | ", $d['pasosRecluta']);
    }
    
    // Carreras target básicas por campo detallado
    $carreras = 'todas';
    $campoDetallado = !empty($d['desCampoDetallado']) ? implode(", ", $d['desCampoDetallado']) : '';
    $campoLower = mb_strtolower($campoDetallado);
    if (strpos($campoLower, 'comput') !== false || strpos($campoLower, 'sistemas') !== false || strpos($campoLower, 'informática') !== false || strpos($campoLower, 'tecnolog') !== false) {
        $carreras = 'LISI, LIA';
    } elseif (strpos($campoLower, 'administra') !== false || strpos($campoLower, 'negocios') !== false || strpos($campoLower, 'comercio') !== false) {
        $carreras = 'Negocios y Comercio Internacional, Administración';
    } elseif (strpos($campoLower, 'psicolog') !== false) {
        $carreras = 'Psicología';
    }
    
    // Guardar
    $insertStmt = $pdo->prepare("
        INSERT INTO bolsa_vacantes 
        (empresa_nombre, titulo, descripcion, modalidad, tipo, sueldo_rango, carreras_target, verificada, enlace_externo, contacto)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
    ");
    $insertStmt->execute([
        $empresa . " (SNE - " . $ubicacion . ")",
        $titulo,
        $desc,
        $modalidad,
        $tipo,
        $sueldo,
        $carreras,
        $enlaceExterno,
        $contacto
    ]);
    
    echo "✅ Guardada.\n";
    $inserted++;
}

echo "✨ Proceso completado. Guardadas: $inserted, Omitidas (ya existentes): $skipped.\n";
