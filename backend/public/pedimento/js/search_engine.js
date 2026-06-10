let ligieDB = null;
let tigieDataArray = [];

async function loadTigieDB() {
    const status = document.getElementById('tigie-status');
    try {
        const response = await fetch('data/ligie_v5_full.json');
        ligieDB = await response.json();
        
        // Convert to array for faster fuzzy search
        tigieDataArray = Object.values(ligieDB);
        status.textContent = `${tigieDataArray.length} fracciones cargadas. Listo para buscar.`;
        status.classList.replace('text-gray-400', 'text-green-400');
    } catch (e) {
        console.error("Error loading LIGIE DB:", e);
        status.textContent = "Error cargando base de datos LIGIE.";
        status.classList.replace('text-gray-400', 'text-red-500');
    }
}

function openTigieSearch() {
    document.getElementById('tigie-modal').classList.remove('hidden');
    document.getElementById('tigie-modal').classList.add('flex');
    document.getElementById('tigie-search-input').focus();
    if (!ligieDB) loadTigieDB();
}

function closeTigieSearch() {
    document.getElementById('tigie-modal').classList.add('hidden');
    document.getElementById('tigie-modal').classList.remove('flex');
}

document.getElementById('tigie-search-input').addEventListener('input', function(e) {
    const term = e.target.value.toLowerCase().trim();
    const resultsContainer = document.getElementById('tigie-results');
    
    if (term.length < 3) {
        resultsContainer.innerHTML = '';
        return;
    }
    
    // Exact or partial match search
    const results = tigieDataArray.filter(item => {
        return item.fraccion.includes(term) || item.desc.toLowerCase().includes(term);
    }).slice(0, 50); // Limit to 50 results for perf
    
    renderResults(results);
});

function renderResults(results) {
    const container = document.getElementById('tigie-results');
    container.innerHTML = '';
    
    if (results.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-400 mt-4">No se encontraron resultados.</p>';
        return;
    }
    
    results.forEach(item => {
        const div = document.createElement('div');
        div.className = 'bg-cesa-cardBg border border-white/10 p-4 rounded-lg cursor-pointer hover:border-cesa-gold transition';
        div.innerHTML = `
            <div class="flex justify-between items-start">
                <div class="text-cesa-gold font-black text-lg">${item.fraccion}</div>
                <div class="bg-blue-900 text-blue-200 text-[10px] px-2 py-1 rounded font-bold">${item.unidad}</div>
            </div>
            <p class="text-xs text-gray-300 mt-2">${item.desc}</p>
            <div class="flex gap-4 mt-3 text-[10px] font-mono">
                <div class="bg-white/5 px-2 py-1 rounded"><span class="text-gray-400">IMP:</span> <span class="text-white font-bold">${item.imp}%</span></div>
                <div class="bg-white/5 px-2 py-1 rounded"><span class="text-gray-400">EXP:</span> <span class="text-white font-bold">${item.exp}</span></div>
            </div>
        `;
        div.onclick = () => selectFraction(item);
        container.appendChild(div);
    });
}

function selectFraction(item) {
    // Inject the selected fraction into the global app state and UI
    window.addPartida(item);
    closeTigieSearch();
}
