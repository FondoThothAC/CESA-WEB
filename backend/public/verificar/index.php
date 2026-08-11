<?php
/**
 * Verificador Público de Certificados - CESA WEB v3.6
 * Archivo: /backend/public/verificar/index.php
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../lib/AcademicProgressManager.php';

$uuid = $_GET['uuid'] ?? '';
$resultado = ['valido' => false, 'motivo' => 'No se proporcionó UUID'];

if ($uuid) {
    $pdo = getDBConnection();
    $manager = new AcademicProgressManager($pdo);
    $resultado = $manager->verificarCertificado($uuid);
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verificación de Certificado | CESA UNISON</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap');
        body { font-family: 'Outfit', sans-serif; background-color: #0f172a; color: #f8fafc; }
        .glass-card { background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.1); }
        .valido-border { border-color: #22c55e; box-shadow: 0 0 20px rgba(34, 197, 94, 0.1); }
        .invalido-border { border-color: #ef4444; box-shadow: 0 0 20px rgba(239, 68, 68, 0.1); }
    </style>
</head>
<body class="min-h-screen flex items-center justify-center p-4">

    <div class="max-w-md w-full glass-card p-10 rounded-[2.5rem] border-2 <?= $resultado['valido'] ? 'valido-border' : 'invalido-border' ?> text-center">
        
        <?php if ($resultado['valido']): ?>
            <div class="mb-8">
                <div class="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-green-500 text-5xl">
                    <i class="fas fa-check-double bounce"></i>
                </div>
                <h1 class="text-3xl font-black text-green-500 tracking-tight">CERTIFICADO VÁLIDO</h1>
                <p class="text-gray-400 text-sm mt-2">Documento oficial verificado por la <br>Sociedad de Alumnos UNISON</p>
            </div>
            
            <div class="space-y-4 pt-6 border-t border-white/10 text-left">
                <div class="bg-white/5 p-4 rounded-2xl">
                    <p class="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Titular del Certificado</p>
                    <p class="text-lg font-bold text-white"><?= htmlspecialchars($resultado['datos']['titular']) ?></p>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div class="bg-white/5 p-4 rounded-2xl">
                        <p class="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Habilidad</p>
                        <p class="font-bold text-blue-400"><?= htmlspecialchars($resultado['datos']['skill']) ?></p>
                    </div>
                    <div class="bg-white/5 p-4 rounded-2xl">
                        <p class="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Nivel</p>
                        <p class="font-bold text-white"><?= htmlspecialchars($resultado['datos']['nivel']) ?></p>
                    </div>
                </div>

                <div class="flex justify-between items-center px-2">
                    <div class="text-left">
                        <p class="text-[10px] text-gray-500 uppercase font-black tracking-widest">Emisión</p>
                        <p class="text-sm font-bold"><?= date('d M, Y', strtotime($resultado['emision'])) ?></p>
                    </div>
                    <?php if ($resultado['expiracion']): ?>
                    <div class="text-right">
                        <p class="text-[10px] text-gray-500 uppercase font-black tracking-widest">Vigencia</p>
                        <p class="text-sm font-bold text-gray-400"><?= date('d M, Y', strtotime($resultado['expiracion'])) ?></p>
                    </div>
                    <?php endif; ?>
                </div>
            </div>

            <div class="mt-10 flex flex-col gap-3">
                 <div class="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Hash de Seguridad</div>
                 <code class="text-[10px] text-gray-500 break-all bg-black/30 p-3 rounded-xl border border-white/5"><?= $uuid ?></code>
            </div>

        <?php else: ?>
            <div class="py-10">
                <div class="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500 text-5xl">
                    <i class="fas fa-times-circle"></i>
                </div>
                <h1 class="text-3xl font-black text-red-500 tracking-tight">CERTIFICADO INVÁLIDO</h1>
                <p class="text-gray-300 mt-4 font-medium"><?= $resultado['motivo'] ?></p>
                <p class="text-gray-500 text-sm mt-2">El código proporcionado no corresponde a una acreditación vigente en nuestro sistema.</p>
            </div>
            <a href="/" class="mt-6 inline-block text-blue-400 hover:text-blue-300 font-bold transition">
                <i class="fas fa-chevron-left mr-2"></i> Volver al Portal CESA
            </a>
        <?php endif; ?>

    </div>

</body>
</html>
