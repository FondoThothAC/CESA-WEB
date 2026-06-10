<?php
/**
 * Login Portal - CESA WEB v3.5
 * Estética: Ultra Modern Glassmorphism
 * Archivo: /backend/public/login.php
 */
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Iniciar Sesión | CESA UNISON</title>
    <?php include __DIR__ . '/includes/pwa-header.php'; ?>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { 
            background: radial-gradient(circle at top right, #1e1b4b, #0f172a, #000000); 
            color: #ffffff; 
            font-family: 'Inter', sans-serif;
            overflow: hidden;
        }
        .glass-card {
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(40px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 40px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        .input-auth {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            color: white;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .input-auth:focus {
            background: rgba(255, 255, 255, 0.08);
            border-color: #6366f1;
            transform: translateY(-2px);
            outline: none;
            box-shadow: 0 10px 20px -5px rgba(99, 102, 241, 0.2);
        }
        .bg-glow {
            position: absolute;
            width: 600px;
            height: 600px;
            background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
            z-index: -1;
            filter: blur(60px);
        }
    </style>
</head>
<body class="min-h-screen flex items-center justify-center p-6 relative">
    
    <div class="bg-glow -top-48 -left-48"></div>
    <div class="bg-glow -bottom-48 -right-48"></div>

    <main class="w-full max-w-md glass-card p-12 space-y-10 animate-in fade-in zoom-in duration-1000">
        
        <div class="text-center space-y-4">
            <div class="inline-flex items-center justify-center w-20 h-20 bg-indigo-600 rounded-[2rem] shadow-2xl shadow-indigo-600/30 text-3xl font-black mb-4">C</div>
            <h1 class="text-4xl font-black uppercase tracking-tighter">Acceso CESA</h1>
            <p class="text-[10px] text-white/40 uppercase font-black tracking-[0.3em]">Comunidad Universitaria Sonora</p>
        </div>

        <form id="loginForm" class="space-y-6">
            <div class="space-y-2">
                <label class="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400 ml-4">Tu Correo Institucional</label>
                <input type="email" name="email" required class="w-full input-auth p-5 text-sm" placeholder="usuario@unison.mx">
            </div>

            <div class="space-y-2">
                <label class="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400 ml-4">Contraseña</label>
                <input type="password" name="password" required class="w-full input-auth p-5 text-sm" placeholder="••••••••">
            </div>

            <div id="errorMsg" class="hidden text-red-500 text-[10px] font-black uppercase tracking-widest text-center"></div>

            <button type="submit" id="loginBtn" class="w-full bg-indigo-600 hover:bg-white hover:text-black py-5 rounded-[20px] text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-500 shadow-xl shadow-indigo-600/20 active:scale-95">
                Entrar al Ecosistema
            </button>
        </form>

        <footer class="text-center space-y-4">
            <p class="text-white/30 text-xs">¿No tienes cuenta? <a href="signup.php" class="text-white font-black hover:text-indigo-400 transition-colors uppercase tracking-widest text-[10px]">Regístrate aquí</a></p>
            <div class="pt-4 border-t border-white/5">
                <p class="text-[8px] text-white/20 uppercase font-black tracking-widest">© 2026 FT APPS - ADMINISTRACIÓN 2026-2028</p>
            </div>
        </footer>

    </main>

    <script>
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const err = document.getElementById('errorMsg');
            const btn = document.getElementById('loginBtn');
            err.classList.add('hidden');
            btn.innerText = 'AUTENTICANDO...';
            btn.disabled = true;

            const formData = {
                email: e.target.email.value,
                password: e.target.password.value
            };

            try {
                const res = await fetch('/api/auth.php?action=login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                const data = await res.json();
                
                if (data.success) {
                    // Redirigir a la PWA Shell Industrializada
                    window.location.href = '/pwa/';
                } else {
                    err.innerText = data.error;
                    err.classList.remove('hidden');
                    btn.innerText = 'ENTRAR AL ECOSISTEMA';
                    btn.disabled = false;
                }
            } catch (err) {
                console.error(err);
                btn.innerText = 'ERROR DE RED';
                btn.disabled = false;
            }
        });
    </script>
</body>
</html>
