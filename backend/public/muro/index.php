<?php
/**
 * Frontend: Muro Social con Karma (v3.7)
 * CESA WEB Industrialized
 * Estilo: Reddit-Glassmorphism
 */
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Muro Social - CESA UNISON</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        .glass-card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
        }
        .karma-btn {
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .karma-up.active { color: #ff4500; filter: drop-shadow(0 0 5px rgba(255,69,0,0.5)); }
        .karma-down.active { color: #7193ff; filter: drop-shadow(0 0 5px rgba(113,147,255,0.5)); }
        .score-count { font-weight: 700; min-width: 20px; text-align: center; }
    </style>
</head>
<body class="bg-slate-950 text-white min-h-screen font-sans">
    <nav class="sticky top-0 z-50 glass-card mx-4 my-2 px-6 py-4 flex justify-between items-center">
        <h1 class="text-xl font-bold bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
            CESA Social Wall
        </h1>
        <div class="flex items-center gap-4">
            <span id="userName" class="text-sm opacity-70"></span>
            <button onclick="window.history.back()" class="opacity-50 hover:opacity-100 transition">
                <i class="fa-solid fa-arrow-left"></i>
            </button>
        </div>
    </nav>

    <main class="max-w-2xl mx-auto p-4 space-y-6">
        <!-- New Post Card -->
        <section class="glass-card p-4">
            <textarea id="postContent" class="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition resize-none" placeholder="¿Qué quieres compartir con la comunidad?" rows="3"></textarea>
            <div class="flex justify-between items-center mt-3">
                <label class="flex items-center gap-2 text-sm cursor-pointer opacity-70 hover:opacity-100">
                    <input type="checkbox" id="anonCheck" class="rounded border-white/20 bg-transparent text-orange-500">
                    Publicar con alias
                </label>
                <button onclick="publishPost()" class="bg-gradient-to-r from-orange-600 to-orange-400 px-6 py-2 rounded-full font-semibold hover:scale-105 active:scale-95 transition">
                    Publicar
                </button>
            </div>
        </section>

        <!-- Feed Container -->
        <div id="feed" class="space-y-4 pb-20">
            <!-- Posts injected here -->
            <div class="flex justify-center py-10" id="loader">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
        </div>
    </main>

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            loadFeed();
        });

        async function loadFeed() {
            try {
                const res = await fetch('/api/muro.php');
                const result = await res.json();
                
                if (result.success) {
                    renderFeed(result.data);
                }
            } catch (err) {
                console.error("Error cargando feed:", err);
            } finally {
                document.getElementById('loader').style.display = 'none';
            }
        }

        function renderFeed(posts) {
            const feed = document.getElementById('feed');
            feed.innerHTML = '';

            posts.forEach(post => {
                const author = post.alias_autor || post.nombre_completo || 'Estudiante CESA';
                const isAnon = !!post.alias_autor;
                const voteState = parseInt(post.user_vote); // 1, -1 o null
                
                const postHTML = `
                    <article class="glass-card p-4 flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300" id="post-${post.id}">
                        <!-- Karma Column -->
                        <div class="flex flex-col items-center gap-1 w-10">
                            <button onclick="votar(${post.id}, 1)" class="karma-btn karma-up ${voteState === 1 ? 'active' : ''} hover:bg-white/5 p-2 rounded-lg" title="Upvote">
                                <i class="fa-solid fa-arrow-up text-lg"></i>
                            </button>
                            <span class="score-count text-sm ${voteState === 1 ? 'text-orange-500' : (voteState === -1 ? 'text-blue-400' : 'text-white/50')}">${post.score || 0}</span>
                            <button onclick="votar(${post.id}, -1)" class="karma-btn karma-down ${voteState === -1 ? 'active' : ''} hover:bg-white/5 p-2 rounded-lg" title="Downvote">
                                <i class="fa-solid fa-arrow-down text-lg"></i>
                            </button>
                        </div>

                        <!-- Content Column -->
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2 mb-1">
                                <span class="font-bold text-orange-400/90">${author}</span>
                                ${isAnon ? '<span class="text-[10px] bg-white/10 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Alias</span>' : ''}
                                <span class="text-[10px] opacity-40 capitalize">• ${post.tipo || 'Post'}</span>
                            </div>
                            <p class="text-white/80 leading-relaxed whitespace-pre-wrap break-words">${post.contenido}</p>
                            <div class="flex gap-4 mt-4 text-xs opacity-50">
                                <span><i class="fa-regular fa-comment mr-1"></i> ${post.comentarios_count || 0} comentarios</span>
                                <span><i class="fa-regular fa-clock mr-1"></i> ${new Date(post.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </article>
                `;
                feed.insertAdjacentHTML('beforeend', postHTML);
            });
        }

        async function votar(postId, valor) {
            try {
                const res = await fetch('/api/muro.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'votar', publicacion_id: postId, valor: valor })
                });
                const data = await res.json();
                
                if (data.success) {
                    // Actualización optimista: Recargamos solo la información del score
                    // O podemos recargar el feed suavemente:
                    loadFeed(); 
                }
            } catch (err) {
                console.error("Error al votar:", err);
            }
        }

        async function publishPost() {
            const content = document.getElementById('postContent').value.trim();
            const anon = document.getElementById('anonCheck').checked;
            if (!content) return;

            try {
                const res = await fetch('/api/muro.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        action: 'publicar', 
                        contenido: content, 
                        usar_alias: anon 
                    })
                });
                const data = await res.json();
                if (data.success) {
                    document.getElementById('postContent').value = '';
                    loadFeed();
                }
            } catch (err) { console.error("Error publishing", err); }
        }
    </script>
</body>
</html>
