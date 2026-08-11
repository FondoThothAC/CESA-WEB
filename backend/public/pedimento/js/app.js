// State Management
let currentStep = 1;
const totalSteps = 4;
let partidas = [];

// DOM Elements
const progressBar = document.getElementById('progress-bar');
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');

// Custom Modal System (replaces native alert/confirm)
let _modalResolve = null;

/**
 * Core modal display function
 * @param {string} message - Message to display
 * @param {object} opts - {type: 'success'|'error'|'warning'|'info', title: string, confirm: boolean}
 * @returns {Promise<boolean>} - Resolves to true (ok/yes) or false (cancel/no)
 */
function showModal(message, opts = {}) {
    return new Promise((resolve) => {
        _modalResolve = resolve;

        const modal = document.getElementById('custom-alert-modal');
        const content = document.getElementById('custom-alert-content');
        const icon = document.getElementById('modal-icon');
        const iconI = document.getElementById('modal-icon-i');
        const title = document.getElementById('modal-title');
        const text = document.getElementById('custom-alert-text');
        const btnOk = document.getElementById('modal-btn-ok');
        const btnYes = document.getElementById('modal-btn-yes');
        const btnNo = document.getElementById('modal-btn-no');

        if (!modal || !content) { resolve(true); return; }

        // Set message
        text.textContent = message;

        // Configure by type
        const type = opts.type || 'success';
        const themes = {
            success: { bg: 'bg-green-500/20', color: 'text-green-400', icon: 'fa-check-circle', title: '¡Operación Exitosa!' },
            error:   { bg: 'bg-red-500/20',   color: 'text-red-400',   icon: 'fa-exclamation-circle', title: '❌ Error' },
            warning: { bg: 'bg-yellow-500/20', color: 'text-yellow-400', icon: 'fa-exclamation-triangle', title: '⚠️ Advertencia' },
            info:    { bg: 'bg-blue-500/20',   color: 'text-blue-400',  icon: 'fa-info-circle', title: 'Información' }
        };
        const theme = themes[type] || themes.info;

        icon.className = `w-10 h-10 rounded-full flex items-center justify-center text-xl ${theme.bg} ${theme.color}`;
        iconI.className = `fas ${theme.icon}`;
        title.textContent = opts.title || theme.title;

        // Show correct buttons
        if (opts.confirm) {
            btnOk.classList.add('hidden');
            btnYes.classList.remove('hidden');
            btnNo.classList.remove('hidden');
        } else {
            btnOk.classList.remove('hidden');
            btnYes.classList.add('hidden');
            btnNo.classList.add('hidden');
        }

        // Show modal
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        setTimeout(() => {
            content.classList.remove('scale-95', 'opacity-0');
            content.classList.add('scale-100', 'opacity-100');
        }, 10);
    });
}

window.resolveModal = function(result) {
    const modal = document.getElementById('custom-alert-modal');
    const content = document.getElementById('custom-alert-content');

    content.classList.remove('scale-100', 'opacity-100');
    content.classList.add('scale-95', 'opacity-0');

    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        if (_modalResolve) {
            _modalResolve(result);
            _modalResolve = null;
        }
    }, 200);
};

// Convenience wrappers
function showCustomAlert(message) {
    return showModal(message, { type: 'success' });
}

function showModalError(message) {
    return showModal(message, { type: 'error', title: '❌ Error de Validación' });
}

function showModalWarning(message) {
    return showModal(message, { type: 'warning' });
}

function showModalConfirm(message) {
    return showModal(message, { type: 'warning', title: '⚠️ Confirmación Requerida', confirm: true });
}

window.closeCustomAlert = function() {
    window.resolveModal(true);
};

// ============================
// Banxico API - Tipo de Cambio FIX (SF43718)
// ============================
const BANXICO_TOKEN = 'REDACTED';
const BANXICO_SERIES = 'SF43718';
const BANXICO_URL = `https://www.banxico.org.mx/SieAPIRest/service/v1/series/${BANXICO_SERIES}/datos/oportuno?mediaType=json`;

async function fetchTipoCambioBanxico() {
    const tcInput = document.querySelector('input[name="tipoCambio"]');
    const wTcInput = document.getElementById('w-tcambio');
    
    try {
        console.log('🏦 Consultando Banxico API para TC FIX...');
        const response = await fetch(BANXICO_URL, {
            method: 'GET',
            headers: {
                'Bmx-Token': BANXICO_TOKEN,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        const serie = data.bmx.series[0];
        const valor = serie.datos[0].dato;
        const fecha = serie.datos[0].fecha;

        const tc = parseFloat(valor).toFixed(4);
        console.log(`✅ TC Banxico (${fecha}): $${tc} MXN/USD`);

        if (tcInput) tcInput.value = tc;
        if (wTcInput) wTcInput.value = tc;

        // Recalcular Valor Aduana con el nuevo TC
        if (typeof calcValorAduana === 'function') calcValorAduana();

        showCustomAlert(`Tipo de Cambio FIX actualizado desde Banxico:\n$${tc} MXN/USD (${fecha})`);
        return tc;
    } catch (error) {
        console.warn('⚠️ No se pudo obtener TC de Banxico:', error.message);
        // Fallback: intentar con API alternativa
        try {
            const fallback = await fetch('https://open.er-api.com/v6/latest/USD');
            const fbData = await fallback.json();
            if (fbData.rates && fbData.rates.MXN) {
                const tc = fbData.rates.MXN.toFixed(4);
                console.log(`✅ TC Fallback (exchangerate-api): $${tc} MXN/USD`);
                if (tcInput) tcInput.value = tc;
                if (wTcInput) wTcInput.value = tc;
                if (typeof calcValorAduana === 'function') calcValorAduana();
                showModalWarning(`TC obtenido de fuente alternativa (no Banxico):\n$${tc} MXN/USD`);
                return tc;
            }
        } catch (e2) {
            console.error('❌ Ambas fuentes de TC fallaron:', e2.message);
        }
        showModalError('No se pudo obtener el Tipo de Cambio. Verifique su conexión a internet o ingréselo manualmente.');
        return null;
    }
}

// Make available globally
window.fetchTipoCambioBanxico = fetchTipoCambioBanxico;

// Wizard Navigation
function updateWizard() {
    // Update steps visibility
    for (let i = 1; i <= totalSteps; i++) {
        const stepEl = document.getElementById(`step-${i}`);
        if (i === currentStep) {
            stepEl.classList.add('active');
        } else {
            stepEl.classList.remove('active');
        }
    }
    
    // Update progress bar
    progressBar.style.width = `${(currentStep / totalSteps) * 100}%`;
    
    // Update buttons
    btnPrev.disabled = currentStep === 1;
    btnPrev.classList.toggle('opacity-50', currentStep === 1);
    btnPrev.classList.toggle('cursor-not-allowed', currentStep === 1);
    
    if (currentStep === totalSteps) {
        btnNext.textContent = "Finalizar Pedimento";
        btnNext.classList.replace('from-cesa-gold', 'from-green-500');
        btnNext.classList.replace('to-yellow-600', 'to-green-700');
        btnNext.classList.replace('text-cesa-navy', 'text-white');
    } else {
        btnNext.textContent = "Siguiente Paso";
        btnNext.classList.replace('from-green-500', 'from-cesa-gold');
        btnNext.classList.replace('to-green-700', 'to-yellow-600');
        btnNext.classList.replace('text-white', 'text-cesa-navy');
    }
}

function nextStep() {
    if (currentStep < totalSteps) {
        currentStep++;
        updateWizard();
    } else {
        showCustomAlert("¡Pedimento Finalizado! Puedes verlo en formato oficial girando tu dispositivo (si es grande) o activando la Vista Oficial en tu computadora.");
    }
}

function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        updateWizard();
    }
}

// Synchronize Wizard options from Desktop Table
function syncWizardOptions() {
    console.log("🔄 Sincronizando catálogos Wizard <-> Tabla Oficial...");
    
    const syncSelect = (desktopName, wizardId) => {
        const desktopSelect = document.querySelector(`select[name="${desktopName}"]`);
        const wizardSelect = document.getElementById(wizardId);
        if (desktopSelect && wizardSelect) {
            const currentVal = wizardSelect.value;
            wizardSelect.innerHTML = desktopSelect.innerHTML;
            wizardSelect.value = currentVal;
        }
    };

    syncSelect('aduanaES', 'w-aduana');
    syncSelect('tipoOper', 'w-toper');
    syncSelect('cvePedimento', 'w-clave');
}

// Two-way Data Binding (Mobile -> Desktop)
function syncToDesktop() {
    const safeSet = (selector, val) => {
        const el = document.querySelector(selector);
        if (el) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') {
                el.value = val;
            } else {
                el.innerText = val;
            }
        }
    };

    // Step 1: Generales
    // Extract aduana value (ej: "26 40" or just "26")
    const aduana = document.getElementById('w-aduana').value;
    safeSet('[name="aduanaES"]', aduana);
    
    // Attempt to update numPedimento with aduana prefix
    const numPedEl = document.querySelector('[name="numPedimento"]');
    if (numPedEl && aduana) {
        const parts = numPedEl.value.split('  ');
        if (parts.length >= 2) {
            // Some aduanas in select are like "26", others might be more. 
            // We use the first 2 chars for the first block usually.
            parts[0] = aduana.substring(0, 2);
            numPedEl.value = parts.join('  ');
        }
    }
    
    safeSet('[name="tipoOper"]', document.getElementById('w-toper').value);
    safeSet('[name="cvePedimento"]', document.getElementById('w-clave').value);
    safeSet('[name="tipoCambio"]', document.getElementById('w-tcambio').value);
    safeSet('[name="valorDolares"]', document.getElementById('w-vdolares').value);
    
    // Step 2: Identidad
    safeSet('[name="rfcImpExp"]', document.getElementById('w-rfc').value);
    safeSet('[name="nombreImpExp"]', document.getElementById('w-rsocial').value);
    safeSet('[name="domicilioImpExp"]', document.getElementById('w-domicilio').value);
    
    // Recalcular todo
    if (typeof calcValorAduana === 'function') calcValorAduana();
    calculateTaxes();
}

// Setup listeners for real-time sync
document.querySelectorAll('#mobile-wizard input, #mobile-wizard select').forEach(input => {
    input.addEventListener('input', syncToDesktop);
});

// Partidas Logic
window.addPartida = function(item) {
    // This is called from search_engine.js
    partidas.push({
        ...item,
        valorAduana: 0 // Default to 0, user will edit
    });
    renderPartidas();
    syncToDesktop();
};

function renderPartidas() {
    const container = document.getElementById('partidas-container');
    container.innerHTML = '';
    
    if (partidas.length === 0) {
        container.innerHTML = '<div class="p-4 border border-dashed border-gray-600 rounded-lg text-center text-gray-500 text-sm">No hay partidas agregadas. Presiona "Buscar LIGIE" para clasificar tu mercancía.</div>';
        return;
    }
    
    partidas.forEach((p, index) => {
        const div = document.createElement('div');
        div.className = 'bg-cesa-cardBg border border-white/10 p-3 rounded-lg relative';
        div.innerHTML = `
            <button onclick="removePartida(${index})" class="absolute top-2 right-2 text-red-400 hover:text-red-300"><i class="fas fa-trash"></i></button>
            <div class="text-cesa-gold font-bold">${p.fraccion}</div>
            <div class="text-[10px] text-gray-300 line-clamp-2 mb-2">${p.desc}</div>
            
            <div class="grid grid-cols-2 gap-2 mt-2">
                <div>
                    <label class="text-[9px] text-gray-500 font-bold uppercase">Valor Aduana (MXN)</label>
                    <input type="number" class="w-full bg-cesa-navy border border-cesa-blue rounded px-2 py-1 text-xs text-white" value="${p.valorAduana}" oninput="updatePartidaValor(${index}, this.value)">
                </div>
                <div>
                    <label class="text-[9px] text-gray-500 font-bold uppercase">Tasa IGI</label>
                    <div class="text-white font-mono mt-1">${p.imp === 'Ex.' ? 'Exento' : p.imp + '%'}</div>
                </div>
            </div>
        `;
        container.appendChild(div);
    });
}

window.removePartida = function(index) {
    partidas.splice(index, 1);
    renderPartidas();
    syncToDesktop();
};

window.updatePartidaValor = function(index, val) {
    partidas[index].valorAduana = parseFloat(val) || 0;
    syncToDesktop();
};

// Compliance Calculation Engine
function calculateTaxes() {
    let totalValorAduana = 0;
    let totalIGI = 0;
    
    // Sum from partidas
    if (typeof partidas !== 'undefined' && Array.isArray(partidas)) {
        partidas.forEach(p => {
            totalValorAduana += p.valorAduana || 0;
            if (p.imp !== 'Ex.' && p.imp !== '0') {
                const tasa = parseFloat(p.imp) / 100;
                totalIGI += (p.valorAduana || 0) * tasa;
            }
        });
    } else {
        // Fallback: leer de los inputs si no hay arreglo de partidas (como en el modo desktop)
        const vaInput = document.querySelector('input[name="valorAduana"]');
        if (vaInput) totalValorAduana = parseFloat(vaInput.value.replace(/,/g, '')) || 0;
        
        const igiInput = document.querySelector('input[name="liqIgiImporte"]');
        if (igiInput) totalIGI = parseFloat(igiInput.value.replace(/,/g, '')) || 0;
    }
    
    // DTA: 8 al millar sobre valor aduana
    let dta = totalValorAduana * 0.008;
    if (dta < 425 && totalValorAduana > 0) dta = 425; // Cuota mínima DTA 2024
    if (totalValorAduana === 0) dta = 0;
    
    // IVA: 16% sobre (Valor Aduana + IGI + DTA)
    let baseIva = totalValorAduana + totalIGI + dta;
    let iva = baseIva * 0.16;
    
    let total = dta + totalIGI + iva;
    
    // Formatters
    const formatMXN = (num) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(num);
    const formatInput = (num) => new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
    
    // Update Mobile Wizard
    const wDta = document.getElementById('w-dta');
    const wIgi = document.getElementById('w-igi');
    const wIva = document.getElementById('w-iva');
    const wTotal = document.getElementById('w-total');

    if(wDta) wDta.innerText = formatMXN(dta);
    if(wIgi) wIgi.innerText = formatMXN(totalIGI);
    if(wIva) wIva.innerText = formatMXN(iva);
    if(wTotal) wTotal.innerText = formatMXN(total);
    
    // Update Desktop Preview (Table Inputs)
    const safeSet = (name, val) => {
        const el = document.querySelector(`[name="${name}"]`);
        if (el) el.value = val;
    };
    
    safeSet('liqDtaImporte', formatInput(dta));
    safeSet('liqIgiImporte', formatInput(totalIGI));
    safeSet('liqIvaImporte', formatInput(iva));
    safeSet('liqEfectivo', formatInput(total));
    safeSet('liqTotal', formatInput(total));
    safeSet('valorAduana', formatInput(totalValorAduana));
}


// View Mode Toggle (PC)
let isWizardForced = false;
window.toggleViewMode = function() {
    isWizardForced = !isWizardForced;
    const btn = document.getElementById('view-toggle');
    
    if (isWizardForced) {
        document.body.classList.add('force-wizard');
        document.body.classList.remove('force-table');
        btn.innerHTML = '<i class="fas fa-table"></i> Ver Tabla Oficial';
        btn.classList.replace('bg-cesa-blue', 'bg-green-600');
    } else {
        document.body.classList.remove('force-wizard');
        document.body.classList.add('force-table');
        btn.innerHTML = '<i class="fas fa-magic"></i> Activar Modo Captura (Wizard)';
        btn.classList.replace('bg-green-600', 'bg-cesa-blue');
    }
};

window.goBackToCesa = function() {
    // Si estamos localmente (file://), intentamos volver al index.php de la carpeta anterior
    if (window.location.protocol === 'file:') {
        window.location.href = '../index.php'; 
    } else {
        // En producción, volvemos a la sección de tutoriales de la PWA
        window.location.href = '/index.php#tutoriales';
    }
};

// =========================================================
// SINCRONIZACIÓN DE SELECTS (DESKTOP -> WIZARD MÓVIL)
// =========================================================
function syncWizardOptions() {
    // Aquí mapeamos el 'name' o 'id' del select Oficial con el del Wizard.
    const selectores = [
        { desktop: 'cvePedimento', wizardName: 'wiz_cvePedimento' },
        { desktop: 'aduanaES',     wizardName: 'wiz_aduanaES' },
        { desktop: 'regimen',      wizardName: 'wiz_regimen' },
        { desktop: 'destino',      wizardName: 'wiz_destino' },
        { desktop: 'tipoOper',     wizardName: 'wiz_tipoOper' }
    ];

    selectores.forEach(mapping => {
        const desktopSelect = document.querySelector(`select[name="${mapping.desktop}"]`) || document.getElementById(mapping.desktop);
        const wizardSelect = document.querySelector(`select[name="${mapping.wizardName}"]`) || document.getElementById(mapping.wizardName);

        if (desktopSelect && wizardSelect) {
            // Clonamos todo el contenido HTML (los <option>) del original al Wizard
            wizardSelect.innerHTML = desktopSelect.innerHTML;
            
            // Sincronizamos el valor actual
            wizardSelect.value = desktopSelect.value;
            
            // Reverse Binding: Wizard -> Desktop
            wizardSelect.addEventListener('change', (e) => {
                desktopSelect.value = e.target.value;
                desktopSelect.dispatchEvent(new Event('change')); 
                if (typeof calculateTaxes === 'function') calculateTaxes();
            });

            // Forward Binding: Desktop -> Wizard
            desktopSelect.addEventListener('change', (e) => {
                wizardSelect.value = e.target.value;
            });
        }
    });
}

// =========================================================
// TOOLTIP MANAGEMENT (NUEVA LÓGICA .show)
// =========================================================
window.toggleTooltip = function(element) {
    const tooltip = element.querySelector('.tooltip');
    if (tooltip) {
        document.querySelectorAll('.tooltip.show').forEach(t => {
            if (t !== tooltip) t.classList.remove('show');
        });
        tooltip.classList.toggle('show');
        
        if (tooltip.classList.contains('show')) {
            const rect = tooltip.getBoundingClientRect();
            if (rect.top < 10) {
                tooltip.style.bottom = 'auto';
                tooltip.style.top = '130%';
            } else {
                tooltip.style.bottom = '130%';
                tooltip.style.top = 'auto';
            }
        }
    }
};

window.closeTooltip = function(event, button) {
    event.stopPropagation();
    const tooltip = button.closest('.tooltip');
    if (tooltip) tooltip.classList.remove('show');
};

document.addEventListener('click', function (event) {
    const infoBtn = event.target.closest('.info');
    if (infoBtn) {
        toggleTooltip(infoBtn);
    } else {
        document.querySelectorAll('.tooltip.show').forEach(t => t.classList.remove('show'));
    }
});


// =========================================================
// INICIALIZADOR GENERAL
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    // 1. Poblamos los selects estáticos de la tabla (ej. países)
    if (typeof getCountryOptions === 'function') {
        const opcionesPaises = getCountryOptions(); 
        document.querySelectorAll('.country-sel-new').forEach(sel => {
            if(sel.innerHTML.trim() === '' || sel.innerHTML.includes('Cargando')) {
                sel.innerHTML = '<option value="">Sel...</option>' + opcionesPaises;
            }
        });
    }

    // 2. Ejecutamos la sincronización hacia el Wizard móvil
    setTimeout(() => {
        syncWizardOptions();
    }, 150);

    // 3. Bindings de texto (Dólares, T.C., RFC, etc.)
    setupTextBinding('valorDolares', 'wiz_valorDolares');
    setupTextBinding('tipoCambio', 'wiz_tipoCambio');
    setupTextBinding('rfcImpExp', 'wiz_rfc');
    setupTextBinding('nombreImpExp', 'wiz_rsocial');
    setupTextBinding('domicilioImpExp', 'wiz_domicilio');

    // Inicializar vista
    if (typeof updateWizard === 'function') updateWizard();
});

function setupTextBinding(desktopName, wizardName) {
    const desktopInput = document.querySelector(`input[name="${desktopName}"]`);
    const wizardInput = document.getElementById(wizardName) || document.querySelector(`input[name="${wizardName}"]`);
    
    if (desktopInput && wizardInput) {
        wizardInput.addEventListener('input', (e) => {
            desktopInput.value = e.target.value;
            if (typeof calculateTaxes === 'function') calculateTaxes();
        });
        desktopInput.addEventListener('input', (e) => {
            wizardInput.value = e.target.value;
        });
    }
}
