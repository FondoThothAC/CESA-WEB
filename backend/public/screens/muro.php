<?php
/**
 * Screen: Muro Social - Reddit Style
 * CESA PWA v2.0
 */
require_once __DIR__ . '/../../lib/Auth.php';
$user = Auth::getAuthenticatedUser();
?>
<div class="space-y-4 animate-slide-in-right">
    
    <!-- Header de Filtros -->
    <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button class="bg-blue-600 text-white px-5 py-1.5 rounded-full text-xs font-bold shadow-lg shadow-blue-900/30">Popular</button>
        <button class="bg-white/10 text-gray-400 px-5 py-1.5 rounded-full text-xs font-bold border border-white/5 hover:bg-white/20 transition">Reciente</button>
        <button class="bg-white/10 text-gray-400 px-5 py-1.5 rounded-full text-xs font-bold border border-white/5 hover:bg-white/20 transition">Anuncios</button>
    </div>

    <!-- Feed Content -->
    <div id="reddit-feed" class="space-y-4">
        <!-- Renderizado dinámicamente -->
        <div class="flex flex-col items-center justify-center py-20 text-gray-500">
            <div class="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p class="text-sm">Escuchando a la comunidad...</p>
        </div>
    </div>
</div>

<script>
    // Reddit Style Post Component
    function renderRedditPost(post) {
        const timeAgo = new Date(post.created_at).toLocaleDateString();
        const initial = post.alias_autor ? post.alias_autor[0].toUpperCase() : (post.nombre_completo ? post.nombre_completo[0].toUpperCase() : 'U');
        const authorDisplay = post.alias_autor || post.nombre_completo || 'Usuario CESA';
        
        return `
        <div class="glass p-4 transition-all active:scale-[0.98]">
            <div class="flex items-center gap-2 mb-3">
                <div class="w-6 h-6 bg-blue-600/30 text-blue-400 rounded-full flex items-center justify-center text-[10px] font-bold">
                    ${initial}
                </div>
                <span class="text-[10px] font-bold text-gray-300">u/${authorDisplay}</span>
                <span class="text-[10px] text-gray-600">• ${post.coordinacion_destino} • ${timeAgo}</span>
            </div>
            
            <h3 class="font-bold text-white mb-2 leading-snug">${post.contenido}</h3>
            
            <div class="flex items-center gap-4 mt-4">
                <div class="bg-white/5 rounded-full flex items-center gap-1 p-1 pr-3 border border-white/5">
                    <button onclick="votarPost(${post.id}, 1, this)" class="p-2 rounded-full hover:bg-orange-500/20 hover:text-orange-500 transition-colors ${post.user_vote == 1 ? 'text-orange-500' : 'text-gray-500'}">
                        <i class="fas fa-arrow-up"></i>
                    </button>
                    <span class="text-xs font-bold min-w-[20px] text-center ${post.score > 0 ? 'text-orange-500' : (post.score < 0 ? 'text-indigo-400' : 'text-gray-400')}">${post.score}</span>
                    <button onclick="votarPost(${post.id}, -1, this)" class="p-2 rounded-full hover:bg-indigo-500/20 hover:text-indigo-400 transition-colors ${post.user_vote == -1 ? 'text-indigo-400' : 'text-gray-500'}">
                        <i class="fas fa-arrow-down"></i>
                    </button>
                </div>
                
                <button class="flex items-center gap-2 text-gray-500 hover:text-white transition">
                    <div class="bg-white/5 p-2 rounded-full"><i class="far fa-comment text-xs"></i></div>
                    <span class="text-[10px] font-bold">${post.comentarios_count || 0}</span>
                </button>
                
                <button class="flex items-center gap-2 text-gray-500 hover:text-white transition">
                    <div class="bg-white/5 p-2 rounded-full"><i class="fas fa-share text-xs"></i></div>
                </button>
            </div>
        </div>
        `;
    }

    // Interaction Functions
    window.votarPost = async function(postId, valor, btn) {
        try {
            const res = await fetch('/api/muro.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'votar', publicacion_id: postId, valor })
            });
            const data = await res.json();
            if (data.success) {
                // Actualizar UI localmente
                const scoreEl = btn.parentElement.querySelector('span');
                scoreEl.textContent = data.new_score;
                
                // Toggle active styles
                const parent = btn.parentElement;
                parent.querySelectorAll('button').forEach(b => b.classList.replace('text-orange-500', 'text-gray-500'));
                parent.querySelectorAll('button').forEach(b => b.classList.replace('text-indigo-400', 'text-gray-500'));
                
                if (valor == 1) btn.classList.replace('text-gray-500', 'text-orange-500');
                if (valor == -1) btn.classList.replace('text-gray-500', 'text-indigo-400');
                
                scoreEl.className = 'text-xs font-bold min-w-[20px] text-center ' + 
                                   (data.new_score > 0 ? 'text-orange-500' : (data.new_score < 0 ? 'text-indigo-400' : 'text-gray-400'));
            }
        } catch (e) {
            console.error('Error al votar:', e);
        }
    }

    // Load Posts
    async function loadMuro() {
        const res = await fetch('/api/muro.php');
        const resp = await res.json();
        if (resp.success) {
            const container = document.getElementById('reddit-feed');
            if (resp.data.length === 0) {
                container.innerHTML = `<div class="text-center py-20 text-gray-500">No hay publicaciones activas.</div>`;
            } else {
                container.innerHTML = resp.data.map(post => renderRedditPost(post)).join('');
            }
        }
    }

    // Global Action for FAB
    window.openCreatePostModal = function() {
        // Implementación de modal dinámico (se puede hacer en el app-shell o aquí)
        alert('Funcionalidad de crear nueva publicación próximamente.');
    }

    loadMuro();
</script>
