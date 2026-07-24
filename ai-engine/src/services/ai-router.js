const axios = require('axios');

// Sistema de rate limiting MUY simple (sin Redis, solo con variables)
const requestCounts = {
  mistral: 0,
  groq: 0,
  gemini: 0,
  ollama_cloud: 0
};

// Configuración de límites para APIs gratuitas (redujimos los límites para ahorrar memoria)
const RATE_LIMITS = {
  mistral: { limit: 3, period: 60 },  // 3 requests/min
  groq: { limit: 20, period: 60 },    // 20 requests/min
  gemini: { limit: 15, period: 60 },   // 15 requests/min (Free Tier)
  ollama_cloud: { limit: 15, period: 60 } // 15 requests/min
};

// Reset automático de los contadores
setInterval(() => {
  requestCounts.mistral = 0;
  requestCounts.groq = 0;
  requestCounts.gemini = 0;
  requestCounts.ollama_cloud = 0;
}, 60000);

class AIRouter {
  constructor() {
    this.providers = [];
    this.macMiniEnabled = process.env.MAC_MINI_ENABLED === 'true';
    
    // Priorizamos Ollama Cloud registrando el pool de claves configuradas
    const rawOllamaKeys = process.env.OLLAMA_API_KEYS || process.env.OLLAMA_API_KEY;
    if (rawOllamaKeys) {
      const keys = rawOllamaKeys.split(',').map(k => k.trim()).filter(Boolean);
      keys.forEach((key, idx) => {
        this.providers.push({
          type: 'ollama_cloud',
          name: `Ollama Key #${idx + 1}`,
          apiKey: key,
          endpoint: process.env.OLLAMA_ENDPOINT || 'https://ollama.com/api/chat'
        });
      });
    }

    if (process.env.GROQ_API_KEY) {
      this.providers.push({ 
        type: 'groq', 
        apiKey: process.env.GROQ_API_KEY,
        endpoint: 'https://api.groq.com/openai/v1/chat/completions'
      });
    }

    if (process.env.GEMINI_API_KEY) {
      this.providers.push({
        type: 'gemini',
        apiKey: process.env.GEMINI_API_KEY,
        endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'
      });
    }

    if (process.env.MISTRAL_API_KEY) {
      this.providers.push({ 
        type: 'mistral', 
        apiKey: process.env.MISTRAL_API_KEY,
        endpoint: 'https://api.mistral.ai/v1/chat/completions'
      });
    }
    
    this.fallbackIndex = 0;
  }

  async routeRequest(prompt, options = {}) {
    try {
      // Optimización: limitar longitud del prompt a menos de que se especifique lo contrario (ej. tareas de delegación IA)
      const finalPrompt = options.skipTrim ? prompt : prompt.substring(0, 800);
      
      // Verificar si es una solicitud pesada (más de 500 caracteres)
      const isHeavy = finalPrompt.length > 500 || 
                     /análisis|comparar|resumir|investigación|profundo/i.test(finalPrompt.toLowerCase());
      
      // Intentar Mac Mini si está habilitado y es pesada
      if (this.macMiniEnabled && options.heavyProcessing && isHeavy) {
        try {
          return await this._callMacMini(finalPrompt);
        } catch (error) {
          // Fallback silencioso a la nube
        }
      }

      // Intentar con proveedores API (solo los disponibles para ahorrar memoria)
      for (let i = 0; i < this.providers.length; i++) {
        const providerIndex = (this.fallbackIndex + i) % this.providers.length;
        const provider = this.providers[providerIndex];
        
        // Verificar límite de rate limiting
        if (requestCounts[provider.type] < RATE_LIMITS[provider.type].limit) {
          try {
            requestCounts[provider.type]++;
            return await this._callProvider(provider, finalPrompt);
          } catch (error) {
            // Solo loguear en debug, fallar al siguiente
            console.error(`Error con proveedor de IA (${provider.type}):`, error.message);
          }
        }
      }

      // Último recurso: Mac Mini si está habilitado y no fue pesada
      if (this.macMiniEnabled && !isHeavy) {
        try {
            return await this._callMacMini(finalPrompt);
        } catch (error) {}
      }

      // Respuesta de error minimalista
      return 'No hay servicios de IA disponibles. Intenta más tarde.';
    } catch (error) {
      return 'Error procesando tu solicitud. Por favor intenta de nuevo.';
    }
  }

  async _callProvider(provider, prompt) {
    if (provider.type === 'gemini') {
      const response = await axios.post(
        `${provider.endpoint}?key=${provider.apiKey}`,
        {
          contents: [{ parts: [{ text: prompt }] }]
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000 // 10 segundos
        }
      );
      return response.data.candidates[0].content.parts[0].text;
    }

    if (provider.type === 'ollama_cloud') {
      const response = await axios.post(
        provider.endpoint,
        {
          model: 'nemotron-3-super',
          messages: [{ role: 'user', content: prompt }],
          stream: false
        },
        {
          headers: { 
            'Authorization': `Bearer ${provider.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 20000
        }
      );
      return response.data.message.content;
    }

    const model = provider.type === 'mistral' ? 'mistral-tiny' : 'llama-3.1-8b-instant';
    
    const response = await axios.post(
      provider.endpoint,
      {
        model,
        messages: [{ role: 'user', content: prompt }]
      },
      {
        headers: { 
          'Authorization': `Bearer ${provider.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000 // Tiempo de espera reducido para ahorrar recursos (5s)
      }
    );
    
    return response.data.choices[0].message.content;
  }

  async _callMacMini(prompt) {
    const macMiniUrl = process.env.MAC_MINI_URL || 'https://ia-local.fondothoth.com/api/generate';
    
    const response = await axios.post(
      macMiniUrl,
      {
        model: 'mistral',
        prompt: prompt,
        stream: false,
        options: { 
          temperature: 0.7,
          num_ctx: 1024 // Reducido para ahorrar memoria en el nodo local
        }
      },
      { 
        timeout: 20000, // Timeout reducido
        maxBodyLength: 1024 * 1024 // Limitar tamaño de respuesta
      }
    );
    
    return response.data.response;
  }

  toggleMacMini(enabled) {
    this.macMiniEnabled = enabled;
    process.env.MAC_MINI_ENABLED = enabled ? 'true' : 'false';
    return this.macMiniEnabled;
  }
  
  getStatus() {
    return {
      providers: this.providers.map(p => ({
        type: p.type,
        available: requestCounts[p.type] < RATE_LIMITS[p.type].limit,
        usage: `${requestCounts[p.type]}/${RATE_LIMITS[p.type].limit}`
      })),
      macMiniEnabled: this.macMiniEnabled,
      macMiniUrl: process.env.MAC_MINI_URL
    };
  }
}

// Inicialización con configuración segura para 1GB RAM
const aiRouter = new AIRouter();
module.exports = { aiRouter };
