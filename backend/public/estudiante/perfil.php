<?php
/**
 * Perfil del Estudiante - CESA WEB v3.6
 * Archivo: /backend/public/estudiante/perfil.php
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../lib/Auth.php';
require_once __DIR__ . '/../../lib/AcademicProgressManager.php';

$auth = new Auth();
if (!$auth->isLoggedIn()) {
    header('Location: /login.php');
    exit;
}

$userId = $auth->getUserId();
$pdo = getDBConnection();
$progressManager = new AcademicProgressManager($pdo);

// Obtener datos académicos
$datosAcademicos = $progressManager->calcularSemestreReal($userId);
$user = $auth->getUser();

// Obtener certificados vigentes
$stmt = $pdo->prepare("
    SELECT c.*, s.icono, s.color_hex, s.vigencia_meses
    FROM certificados_digitales c
    JOIN skills_catalogo s ON c.skill_id = s.id
    WHERE c.usuario_id = ? AND c.estado = 'activo'
    ORDER BY c.fecha_emision DESC
");
$stmt->execute([$userId]);
$certificados = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Obtener skills disponibles para evaluar
$stmt = $pdo->query("SELECT * FROM skills_catalogo WHERE requiere_recertificacion = 0");
$availableSkills = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mi Perfil Académico | CESA UNISON</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap');
        body { font-family: 'Outfit', sans-serif; background-color: #0f172a; color: #f8fafc; }
        .glass-card { background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.1); }
        .progress-gradient { background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%); }
        .badge-pulse { animation: pulse 2s infinite; }
        @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
    </style>
</head>
<body class="min-h-screen">

    <!-- Navegación -->
    <nav class="sticky top-0 z-50 glass-card px-6 py-4 flex justify-between items-center">
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xl">C</div>
            <span class="text-xl font-bold tracking-tight">CESA <span class="text-blue-500">WEB</span></span>
        </div>
        <div class="flex items-center gap-4">
            <div class="text-right hidden md:block">
                <p class="text-sm font-semibold"><?= htmlspecialchars($user['nombre']) ?></p>
                <p class="text-xs text-gray-400 capitalize"><?= $user['rol'] ?></p>
            </div>
            <img src="https://ui-avatars.com/api/?name=<?= urlencode($user['nombre']) ?>&background=3b82f6&color=fff" class="w-10 h-10 rounded-full border-2 border-blue-500 shadow-lg shadow-blue-500/20">
        </div>
    </nav>

    <main class="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Columna Izquierda: Info Académica -->
        <div class="lg:col-span-1 space-y-6">
            <div class="glass-card rounded-3xl p-6 border-l-4 border-blue-500">
                <div class="flex justify-between items-start mb-6">
                    <div>
                        <h2 class="text-2xl font-bold">Estado Académico</h2>
                        <p class="text-gray-400 text-sm"><?= htmlspecialchars($datosAcademicos['carrera']) ?></p>
                    </div>
                    <div class="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                        UNISON
                    </div>
                </div>

                <div class="text-center mb-8">
                    <div class="relative inline-block">
                        <div class="text-6xl font-black text-white"><?= $datosAcademicos['semestre_real'] ?>°</div>
                        <div class="text-xs text-blue-400 font-bold uppercase tracking-widest mt-1">Semestre Calculado</div>
                        <?php if ($datosAcademicos['es_irregular']): ?>
                            <span class="absolute -top-2 -right-6 bg-yellow-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full badge-pulse">
                                <i class="fas fa-exclamation-triangle"></i> IRREGULAR
                            </span>
                        <?php endif; ?>
                    </div>
                </div>

                <div class="space-y-4">
                    <div>
                        <div class="flex justify-between text-sm mb-2">
                            <span class="text-gray-400">Progreso del Ciclo</span>
                            <span class="text-blue-400 font-bold"><?= $datosAcademicos['porcentaje_semestre_actual'] ?>%</span>
                        </div>
                        <div class="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                            <div class="h-full progress-gradient transition-all duration-1000" style="width: <?= $datosAcademicos['porcentaje_semestre_actual'] ?>%"></div>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                        <div class="text-center">
                            <p class="text-2xl font-bold"><?= $datosAcademicos['creditos_acumulados'] ?></p>
                            <p class="text-[10px] text-gray-500 uppercase font-bold">Créditos Totales</p>
                        </div>
                        <div class="text-center">
                            <p class="text-2xl font-bold text-green-400"><?= $datosAcademicos['materias_aprobadas'] ?></p>
                            <p class="text-[10px] text-gray-500 uppercase font-bold">Materias OK</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="glass-card rounded-3xl p-6">
                <h3 class="text-lg font-bold mb-4 flex items-center gap-2">
                    <i class="fas fa-certificate text-blue-500"></i> Certificaciones Disponibles
                </h3>
                <div class="space-y-3">
                    <?php foreach ($availableSkills as $skill): ?>
                        <div class="flex items-center justify-between p-3 bg-slate-800/50 rounded-2xl border border-white/5 transition hover:border-blue-500/50 group">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-lg text-blue-400">
                                    <i class="<?= $skill['icono'] ?: 'fas fa-shield-alt' ?>"></i>
                                </div>
                                <div>
                                    <h4 class="text-sm font-bold"><?= $skill['nombre'] ?></h4>
                                    <p class="text-[10px] text-gray-500 uppercase"><?= $skill['categoria'] ?></p>
                                </div>
                            </div>
                            <a href="/evaluaciones/realizar.php?skill=<?= $skill['id'] ?>" class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-lg shadow-blue-500/30">
                                <i class="fas fa-play text-[10px]"></i>
                            </a>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>
        </div>

        <!-- Columna Derecha: Badges & Certificados -->
        <div class="lg:col-span-2">
            <div class="glass-card rounded-3xl p-8 min-h-full">
                <div class="flex justify-between items-center mb-10">
                    <h2 class="text-3xl font-black italic tracking-tight">MIS INSIGNIAS <span class="text-blue-500">CESA</span></h2>
                    <span class="px-4 py-2 bg-slate-800 rounded-2xl text-xs font-bold text-gray-400">
                        <?= count($certificados) ?> COMPOBADAS
                    </span>
                </div>

                <?php if (empty($certificados)): ?>
                    <div class="flex flex-col items-center justify-center py-20 text-center">
                        <div class="w-32 h-32 bg-slate-800 rounded-full flex items-center justify-center text-5xl text-gray-600 mb-6 border-4 border-dashed border-gray-700">
                            <i class="fas fa-award"></i>
                        </div>
                        <h3 class="text-xl font-bold mb-2">Aún no tienes insignias</h3>
                        <p class="text-gray-500 max-w-xs">Demuestra tu talento realizando evaluaciones y obtén certificados digitales verificables por empresas.</p>
                    </div>
                <?php else: ?>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <?php foreach ($certificados as $cert): ?>
                            <div class="group relative bg-slate-900/50 rounded-[2rem] p-6 border border-white/5 overflow-hidden transition hover:bg-slate-800/50">
                                <div class="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/20 transition"></div>
                                
                                <div class="flex items-start gap-5 relative z-10">
                                    <div class="w-16 h-16 rounded-3xl bg-slate-900 flex items-center justify-center text-3xl shadow-2xl" style="color: <?= $cert['color_hex'] ?>;">
                                        <i class="<?= $cert['icono'] ?>"></i>
                                    </div>
                                    <div class="flex-1">
                                        <h4 class="text-xl font-bold group-hover:text-blue-400 transition"><?= $cert['skill_nombre'] ?></h4>
                                        <div class="flex items-center gap-2 mt-1">
                                            <span class="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-md text-[10px] font-black uppercase"><?= $cert['nivel'] ?></span>
                                            <span class="text-gray-600 text-xl font-thin">|</span>
                                            <span class="text-gray-400 text-[10px] font-bold uppercase tracking-widest"><?= $cert['puntaje_obtenido'] ?>% Score</span>
                                        </div>
                                    </div>
                                </div>

                                <div class="mt-8 flex items-center justify-between relative z-10">
                                    <div class="flex flex-col">
                                        <span class="text-[9px] text-gray-500 uppercase font-bold tracking-widest">Código Único</span>
                                        <code class="text-xs text-blue-300"><?= substr($cert['certificado_uuid'], 0, 8) ?>...</code>
                                    </div>
                                    <div class="flex gap-2">
                                        <button onclick="window.open('/verificar/?uuid=<?= $cert['certificado_uuid'] ?>')" class="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center hover:bg-blue-600 transition">
                                            <i class="fas fa-external-link-alt text-xs"></i>
                                        </button>
                                        <button class="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 hover:scale-105 transition">
                                            <i class="fas fa-download text-xs"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
            </div>
        </div>

    </main>

</body>
</html>
