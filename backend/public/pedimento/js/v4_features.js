/**
 * Pedimento v6 - Script Completo
 * Regla: Dólares -> Pesos -> Pesos (USD * TC = MXN)
 * Ejemplos Exactos: Caso 1 (Bolsas de Lujo) y Caso 2 (Polvo Compacto)
 */

// ─── TOOLTIP LOGIC ────────────────────────────────────────────────────────────
function toggleTooltip(element) {
    if (typeof window.toggleTooltip === 'function') {
        window.toggleTooltip(element);
    } else {
        const tooltip = element.querySelector('.tooltip');
        if (tooltip) {
            document.querySelectorAll('.tooltip.show').forEach(t => {
                if (t !== tooltip) t.classList.remove('show');
            });
            
            const isActive = tooltip.classList.toggle('show');
            
            if (isActive) {
                const rect = tooltip.getBoundingClientRect();
                tooltip.style.transform = 'translateX(-50%)'; 
                tooltip.style.left = '50%';
                
                const newRect = tooltip.getBoundingClientRect();
                if (newRect.left < 10) {
                    tooltip.style.left = '0';
                    tooltip.style.transform = 'translateX(0)';
                } else if (newRect.right > (window.innerWidth - 10)) {
                    tooltip.style.left = 'auto';
                    tooltip.style.right = '0';
                    tooltip.style.transform = 'translateX(0)';
                }
            }
        }
    }
}

function closeTooltip(event, button) {
    event.stopPropagation();
    const tooltip = button.closest('.tooltip');
    if (tooltip) tooltip.classList.remove('show');
}

document.addEventListener('click', function(event) {
    if (!event.target.closest('.info')) {
        document.querySelectorAll('.tooltip.show').forEach(t => t.classList.remove('show'));
    }
});

// ─── FORM LOGIC ───────────────────────────────────────────────────────────────
async function resetForm() {
    const ok = await showModalConfirm("¿Borrar todo el formulario y empezar de cero? Esta acción no se puede deshacer.");
    if (ok) {
        resetFormInternal();
        agregarPartida();
        checkPageOverflow();
    }
}

function resetFormInternal() {
    document.querySelectorAll('input, select, textarea').forEach(el => {
        if (el.type !== 'button' && el.name !== 'firmaElectronica') el.value = '';
    });
    document.querySelectorAll('.page').forEach((p, i) => {
        if (i > 1) p.remove();
    });
    
    // Borrar TODAS las partidas
    document.querySelectorAll('.partida-tbody').forEach(tbody => tbody.remove());
    
    // Borrar elementos que pudieran haber quedado huérfanos por errores previos
    document.querySelectorAll('.contrib-row, .subtotal-row, .art25-section-row').forEach(el => el.remove());

    // Reset app.js state if present
    if (typeof partidas !== 'undefined') {
        partidas = [];
        if (typeof renderPartidas === 'function') renderPartidas();
    }

    identCount = 1;
    const identTbody = document.getElementById('identificadores');
    if (identTbody) {
        identTbody.innerHTML = `
            <tr class="ident-row">
                <td colspan="3" class="data"><input type="text" name="ident[0][clave]"></td>
                <td colspan="3" class="data"><input type="text" name="ident[0][comp1]"></td>
                <td colspan="4" class="data"><input type="text" name="ident[0][comp2]"></td>
                <td colspan="4" class="data"><input type="text" name="ident[0][comp3]"></td>
            </tr>
        `;
    }
    
    const globalIdTbody = document.getElementById('globalIdTbody');
    if (globalIdTbody) globalIdTbody.innerHTML = '';
}



// ─── DATA FORMATTER ───────────────────────────────────────────────────────────
function formatter(num) {
    if (num === null || num === undefined || isNaN(num)) return "0.00";
    let val = parseFloat(num.toString().replace(/,/g, '')) || 0;
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
}

// ─── CALCULATION ENGINE: DÓLARES-PESOS-PESOS ──────────────────────────────────
function calcValorAduana() {
    try {
        const parseClean = (name) => {
            const el = document.querySelector(`input[name="${name}"]`) || document.querySelector(`textarea[name="${name}"]`);
            if (!el || !el.value) return 0;
            return parseFloat(el.value.replace(/,/g, '')) || 0;
        };

        const tc = parseClean('tipoCambio') || 1;
        
        const getIncr = (usdName, mxnName) => {
            const usdVal = parseClean(usdName);
            const mxnInput = document.querySelector(`input[name="${mxnName}"]`);
            let mxnVal = parseClean(mxnName);
            
            if (usdVal > 0 && mxnVal === 0) {
                mxnVal = usdVal * tc;
                if (mxnInput) {
                    mxnInput.value = formatter(mxnVal);
                    mxnInput.style.backgroundColor = "#f1f5f9"; 
                }
            }
            return mxnVal;
        };

        const seguros = getIncr('valSeguros', 'seguros');
        const fletes = parseClean('fletes');
        const embalajes = getIncr('valEmbalajes', 'embalajes');
        const otrosIncr = getIncr('valOtros', 'otrosIncr');

        // Decrementables
        const transpDecrem = parseClean('transpDecrem');
        const seguroDecrem = parseClean('seguroDecrem');
        const cargaDecrem = parseClean('cargaDecrem');
        const descargaDecrem = parseClean('descargaDecrem');
        const otrosDecrem = parseClean('otrosDecrem');

        const valDolares = parseClean('valorDolares');
        
        // Regla: (Comercial * TC) + Incr - Decrem
        const valorAduana = (valDolares * tc) + seguros + fletes + embalajes + otrosIncr - (transpDecrem + seguroDecrem + cargaDecrem + descargaDecrem + otrosDecrem);
        
        const vaInput = document.querySelector('input[name="valorAduana"]');
        if (vaInput) {
            vaInput.value = formatter(valorAduana);
            vaInput.style.backgroundColor = "#f1f5f9"; 
            vaInput.title = "Calculado: (Dólares × TC) + Incrementables - Decrementables";
        }
        
        const precioPagInput = document.querySelector('input[name="precioPagado"]');
        if (precioPagInput) {
            precioPagInput.value = formatter(valorAduana);
            precioPagInput.style.backgroundColor = "#f1f5f9";
        }

        const wVdolares = document.getElementById('w-vdolares');
        if (wVdolares) wVdolares.value = valDolares;

        return valorAduana;

    } catch (err) {
        console.error("Error en calcValorAduana:", err);
        return 0;
    }
}

// ─── EXPORT / IMPORT LOGIC ────────────────────────────────────────────────────
function exportarPedimento() {
    try {
        const data = {};
        document.querySelectorAll('input, select, textarea').forEach(el => {
            if (!el.name || el.type === 'button') return;

            if (el.name.includes('[')) {
                const parts = el.name.split(/[\[\]]+/).filter(p => p !== "");
                let current = data;
                for (let i = 0; i < parts.length - 1; i++) {
                    const part = parts[i];
                    const nextPart = parts[i+1];
                    const isNextNumeric = !isNaN(nextPart);
                    
                    if (!current[part]) {
                        current[part] = isNextNumeric ? [] : {};
                    }
                    current = current[part];
                }
                const lastKey = parts[parts.length - 1];
                current[lastKey] = el.value;
            } else {
                data[el.name] = el.value;
            }
        });

        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const ref = data['numPedimento'] || 'nuevo';
        const date = new Date().toISOString().slice(0, 10);
        const filename = `pedimento_v6_${ref.replace(/\s+/g, '_')}_${date}.json`;
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
    } catch (e) {
        console.error("Error al exportar:", e);
        if (typeof showModalError === 'function') showModalError("Error al generar el archivo de exportación.");
    }
}

function importarPedimento() {
    document.getElementById('importFile').click();
}

function handleImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            populateFormFromJSON(data);
        } catch (err) {
            if (typeof showModalError === 'function') {
                showModalError('Error al leer el archivo JSON: ' + err.message);
            } else {
                alert('Error al leer el archivo JSON');
            }
        }
    };
    reader.readAsText(file);
    event.target.value = ''; 
}

function populateFormFromJSON(data) {
    resetFormInternal();

    let maxPartidaIndex = -1;
    const partidaRegex = /^partidas\[(\d+)\]/;

    for (const key of Object.keys(data)) {
        const match = key.match(partidaRegex);
        if (match) {
            const idx = parseInt(match[1]);
            if (idx > maxPartidaIndex) maxPartidaIndex = idx;
        }
    }

    for (let i = 0; i <= maxPartidaIndex; i++) {
        agregarPartida();
    }

    for (let [key, value] of Object.entries(data)) {
        let targetKey = key;
        
        if (key.startsWith('liq') && key.endsWith('Imp')) {
            targetKey = key.replace('Imp', 'Importe');
        }
        
        const oldContribMatch = key.match(/^partidas\[(\d+)\]\[(con|tasa|tt|fp|importe)\]$/);
        if (oldContribMatch) {
            const pIdx = oldContribMatch[1];
            const cField = oldContribMatch[2];
            targetKey = `partidas[${pIdx}][contribs][0][${cField}]`;
        }

        if (targetKey.includes('[contribs]') && targetKey.endsWith('[imp]')) {
            targetKey = targetKey.replace('[imp]', '[importe]');
        }

        const els = document.querySelectorAll(`[name="${targetKey}"]`);
        els.forEach((el, idx) => {
            if (Array.isArray(value) && targetKey.endsWith('[]')) {
                if (idx < value.length) el.value = value[idx];
            } else {
                el.value = value;
            }
            if (el.tagName === 'TEXTAREA') autoResize(el);
            if (el.tagName === 'SELECT') el.dispatchEvent(new Event('change'));
        });
    }

    if (typeof calcTotal === 'function') calcTotal();
    checkPageOverflow();
    
    if (typeof showCustomAlert === 'function') {
        showCustomAlert('Pedimento cargado correctamente');
    }
}


// =========================================================================
// DATA DE EJEMPLOS OFICIALES DOCENTES (CASO 1 Y CASO 2)
// Mapeados a los name="" EXACTOS del HTML v6
// =========================================================================

// --- CASO 2: POLVO COMPACTO (TC = 18.00) — ADUANA 23 NOGALES ---
const exampleCaso2IN = {
  referencia: "BELLEZA-IN-2026",
  numPedimento: "26 23 3147 7001010",
  tipoOper: "IMP",
  cvePedimento: "IN",
  regimen: "ITE",
  destino: "26",
  tipoCambio: "18.0000",
  pesoBruto: "1200.00",
  aduanaES: "23",
  cveSeccion: "230",
  medioTranspArribo: "3",
  medioTranspSalida: "7",
  marcasBultos: "100 CAJAS C/ 1,000 ESTUCHES Y 100 CAJAS C/ 1,000 EMPAQUES CARTÓN",
  acuseElectronico: "AE264003147700101CBA",
  acuseValidacion: "AV-2640-CBA-IN-1010",
  fechaEntradaPed: "08052026",
  fechaPago: "08052026",
  rfcImpExp: "CBA050501ABC",
  nombreImpExp: "COSMÉTICOS BELLEZA S.A. DE C.V.",
  domicilioImpExp: "AV. INDUSTRIAL 100, NOGALES, SON, CP 84000",
  provIdFiscal: "LKA-88776655",
  provNombre: "SRI LANKA MIRROR INDUSTRIES",
  provDomicilio: "COLOMBO INDUSTRIAL PARK, SRI LANKA",
  provVinculacion: "0",
  numFactura: "CBA-IN-2026-001",
  fechaFactura: "06052026",
  incoterm: "CIF",
  monedaFact: "USD",
  valMonFact: "150000.00",
  valDolaresFact: "150000.00",
  eDocumentVucem: "2640CBA000101IN",
  tipoDocumentoVucem: "003",
  transpIdentificacion: "CARGA TERRESTRE LKA-MEX-2026",
  numeroGuia: "LKA-MEX-2026",
  transportista: "GLOBAL LOGISTICS",
  transpRfc: "GLO860101XX0",
  transpDomicilio: "NOGALES, SONORA",
  numCandado: "N",
  primeraRevision: "V",
  numTipo: "100 CAJAS",
  agenteNombre: "ROBERTO EDUARDO CELIS ROBLES",
  agenteRfc: "CERR041209",
  agenteCurp: "CERR041209HSRLBB06",
  mandatarioNombre: "LAURA VEGA",
  mandatarioRfc: "VECL900520GH1",
  mandatarioCurp: "VECL900520MJC03",
  agentePatente: "3147",
  numSerieCertificado: "00001000000607890123",
  firmaElectronica: "a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4",
  'globIdClave[]': ["IN"],
  'globIdC1[]': ["038-2019"],
  valorDolares: "150000.00",
  valorAduana: "2700000.00",
  precioPagado: "2700000.00",
  valSeguros: "0", seguros: "0", fletes: "0", valEmbalajes: "0", valOtros: "0",
  liqIgiFp: "0", liqIgiImporte: "405000.00",
  liqDtaFp: "0", liqDtaImporte: "463.00",
  liqIvaFp: "0", liqIvaImporte: "496874.00",
  liqPrvFp: "0", liqPrvImporte: "310.00",
  liqCntFp: "0", liqCntImporte: "70.00",
  liqTotal: "902717.00",
  liqEfectivo: "902717.00",
  observaciones: "CASO DOCENTE 2 — IMP. TEMPORAL IMMEX. 100,000 PZS ESTUCHE PLÁSTICO (LKA) + 100,000 PZS CAJA CARTÓN (BRA). IVA BASE = VA+IGI+DTA = $3,105,463 × 16% = $496,874.",
  partidas: [
    {
      fraccion: "3923.90.99", subd: "01", vinc: "0", met: "1", umc: "06", cantUmc: "100000",
      umt: "06", cantUmt: "100000", pvc: "LKA", pod: "LKA", valAduUsd: "100000.00",
      impPrecioPag: "1800000.00", precioUnit: "18.00",
      descripcion: "ESTUCHE DE PLÁSTICO CON ESPEJO PARA POLVO COMPACTO. INSUMO PARA ENSAMBLE IMMEX. ORIGEN SRI LANKA.",
      marca: "MIRROR-PRO", modelo: "",
      contribs: [
        { con: "IGI", tasa: "15", tt: "1", fp: "0", importe: "270000.00" },
        { con: "IVA", tasa: "16", tt: "1", fp: "0", importe: "331282.00" }
      ]
    },
    {
      fraccion: "4819.10.01", subd: "01", vinc: "0", met: "1", umc: "06", cantUmc: "100000",
      umt: "06", cantUmt: "100000", pvc: "BRA", pod: "BRA", valAduUsd: "50000.00",
      impPrecioPag: "900000.00", precioUnit: "9.00",
      descripcion: "CAJAS DE CARTÓN CORRUGADO PARA EMPAQUE DE COSMÉTICOS POLVO COMPACTO. INSUMO IMMEX. ORIGEN BRASIL.",
      marca: "KRAFT-PAK", modelo: "",
      contribs: [
        { con: "IGI", tasa: "15", tt: "1", fp: "0", importe: "135000.00" },
        { con: "IVA", tasa: "16", tt: "1", fp: "0", importe: "165592.00" }
      ]
    }
  ]
};

const exampleCaso2RT = {
  referencia: "BELLEZA-RT-2026",
  numPedimento: "26 23 3147 6001020",
  tipoOper: "EXP",
  cvePedimento: "RT",
  regimen: "EXD",
  destino: "USA",
  tipoCambio: "18.0000",
  pesoBruto: "8000.00",
  aduanaES: "23",
  cveSeccion: "230",
  medioTranspArribo: "7",
  medioTranspSalida: "7",
  marcasBultos: "200 CAJAS C/ 80,000 UNIDADES POLVO COMPACTO CON ESPEJO",
  acuseElectronico: "AE264003147600102CBA",
  acuseValidacion: "AV-2640-CBA-RT-102",
  fechaEntradaPed: "20052026",
  fechaPago: "20052026",
  rfcImpExp: "CBA050501ABC",
  nombreImpExp: "COSMÉTICOS BELLEZA S.A. DE C.V.",
  domicilioImpExp: "AV. INDUSTRIAL 100, NOGALES, SON, CP 84000",
  provIdFiscal: "US-99887766",
  provNombre: "BEAUTY GLOBAL DISTRIBUTION",
  provDomicilio: "MIAMI, FLORIDA, USA",
  provVinculacion: "1",
  numFactura: "CBA-EXP-2026-001",
  fechaFactura: "20052026",
  incoterm: "FOB",
  monedaFact: "USD",
  valMonFact: "400000.00",
  valDolaresFact: "400000.00",
  eDocumentVucem: "2640CBA000102RT",
  tipoDocumentoVucem: "003",
  transpIdentificacion: "MEX-BEAUTY-2026",
  numeroGuia: "AWB-2026-B",
  transportista: "FEDEX CARGO",
  transpRfc: "FED860101XX0",
  transpDomicilio: "NOGALES, SONORA",
  numCandado: "N",
  primeraRevision: "V",
  numTipo: "200 CAJAS",
  agenteNombre: "ROBERTO EDUARDO CELIS ROBLES",
  agenteRfc: "CERR041209",
  agenteCurp: "CERR041209HSRLBB06",
  mandatarioNombre: "LAURA VEGA",
  mandatarioRfc: "VECL900520GH1",
  mandatarioCurp: "VECL900520MJC03",
  agentePatente: "3147",
  numSerieCertificado: "00001000000607890123",
  firmaElectronica: "f5g6h7i8j9k0l1m2n3o4p5q6r7s8t9u0",
  'globIdClave[]': ["IN", "TL"],
  'globIdC1[]': ["038-2019", "USA"],
  valorDolares: "400000.00",
  valorAduana: "7200000.00",
  precioPagado: "7200000.00",
  valSeguros: "0", seguros: "0", fletes: "0", valEmbalajes: "0", valOtros: "0",
  liqIgiFp: "0", liqIgiImporte: "0.00",
  liqDtaFp: "0", liqDtaImporte: "463.00",
  liqIvaFp: "0", liqIvaImporte: "0.00",
  liqPrvFp: "0", liqPrvImporte: "310.00",
  liqCntFp: "0", liqCntImporte: "70.00",
  liqTotal: "843.00",
  liqEfectivo: "843.00",
  observaciones: "CASO DOCENTE 2 — RETORNO EXPORTACIÓN 80% = 80,000 PZS POLVO COMPACTO TERMINADO. DESCARGO IMMEX. T-MEC USA. IGI=0. IVA EXPORTACIÓN=0.",
  partidas: [{
    fraccion: "3304.91.01", subd: "01", vinc: "0", met: "0", umc: "06", cantUmc: "80000",
    umt: "06", cantUmt: "80000", pvc: "MEX", pod: "USA", valAduUsd: "400000.00",
    impPrecioPag: "7200000.00", precioUnit: "90.00",
    descripcion: "POLVOS COMPACTOS DE MAQUILLAJE CON ESPEJO. PRODUCTO FINAL ENSAMBLADO EN MÉXICO. DESCARGO IMMEX. T-MEC.",
    marca: "MEX BEAUTY", modelo: "COMPACT-GLOW", tratado: "TMEC",
    contribs: [
      { con: "IGI", tasa: "0", tt: "1", fp: "0", importe: "0.00" },
      { con: "IVA", tasa: "0", tt: "1", fp: "0", importe: "0.00" }
    ]
  }]
};

const exampleCaso2F4prod = {
  referencia: "BELLEZA-F4-PROD-2026",
  numPedimento: "26 23 3147 6001021",
  tipoOper: "IMP",
  cvePedimento: "F4",
  regimen: "IMP",
  destino: "9",
  tipoCambio: "18.0000",
  pesoBruto: "1500.00",
  aduanaES: "23",
  cveSeccion: "230",
  medioTranspArribo: "7",
  medioTranspSalida: "7",
  marcasBultos: "CAMBIO DE RÉGIMEN PRODUCTO TERMINADO 15,000 UNIDADES POLVO COMPACTO",
  acuseElectronico: "AE2623031476001021CBA",
  acuseValidacion: "AV-2623-CBA-F4-1021",
  fechaEntradaPed: "21052026",
  fechaPago: "21052026",
  rfcImpExp: "CBA050501ABC",
  nombreImpExp: "COSMÉTICOS BELLEZA S.A. DE C.V.",
  domicilioImpExp: "AV. INDUSTRIAL 100, NOGALES, SON, CP 84000",
  provIdFiscal: "LKA-88776655",
  provNombre: "SRI LANKA MIRROR INDUSTRIES",
  provDomicilio: "COLOMBO, SRI LANKA",
  provVinculacion: "0",
  numFactura: "CBA-F4-2026-001",
  fechaFactura: "21052026",
  incoterm: "EXW",
  monedaFact: "USD",
  valMonFact: "75000.00",
  valDolaresFact: "75000.00",
  eDocumentVucem: "2623CBA0001021F4",
  tipoDocumentoVucem: "003",
  transpIdentificacion: "CARGA TERRESTRE",
  numeroGuia: "",
  transportista: "GLOBAL LOGISTICS",
  transpRfc: "GLO860101XX0",
  transpDomicilio: "NOGALES, SONORA",
  numCandado: "N",
  primeraRevision: "V",
  numTipo: "50 CAJAS",
  agenteNombre: "ROBERTO EDUARDO CELIS ROBLES",
  agenteRfc: "CERR041209",
  agenteCurp: "CERR041209HSRLBB06",
  mandatarioNombre: "LAURA VEGA",
  mandatarioRfc: "VECL900520GH1",
  mandatarioCurp: "VECL900520MJC03",
  agentePatente: "3147",
  numSerieCertificado: "00001000000607890123",
  firmaElectronica: "a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4",
  'globIdClave[]': ["TL"],
  'globIdC1[]': ["LKA"],
  valorDolares: "75000.00",
  valorAduana: "1350000.00",
  precioPagado: "1350000.00",
  valSeguros: "0", seguros: "0", fletes: "0", valEmbalajes: "0", valOtros: "0",
  liqIgiFp: "0", liqIgiImporte: "202500.00",
  liqDtaFp: "0", liqDtaImporte: "10800.00",
  liqIvaFp: "0", liqIvaImporte: "250128.00",
  liqPrvFp: "0", liqPrvImporte: "310.00",
  liqCntFp: "0", liqCntImporte: "70.00",
  liqTotal: "463808.00",
  liqEfectivo: "463808.00",
  observaciones: "CASO DOCENTE 2 — F4 CAMBIO RÉGIMEN 15% = 15,000 PZS POLVO COMPACTO MERCADO NACIONAL. VA=$1,350,000. IGI 15%=$202,500. DTA 0.8%=$10,800. IVA BASE=(VA+IGI+DTA)=$1,563,300×16%=$250,128.",
  partidas: [{
    fraccion: "3304.91.01", subd: "01", vinc: "0", met: "1", umc: "06", cantUmc: "15000",
    umt: "06", cantUmt: "15000", pvc: "MEX", pod: "MEX", valAduUsd: "75000.00",
    impPrecioPag: "1350000.00", precioUnit: "90.00",
    descripcion: "POLVOS COMPACTOS DE MAQUILLAJE CON ESPEJO — PRODUCTO TERMINADO. 15% PRODUCCIÓN CAMBIO DE RÉGIMEN A DEFINITIVA. MERCADO NACIONAL.",
    marca: "MEX BEAUTY", modelo: "COMPACT-GLOW",
    contribs: [
      { con: "IGI", tasa: "15", tt: "1", fp: "0", importe: "202500.00" },
      { con: "IVA", tasa: "16", tt: "1", fp: "0", importe: "250128.00" }
    ]
  }]
};

const exampleCaso2F4desp = {
  referencia: "BELLEZA-F4-DESP-2026",
  numPedimento: "26 23 3147 6001022",
  tipoOper: "IMP",
  cvePedimento: "F4",
  regimen: "IMP",
  destino: "9",
  tipoCambio: "18.0000",
  pesoBruto: "500.00",
  aduanaES: "23",
  cveSeccion: "230",
  medioTranspArribo: "7",
  medioTranspSalida: "7",
  marcasBultos: "NACIONALIZACIÓN DE DESPERDICIOS 5,000 UNIDADES SCRAP PLÁSTICO",
  acuseElectronico: "AE2623031476001022CBA",
  acuseValidacion: "AV-2623-CBA-DESP-1022",
  fechaEntradaPed: "22052026",
  fechaPago: "22052026",
  rfcImpExp: "CBA050501ABC",
  nombreImpExp: "COSMÉTICOS BELLEZA S.A. DE C.V.",
  domicilioImpExp: "AV. INDUSTRIAL 100, NOGALES, SON, CP 84000",
  provIdFiscal: "LKA-88776655",
  provNombre: "SRI LANKA MIRROR INDUSTRIES",
  provDomicilio: "COLOMBO, SRI LANKA",
  provVinculacion: "0",
  numFactura: "CBA-DESP-2026-001",
  fechaFactura: "22052026",
  incoterm: "EXW",
  monedaFact: "USD",
  valMonFact: "1500.00",
  valDolaresFact: "1500.00",
  eDocumentVucem: "2623CBA0001022F4",
  tipoDocumentoVucem: "003",
  transpIdentificacion: "CARGA TERRESTRE",
  numeroGuia: "",
  transportista: "GLOBAL LOGISTICS",
  transpRfc: "GLO860101XX0",
  transpDomicilio: "NOGALES, SONORA",
  numCandado: "N",
  primeraRevision: "V",
  numTipo: "10 CAJAS",
  agenteNombre: "ROBERTO EDUARDO CELIS ROBLES",
  agenteRfc: "CERR041209",
  agenteCurp: "CERR041209HSRLBB06",
  mandatarioNombre: "LAURA VEGA",
  mandatarioRfc: "VECL900520GH1",
  mandatarioCurp: "VECL900520MJC03",
  agentePatente: "3147",
  numSerieCertificado: "00001000000607890123",
  firmaElectronica: "a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4",
  'globIdClave[]': ["TL"],
  'globIdC1[]': ["LKA"],
  valorDolares: "1500.00",
  valorAduana: "27000.00",
  precioPagado: "27000.00",
  valSeguros: "0", seguros: "0", fletes: "0", valEmbalajes: "0", valOtros: "0",
  liqIgiFp: "0", liqIgiImporte: "0.00",
  liqDtaFp: "0", liqDtaImporte: "463.00",
  liqIvaFp: "0", liqIvaImporte: "4394.00",
  liqPrvFp: "0", liqPrvImporte: "310.00",
  liqCntFp: "0", liqCntImporte: "70.00",
  liqTotal: "5237.00",
  liqEfectivo: "5237.00",
  observaciones: "CASO DOCENTE 2 — F4 DESPERDICIO 5% = 5,000 PZS / 500 KG SCRAP PLÁSTICO. USD $3/KG × 500 KG = $1,500. IGI=0 ART.109 LA. IVA BASE=(VA+DTA)=$27,463×16%=$4,394.",
  partidas: [{
    fraccion: "3915.90.01", subd: "00", vinc: "0", met: "1", umc: "01", cantUmc: "500",
    umt: "01", cantUmt: "500", pvc: "MEX", pod: "MEX", valAduUsd: "1500.00",
    impPrecioPag: "27000.00", precioUnit: "54.00",
    descripcion: "DESPERDICIO DE PLÁSTICO / SCRAP DE ESTUCHES DAÑADOS EN PROCESO DE ENSAMBLE. VALOR MÍNIMO $3.00 USD/KG. 5% DE 100,000 PZS = 5,000 UDS ≈ 500 KG. ART. 109 LEY ADUANERA.",
    marca: "NA", modelo: "",
    contribs: [
      { con: "IGI", tasa: "0", tt: "1", fp: "0", importe: "0.00" },
      { con: "IVA", tasa: "16", tt: "1", fp: "0", importe: "4394.00" }
    ]
  }]
};

// --- CASO 1: BOLSAS DE LUJO GUCCI (TC = 17.15) ---
const exampleCaso1IN = {
  referencia: "BOLSAS-LUJO-2026",
  numPedimento: "26 48 3480 7001001",
  tipoOper: "IMP",
  cvePedimento: "IN",
  regimen: "ITE",
  destino: "9",
  tipoCambio: "17.1500",
  pesoBruto: "1000.00",
  aduanaES: "48",
  cveSeccion: "480",
  medioTranspArribo: "7",
  medioTranspSalida: "7",
  rfcImpExp: "BLS050501ABC",
  nombreImpExp: "BOLSAS DE LUJO S.A. DE C.V.",
  domicilioImpExp: "AV. INDUSTRIAL 200, GUADALAJARA, JAL, CP 44100",
  provIdFiscal: "ITA-88776655",
  provNombre: "ITALIAN LUXURY BAGS",
  provDomicilio: "FLORENCE, ITALY",
  provVinculacion: "0",
  numFactura: "BL-IN-2026-001",
  fechaFactura: "08052026",
  incoterm: "CIF",
  monedaFact: "USD",
  valMonFact: "120000.00",
  valDolaresFact: "120000.00",
  globIdClave: "IN",
  globIdC1: "038-2019",
  valorDolares: "120000.00",
  valorAduana: "2058000.00",
  precioPagado: "2058000.00",
  valSeguros: "0", seguros: "0", fletes: "0", valEmbalajes: "0", valOtros: "0",
  liqIgiFp: "0", liqIgiImporte: "308,700.00",
  liqIvaFp: "0", liqIvaImporte: "362,160.00",
  liqDtaFp: "0", liqDtaImporte: "16,464.00",
  liqPrvFp: "0", liqPrvImporte: "310.00",
  liqCntFp: "0", liqCntImporte: "70.00",
  liqTotal: "687,704.00",
  liqEfectivo: "843.00",
  observaciones: "CASO DOCENTE 1 — IMPORTACIÓN TEMPORAL DE INSUMOS PARA PRODUCCIÓN DE BOLSAS DE LUJO. ZIPPER ES MEXICANO NO SE IMPORTA.",
  partidas: [
    {
      fraccion: "4107.11.01", subd: "01", vinc: "0", met: "1", umc: "01", cantUmc: "10000",
      umt: "01", cantUmt: "10000", pvc: "IRN", pod: "IRN", valAduUsd: "100000.00",
      impPrecioPag: "1,715,000.00", precioUnit: "171.50",
      descripcion: "CUERO DE BOVINO CURTIDO PARA BOLSAS DE LUJO. INSUMO PARA ENSAMBLE IMMEX. MEDIDA 50x30 CM. ORIGEN IRÁN.",
      marca: "IRAN LEATHER",
      contribs: [
        { con: "IGI", tasa: "15", tt: "1", fp: "0", importe: "257,250.00" },
        { con: "IVA", tasa: "16", tt: "1", fp: "0", importe: "301,680.00" }
      ]
    },
    {
      fraccion: "5205.11.01", subd: "00", vinc: "0", met: "1", umc: "01", cantUmc: "1000",
      umt: "01", cantUmt: "1000", pvc: "ITA", pod: "ITA", valAduUsd: "20000.00",
      impPrecioPag: "343,000.00", precioUnit: "343.00",
      descripcion: "HILO DE ALGODÓN ITALIANO PARA COSTURA DE BOLSAS DE LUJO. INSUMO IMMEX.",
      marca: "ITALIAN THREAD",
      contribs: [
        { con: "IGI", tasa: "15", tt: "1", fp: "0", importe: "51,450.00" },
        { con: "IVA", tasa: "16", tt: "1", fp: "0", importe: "60,480.00" }
      ]
    }
  ]
};

const exampleCaso1RT = {
  referencia: "BOLSAS-LUJO-RT-2026",
  numPedimento: "26 48 3480 6001002",
  tipoOper: "EXP",
  cvePedimento: "RT",
  regimen: "EXD",
  destino: "ITA",
  tipoCambio: "17.1500",
  pesoBruto: "2000.00",
  aduanaES: "48",
  cveSeccion: "480",
  rfcImpExp: "BLS050501ABC",
  nombreImpExp: "BOLSAS DE LUJO S.A. DE C.V.",
  domicilioImpExp: "AV. INDUSTRIAL 200, GUADALAJARA, JAL, CP 44100",
  provIdFiscal: "ITA-88776655",
  provNombre: "ITALIAN LUXURY BAGS",
  provDomicilio: "FLORENCE, ITALY",
  provVinculacion: "1",
  numFactura: "BL-EXP-2026-001",
  fechaFactura: "20052026",
  incoterm: "FOB",
  monedaFact: "USD",
  valMonFact: "600000.00",
  valDolaresFact: "600000.00",
  'globIdClave[]': ["IN", "TL"],
  'globIdC1[]': ["038-2019", "ITA"],
  valorDolares: "600000.00",
  valorAduana: "10,290,000.00",
  precioPagado: "10,290,000.00",
  valSeguros: "0", seguros: "0", fletes: "0", valEmbalajes: "0", valOtros: "0",
  liqIgiFp: "0", liqIgiImporte: "0.00",
  liqIvaFp: "0", liqIvaImporte: "0.00",
  liqDtaFp: "0", liqDtaImporte: "464.00",
  liqPrvFp: "0", liqPrvImporte: "310.00",
  liqCntFp: "0", liqCntImporte: "70.00",
  liqTotal: "844.00",
  liqEfectivo: "844.00",
  observaciones: "CASO DOCENTE 1 — EXPORTACIÓN DE 10,000 BOLSAS TERMINADAS. DESCARGO IMMEX.",
  partidas: [
    {
      fraccion: "4202.21.01", subd: "01", vinc: "1", met: "0", umc: "06", cantUmc: "10000",
      umt: "06", cantUmt: "10000", pvc: "MEX", pod: "ITA", valAduUsd: "600000.00",
      impPrecioPag: "10,290,000.00", precioUnit: "1029.00",
      descripcion: "BOLSA DE MANO DE CUERO BOVINO TERMINADO. DESCARGO IMMEX. EXPORTACIÓN DEFINITIVA A ITALIA. INSUMOS: CUERO IRÁ + HILO ITA + ZIPPER MEX.",
      marca: "LUJO MEX",
      tratado: "TLCUEM",
      contribs: []
    }
  ]
};

const exampleCaso1F4prod = {
  referencia: "BOLSAS-LUJO-F4-2026",
  numPedimento: "26 48 3480 6001003",
  tipoOper: "IMP",
  cvePedimento: "F4",
  regimen: "IMP",
  destino: "9",
  tipoCambio: "17.1500",
  pesoBruto: "400.00",
  aduanaES: "48",
  cveSeccion: "480",
  rfcImpExp: "BLS050501ABC",
  nombreImpExp: "BOLSAS DE LUJO S.A. DE C.V.",
  domicilioImpExp: "AV. INDUSTRIAL 200, GUADALAJARA, JAL, CP 44100",
  provIdFiscal: "ITA-88776655",
  provNombre: "ITALIAN LUXURY BAGS",
  provDomicilio: "FLORENCE, ITALY",
  provVinculacion: "1",
  numFactura: "BL-F4-2026-001",
  fechaFactura: "21052026",
  incoterm: "EXW",
  monedaFact: "USD",
  valMonFact: "120000.00",
  valDolaresFact: "120000.00",
  'globIdClave[]': ["TL", "IN"],
  'globIdC1[]': ["ITA", "038-2019"],
  valorDolares: "120000.00",
  valorAduana: "2,058,000.00",
  precioPagado: "2,058,000.00",
  valSeguros: "0", seguros: "0", fletes: "0", valEmbalajes: "0", valOtros: "0",
  liqIgiFp: "0", liqIgiImporte: "0.00",
  liqIvaFp: "0", liqIvaImporte: "329,280.00",
  liqDtaFp: "0", liqDtaImporte: "16,464.00",
  liqPrvFp: "0", liqPrvImporte: "310.00",
  liqCntFp: "0", liqCntImporte: "70.00",
  liqTotal: "346,124.00",
  liqEfectivo: "346,124.00",
  observaciones: "CASO DOCENTE 1 — CAMBIO DE RÉGIMEN 2,000 BOLSAS TERMINADAS PARA MERCADO NACIONAL.",
  partidas: [
    {
      fraccion: "4202.21.01", subd: "01", vinc: "1", met: "1", umc: "06", cantUmc: "2000",
      umt: "06", cantUmt: "2000", pvc: "ITA", pod: "ITA", valAduUsd: "120000.00",
      impPrecioPag: "2,058,000.00", precioUnit: "1029.00",
      descripcion: "BOLSA DE MANO DE CUERO BOVINO NACIONALIZACIÓN. MODELO LUJO.",
      marca: "LUJO MEX",
      tratado: "TLCUEM",
      contribs: [
        { con: "IGI", tasa: "0", tt: "1", fp: "0", importe: "0.00" },
        { con: "IVA", tasa: "16", tt: "1", fp: "0", importe: "329,280.00" }
      ]
    }
  ]
};

const exampleCaso1F4desp = {
  referencia: "BOLSAS-LUJO-F4-DESP-2026",
  numPedimento: "26 48 3480 6001004",
  tipoOper: "IMP",
  cvePedimento: "F4",
  regimen: "IMP",
  destino: "9",
  tipoCambio: "17.1500",
  pesoBruto: "500.00",
  aduanaES: "48",
  cveSeccion: "480",
  rfcImpExp: "BLS050501ABC",
  nombreImpExp: "BOLSAS DE LUJO S.A. DE C.V.",
  domicilioImpExp: "AV. INDUSTRIAL 200, GUADALAJARA, JAL, CP 44100",
  provIdFiscal: "ITA-88776655",
  provNombre: "ITALIAN LUXURY BAGS",
  provDomicilio: "FLORENCE, ITALY",
  provVinculacion: "0",
  numFactura: "BL-DESP-2026-001",
  fechaFactura: "22052026",
  incoterm: "EXW",
  monedaFact: "USD",
  valMonFact: "1200.00",
  valDolaresFact: "1200.00",
  globIdClave: "TL",
  globIdC1: "ITA",
  valorDolares: "1200.00",
  valorAduana: "20,580.00",
  precioPagado: "20,580.00",
  valSeguros: "0", seguros: "0", fletes: "0", valEmbalajes: "0", valOtros: "0",
  liqIgiFp: "0", liqIgiImporte: "0.00",
  liqIvaFp: "0", liqIvaImporte: "3,292.80",
  liqDtaFp: "0", liqDtaImporte: "165.00",
  liqPrvFp: "0", liqPrvImporte: "310.00",
  liqCntFp: "0", liqCntImporte: "70.00",
  liqTotal: "3,837.80",
  liqEfectivo: "3,837.80",
  observaciones: "CASO DOCENTE 1 — CAMBIO DE RÉGIMEN 5% VALOR DE DESPERDICIO. 500 UDS DE SCRAP DE CUERO. ART. 109 L.A.",
  partidas: [
    {
      fraccion: "3915.90.01", subd: "00", vinc: "0", met: "1", umc: "01", cantUmc: "500",
      umt: "01", cantUmt: "500", pvc: "MEX", pod: "MEX", valAduUsd: "1200.00",
      impPrecioPag: "20,580.00", precioUnit: "41.16",
      descripcion: "DESPERDICIO DE CUERO SCRAP DE BOLSAS DAÑADAS EN PROCESO DE ENSAMBLE.",
      marca: "NA",
      contribs: [
        { con: "IGI", tasa: "0", tt: "1", fp: "0", importe: "0.00" },
        { con: "IVA", tasa: "16", tt: "1", fp: "0", importe: "3292.80" }
      ]
    }
  ]
};

// ─── CASOS ESPECIALES ───────────────────────────────────────────────────
const exampleAmazonGuaymas = {
  referencia: "AMZ-GUY-20ITEMS-V1", numPedimento: "26 16 3147 6000001",
  tipoOper: "IMP", cvePedimento: "A1", regimen: "IMD", destino: "SON",
  tipoCambio: "18.50", pesoBruto: "32500.0", aduanaES: "16", cveSeccion: "160",
  medioTranspArribo: "3", medioTranspSalida: "7", rfcImpExp: "AME121105990",
  nombreImpExp: "AMAZON MEXICO S. DE R.L. DE C.V.",
  domicilioImpExp: "CALLE DE LOS EMBARQUES 500, PARQUE INDUSTRIAL, HERMOSILLO, SONORA, CP 83000",
  provIdFiscal: "91-16383XX", provNombre: "AMAZON SALES LLC GLOBAL OPERATIONS",
  provDomicilio: "410 TERRY AVE N, SEATTLE, WA 98109, USA", provVinculacion: "0",
  numFactura: "AMZ-CONTAINER-2026-X", fechaFactura: "07042026",
  incoterm: "CIF", monedaFact: "USD", valMonFact: "116500.00", valDolaresFact: "116500.00",
  eDocumentVucem: "2601AMZHQ987654321", tipoDocumentoVucem: "002",
  transpIdentificacion: "MSK ALTAIR V.99 TRACTO-KENWORTH-88", numeroGuia: "MAERSK-GUY-2026-001",
  contenedor: "MSKU-887766-5 40HC HIGH CUBE", transportista: "MAERSK LOGISTICS MEXICO S.A.",
  transpRfc: "MLM900101XYZ", transpDomicilio: "RECINTO PORTUARIO GUAYMAS, SONORA, MEX",
  numCandado: "ANAM-998877-SECURE", primeraRevision: "CUMPLE 100% FISCALIZACIÓN ANAM",
  numTipo: "1 40HC", agenteNombre: "ROBERTO EDUARDO CELIS ROBLES",
  agenteRfc: "CERR041209", agenteCurp: "CERR041209HSRLBB06", agentePatente: "3147",
  'globIdClave[]': ["PR"], 'globIdC1[]': ["USA"],
  valorDolares: "116500.00", valorAduana: "2155250.00", precioPagado: "2155250.00",
  valSeguros: "15500", seguros: "15500", fletes: "62500.00", valEmbalajes: "4500", valOtros: "12500.00",
  liqIgiFp: "0", liqIgiImporte: "107760.00", liqIvaFp: "0", liqIvaImporte: "362140.00",
  liqDtaFp: "0", liqDtaImporte: "17242.00", liqPrvFp: "0", liqPrvImporte: "310.00",
  liqCntFp: '0', liqCntImporte: "70.00", liqTotal: "487522.00", liqEfectivo: "487522.00",
  partidas: [
    {
      fraccion: "8518.22.01", subd: "01", vinc: "0", met: "1", umc: "06", cantUmc: "850",
      umt: "06", cantUmt: "850", pvc: "CHN", pod: "MEX", valAduUsd: "25500.00",
      impPrecioPag: "471750.00", precioUnit: "555.00", descripcion: "JBL SPEAKERS XL-SERIES PRO BOCINAS INALÁMBRICAS",
      marca: "JBL", modelo: "G2-PRO", contribs: [
        { con: "IGI", tasa: "5", tt: "1", fp: '0', importe: "23580.00" },
        { con: "IVA", tasa: "16", tt: '1', fp: '0', importe: "79332.00" }
      ]
    },
    {
      fraccion: "8471.30.01", subd: "01", vinc: "0", met: "1", umc: "06", cantUmc: "500",
      umt: "06", cantUmt: "500", pvc: "VNM", pod: "MEX", valAduUsd: "15000.00",
      impPrecioPag: "277500.00", precioUnit: "555.00", descripcion: "AMAZON ECHO GEN 6 - SMART HUB ASISTENTE VIRTUAL",
      marca: "AMAZON", modelo: "ECH6-BLACK", contribs: [
        { con: "IGI", tasa: "0", tt: '1', fp: '0', importe: "0.00" },
        { con: "IVA", tasa: "16", tt: '1', fp: '0', importe: "44400.00" }
      ]
    }
  ]
};

const exampleMaxAmazon = {
  referencia: "MAX-AMAZON-MULTI-PRODUCTO", numPedimento: "26 47 3480 6009876",
  tipoOper: "IMP", cvePedimento: "A1", regimen: "IMD", destino: "09",
  tipoCambio: "17.0000", pesoBruto: "8540.50", aduanaES: "470", cveSeccion: "470",
  rfcImpExp: "SCA110515ABC", nombreImpExp: "SERVICIOS COMERCIALES AMAZON MEXICO S. DE R.L. DE C.V.",
  domicilioImpExp: "JUAN SALVADOR AGRAZ 73, PISO 5, COL. LOMAS DE SANTA FE, CUAJIMALPA, CDMX, CP 05109",
  valorDolares: "45800.75", valorAduana: "778612.75", precioPagado: "778612.75",
  valSeguros: "450", seguros: "450", fletes: "12500.00", valEmbalajes: "200", valOtros: "150",
  liqIgiFp: "0", liqIgiImporte: "155730.00", liqIvaFp: "0", liqIvaImporte: "192360.00",
  liqDtaFp: "0", liqDtaImporte: "6228.00", liqPrvFp: "0", liqPrvImporte: "310.00",
  liqCntFp: '0', liqCntImporte: "70.00", liqTotal: "354698.00", liqEfectivo: "354698.00",
  partidas: [
    {
      fraccion: "8471.30.01", subd: "00", vinc: "0", met: "1", umc: "06", cantUmc: "50",
      umt: "06", cantUmt: "50", pvc: "CHN", pod: "CHN", valAduUsd: "15000.00",
      impPrecioPag: "255000.00", precioUnit: "5100.00", descripcion: "TABLETAS ELECTRÓNICAS KINDLE PAPERWHITE 11A GEN",
      marca: "AMAZON", modelo: "KINDLE-PW-11", contribs: [
        { con: "IGI", tasa: "0", tt: '1', fp: '0', importe: "0.00" },
        { con: "IVA", tasa: "16", tt: '1', fp: '0', importe: "40800.00" }
      ]
    }
  ]
};

const exampleMinBancos = {
  referencia: "MIN-BANCOS-INDUSTRIALES", numPedimento: "26 07 3480 6001234",
  tipoOper: "IMP", cvePedimento: "A1", regimen: "IMD", destino: "26",
  tipoCambio: "17.1500", pesoBruto: "1250", aduanaES: "070", cveSeccion: "070",
  medioTranspArribo: "7", medioTranspSalida: "7", rfcImpExp: "FSI120304ABC",
  nombreImpExp: "FT SOLUCIONES INDUSTRIALES S.A. DE C.V.",
  domicilioImpExp: "CALLE INDUSTRIAL 123, COL. CENTRO, HERMOSILLO, SONORA, CP 83000",
  valorDolares: "5420.00", valorAduana: "92953.00", precioPagado: "92953.00",
  valSeguros: "0", seguros: "0", fletes: "850.00", valEmbalajes: "0", valOtros: "0",
  liqIgiFp: "0", liqIgiImporte: "4648.00", liqIvaFp: "0", liqIvaImporte: "15616.00",
  liqDtaFp: "0", liqDtaImporte: "743.00", liqPrvFp: "0", liqPrvImporte: "310.00",
  liqCntFp: '0', liqCntImporte: "70.00", liqTotal: "21387.00", liqEfectivo: "21387.00",
  partidas: [{
    fraccion: "9403.90.01", subd: "00", vinc: "0", met: "1", umc: "06", cantUmc: "100",
    umt: "06", cantUmt: "100", pvc: "MEX", pod: "MEX", valAduUsd: "3500.00",
    impPrecioPag: "60025.00", precioUnit: "600.25", descripcion: "ESTRUCTURA DE HIERRO PARA ENSAMBLE DE BANCOS INDUSTRIALES",
    marca: "HEAVY-DUTY", modelo: "IND-2026", contribs: [{ con: "IGI", tasa: "10", tt: "1", fp: "0", importe: "4648.00" }]
  }]
};

const exampleMaritimoCNC = {
  referencia: "MARITIMO-CNC-LASER-FORZA-GBR", numPedimento: "26 43 1234 7000001",
  tipoOper: "IMP", cvePedimento: "A1", regimen: "IMD", destino: "GBR",
  tipoCambio: "18.5000", pesoBruto: "7900", aduanaES: "43", cveSeccion: "430",
  medioTranspArribo: "3", medioTranspSalida: "7", rfcImpExp: "CERR040101XXX",
  nombreImpExp: "ROBERTO EDUARDO CELIS ROBLES", domicilioImpExp: "HERMOSILLO, SONORA, MÉXICO",
  provIdFiscal: "GB123456789", provNombre: "LONDON LASER SYSTEMS LTD",
  provDomicilio: "78 INDUSTRIAL ROAD, SHEFFIELD, UK", provVinculacion: "0",
  numFactura: "INV-2026-0089", fechaFactura: "15032026", incoterm: "CFR",
  monedaFact: "USD", valMonFact: "65000.00", valDolaresFact: "65000.00",
  eDocumentVucem: "2601EDC987654321", tipoDocumentoVucem: "002",
  transpIdentificacion: "MV MSC AMSTERDAM", numeroGuia: "GBVER20260401MSC",
  contenedor: "MSKU9876543 40HC", transportista: "MEDITERRANEAN SHIPPING COMPANY",
  transpRfc: "MSC950101XYZ", transpDomicilio: "AV. INDEPENDENCIA 123, VERACRUZ, MEX",
  numCandado: "C-987654", primeraRevision: "SIN INCIDENCIAS", numTipo: "1 40HC",
  agenteNombre: "ROBERTO EDUARDO CELIS ROBLES", agenteRfc: "CERR041209",
  agenteCurp: "CERR041209HSRLBB06", agentePatente: "3147",
  valorDolares: "65000.00", valorAduana: "1202500.00", precioPagado: "1202500.00",
  valSeguros: "450", seguros: "450", fletes: "3500.00", valEmbalajes: "0", valOtros: "0",
  liqIgiFp: "0", liqIgiImporte: "0.00", liqIvaFp: "0", liqIvaImporte: "192400.00",
  liqDtaFp: "0", liqDtaImporte: "9620.00", liqPrvFp: "0", liqPrvImporte: "310.00",
  liqCntFp: '0', liqCntImporte: "70.00", liqTotal: "202400.00", liqEfectivo: "202400.00",
  partidas: [{
    fraccion: "8456.11.01", subd: "01", vinc: "0", met: "1", umc: "06", cantUmc: "1",
    umt: "06", cantUmt: "1", pvc: "GBR", pod: "GBR", valAduUsd: "65000.00",
    impPrecioPag: "1202500.00", precioUnit: "1202500.00",
    descripcion: "MÁQUINA INDUSTRIAL CNC DE CORTE LÁSER DE FIBRA 6000W MODELO G3060P60 Y ACCESORIOS (CHILLER, EXTRACTOR, TRANSFORMADOR)",
    marca: "FORZA", modelo: "G3060P60", contribs: [{ con: "IGI", tasa: "0", tt: "1", fp: "0", importe: "192400.00" }]
  }]
};


// ─── PARTIDAS ENGINE ──────────────────────────────────────────────────────────

function agregarPartida() {
    const partidaCount = document.querySelectorAll('.partida-tbody').length;
    const html = `
        <tr class="partida-row" style="border-top:2px solid black;">
            <td class="data"><input type="text" name="partidas[${partidaCount}][fraccion]" placeholder="Fracción"></td>
            <td class="data"><input type="text" name="partidas[${partidaCount}][subd]" placeholder="Subd"></td>
            <td class="data"><select name="partidas[${partidaCount}][vinc]"><option value="0">0</option><option value="1">1</option></select></td>
            <td class="data"><select name="partidas[${partidaCount}][met]"><option value="0">0</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option><option value="7">7</option></select></td>
            <td class="data">
                <select name="partidas[${partidaCount}][umc]">
                    <option value="01">01 - Kilo</option><option value="06">06 - Pieza</option>
                </select>
            </td>
            <td class="data"><input type="number" name="partidas[${partidaCount}][cantUmc]" step="any"></td>
            <td class="data">
                <select name="partidas[${partidaCount}][umt]">
                    <option value="01">01 - Kilo</option><option value="06">06 - Pieza</option>
                </select>
            </td>
            <td class="data"><input type="number" name="partidas[${partidaCount}][cantUmt]" step="any"></td>
            <td class="data"><select name="partidas[${partidaCount}][pvc]" class="country-sel-new"><option value="MEX">MEX</option></select></td>
            <td class="data"><select name="partidas[${partidaCount}][pod]" class="country-sel-new"><option value="USA">USA</option></select></td>
            <td colspan="4" class="data">
                <select name="partidas[${partidaCount}][tratado]" class="select-tlc">
                    <option value="">Arancel General</option><option value="TMEC">T-MEC</option>
                    <option value="TLCUEM">TLCUEM</option>
                </select>
            </td>
        </tr>
        <tr>
            <td class="label">SEC</td>
            <td colspan="13" class="label">DESCRIPCIÓN Y CLASE DE MERCANCÍA</td>
        </tr>
        <tr>
            <td class="data"><input type="number" name="partidas[${partidaCount}][sec]" value="${partidaCount + 1}"></td>
            <td colspan="13" class="data"><textarea name="partidas[${partidaCount}][descripcion]" oninput="autoResize(this)"></textarea></td>
        </tr>
        <tr>
            <td class="section-header" colspan="14" style="background:#f1f5f9; color:#475569; font-size:7px; height:12px; padding:0;">LIQUIDACIÓN DE LA PARTIDA</td>
        </tr>
        <tr>
            <td class="label">CON.</td>
            <td class="label">TASA</td>
            <td class="label">T.T.</td>
            <td class="label">F.P.</td>
            <td colspan="3" class="label">IMPORTE</td>
            <td class="label" colspan="7"></td>
        </tr>
        <tr class="contrib-row">
            <td class="data"><input type="text" name="partidas[${partidaCount}][contribs][0][con]" value="IGI"></td>
            <td class="data"><input type="text" name="partidas[${partidaCount}][contribs][0][tasa]" value="0"></td>
            <td class="data"><input type="text" name="partidas[${partidaCount}][contribs][0][tt]" value="1"></td>
            <td class="data"><select name="partidas[${partidaCount}][contribs][0][fp]"><option value="0">0</option></select></td>
            <td colspan="3" class="data"><input type="text" name="partidas[${partidaCount}][contribs][0][importe]" onblur="this.value = formatter(this.value)" value="0"></td>
            <td class="data text-center" colspan="7" style="background:#f8fafc;">
                <button type="button" onclick="addContribRow(${partidaCount})" style="font-size:7px; background:#e2e8f0; border:1px solid #cbd5e1; border-radius:3px; cursor:pointer;">+ Agregar</button>
            </td>
        </tr>
        <tr class="subtotal-row" style="background:#f8fafc;">
            <td colspan="4" style="text-align:right; font-size:7px; font-weight:bold; color:#64748b; padding-right:10px;">
                <button type="button" class="no-print" onclick="autoCalcPartida(${partidaCount})" style="font-size:8px; background:#dbeafe; border:1px solid #bfdbfe; color:#1e40af; border-radius:3px; cursor:pointer; padding:3px 6px; margin-right: 10px;">⚡ Auto-Calcular Impuestos de Partida</button>
                SUMA CONTRIBUCIONES PARTIDA:
            </td>
            <td colspan="3" class="data"><input name="partidas[${partidaCount}][subtotal]" type="text" readonly style="background:#f1f5f9; font-weight:bold;"/></td>
            <td colspan="7"></td>
        </tr>
        <tr>
            <td colspan="3" class="label">VAL.ADU/USD</td>
            <td colspan="3" class="label">IMP.PRECIO PAG.</td>
            <td colspan="3" class="label">PRECIO UNIT.</td>
            <td colspan="3" class="label">VAL. AGREG.</td>
            <td colspan="2" class="label">E.F. ORIG-DEST-VEND-COMP</td>
        </tr>
        <tr>
            <td colspan="3" class="data"><input type="text" name="partidas[${partidaCount}][valAduUsd]"></td>
            <td colspan="3" class="data"><input type="text" name="partidas[${partidaCount}][impPrecioPag]" style="background:#f1f5f9;"></td>
            <td colspan="3" class="data"><input type="text" name="partidas[${partidaCount}][precioUnit]" style="background:#f1f5f9;"></td>
            <td colspan="3" class="data"><input type="text" name="partidas[${partidaCount}][valAgreg]"></td>
            <td colspan="2" class="data"><input type="text" name="partidas[${partidaCount}][efInfo]"></td>
        </tr>
        <tr>
            <td colspan="5" class="label">MARCA</td>
            <td colspan="5" class="label">MODELO</td>
            <td colspan="4" class="label">CÓDIGO PRODUCTO</td>
        </tr>
        <tr>
            <td colspan="5" class="data"><input type="text" name="partidas[${partidaCount}][marca]"></td>
            <td colspan="5" class="data"><input type="text" name="partidas[${partidaCount}][modelo]"></td>
            <td colspan="4" class="data"><input type="text" name="partidas[${partidaCount}][codProducto]"></td>
        </tr>
        <tr>
            <td colspan="14" class="label">OBSERVACIONES A NIVEL PARTIDA</td>
        </tr>
        <tr>
            <td colspan="14" class="data"><textarea name="partidas[${partidaCount}][observaciones]" oninput="autoResize(this)" style="min-height:30px;"></textarea></td>
        </tr>
    `;

    const newTbody = document.createElement('tbody');
    newTbody.className = 'partida-tbody';
    newTbody.innerHTML = html;
    
    if (typeof getCountryOptions === 'function') {
        const opts = getCountryOptions();
        newTbody.querySelectorAll('.country-sel-new').forEach(sel => {
            sel.innerHTML = opts;
        });
    }

    const addButton = document.querySelector('.btn-add');
    const footerRow = addButton?.closest('tbody');
    const table = footerRow?.parentElement;

    if (table && footerRow) {
        table.insertBefore(newTbody, footerRow);
    } else {
        // Fallback robusto
        const targetTable = document.querySelector('.page table') || document.querySelector('table');
        if (targetTable) targetTable.appendChild(newTbody);
    }
    checkPageOverflow();
}

function autoCalcPartida(idx) {
    try {
        const parseClean = (val) => parseFloat((val || "0").toString().replace(/,/g, '')) || 0;

        const valAduGlobal = parseClean(document.querySelector('input[name="valorAduana"]')?.value);
        const valDolaresGlobal = parseClean(document.querySelector('input[name="valorDolares"]')?.value);
        const dtaGlobal = parseClean(document.getElementById('liqDtaImporte')?.value);

        if (valAduGlobal <= 0 || valDolaresGlobal <= 0) {
            if (typeof showModalError === 'function') showModalError("Debe calcular el 'Valor en Aduana' y 'Valor Dólares' en el encabezado antes de auto-calcular los impuestos de la partida.");
            else alert("Faltan valores globales (Valor Aduana / Valor Dólares).");
            return;
        }

        const partidaTbody = document.querySelectorAll('.partida-tbody')[idx];
        if (!partidaTbody) return;

        const valAduUsdInput = partidaTbody.querySelector(`input[name="partidas[${idx}][valAduUsd]"]`);
        const valAduUsd = parseClean(valAduUsdInput?.value);

        if (valAduUsd <= 0) {
            if (typeof showModalError === 'function') showModalError("Debe ingresar el VAL.ADU/USD de la partida.");
            else alert("Falta VAL.ADU/USD en la partida.");
            return;
        }

        const factor = valAduUsd / valDolaresGlobal;
        const vaPartida = valAduGlobal * factor;
        const dtaPartida = dtaGlobal * factor; 

        let igiImporte = 0;
        let iepsImporte = 0;
        let ivaImporte = 0;

        const rows = partidaTbody.querySelectorAll('.contrib-row');
        
        rows.forEach(row => {
            const con = (row.querySelector('[name*="[con]"]')?.value || "").toUpperCase().trim();
            const tasa = row.querySelector('[name*="[tasa]"]')?.value || "0";
            const importeInput = row.querySelector('[name*="[importe]"]') || row.querySelector('[name*="[imp]"]');
            
            if (con === "IGI") {
                if (tasa === "EX" || tasa === "0") {
                    igiImporte = 0;
                } else {
                    const t = parseClean(tasa);
                    igiImporte = vaPartida * (t / 100);
                }
                if (importeInput) importeInput.value = formatter(igiImporte);
            }
        });

        rows.forEach(row => {
            const con = (row.querySelector('[name*="[con]"]')?.value || "").toUpperCase().trim();
            const tasa = row.querySelector('[name*="[tasa]"]')?.value || "0";
            const importeInput = row.querySelector('[name*="[importe]"]') || row.querySelector('[name*="[imp]"]');
            
            if (con === "IEPS") {
                if (tasa === "EX" || tasa === "0") {
                    iepsImporte = 0;
                } else {
                    const t = parseClean(tasa);
                    iepsImporte = (vaPartida + igiImporte) * (t / 100);
                }
                if (importeInput) importeInput.value = formatter(iepsImporte);
            }
        });

        rows.forEach(row => {
            const con = (row.querySelector('[name*="[con]"]')?.value || "").toUpperCase().trim();
            const tasa = row.querySelector('[name*="[tasa]"]')?.value || "0";
            const importeInput = row.querySelector('[name*="[importe]"]') || row.querySelector('[name*="[imp]"]');
            
            if (con === "IVA") {
                if (tasa === "EX" || tasa === "0") {
                    ivaImporte = 0;
                } else {
                    const t = parseClean(tasa);
                    ivaImporte = (vaPartida + igiImporte + iepsImporte + dtaPartida) * (t / 100);
                }
                if (importeInput) importeInput.value = formatter(ivaImporte);
            }
        });

        calcTotal();
    } catch (error) {
        console.error("Error auto-calculando partida:", error);
    }
}

function calcTotal() {
    try {
        const taxes = ['Igi', 'Dta', 'Iva', 'Prv', 'Cnt', 'Ieps', 'Rec', 'Cc', 'Mt'];
        const globalConceptTotals = {};
        taxes.forEach(t => globalConceptTotals[t.toUpperCase()] = 0);

        const partidaBodies = document.querySelectorAll('[id^="partida-"][id$="-contribs"]');
        partidaBodies.forEach(body => {
            const partidaIdMatch = body.id.match(/partida-(\d+)-contribs/);
            const pIdx = partidaIdMatch ? partidaIdMatch[1] : null;
            let partidaSubtotal = 0;

            const rows = body.querySelectorAll('.contrib-row');
            rows.forEach(row => {
                const conInput = row.querySelector('[name*="[con]"]');
                const impInput = row.querySelector('[name*="[importe]"]') || row.querySelector('[name*="[imp]"]');
                
                if (conInput && impInput) {
                    const con = conInput.value.toUpperCase().trim();
                    let matchedTax = null;
                    if (con.startsWith("IEPS")) matchedTax = "IEPS";
                    else if (con.startsWith("IGI")) matchedTax = "IGI";
                    else if (con.startsWith("IVA")) matchedTax = "IVA";
                    else if (con.startsWith("DTA")) matchedTax = "DTA";
                    else if (con.startsWith("PRV")) matchedTax = "PRV";
                    else if (con.startsWith("CNT")) matchedTax = "CNT";
                    else if (con.startsWith("REC")) matchedTax = "REC";
                    else if (con.startsWith("CC")) matchedTax = "CC";
                    else if (con.startsWith("MT")) matchedTax = "MT";

                    const val = parseFloat(impInput.value.replace(/,/g, '')) || 0;
                    partidaSubtotal += val;
                    
                    if (matchedTax && globalConceptTotals.hasOwnProperty(matchedTax)) {
                        globalConceptTotals[matchedTax] += val;
                    }
                }
            });

            if (pIdx !== null) {
                const subInput = document.querySelector(`[name="partidas[${pIdx}][subtotal]"]`);
                if (subInput) subInput.value = formatter(partidaSubtotal);
            }
        });

        Object.keys(globalConceptTotals).forEach(con => {
            const id = 'liq' + con.charAt(0) + con.slice(1).toLowerCase() + 'Importe';
            const liqInput = document.getElementById(id);
            if (liqInput && globalConceptTotals[con] > 0) {
                liqInput.value = formatter(globalConceptTotals[con]);
            }
        });

        let totalAmount = 0;
        let efectivoAmount = 0;
        let otrosAmount = parseFloat(("" + (document.getElementById('liqOtros')?.value || "0")).replace(/,/g, '')) || 0;

        taxes.forEach(tax => {
            const impInput = document.getElementById('liq' + tax + 'Importe');
            if (impInput) {
                const val = parseFloat(impInput.value.replace(/,/g, '')) || 0;
                totalAmount += val;
                
                const fpInputObj = document.getElementsByName('liq' + tax + 'Fp');
                let fpStr = "0";
                if(fpInputObj && fpInputObj.length > 0) fpStr = fpInputObj[0].value;
                else if(document.getElementById('liq' + tax + 'Fp')) fpStr = document.getElementById('liq' + tax + 'Fp').value;
                
                if (fpStr === "0" || fpStr === "0 - Efectivo" || fpStr === "EFECTIVO") {
                    efectivoAmount += val;
                }
            }
        });

        const totalInput = document.getElementById('liqTotal');
        if (totalInput) totalInput.value = formatter(totalAmount);

        const efecInput = document.getElementById('liqEfectivo');
        if (efecInput) efecInput.value = formatter(efectivoAmount - otrosAmount); 
        
    } catch(e) {
        console.error("Error calculating TOTAL: ", e);
    }
}

function calcDTA() {
    try {
        const valAduanaInput = document.querySelector('input[name="valorAduana"]');
        if (!valAduanaInput || !valAduanaInput.value) {
            if(typeof showModalError === 'function') showModalError("Primero debe ingresar el VALOR ADUANA en la cabecera.");
            return;
        }
        
        const valorAduanaStr = valAduanaInput.value.replace(/,/g, '');
        const valorAduana = parseFloat(valorAduanaStr);
        
        if (isNaN(valorAduana) || valorAduana <= 0) {
            if(typeof showModalError === 'function') showModalError("El Valor en Aduana debe ser un número válido mayor a 0.");
            return;
        }
        
        let dta = valorAduana * 0.008;
        
        const DTA_MINIMO = 463;
        if (dta < DTA_MINIMO) {
            dta = DTA_MINIMO;
        }
        
        const dtaInput = document.getElementById('liqDtaImporte');
        if (dtaInput) {
            dtaInput.value = formatter(dta);
        }
    } catch (e) {
        console.error("Error al calcular DTA:", e);
    }
}

function calcPRV() {
    const prvInput = document.getElementById('liqPrvImporte');
    if (prvInput) prvInput.value = "310.00"; 
}

function calcIVA() {
    try {
        const valAduanaStr = (document.querySelector('input[name="valorAduana"]')?.value || "0").replace(/,/g, '');
        const dtaStr = (document.getElementById('liqDtaImporte')?.value || "0").replace(/,/g, '');
        const igiStr = (document.getElementById('liqIgiImporte')?.value || "0").replace(/,/g, '');
        const iepsStr = (document.getElementById('liqIepsImporte')?.value || "0").replace(/,/g, '');
        
        const valAduana = parseFloat(valAduanaStr) || 0;
        const dta = parseFloat(dtaStr) || 0;
        const igi = parseFloat(igiStr) || 0;
        const ieps = parseFloat(iepsStr) || 0;
        
        if (valAduana <= 0) {
            if (typeof showModalError === 'function') showModalError("Primero debe calcular o ingresar el Valor en Aduana.");
            return;
        }
        
        const baseIVA = valAduana + igi + dta + ieps;
        
        const cve = document.querySelector('select[name="cvePedimento"]')?.value;
        let rate = 0.16;
        if (['C1', 'C2', 'C3'].includes(cve)) {
            rate = 0.08;
        }

        const iva = baseIVA * rate;
        
        const ivaInput = document.getElementById('liqIvaImporte');
        if (ivaInput) ivaInput.value = formatter(iva);
    } catch(e) {
        console.error("Error al calcular IVA:", e);
    }
}

function checkPageOverflow() {
    const pages = document.querySelectorAll('.page');
    const lastPage = pages[pages.length - 1];
    const MAX_HEIGHT = 1050; 
    if (lastPage.scrollHeight > MAX_HEIGHT) {
        createNewPage(lastPage);
    }
    updatePageNumbers();
}

function createNewPage(sourcePage) {
    const pageCount = document.querySelectorAll('.page').length + 1;
    const newPage = document.createElement('div');
    newPage.className = 'page page-break';
    newPage.id = 'pagina' + pageCount;
    
    newPage.style.cssText = 'background-color: #ffffff !important; color: #000000 !important;';

    newPage.innerHTML = `
        <table style="background-color: #ffffff !important; color: #000000 !important; width: 100%;">
            <tr>
                <td colspan="12" class="header-title" style="color: #000 !important;">ANEXO DEL PEDIMENTO (Continuación)</td>
                <td colspan="2" class="label text-right" style="color: #000 !important;">Página <span class="page-num">${pageCount}</span> de <span class="total-pages">?</span></td>
            </tr>
             <tr>
                <td colspan="14" class="section-header" style="color: #000 !important; border-bottom: 1px solid #000;">PARTIDAS (Continuación)</td>
            </tr>
            <tr>
                <td class="label" style="color: #000 !important;">FRACCIÓN</td>
                <td class="label" style="color: #000 !important;">SUBD</td>
                <td class="label" style="color: #000 !important;">VINC</td>
                <td class="label" style="color: #000 !important;">MET. VAL</td>
                <td class="label" style="color: #000 !important;">UMC</td>
                <td class="label" style="color: #000 !important;">CANT. UMC</td>
                <td class="label" style="color: #000 !important;">UMT</td>
                <td class="label" style="color: #000 !important;">CANT. UMT</td>
                <td class="label" style="color: #000 !important;">P.V/C</td>
                <td class="label" style="color: #000 !important;">P.O/D</td>
                <td colspan="4" class="label" style="color: #000 !important;">PREFERENCIA / TRATADO</td>
            </tr>
        </table>
    `;

    document.body.appendChild(newPage);

    const table = sourcePage.querySelector('table');
    const partitas = table.querySelectorAll('.partida-tbody');

    if (partitas.length > 0) {
        const lastPartida = partitas[partitas.length - 1];
        const newTable = newPage.querySelector('table');
        newTable.appendChild(lastPartida);
    }
}

function updatePageNumbers() {
    const pages = document.querySelectorAll('.page');
    const total = pages.length;

    const p1 = document.getElementById('pagina1');
    if (p1) {
        const inputs = p1.querySelectorAll('.header-title ~ td input');
        if (inputs.length >= 2) {
            inputs[1].value = total;
        }
    }

    const p2 = document.getElementById('pagina2');
    if (p2) {
        const label = p2.querySelector('.header-title ~ td.label');
        if (label) label.innerHTML = `Página 2 de ${total}`;
    }

    for (let i = 3; i <= total; i++) {
        const p = document.getElementById('pagina' + i);
        if (p) {
            const pageNumSpan = p.querySelector('.page-num');
            const totalPageSpan = p.querySelector('.total-pages');
            if (pageNumSpan) pageNumSpan.innerText = i;
            if (totalPageSpan) totalPageSpan.innerText = total;
        }
    }
}

function syncFooters() {
    const agente = document.querySelector('[name="agenteNombre"]')?.value || "";
    const mandatario = document.querySelector('[name="mandatarioNombre"]')?.value || "";
    const firmaAgente = document.getElementById('footerAgenteFirma');
    const firmaMandatario = document.getElementById('footerMandatarioFirma');
    if (firmaAgente) firmaAgente.innerText = agente.toUpperCase();
    if (firmaMandatario) firmaMandatario.innerText = mandatario.toUpperCase();
}

async function validateAndPrint() {
    const valAduanaPreCheck = parseFloat((document.querySelector('input[name="valorAduana"]')?.value || "0").replace(/,/g, '')) || 0;
    if (valAduanaPreCheck <= 0) calcValorAduana();

    const descripciones = document.querySelectorAll('[name$="[descripcion]"]');
    let hasError = false;
    let hasDesperdicio = false;
    
    descripciones.forEach((desc, idx) => {
        const text = desc.value.toUpperCase();
        if (text.startsWith('DESPERDICIO')) hasDesperdicio = true;
        if ((text.includes('MERMA') || text.includes('DESECHO') || text.includes('SCRAP')) && !text.startsWith('DESPERDICIO')) {
            if (typeof showModalError === 'function') showModalError(`PARTIDA ${idx + 1}: Para el Caso Docente 2, todo residuo debe iniciar con la palabra "DESPERDICIO" para cumplir con el Anexo 22.`);
            desc.style.border = "2px solid red";
            hasError = true;
        } else {
            desc.style.border = "";
        }
    });

    if (hasError) return;

    const cve = document.querySelector('select[name="cvePedimento"]')?.value;
    const valAduana = parseFloat((document.querySelector('input[name="valorAduana"]')?.value || "0").replace(/,/g, '')) || 0;
    const dta = parseFloat((document.getElementById('liqDtaImporte')?.value || "0").replace(/,/g, '')) || 0;
    const cnt = parseFloat((document.getElementById('liqCntImporte')?.value || "0").replace(/,/g, '')) || 0;

    if (valAduana <= 0) {
        if (typeof showModalError === 'function') await showModalError("El 'Valor en Aduana' no puede estar vacío ni ser 0. Ingrese el Valor en Dólares y Tipo de Cambio, o presione el botón ⚡ Calc V.A.");
        else alert("Falta Valor en Aduana.");
        return;
    }

    if (cve === 'F4' && !hasDesperdicio && (document.body.innerText.includes("CASO 2") || document.body.innerText.includes("DESPERDICIO") || document.body.innerText.includes("BOLSAS DE LUJO"))) {
        if (typeof showModalConfirm === 'function') {
            const conf = await showModalConfirm("En un pedimento F4 para desperdicios, al menos una partida debería iniciar con 'DESPERDICIO'. ¿Desea continuar de todos modos?");
            if (!conf) return;
        }
    }

    if (dta === 0 || cnt === 0) {
        if (typeof showModalConfirm === 'function') {
            const conf = await showModalConfirm("DTA o CNT están en 0. Normalmente se cobran en pedimentos de importación. ¿Desea imprimir de todos modos?");
            if (!conf) return;
        }
    }

    window.print();
}

function loadVucemQR() {
    const container = document.getElementById('vucemQrContainer');
    const img = document.getElementById('vucemQrImage');

    let existing = document.getElementById('vucemModal');
    if (existing) { existing.remove(); return; }

    const modal = document.createElement('div');
    modal.id = 'vucemModal';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:10000;display:flex;align-items:center;justify-content:center;';
    modal.innerHTML = `
        <div style="background:#0f172a;border:2px solid #10b981;border-radius:12px;padding:24px;width:360px;color:white;font-family:Arial,sans-serif;box-shadow:0 20px 60px rgba(0,0,0,0.8);">
            <div style="font-size:16px;font-weight:bold;color:#10b981;margin-bottom:16px;">🔒 Sello VUCEM</div>
            <button onclick="vucemAction(1)" style="display:block;width:100%;padding:10px;margin:6px 0;background:#1e293b;color:white;border:1px solid #334155;border-radius:6px;cursor:pointer;text-align:left;font-size:12px;transition:0.2s;" onmouseover="this.style.background='#334155'" onmouseout="this.style.background='#1e293b'">
                <b style="color:#10b981;">1.</b> Generar QR Genérico (Demostración/Auditoría)
            </button>
            <button onclick="vucemAction(2)" style="display:block;width:100%;padding:10px;margin:6px 0;background:#1e293b;color:white;border:1px solid #334155;border-radius:6px;cursor:pointer;text-align:left;font-size:12px;transition:0.2s;" onmouseover="this.style.background='#334155'" onmouseout="this.style.background='#1e293b'">
                <b style="color:#10b981;">2.</b> Pegar URL de Constancia Oficial VUCEM
            </button>
            <button onclick="vucemAction(3)" style="display:block;width:100%;padding:10px;margin:6px 0;background:#1e293b;color:#ef4444;border:1px solid #334155;border-radius:6px;cursor:pointer;text-align:left;font-size:12px;transition:0.2s;" onmouseover="this.style.background='#334155'" onmouseout="this.style.background='#1e293b'">
                <b>3.</b> Eliminar Sello Actual
            </button>
            <div id="vucemUrlInput" style="display:none;margin-top:10px;">
                <input id="vucemUrlField" type="text" placeholder="https://..." style="width:100%;padding:8px;border:1px solid #334155;border-radius:6px;background:#1e293b;color:white;font-size:11px;outline:none;box-sizing:border-box;" />
                <button onclick="vucemApplyUrl()" style="margin-top:6px;padding:6px 16px;background:#10b981;color:white;border:none;border-radius:6px;cursor:pointer;font-size:11px;font-weight:bold;">Aplicar</button>
            </div>
            <button onclick="document.getElementById('vucemModal').remove()" style="display:block;width:100%;padding:8px;margin-top:12px;background:transparent;color:#64748b;border:1px solid #334155;border-radius:6px;cursor:pointer;font-size:11px;">Cancelar</button>
        </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', function(e) { if (e.target === modal) modal.remove(); });
}

function vucemAction(opt) {
    const container = document.getElementById('vucemQrContainer');
    const img = document.getElementById('vucemQrImage');
    const modal = document.getElementById('vucemModal');

    if (opt === 1) {
        const numPed = document.querySelector('[name="pedimentoNum"]').value || "0000000";
        const aduana = document.querySelector('[name="aduanaNum"]').value || "00";
        const qrcodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=VUCEM-FIRMA-PED:${numPed}-ADU:${aduana}-VALIDO`;
        img.src = qrcodeUrl;
        container.style.display = 'none';
        img.style.display = 'block';
        if (modal) modal.remove();
    } else if (opt === 2) {
        document.getElementById('vucemUrlInput').style.display = 'block';
    } else if (opt === 3) {
        img.src = "";
        img.style.display = 'none';
        container.style.display = 'flex';
        if (modal) modal.remove();
    }
}

function vucemApplyUrl() {
    const container = document.getElementById('vucemQrContainer');
    const img = document.getElementById('vucemQrImage');
    const url = document.getElementById('vucemUrlField').value;
    const modal = document.getElementById('vucemModal');
    if (url) {
        img.src = url;
        container.style.display = 'none';
        img.style.display = 'block';
    }
    if (modal) modal.remove();
}

function getCountryOptions() {
    const countries = [
        {c:"AFG",n:"Afganistán"},{c:"ALB",n:"Albania"},{c:"DEU",n:"Alemania"},{c:"AND",n:"Andorra"},{c:"AGO",n:"Angola"},
        {c:"ATG",n:"Antigua y Barbuda"},{c:"SAU",n:"Arabia Saudita"},{c:"DZA",n:"Argelia"},{c:"ARG",n:"Argentina"},
        {c:"ARM",n:"Armenia"},{c:"AUS",n:"Australia"},{c:"AUT",n:"Austria"},{c:"AZE",n:"Azerbayán"},{c:"BHS",n:"Bahamas"},
        {c:"BGD",n:"Bangladés"},{c:"BRB",n:"Barbados"},{c:"BHR",n:"Baréin"},{c:"BEL",n:"Bélgica"},{c:"BLZ",n:"Belice"},
        {c:"BEN",n:"Benín"},{c:"BLR",n:"Bielorrusia"},{c:"MMR",n:"Birmania"},{c:"BOL",n:"Bolivia"},{c:"BIH",n:"Bosnia y Herzegovina"},
        {c:"BWA",n:"Botsuana"},{c:"BRA",n:"Brasil"},{c:"BRN",n:"Brunéi"},{c:"BGR",n:"Bulgaria"},{c:"BFA",n:"Burkina Faso"},
        {c:"BDI",n:"Burundi"},{c:"BTN",n:"Bután"},{c:"CPV",n:"Cabo Verde"},{c:"KHM",n:"Camboya"},{c:"CMR",n:"Camerún"},
        {c:"CAN",n:"Canadá"},{c:"QAT",n:"Catar"},{c:"TCD",n:"Chad"},{c:"CHL",n:"Chile"},{c:"CHN",n:"China"},
        {c:"CYP",n:"Chipre"},{c:"VAT",n:"Ciudad del Vaticano"},{c:"COL",n:"Colombia"},{c:"COM",n:"Comoras"},{c:"PRK",n:"Corea del Norte"},
        {c:"KOR",n:"Corea del Sur"},{c:"CIV",n:"Costa de Marfil"},{c:"CRI",n:"Costa Rica"},{c:"HRV",n:"Croacia"},{c:"CUB",n:"Cuba"},
        {c:"DNK",n:"Dinamarca"},{c:"DMA",n:"Dominica"},{c:"ECU",n:"Ecuador"},{c:"EGY",n:"Egipto"},{c:"SLV",n:"El Salvador"},
        {c:"ARE",n:"Emiratos Árabes Unidos"},{c:"ERI",n:"Eritrea"},{c:"SVK",n:"Eslovaquia"},{c:"SVN",n:"Eslovenia"},{c:"ESP",n:"España"},
        {c:"USA",n:"Estados Unidos"},{c:"EST",n:"Estonia"},{c:"ETH",n:"Etiopía"},{c:"PHL",n:"Filipinas"},{c:"FIN",n:"Finlandia"},
        {c:"FJI",n:"Fiyi"},{c:"FRA",n:"Francia"},{c:"GAB",n:"Gabón"},{c:"GMB",n:"Gambia"},{c:"GEO",n:"Georgia"},
        {c:"GHA",n:"Ghana"},{c:"GRD",n:"Granada"},{c:"GRC",n:"Grecia"},{c:"GTM",n:"Guatemala"},{c:"GUY",n:"Guyana"},
        {c:"GIN",n:"Guinea"},{c:"GNB",n:"Guinea-Bisáu"},{c:"GNQ",n:"Guinea Ecuatorial"},{c:"HTI",n:"Haití"},{c:"HND",n:"Honduras"},
        {c:"HUN",n:"Hungría"},{c:"IND",n:"India"},{c:"IDN",n:"Indonesia"},{c:"IRQ",n:"Irak"},{c:"IRN",n:"Irán"},
        {c:"IRL",n:"Irlanda"},{c:"ISL",n:"Islandia"},{c:"ISR",n:"Israel"},{c:"ITA",n:"Italia"},{c:"JAM",n:"Jamaica"},
        {c:"JPN",n:"Japón"},{c:"JOR",n:"Jordania"},{c:"KAZ",n:"Kazajistán"},{c:"KEN",n:"Kenia"},{c:"KGZ",n:"Kirguistán"},
        {c:"KIR",n:"Kiribati"},{c:"KWT",n:"Kuwait"},{c:"LAO",n:"Laos"},{c:"LSO",n:"Lesoto"},{c:"LVA",n:"Letonia"},
        {c:"LBN",n:"Líbano"},{c:"LBR",n:"Liberia"},{c:"LBY",n:"Libia"},{c:"LIE",n:"Liechtenstein"},{c:"LTU",n:"Lituania"},
        {c:"LUX",n:"Luxemburgo"},{c:"MKD",n:"Macedonia del Norte"},{c:"MDG",n:"Madagascar"},{c:"MYS",n:"Malasia"},{c:"MWI",n:"Malaui"},
        {c:"MDV",n:"Maldivas"},{c:"MLI",n:"Malí"},{c:"MLT",n:"Malta"},{c:"MAR",n:"Marruecos"},{c:"MUS",n:"Mauricio"},
        {c:"MRT",n:"Mauritania"},{c:"MEX",n:"México"},{c:"FSM",n:"Micronesia"},{c:"MDA",n:"Moldavia"},{c:"MCO",n:"Mónaco"},
        {c:"MNG",n:"Mongolia"},{c:"MNE",n:"Montenegro"},{c:"MOZ",n:"Mozambique"},{c:"NAM",n:"Namibia"},{c:"NRU",n:"Nauru"},
        {c:"NPL",n:"Nepal"},{c:"NIC",n:"Nicaragua"},{c:"NER",n:"Níger"},{c:"NGA",n:"Nigeria"},{c:"NOR",n:"Noruega"},
        {c:"NZL",n:"Nueva Zelanda"},{c:"OMN",n:"Omán"},{c:"NLD",n:"Países Bajos"},{c:"PAK",n:"Pakistán"},{c:"PLW",n:"Palaos"},
        {c:"PAN",n:"Panamá"},{c:"PNG",n:"Papúa Nueva Guinea"},{c:"PRY",n:"Paraguay"},{c:"PER",n:"Perú"},{c:"POL",n:"Polonia"},
        {c:"PRT",n:"Portugal"},{c:"GBR",n:"Reino Unido"},{c:"CAF",n:"República Centroafricana"},{c:"CZE",n:"República Checa"},
        {c:"COG",n:"Rep. del Congo"},{c:"COD",n:"Rep. Dem. del Congo"},{c:"DOM",n:"Rep. Dominicana"},{c:"RWA",n:"Ruanda"},{c:"ROU",n:"Rumania"},
        {c:"RUS",n:"Rusia"},{c:"WSM",n:"Samoa"},{c:"KNA",n:"San Cristóbal y Nieves"},{c:"SMR",n:"San Marino"},{c:"VCT",n:"San Vicente y las Granadinas"},
        {c:"LCA",n:"Santa Lucía"},{c:"STP",n:"Santo Tomé y Príncipe"},{c:"SEN",n:"Senegal"},{c:"SRB",n:"Serbia"},{c:"SYC",n:"Seychelles"},
        {c:"SLE",n:"Sierra Leona"},{c:"SGP",n:"Singapur"},{c:"SYR",n:"Siria"},{c:"SOM",n:"Somalia"},{c:"LKA",n:"Sri Lanka"},
        {c:"SWZ",n:"Suazilandia"},{c:"ZAF",n:"Sudáfrica"},{c:"SDN",n:"Sudán"},{c:"SSD",n:"Sudán del Sur"},{c:"SWE",n:"Suecia"},
        {c:"CHE",n:"Suiza"},{c:"SUR",n:"Surinam"},{c:"THA",n:"Tailandia"},{c:"TZA",n:"Tanzania"},{c:"TJK",n:"Tayikistán"},
        {c:"TLS",n:"Timor Oriental"},{c:"TGO",n:"Togo"},{c:"TON",n:"Tonga"},{c:"TTO",n:"Trinidad y Tobago"},{c:"TUN",n:"Túne"},
        {c:"TKM",n:"Turkmenistán"},{c:"TUR",n:"Turquía"},{c:"TUV",n:"Tuvalu"},{c:"UKR",n:"Ucrania"},{c:"UGA",n:"Uganda"},
        {c:"URY",n:"Uruguay"},{c:"UZB",n:"Uzbekistán"},{c:"VUT",n:"Vanuatu"},{c:"VEN",n:"Venezuela"},{c:"VNM",n:"Vietnam"},
        {c:"YEM",n:"Yemen"},{c:"DJI",n:"Yibuti"},{c:"ZMB",n:"Zambia"},{c:"ZWE",n:"Zimbabue"}
    ];
    return countries.map(co => `<option value="${co.c}">${co.c}-${co.n}</option>`).join('');
}

function addGlobalIdRow() {
    const tbody = document.getElementById('globalIdTbody');
    const row = document.createElement('tr');
    row.className = 'glob-id-row';
    row.innerHTML = `
        <td class="data" colspan="2"><input name="globIdClave[]" type="text" style="text-align:center; font-weight:bold;"/></td>
        <td class="data" colspan="4"><input name="globIdC1[]" type="text"/></td>
        <td class="data" colspan="4"><input name="globIdC2[]" type="text"/></td>
        <td class="data" colspan="4"><input name="globIdC3[]" type="text"/></td>
    `;
    tbody.appendChild(row);
    globalIdCount++;
    checkPageOverflow();
}

function checkRectificacion() {
    const cve = document.querySelector('select[name="cvePedimento"]').value;
    const isRect = (cve === 'R1' || cve === 'G7' || cve === 'K2'); 
    const sections = document.querySelectorAll('.rect-section');
    sections.forEach(s => {
        s.style.display = isRect ? (s.tagName === 'TBODY' ? 'table-row-group' : 'table-row') : 'none';
    });
}

function agregarIdentificador() {
    const tbody = document.getElementById('identificadores');
    const row = tbody.querySelector('.ident-row').cloneNode(true);
    row.querySelectorAll('input').forEach(input => {
        input.value = '';
        input.name = input.name.replace(/\[\d+\]/, `[${identCount}]`);
    });
    tbody.appendChild(row);
    identCount++;
    checkPageOverflow();
}

function addContribRow(partidaIdx) {
    const tbodies = document.querySelectorAll('.partida-tbody');
    const tbody = tbodies[partidaIdx];
    if (!tbody) { console.warn('addContribRow: no tbody for partida', partidaIdx); return; }
    
    const anchor = tbody.querySelector('.subtotal-row');
    if (!anchor) { console.warn('addContribRow: no anchor row in tbody', partidaIdx); return; }
    
    const contribCount = tbody.querySelectorAll('.contrib-row').length;
    const row = document.createElement('tr');
    row.className = 'contrib-row';
    row.innerHTML = `
        <td class="data"><input type="text" name="partidas[${partidaIdx}][contribs][${contribCount}][con]"></td>
        <td class="data"><input type="text" name="partidas[${partidaIdx}][contribs][${contribCount}][tasa]"></td>
        <td class="data"><input type="text" name="partidas[${partidaIdx}][contribs][${contribCount}][tt]"></td>
        <td class="data"><select name="partidas[${partidaIdx}][contribs][${contribCount}][fp]"><option value="0">0</option></select></td>
        <td colspan="3" class="data"><input type="text" name="partidas[${partidaIdx}][contribs][${contribCount}][importe]" onblur="this.value = formatter(this.value)"></td>
        <td class="data text-center" colspan="7" style="background:#f8fafc;">
            <button type="button" onclick="this.closest('tr').remove(); calcTotal();" style="font-size:7px; background:#fee2e2; border:1px solid #fecaca; color:#dc2626; border-radius:3px; cursor:pointer;">✕ Quitar</button>
        </td>
    `;
    
    tbody.insertBefore(row, anchor);
    checkPageOverflow();
}

function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    const header = section.previousElementSibling.querySelector('.collapsible-header') || document.querySelector(`[onclick="toggleSection('${sectionId}')"]`);
    section.classList.toggle('show');
    if (header) header.classList.toggle('active');
}

function agregarDescargo() {
    const tbody = document.getElementById('descargos');
    const row = document.createElement('tr');
    row.innerHTML = `
        <td colspan="3" class="data"><input type="text" name="descargo[${descargoCount}][pedOriginal]" placeholder="00 00 0000 0000000"></td>
        <td colspan="3" class="data"><input type="text" name="descargo[${descargoCount}][fechaOriginal]" placeholder="DD/MM/AAAA"></td>
        <td colspan="2" class="data"><input type="text" name="descargo[${descargoCount}][cveAduana]"></td>
        <td colspan="2" class="data"><input type="text" name="descargo[${descargoCount}][patenteOrig]"></td>
        <td colspan="2" class="data"><input type="text" name="descargo[${descargoCount}][cantidad]"></td>
        <td colspan="2" class="data"><input type="text" name="descargo[${descargoCount}][unidad]"></td>
    `;
    tbody.insertBefore(row, tbody.querySelector('.no-print-row'));
    descargoCount++;
}

/**
 * Motor de Carga v6 - Industrializado
 * Mapea JSON a Inputs HTML por name=""
 */
function loadExample(type) {
    resetFormInternal();
    let data = null;

    const MAP = {
        'caso1IN': exampleCaso1IN, 'caso1RT': exampleCaso1RT,
        'caso1F4prod': exampleCaso1F4prod, 'caso1F4desp': exampleCaso1F4desp,
        'caso2IN': exampleCaso2IN, 'caso2RT': exampleCaso2RT,
        'caso2F4prod': exampleCaso2F4prod, 'caso2F4desp': exampleCaso2F4desp,
        'gucciIN': exampleCaso1IN, 'gucciRT': exampleCaso1RT,
        'gucciF4Bolsa': exampleCaso1F4prod, 'gucciF4': exampleCaso1F4desp,
        'amazonGuaymas': exampleAmazonGuaymas, 'maxAmazon': exampleMaxAmazon,
        'minBancos': exampleMinBancos, 'maritimoCNC': exampleMaritimoCNC,
        // Compatibilidad legacy
        'caso1_IN': exampleCaso1IN, 'caso1_RT': exampleCaso1RT,
        'caso1_F4_prod': exampleCaso1F4prod, 'caso1_F4_desp': exampleCaso1F4desp,
        'caso2_IN': exampleCaso2IN, 'caso2_RT': exampleCaso2RT,
        'caso2_F4_prod': exampleCaso2F4prod, 'caso2_F4_desp': exampleCaso2F4desp
    };

    data = MAP[type];
    if (!data) {
        console.error("Ejemplo no encontrado:", type);
        return;
    }

    // 1. Preparar Filas
    if (data.partidas) {
        const rowsToCreate = data.partidas.length;
        for (let i = 0; i < rowsToCreate; i++) agregarPartida();
    }

    // 2. Mapeo Global ID
    ['globIdClave', 'globIdC1', 'globIdC2', 'globIdC3'].forEach(gKey => {
        const val = data[gKey + '[]'] || data[gKey];
        if (val && Array.isArray(val)) {
            val.forEach((v, idx) => {
                const tbody = document.getElementById('globalIdTbody');
                if (tbody) {
                    let row = tbody.querySelectorAll('.glob-id-row')[idx];
                    if (!row) { addGlobalIdRow(); row = tbody.querySelectorAll('.glob-id-row')[idx]; }
                    if (row) { const input = row.querySelector(`[name="${gKey}[]"]`); if (input) input.value = v; }
                }
            });
        }
    });

    // 3. Mapeo de Campos Simples
    for (const [key, value] of Object.entries(data)) {
        if (key === 'partidas' || key.startsWith('globId')) continue;
        const inputs = document.querySelectorAll(`[name="${key}"]`);
        inputs.forEach(input => {
            if (!input) return;
            if (input.tagName === 'SELECT') {
                // Para selects: buscar la opción correcta
                let found = false;
                input.querySelectorAll('option').forEach(opt => {
                    if (opt.value === value) {
                        opt.selected = true;
                        found = true;
                    }
                });
                if (!found) {
                    const newOpt = document.createElement('option');
                    newOpt.value = value;
                    newOpt.textContent = value;
                    newOpt.selected = true;
                    input.appendChild(newOpt);
                }
                input.dispatchEvent(new Event('change'));
            } else {
                input.value = value;
                if (input.tagName === 'TEXTAREA') autoResize(input);
            }
        });
    }

    // 4. Mapeo de Partidas y Contribuciones
    if (data.partidas) {
        const tbodies = document.querySelectorAll('.partida-tbody');
        data.partidas.forEach((pData, pIdx) => {
            const tbody = tbodies[pIdx];
            if (!tbody) { console.warn('No tbody for partida', pIdx); return; }

            // Asegurar que los selects de país tengan todas las opciones cargadas
            if (typeof getCountryOptions === 'function') {
                const opts = getCountryOptions();
                tbody.querySelectorAll('.country-sel-new').forEach(sel => {
                    sel.innerHTML = opts;
                });
            }

            // Inyectar datos de la partida
            Object.keys(pData).forEach(pKey => {
                if (pKey === 'contribs') return;
                const input = tbody.querySelector(`[name="partidas[${pIdx}][${pKey}]"]`);
                if (input) {
                    if (input.tagName === 'SELECT') {
                        // Para selects: buscar la opción que coincida y seleccionarla
                        const opts = input.querySelectorAll('option');
                        let found = false;
                        opts.forEach(opt => {
                            if (opt.value === pData[pKey]) {
                                opt.selected = true;
                                found = true;
                            }
                        });
                        if (!found) {
                            // Si no existe la opción, crearla dinámicamente
                            const newOpt = document.createElement('option');
                            newOpt.value = pData[pKey];
                            newOpt.textContent = pData[pKey];
                            newOpt.selected = true;
                            input.appendChild(newOpt);
                        }
                        input.dispatchEvent(new Event('change'));
                    } else {
                        input.value = pData[pKey];
                        if (input.tagName === 'TEXTAREA') autoResize(input);
                    }
                }
            });

            // Inyectar contribuciones de la partida
            if (pData.contribs) {
                // Los browsers eliminan <tbody> anidados, así que buscamos las contrib-row
                // directamente dentro del partida-tbody padre
                const contribRows = tbody.querySelectorAll('.contrib-row');
                
                pData.contribs.forEach((c, cIdx) => {
                    let row = contribRows[cIdx];
                    if (!row) {
                        // Agregar fila de contribución adicional
                        addContribRow(pIdx);
                        // Re-query después de agregar
                        row = tbody.querySelectorAll('.contrib-row')[cIdx];
                    }
                    if (row) {
                        const fields = ['con', 'tasa', 'tt', 'fp', 'importe'];
                        fields.forEach(f => {
                            const fieldName = f === 'importe' ? 'imp' : f;
                            const input = row.querySelector(`[name*="[${fieldName}]"]`) || row.querySelector(`[name*="[${f}]"]`);
                            if (input) input.value = c[f] || '0';
                        });
                    }
                });
            }
        });
    }

    if (typeof calcTotal === 'function') calcTotal();
    
    const liqFields = [
        'liqIgiFp','liqIgiImporte','liqIvaFp','liqIvaImporte','liqDtaFp','liqDtaImporte',
        'liqIepsFp','liqIepsImporte','liqRecFp','liqRecImporte','liqCcFp','liqCcImporte',
        'liqMtFp','liqMtImporte','liqPrvFp','liqPrvImporte','liqCntFp','liqCntImporte',
        'liqTotal','liqEfectivo','liqOtros'
    ];
    
    liqFields.forEach(key => {
        const val = data[key] !== undefined ? data[key] : data[key.replace('Importe', 'Imp')];
        if (val !== undefined) {
            const el = document.querySelector(`[name="${key}"]`) || document.getElementById(key);
            if (el) el.value = val;
        }
    });
    
    checkPageOverflow();
    
    if (type.startsWith('caso')) {
        const anexo = document.getElementById('pagina2');
        if (anexo) anexo.scrollIntoView({ behavior: 'smooth' });
    }

    console.log("Carga exitosa del caso:", type);
    calcValorAduana(); // Recalcular todo al terminar
    
    // Sincronizar con el motor de cálculos si existe
    if (typeof calculateTaxes === 'function') {
        calculateTaxes();
    }
}
window.loadExample = loadExample;

// ─── AUTO-RESIZE TEXTAREAS ───────────────────────────────────────────────────
function autoResize(el) {
    el.style.height = 'auto';
    el.style.height = (el.scrollHeight) + 'px';
    checkPageOverflow();
}

// ─── GLOBAL VARIABLES ─────────────────────────────────────────────────────────
let identCount = 1;
let globalIdCount = 1;
let descargoCount = 1;
let permisoCount = 1;
let currentZoom = 1;

// ─── ZOOM FUNCTIONALITY ───────────────────────────────────────────────────────
function applyZoom() {
    const container = document.getElementById('pedimentoForm');
    if (!container) return;
    
    // Si el navegador soporta 'zoom' (Chrome/Safari/Edge), es preferible para formularios
    if ('zoom' in document.body.style) {
        container.style.zoom = currentZoom;
        container.style.transform = ''; // Limpiar transform si existía
    } else {
        // Fallback para Firefox u otros
        container.style.transform = `scale(${currentZoom})`;
        container.style.transformOrigin = 'top center';
        
        // Ajustar el contenedor para que no se corte
        const wrapper = container.parentElement;
        if (wrapper) {
            wrapper.style.overflow = 'auto';
            // Añadir margen dinámico basado en el zoom para evitar que el fondo se vea cortado
            const scaledHeight = container.offsetHeight * currentZoom;
            wrapper.style.minHeight = `${scaledHeight}px`;
        }
    }
    console.log("Zoom aplicado:", currentZoom);
}

function zoomIn() {
    currentZoom += 0.1;
    applyZoom();
}

function zoomOut() {
    if (currentZoom > 0.5) {
        currentZoom -= 0.1;
        applyZoom();
    }
}

// Exportar a window para que los onclick de HTML funcionen
window.zoomIn = zoomIn;
window.zoomOut = zoomOut;
window.applyZoom = applyZoom;


// ─── SHOW/HIDE MODAL FUNCTIONS (SIMPLE IMPLEMENTATION) ────────────────────────
function showModalConfirm(message) {
    return new Promise(resolve => {
        const confirmed = confirm(message);
        resolve(confirmed);
    });
}

function showModalError(message) {
    alert(`ERROR: ${message}`);
}

function showCustomAlert(message) {
    alert(message);
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    calcValorAduana();
    syncFooters();
    
    // Initialize country dropdowns
    const countrySelects = document.querySelectorAll('.country-sel-new');
    if (countrySelects.length > 0 && typeof getCountryOptions === 'function') {
        const countryOptions = getCountryOptions();
        countrySelects.forEach(select => {
            select.innerHTML = countryOptions;
        });
    }
    
    // Add event listeners to buttons
    document.getElementById('resetBtn')?.addEventListener('click', resetForm);
    document.getElementById('exportBtn')?.addEventListener('click', exportarPedimento);
    document.getElementById('importFile')?.addEventListener('change', handleImport);
    
    // Add zoom controls
    document.getElementById('zoomInBtn')?.addEventListener('click', zoomIn);
    document.getElementById('zoomOutBtn')?.addEventListener('click', zoomOut);
    
    // Add print validation
    document.getElementById('printBtn')?.addEventListener('click', validateAndPrint);
    
    // Add example loaders
    document.getElementById('loadCaso1_IN')?.addEventListener('click', () => loadExample('caso1_IN'));
    document.getElementById('loadCaso1_RT')?.addEventListener('click', () => loadExample('caso1_RT'));
    document.getElementById('loadCaso1_F4_prod')?.addEventListener('click', () => loadExample('caso1_F4_prod'));
    document.getElementById('loadCaso1_F4_desp')?.addEventListener('click', () => loadExample('caso1_F4_desp'));
    
    document.getElementById('loadCaso2_IN')?.addEventListener('click', () => loadExample('caso2_IN'));
    document.getElementById('loadCaso2_RT')?.addEventListener('click', () => loadExample('caso2_RT'));
    document.getElementById('loadCaso2_F4_prod')?.addEventListener('click', () => loadExample('caso2_F4_prod'));
    document.getElementById('loadCaso2_F4_desp')?.addEventListener('click', () => loadExample('caso2_F4_desp'));

    document.getElementById('loadAmazonGuaymas')?.addEventListener('click', () => loadExample('amazonGuaymas'));
    document.getElementById('loadMaxAmazon')?.addEventListener('click', () => loadExample('maxAmazon'));
    document.getElementById('loadMinBancos')?.addEventListener('click', () => loadExample('minBancos'));
    document.getElementById('loadMaritimoCNC')?.addEventListener('click', () => loadExample('maritimoCNC'));
    
    // Add VUCEM QR functionality
    document.getElementById('vucemQrContainer')?.addEventListener('click', loadVucemQR);
    
    // Initialize first partida
    agregarPartida();
});