<?php
/**
 * Screen: Admin Moderación Bazar - CESA PWA
 */
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../lib/Auth.php';

$auth = new Auth();
$user = $auth->getUser();

if (!$user || ($user['rol'] !== 'admin' && $user['rol'] !== 'mesa_directiva' && $user['rol'] !== 'coordinador_impulso')) {
    echo "<div class='p-8 text-center text-red-400'>Acceso no autorizado a este módulo.</div>";
    exit;
}

$pdo = getDBConnection();
// Pendientes
$stmt = $pdo->prepare("SELECT e.*, u.nombre_completo, u.matricula FROM emprendimientos e JOIN usuarios u ON e.usuario_id = u.id WHERE e.verificado = 0 AND e.activo = 1 ORDER BY e.created_at DESC");
$stmt->execute();
$pendientes = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Verificados recientemente
$stmt2 = $pdo->prepare("SELECT e.*, u.nombre_completo FROM emprendimientos e JOIN usuarios u ON e.usuario_id = u.id WHERE e.verificado = 1 AND e.activo = 1 ORDER BY e.created_at DESC LIMIT 10");
$stmt2->execute();
$verificados = $stmt2->fetchAll(PDO::FETCH_ASSOC);
?>

<div class="space-y-6 animate-slide-in-right pb-20">
    <div class="flex items-center gap-4">
        <button onclick="window.router.navigate('admin')" class="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition">
            <i class="fas fa-arrow-left"></i>
        </button>
        <div>
            <h2 class="text-xl font-black text-white uppercase tracking-tighter">Moderación Bazar</h2>
            <p class="text-[10px] text-cesa-gold font-bold uppercase tracking-widest">Coordinación Impulso</p>
        </div>
    </div>

    <div class="grid grid-cols-2 gap-4">
        <div class="glass p-4 rounded-3xl border-l-4 border-cesa-gold">
            <p class="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Pendientes</p>
            <h3 class="text-2xl font-black text-white"><?= count($pendientes) ?></h3>
        </div>
        <div class="glass p-4 rounded-3xl border-l-4 border-green-500">
            <p class="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Activos (Top 10)</p>
            <h3 class="text-2xl font-black text-white"><?= count($verificados) ?></h3>
        </div>
    </div>

    <!-- Lista de Pendientes -->
    <section>
        <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-2">Negocios por Verificar</h3>
        <?php if(empty($pendientes)): ?>
            <div class="glass p-8 text-center rounded-3xl opacity-50">
                <i class="fas fa-check-circle text-green-500 text-3xl mb-2"></i>
                <p class="text-white font-bold text-sm">Todo al día</p>
                <p class="text-xs text-gray-400">No hay negocios pendientes de revisión.</p>
            </div>
        <?php else: ?>
            <div class="space-y-4">
                <?php foreach($pendientes as $p): ?>
                    <div class="glass rounded-3xl p-5 border border-white/5 relative overflow-hidden group">
                        <div class="flex items-start gap-4">
                            <div class="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white font-black shadow-inner flex-shrink-0">
                                <?= strtoupper(substr($p['nombre_negocio'], 0, 1)) ?>
                            </div>
                            <div class="flex-1">
                                <h4 class="font-bold text-white leading-none mb-1 text-sm"><?= htmlspecialchars($p['nombre_negocio']) ?></h4>
                                <p class="text-[10px] text-gray-400 mb-2">Por: <?= htmlspecialchars($p['nombre_completo']) ?> (<?= $p['matricula'] ?>)</p>
                                <span class="bg-blue-500/20 text-blue-300 px-2.5 py-1 rounded-md text-[8px] font-black uppercase tracking-widest border border-blue-500/30">
                                    <?= htmlspecialchars($p['categoria']) ?>
                                </span>
                            </div>
                        </div>
                        <p class="text-xs text-gray-300 mt-4 line-clamp-2"><?= htmlspecialchars($p['descripcion']) ?></p>
                        
                        <div class="grid grid-cols-2 gap-2 mt-4">
                            <button onclick="procesarNegocio(<?= $p['id'] ?>, 'verificar')" class="bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition">
                                Aprobar
                            </button>
                            <button onclick="procesarNegocio(<?= $p['id'] ?>, 'rechazar')" class="bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition border border-red-500/30">
                                Rechazar
                            </button>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>
    </section>
</div>

<script>
    async function procesarNegocio(id, accion) {
        if (!confirm(`¿Seguro que deseas ${accion} este negocio?`)) return;

        try {
            const formData = new URLSearchParams();
            formData.append('action', 'verificar');
            formData.append('id', id);
            formData.append('accion', accion);

            const res = await fetch('/api/bazar.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData
            });
            const data = await res.json();
            
            if (data.success) {
                // Recargar el componente
                window.router.navigate('bazar-gestion');
            } else {
                alert('Error: ' + data.error);
            }
        } catch(e) {
            alert('Error grave al procesar la petición.');
            console.error(e);
        }
    }
</script>
