<?php
/**
 * Geocode Worker v1.0 - CESA WEB Industrialized
 * Procesa direcciones de negocios y genera coordenadas (lat, lng)
 */
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';

class GeocodeWorker {
    private $pdo;
    private $user_agent = 'CESA-UNISON-Industrial-Worker/1.0 (admin@cesa.unison.mx)';

    public function __construct() {
        $this->pdo = getDBConnection();
    }

    private function log($msg) {
        echo "[" . date('Y-m-d H:i:s') . "] [GEOCODE] $msg\n";
    }

    public function run() {
        $this->log("Iniciando Worker de Geocodificación...");
        
        while (true) {
            try {
                // 1. Buscar negocios que tengan 'ubicacion' pero no coordenadas
                $stmt = $this->pdo->prepare("
                    SELECT id, nombre_negocio, ubicacion 
                    FROM emprendimientos 
                    WHERE ubicacion IS NOT NULL 
                      AND ubicacion != '' 
                      AND (ubicacion_lat IS NULL OR ubicacion_lng IS NULL)
                    LIMIT 20
                ");
                $stmt->execute();
                $pending = $stmt->fetchAll();

                if (empty($pending)) {
                    $this->log("Sin pendientes. Durmiendo 60s...");
                    sleep(60);
                    continue;
                }

                foreach ($pending as $item) {
                    $this->processItem($item);
                    // Respetar Rate Limit de Nominatim (1 req/s)
                    sleep(2);
                }

            } catch (Exception $e) {
                $this->log("ERROR: " . $e->getMessage());
                sleep(30);
            }
        }
    }

    private function processItem($item) {
        $this->log("Procesando: {$item['nombre_negocio']} ({$item['ubicacion']})");

        // Añadimos contexto de ciudad para mayor precisión
        $query = urlencode($item['ubicacion'] . ", Hermosillo, Sonora, México");
        $url = "https://nominatim.openstreetmap.org/search?q=$query&format=json&limit=1";

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_USERAGENT, $this->user_agent);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        
        $response = curl_exec($ch);
        curl_close($ch);

        if (!$response) {
            $this->log("✗ Error de red en API");
            return;
        }

        $data = json_decode($response, true);
        
        if (!empty($data) && isset($data[0]['lat'], $data[0]['lon'])) {
            $lat = $data[0]['lat'];
            $lng = $data[0]['lon'];

            $upd = $this->pdo->prepare("UPDATE emprendimientos SET ubicacion_lat = ?, ubicacion_lng = ? WHERE id = ?");
            $upd->execute([$lat, $lng, $item['id']]);
            $this->log("✓ Éxito: ($lat, $lng)");
        } else {
            $this->log("✗ No se encontraron resultados");
            // Marcamos como 'enviado pero fallido' poniendo 0,0 para evitar loop infinito? 
            // O simplemente lo dejamos para reintentar más tarde. 
            // Aquí lo dejaremos para reintentar.
        }
    }
}

if (php_sapi_name() === 'cli') {
    $worker = new GeocodeWorker();
    $worker->run();
}
