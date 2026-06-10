<?php
/**
 * AcademicProgressManager - CESA WEB v3.6
 * Calcula el progreso académico real y genera certificados digitales.
 * Archivo: /backend/lib/AcademicProgressManager.php
 */

declare(strict_types=1);

class AcademicProgressManager {
    private PDO $pdo;
    private float $creditsPerSemester = 50.0; // Promedio estándar UNISON

    public function __construct(PDO $pdo) {
        $pdo->exec("SET NAMES 'utf8mb4'");
        $this->pdo = $pdo;
    }

    /**
     * Calcula el semestre real basándose en los créditos aprobados.
     */
    public function calcularSemestreReal(int $usuarioId): array {
        // Obtener créditos totales aprobados
        $stmt = $this->pdo->prepare("
            SELECT SUM(creditos) as total 
            FROM historial_academico 
            WHERE usuario_id = ? AND estado = 'aprobada'
        ");
        $stmt->execute([$usuarioId]);
        $creditosAprobados = (float)($stmt->fetchColumn() ?: 0);

        // Semestre real = (créditos / créditos_por_semestre) + 1
        $semestreReal = floor($creditosAprobados / $this->creditsPerSemester) + 1;
        
        // Calcular progreso al siguiente semestre
        $progresoSiguiente = fmod($creditosAprobados, $this->creditsPerSemester);
        $porcentajeSiguiente = ($progresoSiguiente / $this->creditsPerSemester) * 100;
        
        // Determinar irregularidad
        $stmtU = $this->pdo->prepare("SELECT semestre_ingreso FROM usuarios WHERE id = ?");
        $stmtU->execute([$usuarioId]);
        $semestreIngreso = (int)($stmtU->fetchColumn() ?: 1);

        $esIrregular = ($semestreReal < 1); // Simplificado
        
        return [
            'semestre_real' => (int)$semestreReal,
            'creditos_acumulados' => (int)$creditosAprobados,
            'porcentaje_semestre_actual' => round($porcentajeSiguiente, 2),
            'creditos_faltantes_siguiente_sem' => (int)($this->creditsPerSemester - $progresoSiguiente),
            'es_irregular' => $esIrregular
        ];
    }

    /**
     * Genera un certificado digital único para una evaluación aprobada.
     */
    public function generarCertificado(int $intentoId): array {
        try {
            $this->pdo->beginTransaction();

            // 1. Obtener datos del intento y skill
            $stmt = $this->pdo->prepare("
                SELECT i.*, s.codigo as skill_codigo, s.nombre as skill_nombre, s.vigencia_meses, u.nombre_completo 
                FROM skills_intentos i
                JOIN skills_catalogo s ON i.skill_id = s.id
                JOIN usuarios u ON i.usuario_id = u.id
                WHERE i.id = ? AND i.estado = 'aprobado'
            ");
            $stmt->execute([$intentoId]);
            $data = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$data) {
                throw new Exception("Intento no válido para certificación.");
            }

            // 2. Generar Identificadores Únicos
            $uuid = $this->generateUUID();
            $hash = hash('sha256', $uuid . $data['usuario_id'] . $data['skill_id'] . 'CESA_PRO_SALT_2026');

            // 3. Calcular Expiración
            $fechaExpiracion = null;
            if ($data['vigencia_meses'] > 0) {
                $fechaExpiracion = date('Y-m-d H:i:s', strtotime("+{$data['vigencia_meses']} months"));
            }

            // 4. Insertar Certificado
            $stmtInsert = $this->pdo->prepare("
                INSERT INTO certificados_digitales (
                    certificado_uuid, usuario_id, nombre_completo_certificado, 
                    skill_id, skill_codigo, skill_nombre, fecha_emision, fecha_expiracion,
                    hash_verificacion, puntaje_obtenido, intento_id
                ) VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?)
            ");
            $stmtInsert->execute([
                $uuid, $data['usuario_id'], $data['nombre_completo'],
                $data['skill_id'], $data['skill_codigo'], $data['skill_nombre'],
                $fechaExpiracion, $hash, $data['puntaje_obtenido'], $intentoId
            ]);

            $this->pdo->commit();

            return [
                'success' => true,
                'uuid' => $uuid,
                'hash' => $hash,
                'skill' => $data['skill_nombre']
            ];

        } catch (Exception $e) {
            $this->pdo->rollBack();
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Helper para generar UUID v4 compatible.
     */
    private function generateUUID(): string {
        $data = random_bytes(16);
        $data[6] = chr(ord($data[6]) & 0x0f | 0x40); // set version to 0100
        $data[8] = chr(ord($data[8]) & 0x3f | 0x80); // set bits 6-7 to 10
        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
    }
}
