
        // --- TOOLTIP LOGIC ---
        function toggleTooltip(element) {
            // Close any other open tooltips
            document.querySelectorAll('.info.active').forEach(el => {
                if (el !== element) el.classList.remove('active');
            });
            // Toggle current
            element.classList.toggle('active');

            // Smart reposition: if tooltip is clipped at top, flip it below
            if (element.classList.contains('active')) {
                const tip = element.querySelector('.tooltip');
                if (tip) {
                    tip.classList.remove('tooltip-below');
                    requestAnimationFrame(() => {
                        const rect = tip.getBoundingClientRect();
                        if (rect.top < 0 || rect.top < 80) {
                            tip.classList.add('tooltip-below');
                        }
                    });
                }
            }
        }

        function closeTooltip(event, button) {
            event.stopPropagation();
            const info = button.closest('.info');
            if (info) info.classList.remove('active');
        }

        // Close on click outside
        document.addEventListener('click', function (event) {
            if (!event.target.closest('.info')) {
                document.querySelectorAll('.info.active').forEach(el => el.classList.remove('active'));
            }
        });

        // --- DATA EXAMPLES ---
        const examples = {
            1: {
                // Header
                tipoOper: "IMP", cvePedimento: "A1", regimen: "IMD",
                numPedimento: "24  24  3456  4001234",
                destino: "MEX", tipoCambio: "18.5000", pesoBruto: "12500.00", aduanaES: "24",

                // Importador/Exportador
                rfcImpExp: "XAXX010101000", curpImpExp: "", nombreImpExp: "IMPORTADORA DE MEXICO S.A. DE C.V.",
                domicilioImpExp: "AV. REFORMA 123, COL. CENTRO, CDMX, CP 06000",

                // Valores
                valorDolares: "50000.00", valorAduana: "925000.00", precioPagado: "50000.00",

                // Tasas
                liqDtaFp: "0", liqDtaImp: "4000",
                liqPrvFp: "0", liqPrvImp: "310",
                // cntFP: "0", cntImporte: "90", // No direct field for CNT
                liqIgiFp: "0", liqIgiImp: "15000",
                liqIvaFp: "0", liqIvaImp: "148000",
                liqEfectivo: "167400",

                // Proveedor
                provIdFiscal: "TAX123456789", provNombre: "GLOBAL SUPPLIERS INC.",
                provDomicilio: "1234 MARKET ST, SAN FRANCISCO, CA, USA",
                provVinculacion: "0", numFactura: "F-2024-001", fechaFactura: "2024-01-15",
                incoterm: "FOB", monedaFact: "USD", valMonFact: "50000.00", valDolaresFact: "50000.00",

                // Transporte
                transpIdentificacion: "TRUCK-01",

                // Partidas (Array)
                partidas: [
                    {
                        fraccion: "8504.40.12", subd: "00", vinc: "0", met: "1", umc: "H87", cantUmc: "100", umt: "H87", cantUmt: "100", pvc: "USA", pod: "USA",
                        sec: "1", descripcion: "FUENTES DE PODER PARA COMPUTADORA MODELO ATX-500",
                        con: "0", tasa: "0", tt: "1", fp: "0", importe: "0",
                        valAduUsd: "25000", impPrecioPag: "25000", precioUnit: "250", valAgreg: "0", efInfo: "ENT",
                        marca: "POWERTECH", modelo: "ATX-500", codProducto: "PT-500"
                    },
                    {
                        fraccion: "8471.60.02", subd: "00", vinc: "0", met: "1", umc: "H87", cantUmc: "50", umt: "H87", cantUmt: "50", pvc: "CHN", pod: "CHN",
                        sec: "2", descripcion: "TECLADOS INALÁMBRICOS USB COLOR NEGRO",
                        con: "0", tasa: "15", tt: "1", fp: "0", importe: "3750",
                        valAduUsd: "25000", impPrecioPag: "25000", precioUnit: "500", valAgreg: "0", efInfo: "ENT",
                        marca: "KEYMASTER", modelo: "KM-WIRELESS", codProducto: "KM-101"
                    }
                ]
            },
            2: {
                // Header
                tipoOper: "EXP", cvePedimento: "A1", regimen: "EXD",
                numPedimento: "24  47  3888  5009876",
                destino: "USA", tipoCambio: "19.2000", pesoBruto: "500.00", aduanaES: "47",

                // Importador/Exportador
                rfcImpExp: "MEX990909000", curpImpExp: "", nombreImpExp: "EXPORTADORA MEXICANA S.A. DE C.V.",
                domicilioImpExp: "CALLE 5 DE MAYO, PUEBLA, PUEBLA",

                // Valores
                valorDolares: "12000.00", valorAduana: "0", precioPagado: "12000.00",

                // Proveedor/Cmp
                provIdFiscal: "CUST-999", provNombre: "US BUYERS LLC",
                provDomicilio: "BROADWAY 500, NEW YORK, NY, USA",
                provVinculacion: "0", numFactura: "EXP-001", fechaFactura: "2024-02-01",
                incoterm: "DAP", monedaFact: "USD", valMonFact: "12000.00", valDolaresFact: "12000.00",

                // Partidas (Muchos items para probar paginación)
                partidas: Array(12).fill({
                    fraccion: "0901.11.01", subd: "00", vinc: "0", met: "1", umc: "KGM", cantUmc: "10", umt: "KGM", cantUmt: "10", pvc: "MEX", pod: "MEX",
                    sec: "1", descripcion: "CAFÉ EN GRANO 100% ARÁBIGA ORGÁNICO",
                    con: "0", tasa: "0", tt: "1", fp: "0", importe: "0",
                    valAduUsd: "1000", impPrecioPag: "1000", precioUnit: "100", valAgreg: "0", efInfo: "ENT",
                    marca: "CAFE MEX", modelo: "ARABICA-SUP", codProducto: "CM-001"
                }).map((p, i) => ({ ...p, sec: i + 1 }))
            }
        };

        function resetForm() {
            if (confirm("¿Borrar todo el formulario y empezar de cero?")) {
                resetFormInternal();
                // Add one empty partida back
                agregarPartida();
                checkPageOverflow();
            }
        }

        function resetFormInternal() {
            document.querySelectorAll('input, select, textarea').forEach(el => {
                if (el.type !== 'button') el.value = '';
            });
            // Clear extra pages
            document.querySelectorAll('.page').forEach((p, i) => {
                if (i > 1) p.remove();
            });
            // Clear all partida tbodies except the first one if it exists, or all if we want a fresh start
            // Clear all partida tbodies
            document.querySelectorAll('.partida-tbody').forEach(tbody => tbody.remove());

            // Re-add one empty partida if we want a fresh start, but resetForm calls adding logic separately.
            // Actually, `resetForm` calls `agregarPartida()` immediately after this.
            // So we just need to ensure all existing are gone.
            identCount = 1; // Reset identifier count
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
        }

        // Example Data
        const exampleMin = {
            numPedimento: "26 07 3480 6001234",
            tipoOper: "IMP",
            cvePedimento: "A1",
            regimen: "IMD",
            destino: "26", // Hermosillo, Sonora
            tipoCambio: "17.1500",
            pesoBruto: "1250",
            aduanaES: "070", // Aduana de Nogales
            rfcImpExp: "FSI120304ABC",
            nombreImpExp: "FT SOLUCIONES INDUSTRIALES S.A. DE C.V.",
            domicilioImpExp: "CALLE INDUSTRIAL 123, COL. CENTRO, HERMOSILLO, SONORA, CP 83000",
            valorDolares: "5420.00",
            valorAduana: "92953.00",
            precioPagado: "92953.00",
            valSeguros: "0",
            seguros: "0",
            fletes: "850.00",
            embalajes: "0",
            otrosIncr: "150",
            liqIgiFp: "0", liqIgiImp: "4648.00",
            liqIvaFp: "0", liqIvaImp: "15616.00",
            liqDtaFp: "0", liqDtaImp: "743.00",
            liqPrvFp: "0", liqPrvImp: "310.00",
            liqCntFp: "0", liqCntImp: "70.00",
            liqTotal: "21387.00",
            liqEfectivo: "21387.00",
            partidas: [
                {
                    fraccion: "9403.90.01", subd: "00", vinc: "0", met: "1", umc: "PZA", cantUmc: "100", umt: "PZA", cantUmt: "100",
                    pvc: "MEX", pod: "MEX", valAduUsd: "3500.00", impPrecioPag: "3500.00", precioUnit: "35.00", 
                    descripcion: "ESTRUCTURA DE HIERRO PARA ENSAMBLE DE BANCOS INDUSTRIALES", marca: "HEAVY-DUTY", modelo: "IND-2026"
                },
                {
                    fraccion: "4407.11.99", subd: "00", vinc: "0", met: "1", umc: "KGM", cantUmc: "250", umt: "KGM", cantUmt: "250",
                    pvc: "USA", pod: "USA", valAduUsd: "1200.00", impPrecioPag: "1200.00", precioUnit: "4.80", 
                    descripcion: "MADERA ASERRADA DE PINO (TABLONES) PARA ASIENTOS DE BANCO", marca: "PACIFIC-WOOD", modelo: "GRADE-A"
                },
                {
                    fraccion: "7318.15.99", subd: "00", vinc: "0", met: "1", umc: "KGM", cantUmc: "50", umt: "KGM", cantUmt: "50",
                    pvc: "ISR", pod: "ISR", valAduUsd: "450.00", impPrecioPag: "450.00", precioUnit: "9.00", 
                    descripcion: "TORNILLOS DE ACERO GALVANIZADO DE ALTA RESISTENCIA", marca: "ISRA-FIX", modelo: "M8-HEX"
                },
                {
                    fraccion: "3208.90.99", subd: "00", vinc: "0", met: "1", umc: "LTR", cantUmc: "20", umt: "LTR", cantUmt: "20",
                    pvc: "USA", pod: "USA", valAduUsd: "270.00", impPrecioPag: "270.00", precioUnit: "13.50", 
                    descripcion: "ESMALTE INDUSTRIAL DTM COLOR AZUL PARA ACABADO DE BANCOS", marca: "COLOR-MAX", modelo: "IND-GLOSS"
                }
            ]
        };

        const exampleMax = {
            numPedimento: "26  47  3480  6009876",
            tipoOper: "IMP",
            cvePedimento: "A1",
            regimen: "IMD",
            destino: "09", // CDMX
            tipoCambio: "17.0000",
            pesoBruto: "8540.50",
            aduanaES: "470", // AICM
            valorDolares: "45800.75",
            valorAduana: "778612.75",
            precioPagado: "778,612.75",
            rfcImpExp: "SCA110515ABC",
            nombreImpExp: "SERVICIOS COMERCIALES AMAZON MEXICO S. DE R.L. DE C.V.",
            domicilioImpExp: "JUAN SALVADOR AGRAZ 73, PISO 5, COL. LOMAS DE SANTA FE, CUAJIMALPA, CDMX, CP 05109",
            valSeguros: "450",
            seguros: "450",
            fletes: "12500.00",
            embalajes: "200",
            otrosIncr: "150",
            liqIgiFp: "0", liqIgiImp: "155730.00",
            liqIvaFp: "0", liqIvaImp: "192360.00",
            liqDtaFp: "0", liqDtaImp: "6228.00",
            liqPrvFp: "0", liqPrvImp: "310.00",
            liqCntFp: "0", liqCntImp: "70.00",
            liqTotal: "354698.00",
            liqEfectivo: "354698.00",
            partidas: [
                { fraccion: "8471.30.01", subd: "00", vinc: "0", met: "1", umc: "H87", cantUmc: "50", umt: "H87", cantUmt: "50", pvc: "CHN", pod: "CHN", valAduUsd: "15000.00", impPrecioPag: "15000.00", precioUnit: "300.00", descripcion: "TABLETAS ELECTRÓNICAS KINDLE PAPERWHITE 11A GEN", marca: "AMAZON", modelo: "KINDLE-PW-11" },
                { fraccion: "8518.21.01", subd: "00", vinc: "0", met: "1", umc: "H87", cantUmc: "100", umt: "H87", cantUmt: "100", pvc: "VNM", pod: "VNM", valAduUsd: "4500.00", impPrecioPag: "4500.00", precioUnit: "45.00", descripcion: "ASISTENTES VIRTUALES ECHO DOT 5A GENERACIÓN", marca: "AMAZON", modelo: "ECHO-DOT-5" },
                { fraccion: "8528.71.01", subd: "00", vinc: "0", met: "1", umc: "H87", cantUmc: "80", umt: "H87", cantUmt: "80", pvc: "CHN", pod: "CHN", valAduUsd: "3200.00", impPrecioPag: "3200.00", precioUnit: "40.00", descripcion: "DISPOSITIVOS DE STREAMING FIRE TV STICK 4K MAX", marca: "AMAZON", modelo: "FIRE-STICK-4K" },
                { fraccion: "8471.30.01", subd: "00", vinc: "0", met: "1", umc: "H87", cantUmc: "10", umt: "H87", cantUmt: "10", pvc: "USA", pod: "USA", valAduUsd: "12000.00", impPrecioPag: "12000.00", precioUnit: "1200.00", descripcion: "LAPTOPS MACBOOK AIR 13-INCH M2 CHIP", marca: "APPLE", modelo: "MBA-13-M2" },
                { fraccion: "8517.62.01", subd: "00", vinc: "0", met: "1", umc: "H87", cantUmc: "25", umt: "H87", cantUmt: "25", pvc: "MYS", pod: "MYS", valAduUsd: "3500.00", impPrecioPag: "3500.00", precioUnit: "140.00", descripcion: "ROUTERS INALÁMBRICOS EERO 6 MESH WIFI SYSTEM", marca: "EERO", modelo: "6-MESH" },
                { fraccion: "8518.30.01", subd: "00", vinc: "0", met: "1", umc: "H87", cantUmc: "60", umt: "H87", cantUmt: "60", pvc: "CHN", pod: "CHN", valAduUsd: "5400.00", impPrecioPag: "5400.00", precioUnit: "90.00", descripcion: "AUDÍFONOS INALÁMBRICOS CON CANCELACIÓN DE RUIDO", marca: "SONY", modelo: "WH1000XM4" },
                { fraccion: "8471.60.01", subd: "00", vinc: "0", met: "1", umc: "H87", cantUmc: "30", umt: "H87", cantUmt: "30", pvc: "CHN", pod: "CHN", valAduUsd: "1800.00", impPrecioPag: "1800.00", precioUnit: "60.00", descripcion: "TECLADOS MECÁNICOS PARA GAMING RGB", marca: "RAZER", modelo: "BLACKWIDOW" },
                { fraccion: "8471.60.01", subd: "00", vinc: "0", met: "1", umc: "H87", cantUmc: "40", umt: "H87", cantUmt: "40", pvc: "TWN", pod: "TWN", valAduUsd: "1200.00", impPrecioPag: "1200.00", precioUnit: "30.00", descripcion: "RATONES INALÁMBRICOS ERGONÓMICOS MX MASTER", marca: "LOGITECH", modelo: "MX-MASTER-3" },
                { fraccion: "8525.80.01", subd: "00", vinc: "0", met: "1", umc: "H87", cantUmc: "15", umt: "H87", cantUmt: "15", pvc: "CHN", pod: "CHN", valAduUsd: "2250.00", impPrecioPag: "2250.00", precioUnit: "150.00", descripcion: "CÁMARAS DE SEGURIDAD INTELIGENTES RING INDOOR", marca: "RING", modelo: "STICK-UP-CAM" },
                { fraccion: "8544.42.01", subd: "00", vinc: "0", met: "1", umc: "KGM", cantUmc: "5", umt: "KGM", cantUmt: "5", pvc: "CHN", pod: "CHN", valAduUsd: "250.00", impPrecioPag: "250.00", precioUnit: "50.00", descripcion: "CABLES USB-C DE ALTA VELOCIDAD (PACK 3)", marca: "AMAZON-BASICS", modelo: "USBC-CB-3" }
            ]
        };

        const exampleMaritimo = {
            numPedimento: "26  43  1234  7000001",
            tipoOper: "IMP",
            cvePedimento: "A1",
            regimen: "IMD",
            destino: "GBR",
            tipoCambio: "18.5000",
            pesoBruto: "7900",
            aduanaES: "43",
            medioTranspArribo: "3",
            medioTranspSalida: "7",
            valorDolares: "65,000.00",
            valorAduana: "1,202,500.00",
            precioPagado: "1,202,500.00",
            rfcImpExp: "CERR040101XXX",
            nombreImpExp: "Roberto Eduardo Celis Robles",
            domicilioImpExp: "Hermosillo, Sonora, México.",
            provIdFiscal: "GB123456789", 
            provNombre: "LONDON LASER SYSTEMS LTD",
            provDomicilio: "78 INDUSTRIAL ROAD, SHEFFIELD, UK",
            provVinculacion: "0", 
            numFactura: "INV-2026-0089", 
            fechaFactura: "15/03/2026",
            incoterm: "CFR", 
            monedaFact: "USD", 
            valMonFact: "65000.00", 
            valDolaresFact: "65000.00",
            eDocumentVucem: "2601EDC987654321",
            tipoDocumentoVucem: "002",
            transpIdentificacion: "M/V MSC AMSTERDAM",
            numeroGuia: "GBVER20260401MSC",
            contenedor: "MSKU9876543 / 40HC",
            transportista: "MEDITERRANEAN SHIPPING COMPANY",
            transpRfc: "MSC950101XYZ",
            transpCurp: "",
            transpDomicilio: "AV. INDEPENDENCIA 123, VERACRUZ, MEX",
            numCandado: "C-987654",
            primeraRevision: "SIN INCIDENCIAS",
            numTipo: "1/40HC",
            agenteNombre: "ROBERTO EDUARDO CELIS ROBLES",
            agenteRfc: "CERR041209",
            agenteCurp: "CERR041209HSRLBB06",
            mandatarioNombre: "ANA LOPEZ MARTINEZ",
            mandatarioRfc: "LOMA850202ABC",
            mandatarioCurp: "LOMA850202MSRLLN02",
            agentePatente: "3147",
            numSerieCertificado: "00001000000504567890",
            firmaElectronica: "f7d8e9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8",
            "globIdClave[]": "TL",
            "globIdC1[]": "GBR",
            "globIdC2[]": "",
            "globIdC3[]": "",
            valSeguros: "450",
            fletes: "3500.00",
            valEmbalajes: "0",
            valOtros: "0",
            transporteDecrem: "0",
            seguroDecrem: "0",
            cargaDecrem: "0",
            descargaDecrem: "0",
            otrosDecrem: "0",
            acuseElectronico: "AE20264331470001",
            "descargo[0][pedOriginal]": "25 43 3147 5000123",
            "descargo[0][fechaOriginal]": "10/01/2026",
            "descargo[0][cveAduana]": "43",
            "descargo[0][patenteOrig]": "3147",
            "descargo[0][cantidad]": "1",
            "descargo[0][unidad]": "06",
            "permiso[0][cvePermiso]": "NOM",
            "permiso[0][numPermiso]": "NOM-019-SCFI-2026-987",
            "permiso[0][firmaDescargo]": "VALIDO-9988",
            "permiso[0][valComercial]": "65000.00",
            "permiso[0][cantidad]": "1",
            liqIgiFp: "0", liqIgiImp: "0.00",
            liqIvaFp: "0", liqIvaImp: "192400.00", // Roughly 16% of 1,202,500
            liqDtaFp: "0", liqDtaImp: "9620.00", // 0.008 * 1,202,500
            liqPrvFp: "0", liqPrvImp: "310.00",
            liqCntFp: "0", liqCntImp: "70.00",
            liqTotal: "202400.00", // PRV + CNT + DTA + IVA
            liqEfectivo: "202400.00",
            partidas: [
                {
                    fraccion: "8456.11.01",
                    subd: "01",
                    vinc: "0",
                    met: "1",
                    umc: "06",
                    cantUmc: "1",
                    umt: "06",
                    cantUmt: "1",
                    pvc: "GBR",
                    pod: "GBR",
                    valAduUsd: "65000.00",
                    impPrecioPag: "65000.00",
                    precioUnit: "65000.00",
                    descripcion: "MÁQUINA INDUSTRIAL CNC DE CORTE LÁSER DE FIBRA 6000W MODELO G3060P60 Y ACCESORIOS (CHILLER, EXTRACTOR, TRANSFORMADOR)",
                    marca: "FORZA",
                    modelo: "G3060P60",
                    con: "IGI", 
                    tasa: "0", 
                    fp: "0", 
                    importe: "0",
                    "ident[0][clave]": "TL",
                    "ident[0][comp1]": "GBR"
                }
            ]
        };

        const exampleAmazon = {
            referencia: "AMZ-GUY-20ITEMS-V1",
            numPedimento: "26 16 3147 6000001", // Aduana 160 (Guaymas)
            tipoOper: "IMP",
            cvePedimento: "A1",
            regimen: "IMD",
            destino: "SON", 
            tipoCambio: "18.50",
            pesoBruto: "32500.0",
            aduanaES: "16", 
            cveSeccion: "160",
            medioTranspArribo: "3", 
            medioTranspSalida: "7", 
            valorDolares: "116500.00",
            valorAduana: "2155250.00",
            precioPagado: "2155250.00",
            valSeguros: "15500",
            seguros: "15500",
            fletes: "62500.00",
            embalajes: "4500",
            otrosIncr: "12500.00",
            carga: "5500.00",
            descarga: "4500.00",
            marcasBultos: "22 PALETS C/ 1,450 CAJAS (FLEJADO Y ETIQUETADO QR)",
            acuseValidacion: "AV-2601-AMZ-ULTRALIVE-001",
            fechaEntradaPed: "08/04/2026",
            fechaPago: "08/04/2026",
            tasaContrib: "IGI", 
            tasaCve: "1", 
            tasa: "0",
            rfcImpExp: "AME121105990",
            nombreImpExp: "AMAZON MEXICO S. DE R.L. DE C.V.",
            curpImpExp: "AME121105HDFRRR01",
            domicilioImpExp: "CALLE DE LOS EMBARQUES 500, PARQUE INDUSTRIAL, HERMOSILLO, SONORA, CP 83000",
            provIdFiscal: "91-16383XX",
            provNombre: "AMAZON SALES LLC (GLOBAL OPERATIONS)",
            provDomicilio: "410 TERRY AVE N, SEATTLE, WA 98109, USA",
            provVinculacion: "0",
            numFactura: "AMZ-CONTAINER-2026-X",
            fechaFactura: "07/04/2026",
            incoterm: "CIF",
            monedaFact: "USD",
            valMonFact: "116500.00",
            valDolaresFact: "116500.00",
            eDocumentVucem: "2601AMZHQ987654321",
            tipoDocumentoVucem: "002",
            transpIdentificacion: "MSK ALTAIR V.99 / TRACTO-KENWORTH-88",
            numeroGuia: "MAERSK-GUY-2026-001",
            contenedor: "MSKU-887766-5 / 40HC HIGH CUBE",
            transportista: "MAERSK LOGISTICS MEXICO S.A.",
            transpRfc: "MLM900101XYZ",
            transpDomicilio: "RECINTO PORTUARIO GUAYMAS, SONORA, MEX",
            numCandado: "ANAM-998877-SECURE",
            primeraRevision: "CUMPLE 100% FISCALIZACION ANAM",
            numTipo: "1/40HC",
            agenteNombre: "ROBERTO EDUARDO CELIS ROBLES",
            agenteRfc: "CERR041209",
            agenteCurp: "CERR041209HSRLBB06",
            mandatarioNombre: "ANA LOPEZ MARTINEZ",
            mandatarioRfc: "LOMA850202ABC",
            mandatarioCurp: "LOMA850202MSRLLN02",
            agentePatente: "3147",
            numSerieCertificado: "00001000000504567890",
            firmaElectronica: "e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8",
            "globIdClave[]": "PR",
            "globIdC1[]": "USA",
            liqIgiFp: "0", liqIgiImp: "107760.00",
            liqIvaFp: "0", liqIvaImp: "362140.00",
            liqDtaFp: "0", liqDtaImp: "17242.00",
            liqPrvFp: "0", liqPrvImp: "310.00",
            liqCntFp: "0", liqCntImp: "70.00",
            liqTotal: "487522.00",
            liqEfectivo: "487522.00",
            observaciones: "CARGA CONSOLIDADA EN CONTENEDOR 40HC. TODA LA MERCANCÍA CUMPLE CON NOM-001-SCFI-2018. EMBARQUE PRIORITARIO PARA AMAZON HUB HERMOSILLO. ESTE PEDIMENTO AMPARA 20 PARTIDAS DIVERSAS DE PRODUCTOS ELECTRONICOS, HOGAR Y CONSUMO.",
            partidas: [
                { fraccion: "8518.22.01", subd: "01", vinc: "0", met: "1", umc: "06", cantUmc: "850", umt: "06", cantUmt: "850", pvc: "CHN", pod: "MEX", valAduUsd: "25500.00", impPrecioPag: "25500.00", precioUnit: "30.00", descripcion: "JBL SPEAKERS XL-SERIES PRO", marca: "JBL", modelo: "G2-PRO", codProducto: "050036902939", contribs: [
                    { con: "IGI", tasa: "5", tt: "1", fp: "0", imp: "23580" },
                    { con: "DTA", tasa: "8 al millar", tt: "1", fp: "0", imp: "374" }
                ]},
                { fraccion: "8471.30.01", subd: "01", vinc: "0", met: "1", umc: "06", cantUmc: "500", umt: "06", cantUmt: "500", pvc: "VNM", pod: "MEX", valAduUsd: "15000.00", impPrecioPag: "15000.00", precioUnit: "30.00", descripcion: "AMAZON ECHO GEN 6 - SMART HUB", marca: "AMAZON", modelo: "ECH6-BLACK", codProducto: "AMZ-ECH6-B", contribs: [{ con: "IGI", tasa: "0", tt: "1", fp: "0", imp: "0" }] },
                { fraccion: "8471.30.01", subd: "01", vinc: "0", met: "1", umc: "06", cantUmc: "300", umt: "06", cantUmt: "300", pvc: "CHN", pod: "MEX", valAduUsd: "12000.00", impPrecioPag: "12000.00", precioUnit: "40.00", descripcion: "KINDLE PAPERWHITE 11TH GEN", marca: "AMAZON", modelo: "KND-P11", codProducto: "AMZ-KND-11", contribs: [{ con: "IGI", tasa: "0", tt: "1", fp: "0", imp: "0" }] },
                { fraccion: "8517.62.01", subd: "01", vinc: "0", met: "1", umc: "06", cantUmc: "1000", umt: "06", cantUmt: "1000", pvc: "MYS", pod: "MEX", valAduUsd: "15000.00", impPrecioPag: "15000.00", precioUnit: "15.00", descripcion: "NETWORK ADAPTERS DATA CENTER", marca: "AMAZON BASICS", modelo: "ETH-AD-01", codProducto: "840080503690", contribs: [{ con: "IGI", tasa: "0", tt: "1", fp: "0", imp: "0" }] },
                { fraccion: "8528.72.06", subd: "01", vinc: "0", met: "1", umc: "06", cantUmc: "200", umt: "06", cantUmt: "200", pvc: "USA", pod: "MEX", valAduUsd: "8000.00", impPrecioPag: "8000.00", precioUnit: "40.00", descripcion: "FIRE TV STICK 4K MAX", marca: "AMAZON", modelo: "FTV-4K-MAX", codProducto: "AMZ-FTV-4K", contribs: [{ con: "IGI", tasa: "0", tt: "1", fp: "0", imp: "0" }] },
                { fraccion: "6302.60.01", subd: "01", vinc: "0", met: "1", umc: "06", cantUmc: "500", umt: "01", cantUmt: "120", pvc: "IND", pod: "MEX", valAduUsd: "5000.00", impPrecioPag: "5000.00", precioUnit: "10.00", descripcion: "COTTON TOWEL SETS", marca: "PINZON", modelo: "TOWL-XL", codProducto: "190123456789", contribs: [{ con: "IGI", tasa: "15", tt: "1", fp: "0", imp: "13500" }] },
                { fraccion: "9404.90.99", subd: "01", vinc: "0", met: "1", umc: "06", cantUmc: "150", umt: "06", cantUmt: "150", pvc: "VNM", pod: "MEX", valAduUsd: "4500.00", impPrecioPag: "4500.00", precioUnit: "30.00", descripcion: "MEMORY FOAM PILLOWS", marca: "AMAZON BASICS", modelo: "PILLOW-MF", codProducto: "AMZ-MFP-PRO", contribs: [{ con: "IGI", tasa: "10", tt: "1", fp: "0", imp: "8200" }] },
                { fraccion: "8211.91.01", subd: "01", vinc: "0", met: "1", umc: "06", cantUmc: "100", umt: "06", cantUmt: "100", pvc: "CHN", pod: "MEX", valAduUsd: "2500.00", impPrecioPag: "2500.00", precioUnit: "25.00", descripcion: "STAINLESS STEEL KNIFE SET", marca: "AMAZON BASICS", modelo: "KITCH-12PC", codProducto: "789012345671", contribs: [{ con: "IGI", tasa: "15", tt: "1", fp: "0", imp: "6800" }] },
                { fraccion: "8509.40.01", subd: "01", vinc: "0", met: "1", umc: "06", cantUmc: "80", umt: "06", cantUmt: "80", pvc: "USA", pod: "MEX", valAduUsd: "3200.00", impPrecioPag: "3200.00", precioUnit: "40.00", descripcion: "ELECTRIC COUNTERTOP BLENDER", marca: "NUTRIBULLET", modelo: "NB-600", codProducto: "NB-600-CODE", contribs: [{ con: "IGI", tasa: "10", tt: "1", fp: "0", imp: "5800" }] },
                { fraccion: "9503.00.01", subd: "01", vinc: "0", met: "1", umc: "06", cantUmc: "120", umt: "06", cantUmt: "120", pvc: "DNK", pod: "MEX", valAduUsd: "6000.00", impPrecioPag: "6000.00", precioUnit: "50.00", descripcion: "CONSTRUCTION TOY SETS", marca: "LEGO", modelo: "42151-BO", codProducto: "673419339239", contribs: [{ con: "IGI", tasa: "0", tt: "1", fp: "0", imp: "0" }] },
                { fraccion: "8471.60.03", subd: "01", vinc: "0", met: "1", umc: "06", cantUmc: "200", umt: "06", cantUmt: "200", pvc: "CHN", pod: "MEX", valAduUsd: "2000.00", impPrecioPag: "2000.00", precioUnit: "10.00", descripcion: "WIRELESS OPTICAL MOUSE", marca: "LOGITECH", modelo: "M185-SILVER", codProducto: "LOGI-M185", contribs: [{ con: "IGI", tasa: "0", tt: "1", fp: "0", imp: "0" }] },
                { fraccion: "8471.60.02", subd: "01", vinc: "0", met: "1", umc: "06", cantUmc: "100", umt: "06", cantUmt: "100", pvc: "CHN", pod: "MEX", valAduUsd: "3000.00", impPrecioPag: "3000.00", precioUnit: "30.00", descripcion: "MECHANICAL GAMING KEYBOARD", marca: "LOGITECH", modelo: "G-PRO-K", codProducto: "097855156005", contribs: [{ con: "IGI", tasa: "0", tt: "1", fp: "0", imp: "0" }] },
                { fraccion: "8518.30.04", subd: "01", vinc: "0", met: "1", umc: "06", cantUmc: "150", umt: "06", cantUmt: "150", pvc: "VNM", pod: "MEX", valAduUsd: "3750.00", impPrecioPag: "3750.00", precioUnit: "25.00", descripcion: "OVER-EAR HEADPHONES NC", marca: "BOSE", modelo: "QC-45", codProducto: "017817847420", contribs: [{ con: "IGI", tasa: "0", tt: "1", fp: "0", imp: "0" }] },
                { fraccion: "8525.89.01", subd: "01", vinc: "0", met: "1", umc: "06", cantUmc: "50", umt: "06", cantUmt: "50", pvc: "USA", pod: "MEX", valAduUsd: "2500.00", impPrecioPag: "2500.00", precioUnit: "50.00", descripcion: "SMART VIDEO DOORBELL", marca: "RING", modelo: "DB-GEN2", codProducto: "840080563458", contribs: [{ con: "IGI", tasa: "0", tt: "1", fp: "0", imp: "0" }] },
                { fraccion: "8414.51.01", subd: "01", vinc: "0", met: "1", umc: "06", cantUmc: "100", umt: "06", cantUmt: "100", pvc: "CHN", pod: "MEX", valAduUsd: "2000.00", impPrecioPag: "2000.00", precioUnit: "20.00", descripcion: "USB DESK FAN SILENT", marca: "AMAZON BASICS", modelo: "FAN-10-BK", codProducto: "AMZ-FAN-10", contribs: [{ con: "IGI", tasa: "10", tt: "1", fp: "0", imp: "3650" }] },
                { fraccion: "3924.10.01", subd: "01", vinc: "0", met: "1", umc: "06", cantUmc: "300", umt: "06", cantUmt: "300", pvc: "USA", pod: "MEX", valAduUsd: "1500.00", impPrecioPag: "1500.00", precioUnit: "5.00", descripcion: "PLASTIC FOOD STORAGE SET", marca: "RUBBERMAID", modelo: "BRILL-10PC", codProducto: "071691123456", contribs: [{ con: "IGI", tasa: "15", tt: "1", fp: "0", imp: "4100" }] },
                { fraccion: "8544.42.04", subd: "01", vinc: "0", met: "1", umc: "06", cantUmc: "1000", umt: "06", cantUmt: "1000", pvc: "CHN", pod: "MEX", valAduUsd: "3000.00", impPrecioPag: "3000.00", precioUnit: "3.00", descripcion: "USB-C CHARGING CABLE 6FT", marca: "AMAZON BASICS", modelo: "CAB-USBC-6", codProducto: "AMZ-CBL-C6", contribs: [{ con: "IGI", tasa: "0", tt: "1", fp: "0", imp: "0" }] },
                { fraccion: "3305.10.01", subd: "01", vinc: "0", met: "1", umc: "06", cantUmc: "200", umt: "01", cantUmt: "100", pvc: "MEX", pod: "MEX", valAduUsd: "1000.00", impPrecioPag: "1000.00", precioUnit: "5.00", descripcion: "SHAMPOO REPAIR PRO-V", marca: "PANTENE", modelo: "PROV-REP", codProducto: "800123456789", contribs: [{ con: "IGI", tasa: "10", tt: "1", fp: "0", imp: "1820" }] },
                { fraccion: "0901.21.01", subd: "01", vinc: "0", met: "1", umc: "06", cantUmc: "400", umt: "01", cantUmt: "100", pvc: "COL", pod: "MEX", valAduUsd: "2000.00", impPrecioPag: "2000.00", precioUnit: "5.00", descripcion: "ROASTED WHOLE BEAN COFFEE", marca: "STARBUCKS", modelo: "COL-DARK", codProducto: "AMZ-COF-COL", contribs: [{ con: "IGI", tasa: "0", tt: "1", fp: "0", imp: "0" }] },
                { fraccion: "9603.21.01", subd: "01", vinc: "0", met: "1", umc: "06", cantUmc: "600", umt: "06", cantUmt: "600", pvc: "USA", pod: "MEX", valAduUsd: "1800.00", impPrecioPag: "1800.00", precioUnit: "3.00", descripcion: "SOFT BRISTLE TOOTHBRUSHES", marca: "ORAL-B", modelo: "SOFT-3PC", codProducto: "041234567890", contribs: [{ con: "IGI", tasa: "15", tt: "1", fp: "0", imp: "4830" }] }
            ]
        };

        /* ============================================================
           TAREA 4 – GUCCI: BOLSAS DE LUJO (EXPORTACIÓN IMMEX)
           Escenario:
           • Empresa maquiladora exporta 10,000 bolsas de cuero de lujo.
           • Materiales importados temporalmente:
               – Cuero vacuno curtido (50×30 cm/bolsa) – Origen: IRÁN
               – Hilo 100% nylon multifilamento – Origen: ITALIA
               – Cierre de dientes metálicos (zipper) – Origen: MÉXICO (nacional)
           • Cambio de régimen: 2,000 piezas a valor de desperdicio del 5%.
           • Pedimento tipo H1 (Exportación por cambio de régimen IMMEX).
           • Aduana de salida: Aeropuerto Internacional de Guadalajara (48).
           Cálculos base:
           • Precio FOB exportación: USD $95.00 / bolsa
           • 10,000 bolsas × $95.00 = USD 950,000.00 (Valor Comercial)
           • TC DOF 14/04/2026 = $17.1500 MXN/USD
           • Valor Comercial MXN = $16,292,500.00
           • Exportación IMMEX sin IGI; IVA tasa 0%; DTA cuota fija $463 MXN.
           Cambio de régimen (desperdicio 5%):
           • 2,000 pzas – valor CIF material importado temp: USD $14.50/bolsa
           • Valor desperdicio: $14.50 × 5% = $0.725/bolsa × 2,000 = USD $1,450.00
           • Base gravable MXN: $1,450 × 17.1500 = $24,867.50
           • IGI cuero iraní (4107.11.01) sin tratado: 10%  → $2,486.75
           • IVA: ($24,867.50 + $2,486.75) × 16% = $4,376.84
           • DTA: cuota fija export/IMMEX = $463.00
           ============================================================ */
            // ============================================================
            // TAREA 4 – GUCCI: INSUMOS BOLSAS DE LUJO (IMPORTACIÓN TEMPORAL)
            // ============================================================
        const exampleGucci = {
            referencia: "GUCCI-MEX-IMPORT-T4-2026",
            numPedimento: "26  48  3480  7000042",
            tipoOper: "IMP",
            cvePedimento: "IN",
            regimen: "ITE",
            destino: "14",
            tipoCambio: "17.1500",
            pesoBruto: "3850.00",
            aduanaES: "48",
            cveSeccion: "480",
            medioTranspArribo: "7",
            medioTranspSalida: "7",
            valorDolares: "39,690.00",
            valorAduana: "682,500.00",
            precioPagado: "680,683.00",
            valSeguros: "1,200.00",
            seguros: "1,200.00",
            fletes: "4,200.00",
            valEmbalajes: "0",
            valOtros: "0",
            transporteDecrem: "0",
            seguroDecrem: "0",
            cargaDecrem: "0",
            descargaDecrem: "0",
            otrosDecrem: "0",
            marcasBultos: "4 PALLETS C/ ROLLOS DE CUERO NAPA Y CAJAS DE HILO",
            acuseElectronico: "AE26480348070042GCC",
            acuseValidacion: "AV-2648-GUCCI-LUXURY-042",
            fechaEntradaPed: "14/04/2026",
            fechaPago: "14/04/2026",
            rfcImpExp: "GBW000001AB6",
            nombreImpExp: "GUCCI BOLSOS DE MANO MEXICO S.A. DE C.V.",
            curpImpExp: "",
            domicilioImpExp: "BLVD. PUERTA DE HIERRO 4965-A, PISO 2, ZAPOPAN, JAL, CP 45116",
            provIdFiscal: "IRN-10102567891",
            provNombre: "IRAN LEATHER TANNING INDUSTRIES CO.",
            provDomicilio: "TABRIZ INDUSTRIAL ZONE, EAST AZERBAIJAN, IRAN",
            provVinculacion: "0",
            numFactura: "IRN-MEX-2026-0042",
            fechaFactura: "10/04/2026",
            incoterm: "CIF",
            monedaFact: "USD",
            valMonFact: "39,690.00",
            valDolaresFact: "39,690.00",
            eDocumentVucem: "2648GCCJAL000042IRN",
            tipoDocumentoVucem: "003",
            transpIdentificacion: "AM 2748 / AEROMEXICO CARGO",
            numeroGuia: "AERO-IRN-2026-0042-GDL",
            contenedor: "N/A – CARGA AÉREA",
            transportista: "AEROMEXICO CARGO S.A. DE C.V.",
            transpRfc: "ACG860101XX0",
            transpDomicilio: "AEROPUERTO INT. GDL, JAL",
            numCandado: "ANAM-GDL-48-2026-0042",
            primeraRevision: "CANAL VERDE",
            numTipo: "4 PALLETS",
            agenteNombre: "ROBERTO EDUARDO CELIS ROBLES",
            agenteRfc: "CERR041209",
            agenteCurp: "CERR041209HSRLBB06",
            mandatarioNombre: "LAURA VEGA",
            mandatarioRfc: "VECL900520GH1",
            mandatarioCurp: "VECL900520MJC03",
            agentePatente: "3480",
            numSerieCertificado: "0000100000060789",
            firmaElectronica: "a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0",
            "globIdClave[]": "IM",
            "globIdC1[]": "038-2019",
            liqIgiFp: "21",
            liqIgiImp: "64,827.00",
            liqIvaFp: "21",
            liqIvaImp: "119,706.00",
            liqDtaFp: "0",
            liqDtaImp: "5,458.00",
            liqPrvFp: "0",
            liqPrvImp: "310.00",
            liqCntFp: "0",
            liqCntImp: "70.00",
            liqTotal: "190,371.00",
            liqEfectivo: "5,838.00",
            observaciones: "IMPORTACIÓN TEMPORAL (IN) DE MATERIA PRIMA. BASADA EN UNA DEMANDA DE 12,000 BOLSAS (10K EXPORT + 2K CAMBIO RÉGIMEN) + MERMA 5% = TOTAL REQ: 12,600 PIEZAS. \r\n1) CUERO (IRÁN): 0.15m2 X BOLSA * 12,600 = 1,890 m2. SIN TLC (IGI 10%). \r\n2) HILO (ITALIA): 5m X BOLSA = 63,000 m (63 Kg). TLCUEM (IGI ORIGEN 0%). \r\n* IMPUESTOS IVA/IGI 100% GARANTIZADOS BAJO CRÉDITO FISCAL (FP 21) INGRESO IMMEX.",
            partidas: [
                {
                    fraccion: "4107.11.01",
                    subd: "01",
                    vinc: "0",
                    met: "1",
                    umc: "04",
                    cantUmc: "1890",
                    umt: "04",
                    cantUmt: "1890",
                    pvc: "IRN",
                    pod: "IRN",
                    valAduUsd: "37,800.00",
                    impPrecioPag: "37,800.00",
                    precioUnit: "20.00",
                    descripcion: "CUERO DE BOVINO CURTIDO AL VEGETAL, ACABADO NAPA. ROLLOS 1.5M X 50M. CANTIDAD CALCULADA PARA COFECCIONAR 12,600 BOLSAS 'GUCCI' (INCL. 5% DE DESPERDICIO/MERMA CONTEMPLADO).",
                    marca: "IRAN LEATHER TANNING",
                    modelo: "NAPA-2026",
                    codProducto: "IRN-001",
                    contribs: [
                        { con: "IGI", tasa: "10", tt: "1", fp: "21", imp: "64,827.00" },
                        { con: "IVA", tasa: "16", tt: "1", fp: "21", imp: "119,706.00" }
                    ]
                },
                {
                    fraccion: "5402.11.01",
                    subd: "01",
                    vinc: "0",
                    met: "1",
                    umc: "01",
                    cantUmc: "63",
                    umt: "01",
                    cantUmt: "63",
                    pvc: "ITA",
                    pod: "ITA",
                    valAduUsd: "1,890.00",
                    impPrecioPag: "1,890.00",
                    precioUnit: "30.00",
                    descripcion: "HILO 100% NYLON MULTIFILAMENTO ALTA RESISTENCIA 210D/3. CANTIDAD ESTIMADA 63KG PARA LA PRODUCCIÓN DE 12,600 BOLSAS. INSUMO ORIGINARIO DE ITALIA.",
                    marca: "COATS THREAD ITALY S.R.L.",
                    modelo: "CTI-210D3",
                    codProducto: "ITA-H01",
                    contribs: [
                        { con: "IGI", tasa: "EX", tt: "1", fp: "21", imp: "0.00" },
                        { con: "IVA", tasa: "16", tt: "1", fp: "21", imp: "5,186.00" }
                    ],
                    tratado: "TLCUEM"
                }
            ]
        };
        const exampleGucciRT = {
            referencia: "GUCCI-MEX-EXPORT-T4-2026", numPedimento: "26  48  3480  6000043", tipoOper: "EXP", cvePedimento: "RT", regimen: "EXD", destino: "ITA", tipoCambio: "17.1500", pesoBruto: "4000.00", aduanaES: "48", cveSeccion: "480", medioTranspArribo: "7", medioTranspSalida: "7", valorDolares: "950,000.00", valorAduana: "16,292,500.00", precioPagado: "16,292,500.00", valSeguros: "0", seguros: "0", fletes: "0", valEmbalajes: "0", valOtros: "0", transporteDecrem: "0", seguroDecrem: "0", cargaDecrem: "0", descargaDecrem: "0", otrosDecrem: "0", marcasBultos: "250 CAJAS C/ 40 BOLSAS C/U. ETIQUETA GUCCI MADE IN MEXICO", acuseElectronico: "AE26480348060043GCC", acuseValidacion: "AV-2648-GUCCI-EXP-043", fechaEntradaPed: "25/04/2026", fechaPago: "25/04/2026", rfcImpExp: "GBW000001AB6", nombreImpExp: "GUCCI BOLSOS DE MANO MEXICO S.A. DE C.V.", curpImpExp: "", domicilioImpExp: "BLVD. PUERTA DE HIERRO 4965-A, PISO 2, ZAPOPAN, JAL, CP 45116", provIdFiscal: "IT-00930930487", provNombre: "GUCCIO GUCCI S.P.A.", provDomicilio: "VIA TORNABUONI 73/R, 50123 FLORENCIA (FI), ITALIA", provVinculacion: "1", numFactura: "GCC-EXP-2026-0043", fechaFactura: "25/04/2026", incoterm: "FOB", monedaFact: "USD", valMonFact: "950,000.00", valDolaresFact: "950,000.00", eDocumentVucem: "2648GCCJAL000043ITA", tipoDocumentoVucem: "003", transpIdentificacion: "AM 2748", numeroGuia: "AERO-ITA-2026", contenedor: "C. G.", transportista: "AEROMEXICO", transpRfc: "ACG860101XX0", transpDomicilio: "GDL, JAL", numCandado: "N", primeraRevision: "V", numTipo: "250 CAJAS", agenteNombre: "ROBERTO EDUARDO CELIS ROBLES", agenteRfc: "CERR041209", agenteCurp: "CERR041209HSRLBB06", mandatarioNombre: "LAURA VEGA", mandatarioRfc: "VECL900520GH1", mandatarioCurp: "VECL900520MJC03", agentePatente: "3480", numSerieCertificado: "0000100000060789", firmaElectronica: "a9b8c7...", "globIdClave[]": ["IN", "TL"], "globIdC1[]": ["038-2019", "ITA"], liqIgiFp: "0", liqIgiImp: "0", liqIvaFp: "0", liqIvaImp: "0", liqDtaFp: "0", liqDtaImp: "464.00", liqPrvFp: "0", liqPrvImp: "310.00", liqCntFp: "0", liqCntImp: "70.00", liqTotal: "844.00", liqEfectivo: "844.00", observaciones: "RETORNO DE MERCANCÍAS ELABORADAS BAJO PROGRAMA IMMEX (RT). EXPORTACIÓN DE 10,000 BOLSAS TERMINADAS. DESCARGO LEGAL DE LAS MATERIAS PRIMAS IMPORTADAS TEMPORALMENTE CON EL PEDIMENTO IN 7000042.", partidas: [{ fraccion: "4202.21.01", subd: "01", vinc: "1", met: "0", umc: "06", cantUmc: "10000", umt: "06", cantUmt: "10000", pvc: "MEX", pod: "ITA", valAduUsd: "950,000.00", impPrecioPag: "950,000.00", precioUnit: "95.00", descripcion: "BOLSA DE MANO DE CUERO BOVINO (TERMINADO). GUCCI DIONYSUS. DESCARGO IMMEX.", marca: "GUCCI", contribs: [{ con: "DTA", tasa: "fija", tt: "1", fp: "0", imp: "464.00" }], tratado: "TLCUEM" }]
        };

        const exampleGucciF4 = {
            referencia: "GUCCI-MEX-F4-PHYS-2026", numPedimento: "26  48  3480  6000044", tipoOper: "IMP", cvePedimento: "F4", regimen: "IMP", destino: "9", tipoCambio: "17.1500", pesoBruto: "500.00", aduanaES: "48", cveSeccion: "480", medioTranspArribo: "7", medioTranspSalida: "7", valorDolares: "12,450.00", valorAduana: "213,517.50", precioPagado: "213,517.50", valSeguros: "0", seguros: "0", fletes: "0", valEmbalajes: "0", valOtros: "0", transporteDecrem: "0", seguroDecrem: "0", cargaDecrem: "0", descargaDecrem: "0", otrosDecrem: "0", marcasBultos: "CAMBIO DE RÉGIMEN FÍSICO DE INSUMOS Y DESPERDICIOS", acuseElectronico: "AE26480348060044GCC", acuseValidacion: "AV-2648-GUCCI-F4-044", fechaEntradaPed: "26/04/2026", fechaPago: "26/04/2026", rfcImpExp: "GBW000001AB6", nombreImpExp: "GUCCI BOLSOS DE MANO MEXICO S.A. DE C.V.", curpImpExp: "", domicilioImpExp: "BLVD. PUERTA DE HIERRO 4965-A, PISO 2, ZAPOPAN, JAL, CP 45116", provIdFiscal: "IRN-10102567891", provNombre: "PROVEEDORES MULTIPLES", provDomicilio: "IRÁN E ITALIA", provVinculacion: "0", numFactura: "F4-REGIME-2026", fechaFactura: "26/04/2026", incoterm: "EXW", monedaFact: "USD", valMonFact: "12,450.00", valDolaresFact: "12,450.00", eDocumentVucem: "2648GCC0044F4", tipoDocumentoVucem: "003", transpIdentificacion: "CARGA TERRESTRE", numeroGuia: "", contenedor: "", transportista: "LOGISTICA MX", transpRfc: "LMX820101XYZ", transpDomicilio: "GDL, JAL", numCandado: "N", primeraRevision: "V", numTipo: "2 PALETS", agenteNombre: "ROBERTO EDUARDO CELIS ROBLES", agenteRfc: "CERR041209", agenteCurp: "CERR041209HSRLBB06", mandatarioNombre: "LAURA VEGA", mandatarioRfc: "VECL900520GH1", mandatarioCurp: "VECL900520MJC03", agentePatente: "3480", numSerieCertificado: "0000100000060789", firmaElectronica: "a9b8c7...", "globIdClave[]": ["C3", "TL"], "globIdC1[]": ["038-2019", "ITA"], liqIgiFp: "0", liqIgiImp: "13,377.00", liqIvaFp: "0", liqIvaImp: "37,413.00", liqDtaFp: "0", liqDtaImp: "1,708.00", liqIepsFp: "0", liqIepsImp: "0.00", liqRecFp: "0", liqRecImp: "850.00", liqPrvFp: "0", liqPrvImp: "310.00", liqCntFp: "0", liqCntImp: "70.00", liqTotal: "53,728.00", liqEfectivo: "53,728.00", observaciones: "CAMBIO DE RÉGIMEN FÍSICO (F4). NACIONALIZACIÓN DE INSUMOS (CUERO E HILO) Y DESPERDICIOS GENERADOS EN PROCESO PRODUCTIVO. SE INCLUYEN RECARGOS (REC) POR ACTUALIZACIÓN.", partidas: [{ fraccion: "4107.11.01", subd: "01", vinc: "0", met: "1", umc: "04", cantUmc: "390", umt: "04", cantUmt: "390", pvc: "IRN", pod: "IRN", valAduUsd: "7,800.00", impPrecioPag: "7,800.00", precioUnit: "20.00", descripcion: "CUERO BOVINO VEGETAL (NACIONALIZACIÓN DE INSUMO).", marca: "IRAN LEATHER", contribs: [{ con: "IGI", tasa: "10", tt: "1", fp: "0", imp: "13,377.00" }, { con: "IVA", tasa: "16", tt: "1", fp: "0", imp: "23,543.00" }, { con: "REC", tasa: "1.47", tt: "1", fp: "0", imp: "850.00" }] }, { fraccion: "5402.11.01", subd: "01", vinc: "0", met: "1", umc: "01", cantUmc: "13", umt: "01", cantUmt: "13", pvc: "ITA", pod: "ITA", valAduUsd: "390.00", impPrecioPag: "390.00", precioUnit: "30.00", descripcion: "HILO NYLON 210D/3 (NACIONALIZACIÓN DE INSUMO).", marca: "COATS THREAD", contribs: [{ con: "IGI", tasa: "EX", tt: "1", fp: "0", imp: "0.00" }, { con: "IVA", tasa: "16", tt: "1", fp: "0", imp: "1,070.00" }], tratado: "TLCUEM" }, { fraccion: "4115.20.01", subd: "00", vinc: "0", met: "1", umc: "01", cantUmc: "210", umt: "01", cantUmt: "210", pvc: "MEX", pod: "MEX", valAduUsd: "4,260.00", impPrecioPag: "4,260.00", precioUnit: "20.28", descripcion: "VALOR DE DESPERDICIO DE CUERO (RECORTES Y MERMAS) NACIONALIZADO SEGÚN ART. 109 L.A.", marca: "N/A", contribs: [{ con: "IGI", tasa: "EX", tt: "1", fp: "0", imp: "0.00" }, { con: "IVA", tasa: "16", tt: "1", fp: "0", imp: "12,800.00" }] }]
        };

        const exampleGucciF4_Bolsa = {
            referencia: "GUCCI-MEX-F4-BOLSA-2026", numPedimento: "26  48  3480  6000045", tipoOper: "IMP", cvePedimento: "F4", regimen: "IMP", destino: "9", tipoCambio: "17.1500", pesoBruto: "800.00", aduanaES: "48", cveSeccion: "480", medioTranspArribo: "7", medioTranspSalida: "7", valorDolares: "190,000.00", valorAduana: "3,258,500.00", precioPagado: "3,258,500.00", valSeguros: "0", seguros: "0", fletes: "0", valEmbalajes: "0", valOtros: "0", transporteDecrem: "0", seguroDecrem: "0", cargaDecrem: "0", descargaDecrem: "0", otrosDecrem: "0", marcasBultos: "100 CAJAS C/ 20 BOLSAS C/U. CAMBIO DE REGIMEN (NACIONALIZACION)", acuseElectronico: "AE26480348060045GCC", acuseValidacion: "AV-2648-GUCCI-F4BOLSA", fechaEntradaPed: "27/04/2026", fechaPago: "27/04/2026", rfcImpExp: "GBW000001AB6", nombreImpExp: "GUCCI BOLSOS DE MANO MEXICO S.A. DE C.V.", curpImpExp: "", domicilioImpExp: "BLVD. PUERTA DE HIERRO 4965-A, PISO 2, ZAPOPAN, JAL, CP 45116", provIdFiscal: "IT-00930930487", provNombre: "GUCCIO GUCCI S.P.A. (ITALIA)", provDomicilio: "VIA TORNABUONI 73, FLORENCIA, ITALIA", provVinculacion: "1", numFactura: "GCC-F4-2026-0045", fechaFactura: "27/04/2026", incoterm: "FOB", monedaFact: "USD", valMonFact: "190,000.00", valDolaresFact: "190,000.00", eDocumentVucem: "2648GCC0045F4B", tipoDocumentoVucem: "003", transpIdentificacion: "CARGA TERRESTRE", numeroGuia: "AWB-2026-045", contenedor: "", transportista: "DHL GLOBAL", transpRfc: "DHL860101XX0", transpDomicilio: "GDL, JAL", numCandado: "N", primeraRevision: "V", numTipo: "100 CAJAS", agenteNombre: "ROBERTO EDUARDO CELIS ROBLES", agenteRfc: "CERR041209", agenteCurp: "CERR041209HSRLBB06", mandatarioNombre: "LAURA VEGA", mandatarioRfc: "VECL900520GH1", mandatarioCurp: "VECL900520MJC03", agentePatente: "3480", numSerieCertificado: "0000100000060789", firmaElectronica: "a9b8c7...", "globIdClave[]": ["TL", "IN"], "globIdC1[]": ["ITA", "038-2019"], liqIgiFp: "0", liqIgiImp: "0.00", liqIvaFp: "0", liqIvaImp: "521,360.00", liqDtaFp: "0", liqDtaImp: "26,068.00", liqPrvFp: "0", liqPrvImp: "310.00", liqCntFp: "0", liqCntImp: "70.00", liqTotal: "547,808.00", liqEfectivo: "547,808.00", observaciones: "CAMBIO DE RÉGIMEN FÍSICO (F4). NACIONALIZACIÓN DE PRODUCTO TERMINADO (2,000 BOLSAS DE MANO) PARA SU COMERCIALIZACIÓN EN TERRITORIO NACIONAL. SE PAGA EL IMPUESTO CORRESPONDIENTE AL VALOR DE VENTA / COMERCIAL.", partidas: [{ fraccion: "4202.21.01", subd: "01", vinc: "1", met: "1", umc: "06", cantUmc: "2000", umt: "06", cantUmt: "2000", pvc: "ITA", pod: "ITA", valAduUsd: "190,000.00", impPrecioPag: "190,000.00", precioUnit: "95.00", descripcion: "BOLSA DE MANO DE CUERO BOVINO (NACIONALIZACIÓN DE PRODUCTO TERMINADO). MODELO DIONYSUS.", marca: "GUCCI", contribs: [{ con: "IGI", tasa: "EX", tt: "1", fp: "0", imp: "0.00" }, { con: "IVA", tasa: "16", tt: "1", fp: "0", imp: "521,360.00" }, { con: "DTA", tasa: "8 al millar", tt: "1", fp: "0", imp: "26,068.00" }], tratado: "TLCUEM" }]
        };

        // CASO 2: COSMÉTICOS BELLEZA (IMMEX)
        const exampleCaso2_IN = {
            referencia: "BELLEZA-IN-2026", numPedimento: "26  40  3147  7001010", tipoOper: "IMP", cvePedimento: "IN", regimen: "ITE", destino: "26", tipoCambio: "18.0000", pesoBruto: "1200.00", aduanaES: "26", cveSeccion: "400", medioTranspArribo: "3", medioTranspSalida: "7", valorDolares: "150,000.00", valorAduana: "2,700,000.00", precioPagado: "2,700,000.00", valSeguros: "0", seguros: "0", fletes: "0", valEmbalajes: "0", valOtros: "0", transporteDecrem: "0", seguroDecrem: "0", cargaDecrem: "0", descargaDecrem: "0", otrosDecrem: "0", marcasBultos: "100 CAJAS C/ PRODUCTO TERMINADO POLVO COMPACTO", acuseElectronico: "AE264003147700101CBA", acuseValidacion: "AV-2640-CBA-IN-101", fechaEntradaPed: "10/05/2026", fechaPago: "10/05/2026", rfcImpExp: "CBA050501ABC", nombreImpExp: "COSMÉTICOS BELLEZA S.A. DE C.V.", curpImpExp: "", domicilioImpExp: "AV. INDUSTRIAL 100, NOGALES, SON, CP 84000", provIdFiscal: "LKA-88776655", provNombre: "SRI LANKA MIRROR INDUSTRIES", provDomicilio: "COLOMBO INDUSTRIAL PARK, SRI LANKA", provVinculacion: "0", numFactura: "CBA-IN-2026-001", fechaFactura: "08/05/2026", incoterm: "CIF", monedaFact: "USD", valMonFact: "150,000.00", valDolaresFact: "150,000.00", eDocumentVucem: "2640CBA000101IN", tipoDocumentoVucem: "003", transpIdentificacion: "CARGA TERRESTRE", numeroGuia: "LKA-MEX-2026", contenedor: "", transportista: "GLOBAL LOGISTICS", transpRfc: "GLO860101XX0", transpDomicilio: "NOGALES, SON", numCandado: "N", primeraRevision: "V", numTipo: "100 CAJAS", agenteNombre: "ROBERTO EDUARDO CELIS ROBLES", agenteRfc: "CERR041209", agenteCurp: "CERR041209HSRLBB06", mandatarioNombre: "LAURA VEGA", mandatarioRfc: "VECL900520GH1", mandatarioCurp: "VECL900520MJC03", agentePatente: "3147", numSerieCertificado: "00001000000607890123", firmaElectronica: "e2f3a4b5...", "globIdClave[]": ["IN"], "globIdC1[]": ["038-2019"], liqIgiFp: "21", liqIgiImp: "405,000.00", liqIvaFp: "21", liqIvaImp: "496,874.00", liqDtaFp: "0", liqDtaImp: "463.00", liqPrvFp: "0", liqPrvImp: "310.00", liqCntFp: "0", liqCntImp: "70.00", liqTotal: "902,717.00", liqEfectivo: "843.00", observaciones: "IMPORTACION TEMPORAL (IN) DE INSUMOS PARA ENSAMBLE. INSUMO 1: ESTUCHES DE POLVO CON ESPEJO (SRI LANKA). 100,000 PZAS @ $1.00 USD. INSUMO 2: EMPAQUE / CAJAS (BRASIL). 100,000 PZAS @ $0.50 USD. DTA CUOTA FIJA ART. 49 LFD ($463 MXN).", partidas: [{ fraccion: "3923.90.99", subd: "01", vinc: "0", met: "1", umc: "06", cantUmc: "100000", umt: "06", cantUmt: "100000", pvc: "LKA", pod: "LKA", valAduUsd: "100,000.00", impPrecioPag: "100,000.00", precioUnit: "1.00", descripcion: "ESTUCHE DE PLÁSTICO CON ESPEJO PARA POLVO COMPACTO. INSUMO PARA ENSAMBLE IMMEX.", marca: "MIRROR-PRO", contribs: [{ con: "IGI", tasa: "15", tt: "1", fp: "21", imp: "270,000.00" }, { con: "IVA", tasa: "16", tt: "1", fp: "21", imp: "331,200.00" }] }, { fraccion: "4819.10.01", subd: "01", vinc: "0", met: "1", umc: "06", cantUmc: "100000", umt: "06", cantUmt: "100000", pvc: "BRA", pod: "BRA", valAduUsd: "50,000.00", impPrecioPag: "50,000.00", precioUnit: "0.50", descripcion: "CAJAS DE CARTÓN CORRUGADO PARA EMPAQUE DE COSMÉTICOS. INSUMO IMMEX.", marca: "KRAFT-PAK", contribs: [{ con: "IGI", tasa: "15", tt: "1", fp: "21", imp: "135,000.00" }, { con: "IVA", tasa: "16", tt: "1", fp: "21", imp: "165,600.00" }] }]
        };

        const exampleCaso2_RT = {
            referencia: "BELLEZA-RT-2026", numPedimento: "26  40  3147  6001020", tipoOper: "EXP", cvePedimento: "RT", regimen: "EXD", destino: "USA", tipoCambio: "18.0000", pesoBruto: "8000.00", aduanaES: "26", cveSeccion: "400", medioTranspArribo: "7", medioTranspSalida: "7", valorDolares: "400,000.00", valorAduana: "7,200,000.00", precioPagado: "7,200,000.00", valSeguros: "0", seguros: "0", fletes: "0", valEmbalajes: "0", valOtros: "0", transporteDecrem: "0", seguroDecrem: "0", cargaDecrem: "0", descargaDecrem: "0", otrosDecrem: "0", marcasBultos: "200 CAJAS C/ PRODUCTO TERMINADO POLVO COMPACTO", acuseElectronico: "AE264003147600102CBA", acuseValidacion: "AV-2640-CBA-RT-102", fechaEntradaPed: "20/05/2026", fechaPago: "20/05/2026", rfcImpExp: "CBA050501ABC", nombreImpExp: "COSMÉTICOS BELLEZA S.A. DE C.V.", curpImpExp: "", domicilioImpExp: "AV. INDUSTRIAL 100, NOGALES, SON", provIdFiscal: "US-99887766", provNombre: "BEAUTY GLOBAL DISTRIBUTION", provDomicilio: "MIAMI, FLORIDA, USA", provVinculacion: "1", numFactura: "CBA-EXP-2026-001", fechaFactura: "20/05/2026", incoterm: "FOB", monedaFact: "USD", valMonFact: "400,000.00", valDolaresFact: "400,000.00", eDocumentVucem: "2640CBA000102RT", tipoDocumentoVucem: "003", transpIdentificacion: "MEX-BEAUTY-2026", numeroGuia: "AWB-2026-B", contenedor: "", transportista: "FEDEX CARGO", transpRfc: "FED860101XX0", transpDomicilio: "NOGALES, SON", numCandado: "N", primeraRevision: "V", numTipo: "200 CAJAS", agenteNombre: "ROBERTO EDUARDO CELIS ROBLES", agenteRfc: "CERR041209", agenteCurp: "CERR041209HSRLBB06", mandatarioNombre: "LAURA VEGA", mandatarioRfc: "VECL900520GH1", mandatarioCurp: "VECL900520MJC03", agentePatente: "3147", numSerieCertificado: "00001000000607890123", firmaElectronica: "f5g6h7...", "globIdClave[]": ["IN", "TL"], "globIdC1[]": ["038-2019", "USA"], liqIgiFp: "0", liqIgiImp: "0.00", liqIvaFp: "0", liqIvaImp: "0.00", liqDtaFp: "0", liqDtaImp: "463.00", liqPrvFp: "0", liqPrvImp: "310.00", liqCntFp: "0", liqCntImp: "70.00", liqTotal: "843.00", liqEfectivo: "843.00", observaciones: "RETORNO DE MERCANCÍAS ELABORADAS BAJO PROGRAMA IMMEX (RT). EXPORTACIÓN DEL 80% DE LA PRODUCCIÓN (80,000 PZAS). EXPORTACIÓN TASA 0% IVA Y EXENTA DE IGI. DTA CUOTA FIJA ART. 49 LFD ($463 MXN).", partidas: [{ fraccion: "3304.91.01", subd: "01", vinc: "0", met: "0", umc: "06", cantUmc: "80000", umt: "06", cantUmt: "80000", pvc: "MEX", pod: "USA", valAduUsd: "400,000.00", impPrecioPag: "400,000.00", precioUnit: "5.00", descripcion: "POLVOS COMPACTOS DE MAQUILLAJE. PRODUCTO FINAL ENSAMBLADO EN MÉXICO CON INSUMOS TEMPORALES. DESCARGO IMMEX.", marca: "MEX BEAUTY", modelo: "COMPACT-GLOW", codProducto: "MEX-POLVO-80K", contribs: [{ con: "DTA", tasa: "fija", tt: "1", fp: "0", imp: "463.00" }] }]
        };

        const exampleCaso2_F4_prod = {
            referencia: "BELLEZA-F4-PROD-2026", numPedimento: "26  40  3147  6001021", tipoOper: "IMP", cvePedimento: "F4", regimen: "IMP", destino: "9", tipoCambio: "18.0000", pesoBruto: "2000.00", aduanaES: "26", cveSeccion: "400", medioTranspArribo: "7", medioTranspSalida: "7", valorDolares: "100,000.00", valorAduana: "1,800,000.00", precioPagado: "1,800,000.00", valSeguros: "0", seguros: "0", fletes: "0", valEmbalajes: "0", valOtros: "0", transporteDecrem: "0", seguroDecrem: "0", cargaDecrem: "0", descargaDecrem: "0", otrosDecrem: "0", marcasBultos: "CAMBIO DE RÉGIMEN PRODUCTO TERMINADO", acuseElectronico: "AE2640031476001021CBA", acuseValidacion: "AV-2640-CBA-F4-1021", fechaEntradaPed: "21/05/2026", fechaPago: "21/05/2026", rfcImpExp: "CBA050501ABC", nombreImpExp: "COSMÉTICOS BELLEZA S.A. DE C.V.", curpImpExp: "", domicilioImpExp: "AV. INDUSTRIAL 100, NOGALES, SON", provIdFiscal: "LKA-88776655", provNombre: "SRI LANKA MIRROR INDUSTRIES", provDomicilio: "COLOMBO, SRI LANKA", provVinculacion: "0", numFactura: "CBA-F4-2026-001", fechaFactura: "21/05/2026", incoterm: "EXW", monedaFact: "USD", valMonFact: "100,000.00", valDolaresFact: "100,000.00", eDocumentVucem: "2640CBA0001021F4", tipoDocumentoVucem: "003", transpIdentificacion: "CARGA TERRESTRE", numeroGuia: "", contenedor: "", transportista: "GLOBAL LOGISTICS", transpRfc: "GLO860101XX0", transpDomicilio: "NOGALES, SON", numCandado: "N", primeraRevision: "V", numTipo: "50 CAJAS", agenteNombre: "ROBERTO EDUARDO CELIS ROBLES", agenteRfc: "CERR041209", agenteCurp: "CERR041209HSRLBB06", mandatarioNombre: "LAURA VEGA", mandatarioRfc: "VECL900520GH1", mandatarioCurp: "VECL900520MJC03", agentePatente: "3147", numSerieCertificado: "00001000000607890123", firmaElectronica: "a9b8c7...", "globIdClave[]": ["TL"], "globIdC1[]": ["LKA"], liqIgiFp: "0", liqIgiImp: "270,000.00", liqIvaFp: "0", liqIvaImp: "331,200.00", liqDtaFp: "0", liqDtaImp: "14,400.00", liqPrvFp: "0", liqPrvImp: "310.00", liqCntFp: "0", liqCntImp: "70.00", liqTotal: "615,980.00", liqEfectivo: "615,980.00", observaciones: "CAMBIO DE RÉGIMEN (F4) DE PRODUCTO TERMINADO PARA VENTA EN MÉXICO. SE PAGAN IMPUESTOS CORRESPONDIENTES A LOS INSUMOS IMPORTADOS TEMPORALMENTE.", partidas: [{ fraccion: "3304.91.01", subd: "01", vinc: "0", met: "1", umc: "06", cantUmc: "20000", umt: "06", cantUmt: "20000", pvc: "MEX", pod: "MEX", valAduUsd: "100,000.00", impPrecioPag: "100,000.00", precioUnit: "5.00", descripcion: "POLVOS COMPACTOS DE MAQUILLAJE (NACIONALIZACIÓN POR VENTA MX).", marca: "MEX BEAUTY", contribs: [{ con: "IGI", tasa: "15", tt: "1", fp: "0", imp: "270,000.00" }, { con: "IVA", tasa: "16", tt: "1", fp: "0", imp: "331,200.00" }, { con: "DTA", tasa: "8 al millar", tt: "1", fp: "0", imp: "14,400.00" }] }]
        };

        const exampleCaso2_F4_desp = {
            referencia: "BELLEZA-F4-DESP-2026", numPedimento: "26  40  3147  6001022", tipoOper: "IMP", cvePedimento: "F4", regimen: "IMP", destino: "9", tipoCambio: "18.0000", pesoBruto: "500.00", aduanaES: "26", cveSeccion: "400", medioTranspArribo: "7", medioTranspSalida: "7", valorDolares: "1,500.00", valorAduana: "27,000.00", precioPagado: "27,000.00", valSeguros: "0", seguros: "0", fletes: "0", valEmbalajes: "0", valOtros: "0", transporteDecrem: "0", seguroDecrem: "0", cargaDecrem: "0", descargaDecrem: "0", otrosDecrem: "0", marcasBultos: "NACIONALIZACIÓN DE DESPERDICIOS", acuseElectronico: "AE2640031476001022CBA", acuseValidacion: "AV-2640-CBA-DESP-1022", fechaEntradaPed: "22/05/2026", fechaPago: "22/05/2026", rfcImpExp: "CBA050501ABC", nombreImpExp: "COSMÉTICOS BELLEZA S.A. DE C.V.", curpImpExp: "", domicilioImpExp: "AV. INDUSTRIAL 100, NOGALES, SON", provIdFiscal: "LKA-88776655", provNombre: "SRI LANKA MIRROR INDUSTRIES", provDomicilio: "COLOMBO, SRI LANKA", provVinculacion: "0", numFactura: "CBA-DESP-2026-001", fechaFactura: "22/05/2026", incoterm: "EXW", monedaFact: "USD", valMonFact: "1,500.00", valDolaresFact: "1,500.00", eDocumentVucem: "2640CBA0001022F4", tipoDocumentoVucem: "003", transpIdentificacion: "CARGA TERRESTRE", numeroGuia: "", contenedor: "", transportista: "GLOBAL LOGISTICS", transpRfc: "GLO860101XX0", transpDomicilio: "NOGALES, SON", numCandado: "N", primeraRevision: "V", numTipo: "10 CAJAS", agenteNombre: "ROBERTO EDUARDO CELIS ROBLES", agenteRfc: "CERR041209", agenteCurp: "CERR041209HSRLBB06", mandatarioNombre: "LAURA VEGA", mandatarioRfc: "VECL900520GH1", mandatarioCurp: "VECL900520MJC03", agentePatente: "3147", numSerieCertificado: "00001000000607890123", firmaElectronica: "a9b8c7...", "globIdClave[]": ["TL"], "globIdC1[]": ["LKA"], liqIgiFp: "0", liqIgiImp: "0.00", liqIvaFp: "0", liqIvaImp: "4,320.00", liqDtaFp: "0", liqDtaImp: "463.00", liqPrvFp: "0", liqPrvImp: "310.00", liqCntFp: "0", liqCntImp: "70.00", liqTotal: "5,163.00", liqEfectivo: "5,163.00", observaciones: "CAMBIO DE RÉGIMEN (F4) DE DESPERDICIOS GENERADOS EN EL PROCESO PRODUCTIVO IMMEX. VALOR DE DESPERDICIO ESTIMADO EN 5% DEL VALOR DE INSUMO.", partidas: [{ fraccion: "3915.90.01", subd: "00", vinc: "0", met: "1", umc: "01", cantUmc: "500", umt: "01", cantUmt: "500", pvc: "MEX", pod: "MEX", valAduUsd: "1,500.00", impPrecioPag: "1,500.00", precioUnit: "3.00", descripcion: "DESPERDICIO DE PLÁSTICO (SCRAP) DE ESTUCHES DAÑADOS EN PROCESO DE ENSAMBLE.", marca: "N/A", contribs: [{ con: "IGI", tasa: "EX", tt: "1", fp: "0", imp: "0.00" }, { con: "IVA", tasa: "16", tt: "1", fp: "0", imp: "4,320.00" }] }]
        };

        function loadExample(type) {
            resetFormInternal();

            let data = null;
            if (type === 'min') data = exampleMin;
            else if (type === 'max') data = exampleMax;
            else if (type === 'maritimo') data = exampleMaritimo;
            else if (type === 'amazon') data = exampleAmazon;
            else if (type === 'gucciIN') data = exampleGucci;
            else if (type === 'gucciRT') data = exampleGucciRT;
            else if (type === 'gucciF4') data = exampleGucciF4;
            else if (type === 'gucciF4_Bolsa') data = exampleGucciF4_Bolsa;
            else if (type === 'caso2_IN') data = exampleCaso2_IN;
            else if (type === 'caso2_RT') data = exampleCaso2_RT;
            else if (type === 'caso2_F4_prod') data = exampleCaso2_F4_prod;
            else if (type === 'caso2_F4_desp') data = exampleCaso2_F4_desp;

            if (!data) return;
                const existingTbodies = document.querySelectorAll('.partida-tbody');
                // Agregar las faltantes (asumimos que reset deja 1)
                for (let i = existingTbodies.length; i < data.partidas.length; i++) {
                    agregarPartida();
                }
            }

            // 2. Llenar campos simples
            for (const [key, value] of Object.entries(data)) {
                if (key === 'partidas') continue;

                const els = document.querySelectorAll(`[name="${key}"]`);
                els.forEach((el, index) => {
                    if (Array.isArray(value)) {
                        if (index < value.length) el.value = value[index];
                    } else {
                        el.value = value;
                    }
                    if (el.tagName === 'TEXTAREA') autoResize(el);
                    // Disparar cambio manual para selects si es necesario
                    if (el.tagName === 'SELECT') el.dispatchEvent(new Event('change'));
                });
            }

            // 3. Llenar Partidas (incluyendo contribuciones)
            if (data.partidas) {
                const tbodies = document.querySelectorAll('.partida-tbody');
                data.partidas.forEach((pData, index) => {
                    const tbody = tbodies[index];
                    if (!tbody) return;

                    for (const [pKey, pValue] of Object.entries(pData)) {
                        // Handle contribs array specially
                        if (pKey === 'contribs' && Array.isArray(pValue)) {
                            // Find the contrib container for this partida
                            const contribBody = document.getElementById(`partida-${index}-contribs`);
                            if (!contribBody) continue;

                            // Fill first contrib row (already exists)
                            const firstRow = contribBody.querySelector('.contrib-row');
                            if (firstRow && pValue[0]) {
                                const c = pValue[0];
                                const conInput = firstRow.querySelector('[name*="[con]"]');
                                const tasaInput = firstRow.querySelector('[name*="[tasa]"]');
                                const ttInput = firstRow.querySelector('[name*="[tt]"]');
                                const fpSelect = firstRow.querySelector('[name*="[fp]"]');
                                const impInput = firstRow.querySelector('[name*="[imp]"]');
                                if (conInput) conInput.value = c.con || '';
                                if (tasaInput) tasaInput.value = c.tasa || '';
                                if (ttInput) ttInput.value = c.tt || '';
                                if (fpSelect) fpSelect.value = c.fp || '0';
                                if (impInput) impInput.value = c.imp || '0';
                            }

                            // Add additional contrib rows
                            for (let ci = 1; ci < pValue.length; ci++) {
                                addContribRow(index);
                                const rows = contribBody.querySelectorAll('.contrib-row');
                                const newRow = rows[rows.length - 1];
                                if (newRow) {
                                    const c = pValue[ci];
                                    const conInput = newRow.querySelector('[name*="[con]"]');
                                    const tasaInput = newRow.querySelector('[name*="[tasa]"]');
                                    const ttInput = newRow.querySelector('[name*="[tt]"]');
                                    const fpSelect = newRow.querySelector('[name*="[fp]"]');
                                    const impInput = newRow.querySelector('[name*="[imp]"]');
                                    if (conInput) conInput.value = c.con || '';
                                    if (tasaInput) tasaInput.value = c.tasa || '';
                                    if (ttInput) ttInput.value = c.tt || '';
                                    if (fpSelect) fpSelect.value = c.fp || '0';
                                    if (impInput) impInput.value = c.imp || '0';
                                }
                            }
                            continue;
                        }

                        // Skip non-simple fields
                        if (pKey === 'tratado') continue;

                        const input = tbody.querySelector(`[name$="[${pKey}]"]`);
                        if (input) {
                            input.value = pValue;
                            if (input.tagName === 'TEXTAREA') autoResize(input);
                            if (input.tagName === 'SELECT') input.dispatchEvent(new Event('change'));
                        }
                    }
                });
            }

            // 4. Forzar cálculos
            if (typeof calcTotal === 'function') calcTotal();

            // 5. Re-apply global liq values from data (in case calcTotal overrode them)
            const liqFields = ['liqIgiFp','liqIgiImp','liqIvaFp','liqIvaImp','liqDtaFp','liqDtaImp',
                'liqIepsFp','liqIepsImp','liqRecFp','liqRecImp','liqCcFp','liqCcImp',
                'liqMtFp','liqMtImp','liqPrvFp','liqPrvImp','liqCntFp','liqCntImp',
                'liqTotal','liqEfectivo','liqOtros'];
            liqFields.forEach(key => {
                if (data[key] !== undefined) {
                    const el = document.querySelector(`[name="${key}"]`) || document.getElementById(key);
                    if (el) el.value = data[key];
                }
            });

            checkPageOverflow();

            // Scroll suave si es el ejemplo de Amazon/Gucci para ver las partidas
            if (type === 'amazon' || type === 'max' || type.startsWith('gucci')) {
                const anexo = document.getElementById('pagina2');
                if (anexo) anexo.scrollIntoView({ behavior: 'smooth' });
            }
        }

        // Auto-resize textareas
        function autoResize(el) {
            el.style.height = 'auto';
            el.style.height = el.scrollHeight + 'px';
            checkPageOverflow(); // Check if resize caused overflow
        }

        // ========== COUNTRIES DATABASE ==========
        function getCountryOptions() {
            const countries = [
{c:"AFG",n:"Afganistán"},{c:"ALB",n:"Albania"},{c:"DEU",n:"Alemania"},{c:"AND",n:"Andorra"},{c:"AGO",n:"Angola"},
                {c:"ATG",n:"Antigua y Barbuda"},{c:"SAU",n:"Arabia Saudita"},{c:"DZA",n:"Argelia"},{c:"ARG",n:"Argentina"},
                {c:"ARM",n:"Armenia"},{c:"AUS",n:"Australia"},{c:"AUT",n:"Austria"},{c:"AZE",n:"Azerbaiyán"},{c:"BHS",n:"Bahamas"},
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
                {c:"TLS",n:"Timor Oriental"},{c:"TGO",n:"Togo"},{c:"TON",n:"Tonga"},{c:"TTO",n:"Trinidad y Tobago"},{c:"TUN",n:"Túnez"},
                {c:"TKM",n:"Turkmenistán"},{c:"TUR",n:"Turquía"},{c:"TUV",n:"Tuvalu"},{c:"UKR",n:"Ucrania"},{c:"UGA",n:"Uganda"},
                {c:"URY",n:"Uruguay"},{c:"UZB",n:"Uzbekistán"},{c:"VUT",n:"Vanuatu"},{c:"VEN",n:"Venezuela"},{c:"VNM",n:"Vietnam"},
                {c:"YEM",n:"Yemen"},{c:"DJI",n:"Yibuti"},{c:"ZMB",n:"Zambia"},{c:"ZWE",n:"Zimbabue"}
            ];
            return countries.map(co => `<option value="${co.c}">${co.c}-${co.n}</option>`).join('');
        }

        // ========== IDENTIFICADORES GLOBAL ==========
        let globalIdCount = 1;
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
            // R1 is the most common rectification code
            const isRect = (cve === 'R1' || cve === 'G7' || cve === 'K2'); 
            const sections = document.querySelectorAll('.rect-section');
            sections.forEach(s => {
                s.style.display = isRect ? (s.tagName === 'TBODY' ? 'table-row-group' : 'table-row') : 'none';
            });
        }

        // Agregar identificador partida
        let identCount = 1;
        function agregarIdentificador() {
            const tbody = document.getElementById('identificadores');
            const row = tbody.querySelector('.ident-row').cloneNode(true);

            // Limpiar inputs
            row.querySelectorAll('input').forEach(input => {
                input.value = '';
                // Actualizar nombres si es necesario (ident[x]...)
                let name = input.name;
                input.name = name.replace(/\[\d+\]/, `[${identCount}]`);
            });

            tbody.appendChild(row);
            identCount++;
            checkPageOverflow();
        }

        function addContribRow(partidaIdx) {
            const tbody = document.getElementById(`partida-${partidaIdx}-contribs`);
            const contribCount = tbody.querySelectorAll('.contrib-row').length;
            const row = document.createElement('tr');
            row.className = 'contrib-row';
            row.innerHTML = `
                <td class="data"><input type="text" name="partidas[${partidaIdx}][contribs][${contribCount}][con]"></td>
                <td class="data"><input type="text" name="partidas[${partidaIdx}][contribs][${contribCount}][tasa]"></td>
                <td class="data"><input type="text" name="partidas[${partidaIdx}][contribs][${contribCount}][tt]"></td>
                <td class="data"><select name="partidas[${partidaIdx}][contribs][${contribCount}][fp]"><option value="0">0</option><option value="6">6</option><option value="21">21</option></select></td>
                <td colspan="3" class="data"><input type="number" name="partidas[${partidaIdx}][contribs][${contribCount}][imp]" step="any"></td>
                <td class="data text-center" colspan="7" style="background:#f8fafc;">
                    <button type="button" onclick="this.closest('tr').remove()" style="font-size:7px; background:#fee2e2; border:1px solid #fecaca; color:#dc2626; border-radius:3px; cursor:pointer;">✕ Quitar</button>
                </td>
            `;
            tbody.appendChild(row);
            checkPageOverflow();
        }

        // Toggle collapsible sections
        function toggleSection(sectionId) {
            const section = document.getElementById(sectionId);
            const header = section.previousElementSibling.querySelector('.collapsible-header') ||
                document.querySelector(`[onclick="toggleSection('${sectionId}')"]`);

            section.classList.toggle('show');
            if (header) {
                header.classList.toggle('active');
            }
        }

        // Add Descargo row
        let descargoCount = 1;
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
            // Insert before the button row
            const btnRow = tbody.querySelector('.no-print');
            tbody.insertBefore(row, btnRow);
            descargoCount++;
        }

        // Add Permiso row
        let permisoCount = 1;
        function agregarPermiso() {
            const tbody = document.getElementById('permisos');
            const row = document.createElement('tr');
            row.innerHTML = `
                <td colspan="2" class="data"><input type="text" name="permiso[${permisoCount}][cvePermiso]" placeholder="Ej: NOM, SE"></td>
                <td colspan="4" class="data"><input type="text" name="permiso[${permisoCount}][numPermiso]"></td>
                <td colspan="2" class="data"><input type="text" name="permiso[${permisoCount}][firmaDescargo]"></td>
                <td colspan="3" class="data"><input type="text" name="permiso[${permisoCount}][valComercial]"></td>
                <td colspan="3" class="data"><input type="text" name="permiso[${permisoCount}][cantidad]"></td>
            `;
            const btnRow = tbody.querySelector('.no-print');
            tbody.insertBefore(row, btnRow);
            permisoCount++;
        }

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
                            <option value="01">01 - Kilo</option>
                            <option value="02">02 - Gramo</option>
                            <option value="03">03 - Metro Lineal</option>
                            <option value="04">04 - Metro Cuadrado</option>
                            <option value="05">05 - Metro Cúbico</option>
                            <option value="06">06 - Pieza</option>
                            <option value="07">07 - Cabeza</option>
                            <option value="08">08 - Litro</option>
                            <option value="09">09 - Par</option>
                            <option value="15">15 - Kilómetro</option>
                        </select>
                    </td>
                    <td class="data"><input type="number" name="partidas[${partidaCount}][cantUmc]" step="any"></td>
                    <td class="data">
                        <select name="partidas[${partidaCount}][umt]">
                            <option value="01">01 - Kilo</option>
                            <option value="02">02 - Gramo</option>
                            <option value="03">03 - Metro Lineal</option>
                            <option value="04">04 - Metro Cuadrado</option>
                            <option value="05">05 - Metro Cúbico</option>
                            <option value="06">06 - Pieza</option>
                            <option value="07">07 - Cabeza</option>
                            <option value="08">08 - Litro</option>
                            <option value="09">09 - Par</option>
                            <option value="15">15 - Kilómetro</option>
                        </select>
                    </td>
                    <td class="data"><input type="number" name="partidas[${partidaCount}][cantUmt]" step="any"></td>
                    <td class="data"><select name="partidas[${partidaCount}][pvc]" class="country-sel-new"><option value=""></option></select></td>
                    <td class="data"><select name="partidas[${partidaCount}][pod]" class="country-sel-new" onchange="applyTreatyLogic(${partidaCount})"><option value=""></option></select></td>
                    <td colspan="4" class="data">
                        <div style="display:flex; flex-direction:column; gap:2px;">
                            <span style="font-size:7px; color:#64748b; font-weight:bold;">PREFERENCIA / TRATADO</span>
                            <select name="partidas[${partidaCount}][tratado]" class="select-tlc" onchange="applyTreatyLogic(${partidaCount})">
                                <option value="">Ninguna (Arancel General)</option>
                                <option value="TMEC">T-MEC (EE.UU. / CAN)</option>
                                <option value="TLCUEM">TLCUEM (Uniòn Europea)</option>
                                <option value="TIPAT">TIPAT (CPTPP)</option>
                                <option value="AP">Alianza del Pacífico</option>
                            </select>
                            <div id="partida-${partidaCount}-pref-badge" style="display:none;"><span class="pref-badge">PREFERENCIA ACTIVA (FP 6)</span></div>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td class="label">SEC</td>
                    <td colspan="6" class="label">DESCRIPCIÓN</td>
                    <td class="label">CON.</td>
                    <td class="label">TASA</td>
                    <td class="label">T.T.</td>
                    <td class="label">F.P.</td>
                    <td colspan="3" class="label">IMPORTE</td>
                </tr>
                <tr>
                    <td class="data"><input type="number" name="partidas[${partidaCount}][sec]" value="${partidaCount + 1}"></td>
                    <td colspan="6" class="data"><textarea name="partidas[${partidaCount}][descripcion]" oninput="autoResize(this)"></textarea></td>
                    <td colspan="7"></td>
                </tr>
                <tr>
                    <td class="section-header" colspan="14" style="background:#f1f5f9; color:#475569; font-size:7px; height:12px; padding:0;">LIQUIDACIÓN DE LA PARTIDA</td>
                </tr>
                <tr>
                    <td class="label">CON. <span class="info" onclick="toggleTooltip(this)">ⓘ
                        <span class="tooltip">
                            <div class="tt-header"><span class="tt-title">INSTRUCTIVO</span><button class="tt-close" onclick="closeTooltip(event, this)">×</button></div>
                            <div class="tt-body">
                                <p><strong>CONCEPTO</strong></p>
                                <p>Clave del concepto de la contribución o aprovechamiento conforme al Apéndice 12 (ej. IGI, DTA, IVA).</p>
                                <span class="tt-ref">📋 Fuente: Anexo 22, Apéndice 12.</span>
                            </div>
                        </span>
                    </span></td>
                    <td class="label">TASA <span class="info" onclick="toggleTooltip(this)">ⓘ
                        <span class="tooltip">
                            <div class="tt-header"><span class="tt-title">INSTRUCTIVO</span><button class="tt-close" onclick="closeTooltip(event, this)">×</button></div>
                            <div class="tt-body">
                                <p><strong>TASA</strong></p>
                                <p>Factor o porcentaje aplicable a la base gravable para determinar el impuesto.</p>
                            </div>
                        </span>
                    </span></td>
                    <td class="label">T.T. <span class="info" onclick="toggleTooltip(this)">ⓘ
                        <span class="tooltip">
                            <div class="tt-header"><span class="tt-title">INSTRUCTIVO</span><button class="tt-close" onclick="closeTooltip(event, this)">×</button></div>
                            <div class="tt-body">
                                <p><strong>TIPO DE TASA</strong></p>
                                <p>Clave que identifica el tipo de tasa aplicable conforme al Apéndice 18 (ej. 1 para Porcentual, 6 para Específica).</p>
                                <span class="tt-ref">📋 Fuente: Anexo 22, Apéndice 18.</span>
                            </div>
                        </span>
                    </span></td>
                    <td class="label">F.P. <span class="info" onclick="toggleTooltip(this)">ⓘ
                        <span class="tooltip">
                            <div class="tt-header"><span class="tt-title">INSTRUCTIVO</span><button class="tt-close" onclick="closeTooltip(event, this)">×</button></div>
                            <div class="tt-body">
                                <p><strong>FORMA DE PAGO</strong></p>
                                <p>Clave de la forma de pago de la contribución o aprovechamiento conforme al Apéndice 13 (ej. 0 para Efectivo, 21 para Crédito Fiscal).</p>
                                <span class="tt-ref">📋 Fuente: Anexo 22, Apéndice 13.</span>
                            </div>
                        </span>
                    </span></td>
                    <td colspan="3" class="label">IMPORTE <span class="info" onclick="toggleTooltip(this)">ⓘ
                        <span class="tooltip">
                            <div class="tt-header"><span class="tt-title">INSTRUCTIVO</span><button class="tt-close" onclick="closeTooltip(event, this)">×</button></div>
                            <div class="tt-body">
                                <p><strong>IMPORTE</strong></p>
                                <p>Monto de la contribución o aprovechamiento a pagar.</p>
                            </div>
                        </span>
                    </span></td>
                    <td class="label" colspan="7"></td>
                </tr>
                <tbody id="partida-${partidaCount}-contribs">
                    <tr class="contrib-row">
                        <td class="data"><input type="text" name="partidas[${partidaCount}][contribs][0][con]" value="IGI"></td>
                        <td class="data"><input type="text" name="partidas[${partidaCount}][contribs][0][tasa]" value="0"></td>
                        <td class="data"><input type="text" name="partidas[${partidaCount}][contribs][0][tt]" value="1"></td>
                        <td class="data"><select name="partidas[${partidaCount}][contribs][0][fp]"><option value="0">0</option><option value="6">6</option><option value="21">21</option></select></td>
                        <td colspan="3" class="data"><input type="text" name="partidas[${partidaCount}][contribs][0][imp]" onblur="this.value = formatter(this.value)" value="0"></td>
                        <td class="data text-center" colspan="7" style="background:#f8fafc;">
                            <button type="button" onclick="addContribRow(${partidaCount})" style="font-size:7px; background:#e2e8f0; border:1px solid #cbd5e1; border-radius:3px; cursor:pointer;">+ Agregar Contribución</button>
                        </td>
                    </tr>
                </tbody>
                <tr class="subtotal-row" style="background:#f8fafc;">
                    <td colspan="4" style="text-align:right; font-size:7px; font-weight:bold; color:#64748b; padding-right:10px;">SUMA CONTRIBUCIONES PARTIDA:</td>
                    <td colspan="3" class="data"><input name="partidas[${partidaCount}][subtotal]" type="text" readonly style="background:#f1f5f9; font-weight:bold;"/></td>
                    <td colspan="7"></td>
                </tr>
                <tr>
                    <td colspan="3" class="label">VAL.ADU/USD <span class="info" onclick="toggleTooltip(this)">ⓘ
                        <span class="tooltip">
                            <div class="tt-header"><span class="tt-title">INSTRUCTIVO</span><button class="tt-close" onclick="closeTooltip(event, this)">×</button></div>
                            <div class="tt-body">
                                <p><strong>VALOR ADUANA / USD</strong></p>
                                <p>Valor en aduana expresado en dólares.</p>
                            </div>
                        </span>
                    </span></td>
                    <td colspan="3" class="label">IMP.PRECIO PAG. <span class="info" onclick="toggleTooltip(this)">ⓘ
                        <span class="tooltip">
                            <div class="tt-header"><span class="tt-title">INSTRUCTIVO</span><button class="tt-close" onclick="closeTooltip(event, this)">×</button></div>
                            <div class="tt-body">
                                <p><strong>IMP. PRECIO PAGADO</strong></p>
                                <p>Monto pagado total por la partida.</p>
                            </div>
                        </span>
                    </span></td>
                    <td colspan="3" class="label">PRECIO UNIT. <span class="info" onclick="toggleTooltip(this)">ⓘ
                        <span class="tooltip">
                            <div class="tt-header"><span class="tt-title">INSTRUCTIVO</span><button class="tt-close" onclick="closeTooltip(event, this)">×</button></div>
                            <div class="tt-body">
                                <p><strong>PRECIO UNITARIO</strong></p>
                                <p>Precio por unidad comercial.</p>
                            </div>
                        </span>
                    </span></td>
                    <td colspan="3" class="label">VAL. AGREG. <span class="info" onclick="toggleTooltip(this)">ⓘ
                        <span class="tooltip">
                            <div class="tt-header"><span class="tt-title">INSTRUCTIVO</span><button class="tt-close" onclick="closeTooltip(event, this)">×</button></div>
                            <div class="tt-body">
                                <p><strong>VALOR AGREGADO</strong></p>
                                <p>Valor añadido nacional.</p>
                            </div>
                        </span>
                    </span></td>
                    <td colspan="2" class="label">E.F. ORIG-DEST-VEND-COMP</td>
                </tr>
                <tr>
                    <td colspan="3" class="data"><input type="text" name="partidas[${partidaCount}][valAduUsd]"></td>
                    <td colspan="3" class="data"><input type="text" name="partidas[${partidaCount}][impPrecioPag]"></td>
                    <td colspan="3" class="data"><input type="text" name="partidas[${partidaCount}][precioUnit]"></td>
                    <td colspan="3" class="data"><input type="text" name="partidas[${partidaCount}][valAgreg]"></td>
                    <td colspan="2" class="data"><input type="text" name="partidas[${partidaCount}][efInfo]"></td>
                </tr>
                <tr>
                    <td colspan="5" class="label">MARCA <span class="info" onclick="toggleTooltip(this)">ⓘ
                        <span class="tooltip">
                            <div class="tt-header"><span class="tt-title">INSTRUCTIVO</span><button class="tt-close" onclick="closeTooltip(event, this)">×</button></div>
                            <div class="tt-body">
                                <p><strong>MARCA</strong></p>
                                <p>Marca comercial registrada.</p>
                            </div>
                        </span>
                    </span></td>
                    <td colspan="5" class="label">MODELO <span class="info" onclick="toggleTooltip(this)">ⓘ
                        <span class="tooltip">
                            <div class="tt-header"><span class="tt-title">INSTRUCTIVO</span><button class="tt-close" onclick="closeTooltip(event, this)">×</button></div>
                            <div class="tt-body">
                                <p><strong>MODELO</strong></p>
                                <p>Modelo o referencia técnica.</p>
                            </div>
                        </span>
                    </span></td>
                    <td colspan="4" class="label">CÓDIGO PRODUCTO <span class="info" onclick="toggleTooltip(this)">ⓘ
                        <span class="tooltip">
                            <div class="tt-header"><span class="tt-title">INSTRUCTIVO</span><button class="tt-close" onclick="closeTooltip(event, this)">×</button></div>
                            <div class="tt-body">
                                <p><strong>CÓDIGO PRODUCTO</strong></p>
                                <p>SKU o identificador interno.</p>
                            </div>
                        </span>
                    </span></td>
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

            // Populate newly created selects
            const opts = getCountryOptions();
            newTbody.querySelectorAll('.country-sel-new').forEach(sel => {
                sel.innerHTML = '<option value="">Sel...</option>' + opts;
            });

            const btnAdd = document.querySelector('.btn-add');
            if (btnAdd) {
                const actionTbody = btnAdd.closest('tbody');
                const table = actionTbody.closest('table');
                table.insertBefore(newTbody, actionTbody);
            } else {
                const pages = document.querySelectorAll('.page');
                const lastPage = pages[pages.length - 1];
                const table = lastPage.querySelector('table');
                table.appendChild(newTbody);
            }

            checkPageOverflow();
        }

        function checkPageOverflow() {
            const pages = document.querySelectorAll('.page');
            const lastPage = pages[pages.length - 1];
            const MAX_HEIGHT = 1050; // Safe height for A4/Letter print

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

            // Basic Table Structure for new page
            newPage.innerHTML = `
                <table>
                    <tr>
                        <td colspan="12" class="header-title">ANEXO DEL PEDIMENTO (Continuación)</td>
                        <td colspan="2" class="label text-right">Página <span class="page-num">${pageCount}</span> de <span class="total-pages">?</span></td>
                    </tr>
                    <!-- Headers for Partidas repeated -->
                     <tr>
                        <td colspan="14" class="section-header">PARTIDAS (Continuación)</td>
                    </tr>
                    <tr>
                        <td class="label">FRACCIÓN</td>
                        <td class="label">SUBD</td>
                        <td class="label">VINC</td>
                        <td class="label">MET. VAL</td>
                        <td class="label">UMC</td>
                        <td class="label">CANT. UMC</td>
                        <td class="label">UMT</td>
                        <td class="label">CANT. UMT</td>
                        <td class="label">P.V/C</td>
                        <td class="label">P.O/D</td>
                        <td colspan="4" class="label"></td>
                    </tr>
                </table>
            `;

            document.body.appendChild(newPage);

            // Move overflowing elements
            // We assume the last added 'partida-tbody' caused the overflow.
            const table = sourcePage.querySelector('table');
            const partitas = table.querySelectorAll('.partida-tbody');

            if (partitas.length > 0) {
                const lastPartida = partitas[partitas.length - 1];
                const newTable = newPage.querySelector('table');
                newTable.appendChild(lastPartida);

                // Check if STILL overflowing (unlikely unless one partida is huge, but recursive check might be needed)
                // For simplicity, assumed moved.
            }
        }

        function updatePageNumbers() {
            const pages = document.querySelectorAll('.page');
            const total = pages.length;

            // Update inputs in first pages
            document.querySelectorAll('input[value="1"]').forEach(el => {
                if (el.style.width === '15px') { /* heuristics to find page num input */ }
            });

            // easier:
            // Page 1 inputs
            const p1 = document.getElementById('pagina1');
            if (p1) {
                const inputs = p1.querySelectorAll('.header-title ~ td input');
                if (inputs.length >= 2) {
                    inputs[1].value = total;
                }
            }

            // Page 2 inputs
            const p2 = document.getElementById('pagina2');
            if (p2) {
                // The "Página 2 de 2" is text in Page 2 usually, or inputs.
                // In our HTML it is: Pgina 2 de 2 (text)
                const label = p2.querySelector('.header-title ~ td.label');
                if (label) label.innerHTML = `Página 2 de ${total}`;
            }

            // Subsquent pages
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

        // Exportar a archivo JSON
        function exportarPedimento() {
            const form = document.getElementById('pedimentoForm');
            const formData = new FormData(form);
            const data = {};
            for (let [key, value] of formData.entries()) {
                data[key] = value;
            }
            
            // Sync current inputs (footers)
            syncFooters();

            // Save QR State
            const qrImg = document.getElementById('vucemQrImage');
            if (qrImg && qrImg.style.display === 'block') {
                data['__vucemQrSrc'] = qrImg.src;
            }

            const jsonString = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const ref = data['pedimentoNum'] || 'nuevo';
            const date = new Date().toISOString().slice(0, 10);
            const filename = `pedimento_${ref.replace(/\s+/g, '_')}_${date}.json`;
            
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
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
                    alert('❌ Error al leer el archivo JSON: ' + err.message);
                }
            };
            reader.readAsText(file);
            event.target.value = ''; // Reset for next use
        }

        function populateFormFromJSON(data) {
            resetFormInternal();

            // 1. Detect needed partidas count
            let maxPartidaIndex = -1;
            const partidaRegex = /^partidas\[(\d+)\]/;

            for (const key of Object.keys(data)) {
                const match = key.match(partidaRegex);
                if (match) {
                    const idx = parseInt(match[1]);
                    if (idx > maxPartidaIndex) maxPartidaIndex = idx;
                }
            }

            // 2. Create needed rows
            for (let i = 0; i <= maxPartidaIndex; i++) {
                agregarPartida();
                // Check if we need more contribution rows for this partida
                let maxContribIdx = 0;
                const contribRegex = new RegExp(`^partidas\\[${i}\\]\\[contribs\\]\\[(\\d+)\\]`);
                for (const key of Object.keys(data)) {
                    const cMatch = key.match(contribRegex);
                    if (cMatch) {
                        const cIdx = parseInt(cMatch[1]);
                        if (cIdx > maxContribIdx) maxContribIdx = cIdx;
                    }
                }
                for (let j = 1; j <= maxContribIdx; j++) {
                    addContribRow(i);
                }
            }

            // 3. Fill data and QR
            for (let [key, value] of Object.entries(data)) {
                // Compatibility mapping for old format
                let targetKey = key;
                const oldContribMatch = key.match(/^partidas\[(\d+)\]\[(con|tasa|tt|fp|importe)\]$/);
                if (oldContribMatch) {
                    const pIdx = oldContribMatch[1];
                    const cField = oldContribMatch[2] === 'importe' ? 'imp' : oldContribMatch[2];
                    targetKey = `partidas[${pIdx}][contribs][0][${cField}]`;
                }

                const fields = document.querySelectorAll(`[name="${targetKey}"]`);
                fields.forEach(field => {
                    field.value = value;
                    if (field.tagName === 'TEXTAREA') autoResize(field);
                });

                if (key === '__vucemQrSrc' && value) {
                    document.getElementById('vucemQrImage').src = value;
                    document.getElementById('vucemQrImage').style.display = 'block';
                    document.getElementById('vucemQrContainer').style.display = 'none';
                }
            }
            // Trigger Rectificacion check
            checkRectificacion();
            
            checkPageOverflow();
            alert('✅ Pedimento cargado correctamente');
        }

        function syncFooters() {
            const names = ['agenteNombre', 'agenteRfc', 'agenteCurp', 'mandatarioNombre', 'mandatarioRfc', 'mandatarioCurp', 'agentePatente', 'numSerieCertificado', 'firmaElectronica'];
            names.forEach(n => {
                const inputs = document.querySelectorAll(`[name="${n}"]`);
                if (inputs.length > 1) {
                    inputs.forEach(inp => {
                        inp.addEventListener('input', (e) => {
                            inputs.forEach(target => target.value = e.target.value);
                        });
                    });
                }
            });
        }

        // ========== VUCEM QR SELLO ==========
        function loadVucemQR() {
            const container = document.getElementById('vucemQrContainer');
            const img = document.getElementById('vucemQrImage');

            // Remove existing modal if present
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
            // Close on backdrop click
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
        // ═══════════════════════════════════════════════════════════════
        // LIGIE 2022/2026 — MOTOR DE BASE DE DATOS MASIVA (v15.0)
        // ═══════════════════════════════════════════════════════════════
        let TIGIE_DB = [];

        function buildTIGIEDB() {
            if (typeof ligieData !== 'undefined') {
                console.log("⚙️ Construyendo base de datos LIGIE jerárquica (v15.0)...");
                const chaptersIdx = ligieData.chapters || {};
                const headingsIdx = ligieData.headings || {};
                const subheadingsIdx = ligieData.subheadings || {};
                
                TIGIE_DB = [];

                // Mapear Fracciones con rutas de navegación
                for (const [frac, info] of Object.entries(ligieData.fractions || {})) {
                    const subId = info.parent || frac.split('.').slice(0, 2).join('.') || frac.substring(0,7);
                    const subInfo = subheadingsIdx[subId] || {};
                    const headId = subInfo.parent || (subId.length >= 4 ? subId.substring(0, 2) + "." + subId.substring(2, 4) : subId);
                    const headInfo = headingsIdx[headId] || {};
                    const chapId = headInfo.parent || headId.split('.')[0];
                    const chapInfo = chaptersIdx[chapId] || {};

                    // Descripciones
                    const chapDesc = chapInfo.description || `Capítulo ${chapId}`;
                    const headDesc = headInfo.description || "";
                    const subDesc = subInfo.description || "";
                    const fracDesc = info.description;

                    // Unidad (intento de extracción básica)
                    let unit = "Pza";
                    if (fracDesc.match(/\.\s*(Kg|Pza|Ltr|M3|M2|Par)\b/i)) {
                        unit = fracDesc.split(/\.\s*(Kg|Pza|Ltr|M3|M2|Par)/i)[1] || "Pza";
                    }

                    // Código normalizado para búsqueda ultra-flexible
                    const nc = frac.replace(/[\.\s-]/g, '').toLowerCase();

                    TIGIE_DB.push({
                        f: frac,         // Fracción con puntos
                        nc: nc,          // Fracción sin puntos
                        d: fracDesc,     // Solo descripción de la fracción
                        ch: chapDesc,    // Descripción del capítulo
                        hd: headDesc,    // Descripción de la partida
                        sub: subDesc,    // Descripción de la subpartida
                        u: unit,
                        n: info.nico || "00",
                        a: "Ex.", e: "Ex.", i: "16%" // Aranceles default si no vienen en PDF
                    });
                }
                console.log(`✅ Base TIGIE lista: ${TIGIE_DB.length} registros con jerarquía completa.`);
            }
        }
        
        window.addEventListener('DOMContentLoaded', buildTIGIEDB);

        function searchTIGIE(q) {
            const el = document.getElementById('tigieResults');
            if (!q || q.length < 2) { 
                el.innerHTML = '<p style="color:#64748b;font-size:11px;margin-top:20px">Escribe al menos 2 caracteres para buscar...</p>'; 
                return; 
            }
            
            // Normalizar entrada de usuario
            const cleanQ = q.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const queryCode = q.replace(/[\.\s-]/g, '').toLowerCase(); // Para buscar por código sin puntos
            const keywords = cleanQ.split(/\s+/).filter(k => k.length > 0);
            
            const results = TIGIE_DB.filter(r => {
                // Match por código normalizado (32099099)
                if (r.nc.includes(queryCode)) return true;
                
                // Match por texto en cualquier parte de la jerarquía
                const searchableText = (r.d + " " + r.ch + " " + r.hd + " " + r.sub).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                return keywords.every(kw => searchableText.includes(kw));
            }).slice(0, 50); // Límite de 50 para rendimiento

            if (results.length === 0) {
                el.innerHTML = '<p style="color:#f87171;font-size:11px;margin-top:20px">Sin resultados. Intenta con otra palabra o código sin puntos.</p>';
                return;
            }

            el.innerHTML = results.map(r => `
                <div class="tigie-result" onclick="navigator.clipboard.writeText('${r.f}');this.style.borderColor='#fbbf24';setTimeout(()=>this.style.borderColor='#10b981',800)">
                    <div style="font-size:9px; color:#10b981; margin-bottom:4px; font-weight:bold; border-bottom:1px solid #334155; padding-bottom:3px;">
                        <span style="color:#94a3b8; font-weight:normal;">CAPÍTULO:</span> ${r.ch}
                    </div>
                    <div style="font-size:8px; color:#94a3b8; font-style:italic; margin-bottom:6px;">
                        <span style="color:#64748b; font-weight:bold; font-style:normal;">PARTIDA:</span> ${r.hd} 
                        ${r.sub ? ' <span style="color:#64748b; font-weight:bold; font-style:normal;"> > SUBPARTIDA:</span> ' + r.sub : ''}
                    </div>
                    <div class="frac" style="font-size:14px; letter-spacing:1px;">${r.f} <span style="color:#64748b;font-size:10px">NICO ${r.n}</span> <span style="background:#334155;color:#94a3b8;padding:1px 5px;border-radius:3px;font-size:9px;margin-left:4px;">📦 ${r.u}</span></div>
                    <div class="desc" style="color:#fff; font-weight:bold; margin-top:4px; font-size:10px; border-top:1px dashed #334155; padding-top:4px;">${r.d}</div>
                    <div class="rates" style="margin-top:6px; background: rgba(16, 185, 129, 0.1); padding: 4px; border-radius: 4px;">IGI: <b>${r.a}</b> · IGE: <b>${r.e}</b> · IVA: <b>${r.i}</b> · <span style="color:#fbbf24">Click p/ copiar</span></div>
                </div>`).join('');
        }

        function calcDTA() {
            try {
                // Get Valor en Aduana
                const valAduanaInput = document.querySelector('input[name="valorAduana"]');
                if (!valAduanaInput || !valAduanaInput.value) {
                    alert("Primero debe ingresar el VALOR ADUANA en la cabecera.");
                    return;
                }
                
                // Parse clean value (remove commas)
                const valorAduanaStr = valAduanaInput.value.replace(/,/g, '');
                const valorAduana = parseFloat(valorAduanaStr);
                
                if (isNaN(valorAduana) || valorAduana <= 0) {
                    alert("El Valor en Aduana debe ser un número válido mayor a 0.");
                    return;
                }
                
                // LEY FEDERAL DE DERECHOS 2026 (ART. 49 FRACC. I)
                // Tasa: 8 al millar (0.008)
                let dta = valorAduana * 0.008;
                
                // Mínimo legal Abril 2026: $463.00
                const DTA_MINIMO = 463;
                if (dta < DTA_MINIMO) {
                    dta = DTA_MINIMO;
                }
                
                const dtaInput = document.getElementById('liqDtaImp');
                if (dtaInput) {
                    dtaInput.value = formatter(dta);
                }
            } catch (e) {
                console.error("Error al calcular DTA:", e);
            }
        }

        
        let currentZoom = 1;
        function zoomIn() { currentZoom += 0.1; document.querySelector('form').style.transform = `scale(${currentZoom})`; document.querySelector('form').style.transformOrigin = 'top center'; }
        function zoomOut() { currentZoom -= 0.1; document.querySelector('form').style.transform = `scale(${currentZoom})`; document.querySelector('form').style.transformOrigin = 'top center'; }

        function formatter(num, dec = 2) {
            const val = parseFloat(("" + num).replace(/,/g, ''));
            if (isNaN(val)) return "0.00";
            return new Intl.NumberFormat('en-US', { 
                minimumFractionDigits: dec, 
                maximumFractionDigits: dec 
            }).format(val);
        }

        function calcPRV() {
            const prvInput = document.getElementById('liqPrvImp');
            if (prvInput) { prvInput.value = "310"; } // Cuota fija estándar DOF 2026
        }

        function calcTotal() {
            try {
                const taxes = ['Igi', 'Dta', 'Iva', 'Prv', 'Cnt', 'Ieps', 'Rec', 'Cc', 'Mt'];
                const globalConceptTotals = {};
                taxes.forEach(t => globalConceptTotals[t.toUpperCase()] = 0);

                // 1. Sweep all partidas to aggregate taxes
                const partidaBodies = document.querySelectorAll('[id^="partida-"][id$="-contribs"]');
                partidaBodies.forEach(body => {
                    const partidaIdMatch = body.id.match(/partida-(\d+)-contribs/);
                    const pIdx = partidaIdMatch ? partidaIdMatch[1] : null;
                    let partidaSubtotal = 0;

                    const rows = body.querySelectorAll('.contrib-row');
                    rows.forEach(row => {
                        const conInput = row.querySelector('[name*="[con]"]');
                        const impInput = row.querySelector('[name*="[imp]"]');
                        
                        if (conInput && impInput) {
                            const con = conInput.value.toUpperCase().trim();
                            // Handle variations like "IEPS (A)" or "IEPS 20%"
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

                    // Update partida subtotal UI
                    if (pIdx !== null) {
                        const subInput = document.querySelector(`[name="partidas[${pIdx}][subtotal]"]`);
                        if (subInput) subInput.value = formatter(partidaSubtotal);
                    }
                });

                // 2. Synchronize aggregate totals to Global Summary
                Object.keys(globalConceptTotals).forEach(con => {
                    const id = 'liq' + con.charAt(0) + con.slice(1).toLowerCase() + 'Imp';
                    const liqInput = document.getElementById(id);
                    if (liqInput && globalConceptTotals[con] > 0) {
                        liqInput.value = formatter(globalConceptTotals[con]);
                    }
                });

                // 3. Calculate Final Grand Totals
                let totalAmount = 0;
                let efectivoAmount = 0;
                let otrosAmount = parseFloat(("" + (document.getElementById('liqOtros')?.value || "0")).replace(/,/g, '')) || 0;

                taxes.forEach(tax => {
                    const impInput = document.getElementById('liq' + tax + 'Imp');
                    if (impInput) {
                        const val = parseFloat(impInput.value.replace(/,/g, '')) || 0;
                        totalAmount += val;
                        
                        // Check F.P. to see if it's Efectivo (0)
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

        function calcIVA() {
            try {
                const valAduanaStr = (document.querySelector('input[name="valorAduana"]')?.value || "0").replace(/,/g, '');
                const dtaStr = (document.getElementById('liqDtaImp')?.value || "0").replace(/,/g, '');
                const igiStr = (document.getElementById('liqIgiImp')?.value || "0").replace(/,/g, '');
                const iepsStr = (document.getElementById('liqIepsImp')?.value || "0").replace(/,/g, '');
                
                const valAduana = parseFloat(valAduanaStr) || 0;
                const dta = parseFloat(dtaStr) || 0;
                const igi = parseFloat(igiStr) || 0;
                const ieps = parseFloat(iepsStr) || 0;
                
                if (valAduana <= 0) {
                    alert("Primero debe calcular o ingresar el Valor en Aduana.");
                    return;
                }
                
                // Base Gravable IVA = Valor en Aduana + IGI + DTA + IEPS (simplified)
                const baseIVA = valAduana + igi + dta + ieps;
                
                // Logic based on Operation Type / Destination
                const cve = document.querySelector('select[name="cvePedimento"]')?.value;
                let rate = 0.16;
                let rateLabel = "16%";
                
                if (['C1', 'C2', 'C3'].includes(cve)) {
                    rate = 0.08;
                    rateLabel = "8% (Frontera)";
                }

                const iva = baseIVA * rate;
                
                const ivaInput = document.getElementById('liqIvaImp');
                if (ivaInput) {
                    ivaInput.value = formatter(iva);
                    console.log(`IVA calculado al ${rateLabel} sobre base ${baseIVA}`);
                }
            } catch(e) {
                console.error("Error al calcular IVA:", e);
            }
        }

        function validateAndPrint() {
            const valAduana = (document.querySelector('input[name="valorAduana"]')?.value || "").trim();
            const dtaImp = (document.getElementById('liqDtaImp')?.value || "").trim().replace(/,/g, '');
            const ivaImp = (document.getElementById('liqIvaImp')?.value || "").trim().replace(/,/g, '');
            const tipoOper = document.querySelector('select[name="tipoOper"]')?.value;
            const cve = document.querySelector('select[name="cvePedimento"]')?.value;

            // Validación estricta para DESPERDICIOS / F4
            const descTextareas = document.querySelectorAll('textarea[name$="[descripcion]"]');
            let hasDesperdicio = false;
            for (let i = 0; i < descTextareas.length; i++) {
                const text = descTextareas[i].value.trim();
                if (!text) continue;
                const upperText = text.toUpperCase();
                
                if (upperText.startsWith("DESPERDICIO")) {
                    hasDesperdicio = true;
                }

                // Si la descripción menciona palabras clave de desperdicio/merma/desecho pero no inicia con "DESPERDICIO"
                const isWasteIntended = upperText.includes("DESPERDICIO") || upperText.includes("DESECHO") || upperText.includes("MERMA");
                if (isWasteIntended && !upperText.startsWith("DESPERDICIO")) {
                    alert(`⚠️ ERROR EN PARTIDA ${i + 1}:\n\nSi la partida corresponde a un desperdicio, la regla exige que la descripción inicie EXACTAMENTE con la palabra "DESPERDICIO" antes de todo el texto.\n\nDescripción actual:\n"${text}"`);
                    return;
                }
            }

            // Si es clave F4 (Cambio de régimen), validar si es el ejercicio que requiere partida de desperdicio
            if (cve === 'F4' && !hasDesperdicio) {
                const conf = confirm("⚠️ ATENCIÓN (Ejercicio Caso 2): En un pedimento F4 para cambio de régimen a valor de desperdicio, al menos una partida debería iniciar con la palabra 'DESPERDICIO'. No se detectó ninguna partida con ese prefijo.\n\n¿Desea imprimir/continuar de todos modos?");
                if (!conf) return;
            }
            
            if (!valAduana || valAduana === "0" || valAduana === "0.00") {
                alert("⚠️ ATENCIÓN: El 'Valor en Aduana' no puede estar vacío ni ser 0. Corríjalo antes de imprimir.");
                return;
            }
            if (!dtaImp || dtaImp === "0" || dtaImp === "0.00") {
                const conf = confirm("⚠️ ADVERTENCIA: El DTA está en 0 o vacío. Normalmente se cobra el 8 al millar. ¿Desea imprimir de todos modos?");
                if(!conf) return;
            }
            if ((!ivaImp || ivaImp === "0" || ivaImp === "0.00") && tipoOper !== 'EXP') {
                const conf = confirm("⚠️ ADVERTENCIA: El IVA está en 0 o vacío en una Importación. Verifique si su producto está exento. ¿Desea imprimir de todos modos?");
                if(!conf) return;
            }
            
            window.print();
        }

        // Cargar al inicio
        window.onload = () => {
            // Populate all country selects
            const opts = getCountryOptions();
            document.querySelectorAll('.country-sel, select[name="destino"]').forEach(sel => {
                sel.innerHTML = '<option value="">Sel...</option>' + opts;
            });

            // Delegated listener for tax sync
            window.addEventListener('input', (e) => {
                const name = e.target.name || "";
                if (name.includes('[contribs]') || name.startsWith('liq')) {
                    calcTotal();
                }
            });

            // Blur listener for formatting
            document.querySelectorAll('input[name^="liq"][name$="Imp"], #liqTotal, #liqEfectivo, #liqOtros').forEach(inp => {
                inp.addEventListener('blur', function() {
                    this.value = formatter(this.value);
                });
            });
            
            // cargarBorrador(); // Removed in favor of file import
        };
    