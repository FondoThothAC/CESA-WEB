/**
 * CESA Chatbot Global v3.5 - Componente flotante para todo el shell
 * Autor: Fondo Thoth AC | CESA UNISON 2026
 */
class CesaChatbot {
  constructor() {
    this.isOpen = false;
    this.isMinimized = false;
    this.messageQueue = [];
    this.lastMessageId = null;
    this.init();
  }

  init() {
    this.createButton();
    this.createModal();
    this.bindEvents();
    this.loadState();
    this.restoreLastSession();
  }

  createButton() {
    const btn = document.createElement('button');
    btn.id = 'chatbot-float-btn';
    btn.className = `
      fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg
      flex items-center justify-center z-50 hover:scale-105 transition-all duration-300
      focus:outline-none focus:ring-2 focus:ring-blue-400 animate-float
    `;
    btn.innerHTML = `
      <div class="text-white text-xl">
        🦉
      </div>
    `;
    btn.title = "CESA Bot - Asistente Virtual";
    document.body.appendChild(btn);
  }

  createModal() {
    const modal = document.createElement('div');
    modal.id = 'chatbot-modal';
    modal.className = `
      fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] hidden
      flex items-end md:items-center justify-center p-4
    `;
    modal.innerHTML = `
      <div class="w-full max-w-md h-[80vh] bg-gray-900/90 backdrop-blur-xl rounded-2xl overflow-hidden flex flex-col
        border border-gray-700 shadow-2xl relative">
        <!-- Header -->
        <div class="p-4 bg-gray-800/50 border-b border-gray-700 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xl">
              🦉
            </div>
            <div>
              <h3 class="font-bold text-white">CESA Bot</h3>
              <p class="text-[10px] text-green-400 uppercase tracking-widest font-bold">Online • IA Híbrida</p>
            </div>
          </div>
          <button id="btn-minimize-chat" class="text-gray-400 hover:text-white">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Messages container -->
        <div id="chat-messages" class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900/30">
          <div class="text-center text-gray-500 text-sm py-6">
            <i class="fas fa-comments mb-2 text-xl"></i><br>
            ¡Hola! Soy tu asistente del Consejo Estudiantil.<br>
            ¿En qué puedo ayudarte hoy?
          </div>
        </div>

        <!-- Input area -->
        <div class="p-4 border-t border-gray-700 bg-gray-800/50">
          <form id="chat-form" class="flex gap-2">
            <input
              type="text"
              id="chat-input"
              placeholder="Escribe tu pregunta..."
              class="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              maxlength="500"
            />
            <button
              type="submit"
              id="send-btn"
              class="bg-blue-600 hover:bg-blue-500 w-12 h-12 rounded-lg flex items-center justify-center transition"
            >
              <i class="fas fa-paper-plane"></i>
            </button>
          </form>
          <div class="mt-2 text-[10px] text-gray-500 flex justify-between uppercase tracking-widest font-bold">
            <span>🔒 Confidencial</span>
            <span id="latency-indicator" class="hidden">⏱️ <span>0ms</span></span>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // Minimize button
    document.getElementById('btn-minimize-chat').addEventListener('click', () => this.toggleOpen());
  }

  bindEvents() {
    const btn = document.getElementById('chatbot-float-btn');
    const modal = document.getElementById('chatbot-modal');
    const form = document.getElementById('chat-form');
    const input = document.getElementById('chat-input');

    btn.addEventListener('click', () => this.toggleOpen());

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const msg = input.value.trim();
      if (!msg) return;

      this.addMessage(msg, true);
      input.value = '';
      input.disabled = true;
      document.getElementById('send-btn').disabled = true;

      try {
        const start = performance.now();
        const response = await this.sendMessageToAPI(msg);
        const latency = Math.round(performance.now() - start);

        document.getElementById('latency-indicator').classList.remove('hidden');
        document.getElementById('latency-indicator').querySelector('span').textContent = `${latency}ms`;

        this.addMessage(response.response || response.text, false, response.provider);
      } catch (err) {
        this.addMessage("Lo siento, tuve un problema. Por favor, intenta de nuevo.", false);
        console.error('Chatbot error:', err);
      } finally {
        input.disabled = false;
        document.getElementById('send-btn').disabled = false;
        input.focus();
      }
    });

    // Enter processing
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        form.dispatchEvent(new Event('submit'));
      }
    });

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.close();
    });
  }

  async sendMessageToAPI(message) {
    const currentScreen = window.location.hash.replace('#', '') || 'home';
    const res = await fetch('/api/chat.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        message: message,
        current_screen: currentScreen,
        csrf_token: window.csrfToken || '' 
      })
    });

    if (!res.ok) throw new Error('Error en API');
    return await res.json();
  }

  addMessage(text, isUser = false, provider = null) {
    const container = document.getElementById('chat-messages');
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const msgEl = document.createElement('div');
    msgEl.className = `flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`;

    const content = document.createElement('div');
    content.className = `max-w-[85%] px-4 py-3 rounded-2xl text-sm ${
      isUser 
        ? 'bg-blue-600 text-white rounded-tr-none' 
        : 'bg-white/10 text-gray-200 border border-white/5 rounded-tl-none'
    }`;

    const inner = document.createElement('div');
    inner.innerHTML = text.replace(/\n/g, '<br>');
    content.appendChild(inner);

    if (provider && !isUser) {
        const badge = document.createElement('div');
        badge.className = `text-[8px] px-1.5 py-0.5 rounded mt-2 inline-block font-bold uppercase tracking-widest ${
          provider === 'local' ? 'bg-green-500/20 text-green-400' :
          provider === 'groq' ? 'bg-yellow-500/20 text-yellow-400' :
          'bg-purple-500/20 text-purple-400'
        }`;
        badge.innerHTML = `<i class="fas fa-bolt mr-1"></i> ${provider}`;
        content.appendChild(badge);
    }

    const timeEl = document.createElement('div');
    timeEl.className = 'text-[9px] opacity-40 mt-1 text-right';
    timeEl.textContent = timeStr;
    content.appendChild(timeEl);

    msgEl.appendChild(content);
    container.appendChild(msgEl);

    container.scrollTop = container.scrollHeight;
    this.saveToHistory({ text, isUser, timestamp: new Date().toISOString(), provider });
  }

  saveToHistory(entry) {
    let history = JSON.parse(localStorage.getItem('cesa_chat_history')) || [];
    history.push(entry);
    if (history.length > 50) history = history.slice(-50);
    localStorage.setItem('cesa_chat_history', JSON.stringify(history));
  }

  restoreLastSession() {
    const history = JSON.parse(localStorage.getItem('cesa_chat_history')) || [];
    if (history.length === 0) return;

    const container = document.getElementById('chat-messages');
    container.innerHTML = '';

    history.forEach(item => {
      this.addMessage(item.text, item.isUser, item.provider);
    });
  }

  toggleOpen() {
    if (this.isOpen) {
      this.close();
    } else {
      document.getElementById('chatbot-modal').classList.remove('hidden');
      document.getElementById('chatbot-float-btn').classList.add('scale-0');
      this.isOpen = true;
      document.getElementById('chat-input').focus();
    }
  }

  close() {
    document.getElementById('chatbot-modal').classList.add('hidden');
    document.getElementById('chatbot-float-btn').classList.remove('scale-0');
    this.isOpen = false;
  }

  loadState() {
    const csrfMeta = document.querySelector('meta[name="csrf-token"]');
    if (csrfMeta) window.csrfToken = csrfMeta.content;
  }
}

// Global bootstrap
document.addEventListener('DOMContentLoaded', () => {
  window.cesaChat = new CesaChatbot();
});
