<?php
/**
 * Signup Portal - CESA WEB v3.5
 * Estética: Ultra Modern Glassmorphism
 * Archivo: /backend/public/signup.php
 */
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registro Estudiantil | CESA UNISON</title>
    <?php include __DIR__ . '/includes/pwa-header.php'; ?>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { 
            background: radial-gradient(circle at top left, #1e1b4b, #0f172a, #000000); 
            color: #ffffff; 
            font-family: 'Inter', sans-serif;
            overflow-x: hidden;
        }
        .glass-card {
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(40px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 40px;
        }
        .input-auth {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            color: white;
            transition: all 0.3s ease;
        }
        .input-auth:focus {
            background: rgba(255, 255, 255, 0.08);
            border-color: #6366f1;
            outline: none;
        }
        .bg-glow {
            position: absolute;
            width: 800px;
            height: 800px;
            background: radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%);
            z-index: -1;
            filter: blur(80px);
        }
    </style>
</head>
<body class="min-h-screen flex items-center justify-center p-6 relative">
    
    <div class="bg-glow -top-96 -right-96"></div>

    <main class="w-full max-w-xl glass-card p-12 space-y-10 animate-in fade-in slide-in-from-right-10 duration-1000 shadow-2xl">
        
        <div class="text-center space-y-4">
            <h1 class="text-4xl font-black uppercase tracking-tighter">Únete al CESA</h1>
            <p class="text-[10px] text-white/40 uppercase font-black tracking-[0.3em]">Registro Oficial Ciclo 2026-2028</p>
        </div>

        <form id="signupForm" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-2">
                    <label class="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400 ml-4">Nombre Completo</label>
                    <input type="text" name="nombre_completo" required class="w-full input-auth p-5 text-sm" placeholder="Nombre y Apellidos">
                </div>
                <div class="space-y-2">
                    <label class="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400 ml-4">Matrícula (Opcional)</label>
                    <input type="text" name="matricula" class="w-full input-auth p-5 text-sm" placeholder="221200000">
                </div>
            </div>

            <div class="space-y-2">
                <label class="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400 ml-4">Correo Institucional (@unison.mx)</label>
                <input type="email" name="email" required class="w-full input-auth p-5 text-sm" placeholder="tu.nombre@unison.mx">
            </div>

            <div class="space-y-2">
                <label class="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400 ml-4">Contraseña Segura</label>
                <input type="password" name="password" required class="w-full input-auth p-5 text-sm" placeholder="Mínimo 8 caracteres">
            </div>

            <div id="errorMsg" class="hidden text-red-500 text-[10px] font-black uppercase tracking-widest text-center bg-red-500/10 p-3 rounded-xl border border-red-500/20"></div>
            <div id="successMsg" class="hidden text-green-500 text-[10px] font-black uppercase tracking-widest text-center bg-green-500/10 p-3 rounded-xl border border-green-500/20"></div>

            <button type="submit" id="signupBtn" class="w-full bg-indigo-600 hover:bg-white hover:text-black py-5 rounded-[20px] text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-500">
                Crear Cuenta Universitaria
            </button>
        </form>

        <footer class="text-center space-y-4 pt-4 border-t border-white/5">
            <p class="text-white/30 text-xs">¿Ya tienes cuenta? <a href="login.php" class="text-white font-black hover:text-indigo-400 transition-colors uppercase tracking-widest text-[10px]">Inicia Sesión</a></p>
        </footer>

    </main>

    <script>
        document.getElementById('signupForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const err = document.getElementById('errorMsg');
            const scs = document.getElementById('successMsg');
            const btn = document.getElementById('signupBtn');
            
            err.classList.add('hidden');
            scs.classList.add('hidden');
            btn.innerText = 'PROCESANDO...';
            btn.disabled = true;

            const formData = {
                nombre_completo: e.target.nombre_completo.value,
                matricula: e.target.matricula.value,
                email: e.target.email.value,
                password: e.target.password.value
            };

            try {
                const res = await fetch('/api/auth.php?action=signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                const data = await res.json();
                
                if (data.success) {
                    scs.innerText = data.message;
                    scs.classList.remove('hidden');
                    setTimeout(() => window.location.href = 'login.php', 2000);
                } else {
                    err.innerText = data.error;
                    err.classList.remove('hidden');
                    btn.innerText = 'CREAR CUENTA UNIVERSITARIA';
                    btn.disabled = false;
                }
            } catch (err) {
                btn.innerText = 'ERROR DE RED';
                btn.disabled = false;
            }
        });
    </script>
</body>
</html>
