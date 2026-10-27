<?php
/**
 * BazarEvents - Bus de eventos de tiempo real del Bazar Emprendedor
 * Archivo: /backend/lib/BazarEvents.php
 *
 * Cada transaccion relevante del Bazar escribe una fila en bazar_eventos.
 * El backend Rust expone esas filas por SSE en /api/v1/bazar/events/stream.
 *
 * Regla de oro: si bazar_eventos no existe o falla, NUNCA rompemos el
 * flujo principal (registro, aprobacion, tickets, etc.).
 */
declare(strict_types=1);

function bazarEmitEvent(PDO $pdo, string $tipo, array $payload = []): void {
    try {
        $stmt = $pdo->prepare("INSERT INTO bazar_eventos (tipo, payload) VALUES (?, ?)");
        $stmt->execute([
            $tipo,
            json_encode($payload, JSON_UNESCAPED_UNICODE)
        ]);
    } catch (\Throwable $e) {
        // Silencioso por diseño: el tiempo real es mejorable, el Bazar es intocable.
    }
}

/** Atajo para emitir usando una conexion sin iniciar/romper TX activa */
function bazarEventoReserva(array $reserva, string $estado, array $extra = []): array {
    return array_merge([
        'id'            => (int)($reserva['id'] ?? 0),
        'folio'         => $reserva['folio'] ?? null,
        'nombre_negocio' => $reserva['nombre_negocio'] ?? null,
        'categoria'     => $reserva['categoria'] ?? null,
        'puesto_id'     => isset($reserva['puesto_id']) ? (int)$reserva['puesto_id'] : null,
        'zona'          => $reserva['zona'] ?? null,
        'edicion_id'    => isset($reserva['edicion_id']) ? (int)$reserva['edicion_id'] : null,
        'dueno'         => $reserva['nombre_completo'] ?? ($reserva['dueno'] ?? null),
        'estado'        => $estado,
    ], $extra);
}

/**
 * Carga minima de una reserva para emision de eventos.
 * Usable desde cualquier endpoint (no depende de helpers de bazar.php).
 */
function bazarReservaEmitible(PDO $pdo, int $id): array {
    if ($id <= 0) return [];
    try {
        $stmt = $pdo->prepare("SELECT e.id, e.nombre_negocio, e.categoria, e.puesto_id, e.edicion_id,
                                      p.zona, u.nombre_completo
                               FROM emprendimientos e
                               LEFT JOIN cat_puestos p ON p.id = e.puesto_id
                               LEFT JOIN usuarios u ON u.id = e.usuario_id
                               WHERE e.id = ? LIMIT 1");
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) return [];
        $row['folio'] = 'BAZ-' . ($row['edicion_id'] ?? '0') . '-' . str_pad((string)$id, 6, '0', STR_PAD_LEFT);
        return $row;
    } catch (\Throwable $e) {
        return [];
    }
}
