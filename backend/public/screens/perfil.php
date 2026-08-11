<?php
/**
 * Screen: Perfil de Usuario - CESA PWA v4.0 Industrial
 * Incluye Módulo de Carnet Digital QR (CBIT-04)
 */
require_once __DIR__ . '/../../lib/Auth.php';
require_once __DIR__ . '/../../config/database.php';

$auth = new Auth();
$userAuth = $auth->getUser();

if (!$userAuth) {
    echo "<div class='p-8 text-center'>Sesión expirada.</div>";
    exit;
}

// Obtener datos frescos de la DB (CBIT-01 Compliance)
$pdo = getDBConnection();
$stmt = $pdo->prepare("SELECT nombre_completo, email, rol, matricula FROM usuarios WHERE id = ?");
$stmt->execute([$userAuth['id']]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

$userName = $user['nombre_completo'] ?? 'Estudiante';
$userEmail = $user['email'] ?? 'sin-email@unison.mx';
$userRole = $user['rol'] ?? 'estudiante';
$userMatricula = $user['matricula'] ?? 'NO-MATRICULA';
?>
<div class="space-y-6 animate-slide-in-right pb-24">
    
    <!-- Student Identity Card (Collapsible) -->
    <div id="carnet-container" class="relative group">
        <div id="carnet-card" class="glass p-6 border-cesa-gold/30 relative overflow-hidden transition-all duration-500 cursor-pointer hover:shadow-cesa-gold/10 hover:shadow-xl" onclick="toggleCarnet()">
            <div class="absolute top-0 right-0 p-3 opacity-20">
                <i class="fas fa-id-card text-6xl text-cesa-gold"></i>
            </div>
            
            <div class="flex items-center gap-4 mb-6">
                <div class="w-16 h-16 rounded-full bg-cesa-navy flex items-center justify-center text-2xl font-bold border-2 border-cesa-gold shadow-lg">
                    <?= strtoupper(substr($userName, 0, 1)) ?>
                </div>
                <div>
                    <h2 class="text-lg font-bold text-gray-900 dark:text-white"><?= htmlspecialchars($userName) ?></h2>
                    <p class="text-[10px] text-cesa-gold font-black uppercase tracking-tighter"><?= htmlspecialchars($userMatricula) ?> • <?= strtoupper($userRole) ?></p>
                </div>
            </div>

            <!-- QR Container (Hidden by default) -->
            <div id="qr-section" class="hidden flex flex-col items-center justify-center py-4 space-y-4 animate-fade-in">
                <div id="qrcode" class="p-3 bg-white rounded-xl shadow-inner shadow-black/20"></div>
                <div class="text-center">
                    <p class="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Código Dinámico de Seguridad</p>
                    <p id="qr-timer" class="text-[9px] text-green-500 font-medium font-mono mt-1">Expira en: 10:00</p>
                </div>
            </div>

            <div id="carnet-footer" class="mt-4 flex justify-between items-center">
                <span class="text-[9px] text-gray-400 font-medium">Validado por CESA Gobernanza</span>
                <span class="text-[10px] text-cesa-gold font-bold flex items-center gap-1">
                    <span id="carnet-action-text">TAP PARA MOSTRAR QR</span>
                    <i id="carnet-icon" class="fas fa-chevron-down text-[8px]"></i>
                </span>
            </div>
        </div>
    </div>

    <!-- Academic Progress -->
    <section class="glass p-5 border-gray-200 dark:border-white/5">
        <div class="flex justify-between items-center mb-4">
            <h3 class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">Progreso Académico</h3>
            <span class="text-[10px] bg-cesa-navy text-white px-2 py-0.5 rounded-full font-bold">Inscrito</span>
        </div>
        <div class="grid grid-cols-2 gap-4">
            <div class="bg-gray-50 dark:bg-white/5 p-3 rounded-lg border border-gray-100 dark:border-white/10">
                <p class="text-[9px] text-gray-400 uppercase font-bold">Créditos</p>
                <p class="text-sm font-black text-cesa-navy dark:text-cesa-gold">184 / 350</p>
            </div>
            <div class="bg-gray-50 dark:bg-white/5 p-3 rounded-lg border border-gray-100 dark:border-white/10">
                <p class="text-[9px] text-gray-400 uppercase font-bold">Promedio</p>
                <p class="text-sm font-black text-cesa-navy dark:text-cesa-gold">8.9</p>
            </div>
        </div>
    </section>

    <!-- App Settings -->
    <div class="space-y-3">
        <button class="w-full glass p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/5 transition border-gray-200 dark:border-white/10">
            <div class="flex items-center gap-4">
                <div class="w-10 h-10 bg-gray-100 dark:bg-white/5 rounded-xl flex items-center justify-center text-gray-400"><i class="fas fa-bell"></i></div>
                <div class="text-left">
                    <h4 class="text-sm font-bold">Notificaciones</h4>
                    <p class="text-[10px] text-gray-500">Configurar alertas push</p>
                </div>
            </div>
            <i class="fas fa-chevron-right text-gray-200"></i>
        </button>

        <button onclick="logout()" class="w-full glass p-4 flex items-center justify-between border-red-500/10 hover:bg-red-500/5 transition">
            <div class="flex items-center gap-4">
                <div class="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500"><i class="fas fa-sign-out-alt"></i></div>
                <div class="text-left">
                    <h4 class="text-sm font-bold text-red-500">Cerrar Sesión</h4>
                    <p class="text-[10px] text-red-900/30">Versión 4.0 Industrial</p>
                </div>
            </div>
        </button>
    </div>
</div>

<!-- Library QR -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>

<script>
    let qrcode = null;
    let qrTimer = null;
    let isCarnetOpen = false;

    async function toggleCarnet() {
        const qrSection = document.getElementById('qr-section');
        const actionText = document.getElementById('carnet-action-text');
        const icon = document.getElementById('carnet-icon');
        
        isCarnetOpen = !isCarnetOpen;
        
        if (isCarnetOpen) {
            qrSection.classList.remove('hidden');
            actionText.innerText = 'TAP PARA OCULTAR';
            icon.classList.replace('fa-chevron-down', 'fa-chevron-up');
            await refreshQR();
        } else {
            qrSection.classList.add('hidden');
            actionText.innerText = 'TAP PARA MOSTRAR QR';
            icon.classList.replace('fa-chevron-up', 'fa-chevron-down');
            clearInterval(qrTimer);
        }
    }

    async function refreshQR() {
        try {
            const res = await fetch('/api/user/carnet_payload.php');
            const data = await res.json();
            
            if (data.success) {
                const qrContainer = document.getElementById('qrcode');
                qrContainer.innerHTML = ''; // Limpiar previo
                
                qrcode = new QRCode(qrContainer, {
                    text: data.payload,
                    width: 180,
                    height: 180,
                    colorDark : "#0F2C59",
                    colorLight : "#ffffff",
                    correctLevel : QRCode.CorrectLevel.H
                });

                startTimer(data.expires_in);
            }
        } catch (err) {
            console.error('Error al generar carnet:', err);
        }
    }

    function startTimer(seconds) {
        clearInterval(qrTimer);
        let timeLeft = seconds;
        const display = document.getElementById('qr-timer');
        
        qrTimer = setInterval(() => {
            let minutes = Math.floor(timeLeft / 60);
            let secs = timeLeft % 60;
            display.innerText = `Expira en: ${minutes}:${secs < 10 ? '0' : ''}${secs}`;
            
            if (--timeLeft < 0) {
                clearInterval(qrTimer);
                refreshQR(); // Regenerar automáticamente
            }
        }, 1000);
    }

    async function logout() {
        if (confirm('¿Estás seguro de que deseas salir?')) {
            await fetch('/api/auth.php?action=logout', { method: 'POST' });
            window.location.href = '/login.php';
        }
    }
</script>
