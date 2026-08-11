<?php
/**
 * Panel de Coordinación IMPULSO - CESA UNISON
 * Identidad Oficial: Azul Marino + Oro
 */
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../lib/Auth.php';

$auth = new Auth();
// Verificar que sea Admin o miembro de la Coordinación Impulso
if (!$auth->isLoggedIn() || !($auth->hasRole('admin') || $auth->hasRole('coordinador_impulso'))) {
    header('Location: /login.php');
    exit;
}

$pdo = getDBConnection();
$user = $auth->getUser();

// Consultas rápidas para métricas de Impulso
// Nota: Se asume que las tablas 'emprendimientos', 'vacantes', etc. existen.
$stats = [
    'negocios_pendientes' => 0,
    'vacantes_activas' => 0,
    'postulaciones_mes' => 0,
    'skills_validadas' => 0
];

try {
    $stats['negocios_pendientes'] = $pdo->query("SELECT COUNT(*) FROM emprendimientos WHERE verificado = 0")->fetchColumn();
    $stats['vacantes_activas'] = $pdo->query("SELECT COUNT(*) FROM vacantes WHERE activa = 1")->fetchColumn();
    $stats['postulaciones_mes'] = $pdo->query("SELECT COUNT(*) FROM postulaciones WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)")->fetchColumn();
    $stats['skills_validadas'] = $pdo->query("SELECT COUNT(*) FROM certificados_digitales")->fetchColumn();
} catch (Exception $e) {
    // Fallback if tables don't exist yet in the env
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Coordinación IMPULSO | CESA UNISON</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        cesa: {
                            primary: '#0F2C59',
                            secondary: '#1E3A8A',
                            gold: '#D4AF37',
                            goldLight: '#F5D17B',
                            dark: '#0A192F'
                        }
                    }
                }
            }
        }
    </script>
    <style>
        body { background: #0A192F; background-image: radial-gradient(circle at top right, #1E3A8A 0%, #0A192F 50%); color: white; min-height: 100vh; }
        .glass-card { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.05); }
        .status-pulse { animation: pulse 2s infinite; }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
        .border-gold-gradient { border-image: linear-gradient(to bottom, #D4AF37, #0F2C59) 1; }
    </style>
</head>
<body class="font-sans">

    <header class="bg-cesa-primary/90 backdrop-blur-md sticky top-0 z-50 py-3 px-6 flex items-center justify-between border-b border-cesa-gold/30">
        <div class="flex items-center gap-4">
            <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center p-1">
                <div class="font-bold text-cesa-primary">C</div>
            </div>
            <div>
                <h1 class="text-lg font-bold tracking-tight">IMPULSO <span class="text-cesa-gold">CESA</span></h1>
                <p class="text-[10px] text-cesa-goldLight uppercase tracking-widest">Coordinación de Emprendimiento</p>
            </div>
        </div>
        <div class="flex items-center gap-6">
            <div class="hidden md:block text-right">
                <p class="text-xs font-bold"><?= htmlspecialchars($user['nombre_completo'] ?? 'Coordinador') ?></p>
                <p class="text-[10px] text-gray-400">Coordinador de Área</p>
            </div>
            <button class="w-10 h-10 rounded-xl bg-cesa-gold text-cesa-primary flex items-center justify-center font-bold">
                <?= strtoupper(substr($user['nombre_completo'] ?? 'C', 0, 1)) ?>
            </button>
        </div>
    </header>

    <main class="max-w-7xl mx-auto p-4 md:p-8">
        
        <div class="mb-8">
            <h2 class="text-3xl font-bold flex items-center gap-3">
                Gestión de <span class="text-cesa-gold">Impulso Estudiantil</span>
                <span class="w-3 h-3 bg-green-500 rounded-full status-pulse shadow-[0_0_10px_#22c55e]"></span>
            </h2>
            <p class="text-gray-400 mt-2">Monitoreo de Bolsa de Trabajo, Bazar y Certificaciones Digitales.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div class="glass-card rounded-2xl p-6 border-l-4 border-cesa-gold">
                <p class="text-gray-400 text-xs font-bold uppercase mb-1">Bazar: Pendientes</p>
                <h3 class="text-3xl font-bold text-cesa-gold"><?= $stats['negocios_pendientes'] ?></h3>
                <p class="text-[10px] text-gray-500 mt-2">Nuevos negocios por validar</p>
            </div>
            <div class="glass-card rounded-2xl p-6 border-l-4 border-blue-400">
                <p class="text-gray-400 text-xs font-bold uppercase mb-1">Vacantes Activas</p>
                <h3 class="text-3xl font-bold text-blue-400"><?= $stats['vacantes_activas'] ?></h3>
                <p class="text-[10px] text-gray-500 mt-2">Empresas reclutando</p>
            </div>
            <div class="glass-card rounded-2xl p-6 border-l-4 border-purple-400">
                <p class="text-gray-400 text-xs font-bold uppercase mb-1">Skills Validadas</p>
                <h3 class="text-3xl font-bold text-purple-400"><?= $stats['skills_validadas'] ?></h3>
                <p class="text-[10px] text-gray-500 mt-2">Certificados emitidos hoy</p>
            </div>
            <div class="glass-card rounded-2xl p-6 border-l-4 border-green-400">
                <p class="text-gray-400 text-xs font-bold uppercase mb-1">Postulaciones</p>
                <h3 class="text-3xl font-bold text-green-400"><?= $stats['postulaciones_mes'] ?></h3>
                <p class="text-[10px] text-gray-500 mt-2">Actividad de empleo (30d)</p>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div class="lg:col-span-2 space-y-6">
                <div class="glass-card rounded-3xl overflow-hidden">
                    <div class="p-6 border-b border-white/5 flex justify-between items-center bg-cesa-primary/20">
                        <h3 class="font-bold flex items-center gap-2">
                            <i class="fas fa-store text-cesa-gold"></i> Auditoría de Bazar
                        </h3>
                        <button class="text-xs text-cesa-goldLight hover:underline">Ver Historial</button>
                    </div>
                    <div class="p-0">
                        <table class="w-full text-left text-sm">
                            <thead class="text-[10px] uppercase text-gray-500 bg-white/5">
                                <tr>
                                    <th class="px-6 py-3">Negocio</th>
                                    <th class="px-6 py-3">Dueño (Alias)</th>
                                    <th class="px-6 py-3">Categoría</th>
                                    <th class="px-6 py-3 text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-white/5">
                                <tr class="hover:bg-white/5 transition">
                                    <td class="px-6 py-4 font-medium text-white">Burgers del Búho</td>
                                    <td class="px-6 py-4 text-gray-400">Roberto#042</td>
                                    <td class="px-6 py-4"><span class="px-2 py-1 rounded-full bg-orange-500/20 text-orange-400 text-[10px]">COMIDA</span></td>
                                    <td class="px-6 py-4 text-right">
                                        <button class="bg-cesa-gold/20 text-cesa-gold px-3 py-1 rounded-lg text-xs font-bold hover:bg-cesa-gold hover:text-cesa-dark transition">Validar</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="glass-card rounded-3xl p-6">
                    <h3 class="font-bold mb-6 flex items-center gap-2">
                        <i class="fas fa-briefcase text-blue-400"></i> Solicitudes de Empresas
                    </h3>
                    <div class="space-y-4">
                        <div class="flex items-center justify-between p-4 bg-cesa-dark/40 border border-white/5 rounded-2xl">
                            <div class="flex items-center gap-4">
                                <div class="w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400">
                                    <i class="fas fa-building"></i>
                                </div>
                                <div>
                                    <p class="font-bold">Software Solutions MX</p>
                                    <p class="text-xs text-gray-500">Vacante: Junior Web Dev • 2 vacantes</p>
                                </div>
                            </div>
                            <div class="flex gap-2">
                                <button class="p-2 text-gray-400 hover:text-white"><i class="fas fa-eye"></i></button>
                                <button class="bg-blue-600 px-4 py-2 rounded-xl text-xs font-bold">Publicar</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="space-y-6">
                <div class="glass-card rounded-3xl p-6">
                    <h3 class="font-bold mb-4 flex items-center gap-2 text-cesa-gold">
                        <i class="fas fa-award"></i> Últimos Certificados
                    </h3>
                    <div class="space-y-4">
                        <div class="flex gap-3 items-center">
                            <div class="w-8 h-8 rounded-lg bg-cesa-gold/20 flex items-center justify-center text-cesa-gold">
                                <i class="fas fa-check-double text-xs"></i>
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="text-xs font-bold truncate">Excel Avanzado</p>
                                <p class="text-[9px] text-gray-500">Expediente: 219012345</p>
                            </div>
                            <span class="text-[9px] font-mono text-gray-600">ID: a8f2..</span>
                        </div>
                    </div>
                    <button class="w-full mt-6 py-3 border border-cesa-gold/30 text-cesa-gold rounded-2xl text-xs font-bold hover:bg-cesa-gold/10 transition">
                        Verificar UUID Manualmente
                    </button>
                </div>

                <div class="bg-gradient-to-br from-cesa-primary to-cesa-secondary rounded-3xl p-6 border border-cesa-gold/20 shadow-xl relative overflow-hidden">
                    <div class="absolute -right-4 -bottom-4 opacity-10 text-9xl">🦉</div>
                    <h3 class="font-bold mb-2 flex items-center gap-2">
                        <i class="fas fa-robot text-cesa-gold"></i> Impulso Bot IA
                    </h3>
                    <p class="text-xs text-blue-200 leading-relaxed">
                        "He detectado que el 40% de los alumnos en IT no tienen certificados de Inglés B2. ¿Deseas lanzar una convocatoria de validación?"
                    </p>
                    <button class="mt-4 bg-white text-cesa-primary px-4 py-2 rounded-xl text-xs font-bold shadow-lg hover:scale-105 transition">
                        Lanzar Sugerencia
                    </button>
                </div>
            </div>

        </div>
    </main>

    <footer class="mt-12 py-8 px-6 border-t border-white/5 text-center">
        <p class="text-gray-500 text-xs tracking-widest uppercase">© 2026 CESA UNISON • Coordinación Impulso</p>
    </footer>

</body>
</html>
