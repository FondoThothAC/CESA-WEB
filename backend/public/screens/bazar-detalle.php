<?php
/**
 * Screen: Bazar Detalle de Negocio - CESA PWA
 */
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../lib/Auth.php';

$id = (int)($_GET['id'] ?? 0);
if ($id <= 0) {
    echo "<div class='p-8 text-center text-white'>ID de negocio no válido.</div>";
    exit;
}

$pdo = getDBConnection();
$stmt = $pdo->prepare("
    SELECT e.*, u.nombre_completo as vendedor_nombre, u.carrera 
    FROM emprendimientos e
    JOIN usuarios u ON e.usuario_id = u.id
    WHERE e.id = ? AND e.activo = 1
");
$stmt->execute([$id]);
$negocio = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$negocio) {
    echo "<div class='p-8 text-center text-white'>Negocio no encontrado o inactivo.</div>";
    exit;
}
?>

<div class="space-y-6 animate-slide-in-right pb-12">
    <!-- Header/Nav -->
    <div class="flex items-center gap-4">
        <button onclick="window.router.navigate('bazar')" class="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition">
            <i class="fas fa-arrow-left"></i>
        </button>
        <h2 class="text-xl font-bold text-white">Perfil de Negocio</h2>
    </div>

    <!-- Main Card -->
    <div class="glass rounded-3xl p-6">
        <div class="flex flex-col md:flex-row gap-6">
            <div class="w-24 h-24 rounded-2xl bg-gradient-to-br from-cesa-navy to-cesa-gold flex items-center justify-center text-4xl font-black flex-shrink-0 text-white shadow-xl">
                <?= strtoupper(substr($negocio['nombre_negocio'], 0, 1)) ?>
            </div>
            <div class="flex-1">
                <div class="flex justify-between items-start mb-2">
                    <h1 class="text-2xl font-bold text-white"><?= htmlspecialchars($negocio['nombre_negocio']) ?></h1>
                    <?php if ($negocio['destacado']): ?>
                        <span class="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                            <i class="fas fa-crown"></i> PRO
                        </span>
                    <?php endif; ?>
                </div>
                
                <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-4"><?= htmlspecialchars($negocio['categoria']) ?></p>
                <p class="text-gray-300 text-sm leading-relaxed mb-6"><?= htmlspecialchars($negocio['descripcion']) ?></p>
                
                <div class="flex flex-wrap gap-2 text-xs mb-4">
                    <span class="bg-blue-500/20 text-blue-300 px-3 py-1.5 rounded-lg flex items-center gap-2 font-bold shadow-lg">
                        <i class="fas fa-user-graduate"></i> <?= htmlspecialchars($negocio['vendedor_nombre']) ?>
                    </span>
                    <span class="bg-purple-500/20 text-purple-300 px-3 py-1.5 rounded-lg flex items-center gap-2 font-bold shadow-lg">
                        <i class="fas fa-book"></i> <?= htmlspecialchars($negocio['carrera']) ?>
                    </span>
                </div>
            </div>
        </div>
    </div>

    <!-- Detailed Info & Actions -->
    <div class="grid md:grid-cols-2 gap-6">
        <div class="glass rounded-3xl p-6">
            <h3 class="text-lg font-bold mb-4 flex items-center gap-2 text-white">
                <i class="fas fa-address-card text-blue-400"></i> Contacto
            </h3>
            <div class="space-y-4">
                <?php if (!empty($negocio['whatsapp'])): ?>
                    <a href="https://wa.me/<?= preg_replace('/[^0-9]/', '', $negocio['whatsapp']) ?>?text=Hola,%20vi%20tu%20negocio%20en%20el%20Bazar%20CESA%20%F0%9F%A6%89" 
                       target="_blank" onclick="trackInteraction(<?= $negocio['id'] ?>, 'whatsapp')"
                       class="flex items-center gap-4 p-4 bg-green-500/10 border border-green-500/30 rounded-2xl hover:bg-green-500/20 transition active:scale-95">
                        <div class="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-xl"><i class="fab fa-whatsapp"></i></div>
                        <div>
                            <p class="font-bold text-white text-sm">WhatsApp</p>
                            <p class="text-xs text-gray-400"><?= htmlspecialchars($negocio['whatsapp']) ?></p>
                        </div>
                    </a>
                <?php endif; ?>
                
                <?php if (!empty($negocio['instagram'])): ?>
                    <a href="https://instagram.com/<?= str_replace('@', '', $negocio['instagram']) ?>" 
                       target="_blank" onclick="trackInteraction(<?= $negocio['id'] ?>, 'instagram')"
                       class="flex items-center gap-4 p-4 bg-pink-500/10 border border-pink-500/30 rounded-2xl hover:bg-pink-500/20 transition active:scale-95">
                        <div class="w-12 h-12 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 flex items-center justify-center text-white text-xl"><i class="fab fa-instagram"></i></div>
                        <div>
                            <p class="font-bold text-white text-sm">Instagram</p>
                            <p class="text-xs text-gray-400"><?= htmlspecialchars($negocio['instagram']) ?></p>
                        </div>
                    </a>
                <?php endif; ?>
            </div>
        </div>

        <div class="glass rounded-3xl p-6">
             <h3 class="text-lg font-bold mb-4 flex items-center gap-2 text-white">
                <i class="fas fa-info-circle text-cesa-gold"></i> Detalles
            </h3>
             <div class="space-y-4">
                 <?php if (!empty($negocio['precio_min'])): ?>
                    <div class="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                        <span class="text-xs text-gray-400 font-bold uppercase">Rango Precios</span>
                        <span class="text-sm font-bold text-green-400">$<?= number_format($negocio['precio_min']) ?> - $<?= number_format($negocio['precio_max']) ?></span>
                    </div>
                 <?php endif; ?>
                 <div class="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                        <span class="text-xs text-gray-400 font-bold uppercase">Visitas PWA</span>
                        <span class="text-sm font-bold text-blue-400"><?= $negocio['views'] ?> vistas</span>
                </div>
                <div class="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                        <span class="text-xs text-gray-400 font-bold uppercase">Karma Score</span>
                        <span class="text-sm font-bold text-cesa-gold"><?= $negocio['score'] ?> puntos</span>
                </div>
             </div>
        </div>
    </div>
</div>

<script>
    // Trigger the view counter in background
    fetch('/api/bazar.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: new URLSearchParams({
            action: 'registrar_view',
            id: <?= $negocio['id'] ?>
        })
    });

    function trackInteraction(id, type) {
         fetch('/api/bazar.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: new URLSearchParams({
                action: 'registrar_view',
                id: id,
                type: type
            })
        });
    }
</script>
