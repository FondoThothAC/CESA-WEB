document.addEventListener('DOMContentLoaded', async () => {
    const treeNav = document.getElementById('treeNav');
    const contentView = document.getElementById('contentView');
    const searchInput = document.getElementById('searchInput');
    const breadcrumb = document.getElementById('breadcrumb');
    
    // window.ligieData is loaded from data.js beforehand
    if (typeof ligieData !== 'undefined' && ligieData) {
        renderInitialTree();
    } else {
        treeNav.innerHTML = `
            <div class="loading-state">
                <i data-lucide="alert-circle" style="color: #ef4444; width: 40px; height: 40px; margin-bottom:16px;"></i>
                <p>Error cargando datos LIGIE.</p>
                <p style="font-size: 0.8rem; margin-top: 8px;">Asegúrate de haber generado el data.js</p>
            </div>
        `;
        lucide.createIcons();
    }

    function renderInitialTree() {
        treeNav.innerHTML = '';
        const docFragment = document.createDocumentFragment();

        // Check if data is empty
        if (!ligieData || Object.keys(ligieData.chapters || {}).length === 0) {
            treeNav.innerHTML = `<div class="loading-state"><p>No se encontraron capítulos. Revisa data.json</p></div>`;
            return;
        }

        // Render Chapters (which contain Headings -> Subheadings -> Fractions)
        Object.entries(ligieData.chapters).forEach(([chapCode, chapInfo]) => {
            const chapterEl = createTreeNode(`Capítulo ${chapCode}`, chapInfo.description, 'folder');
            const childrenContainer = document.createElement('div');
            childrenContainer.className = 'children-container';
            
            // Populate on click to save DOM nodes initially
            let populated = false;

            chapterEl.querySelector('.tree-node').addEventListener('click', (e) => {
                e.stopPropagation();
                // Toggle active state for other nodes
                document.querySelectorAll('.tree-node.active').forEach(n => n.classList.remove('active'));
                chapterEl.querySelector('.tree-node').classList.add('active');

                // Toggle expanded
                chapterEl.classList.toggle('expanded');
                
                if (!populated) {
                    populateHeadings(chapCode, childrenContainer);
                    populated = true;
                }
                
                showChapterView(chapCode, chapInfo);
            });

            chapterEl.appendChild(childrenContainer);
            docFragment.appendChild(chapterEl);
        });

        treeNav.appendChild(docFragment);
        lucide.createIcons();
    }

    function populateHeadings(chapCode, container) {
        const headings = Object.entries(ligieData.headings).filter(([k, v]) => v.parent === chapCode);
        
        headings.forEach(([headCode, headInfo]) => {
            const headingEl = createTreeNode(headCode, headInfo.description, 'layout-grid');
            const subContainer = document.createElement('div');
            subContainer.className = 'children-container';
            
            let pop = false;
            headingEl.querySelector('.tree-node').addEventListener('click', (e) => {
                e.stopPropagation();
                document.querySelectorAll('.tree-node.active').forEach(n => n.classList.remove('active'));
                headingEl.querySelector('.tree-node').classList.add('active');
                
                headingEl.classList.toggle('expanded');
                
                if (!pop) {
                    populateSubheadings(headCode, subContainer);
                    pop = true;
                }

                showHeadingView(headCode, headInfo);
            });

            headingEl.appendChild(subContainer);
            container.appendChild(headingEl);
        });
        
        if (headings.length === 0) {
            container.innerHTML = `<p style="font-size:0.8rem; color:var(--text-muted); padding:4px 12px;">Sin partidas</p>`;
        }
        lucide.createIcons();
    }

    function populateSubheadings(headCode, container) {
        const subheadings = Object.entries(ligieData.subheadings).filter(([k, v]) => v.parent === headCode);
        
        subheadings.forEach(([subCode, subInfo]) => {
            const subEl = createTreeNode(subCode, subInfo.description, 'layers');
            
            subEl.querySelector('.tree-node').addEventListener('click', (e) => {
                e.stopPropagation();
                document.querySelectorAll('.tree-node.active').forEach(n => n.classList.remove('active'));
                subEl.querySelector('.tree-node').classList.add('active');
                showSubheadingView(subCode, subInfo);
            });
            
            container.appendChild(subEl);
        });
        
        if (subheadings.length === 0) {
            container.innerHTML = `<p style="font-size:0.8rem; color:var(--text-muted); padding:4px 12px;">Sin subpartidas</p>`;
        }
        lucide.createIcons();
    }

    function createTreeNode(code, description, iconName) {
        const div = document.createElement('div');
        div.className = 'tree-item';
        div.innerHTML = `
            <div class="tree-node">
                <i data-lucide="${iconName}" class="node-icon"></i>
                <span class="node-code">${code}</span>
                <span class="node-title">${description || ''}</span>
            </div>
        `;
        return div;
    }

    // View Renders
    function updateBreadcrumb(items) {
        breadcrumb.innerHTML = items.map((item, idx) => {
            const isLast = idx === items.length - 1;
            return `
                <span class="${isLast ? 'active' : ''}">${item}</span>
                ${!isLast ? '<i data-lucide="chevron-right"></i>' : ''}
            `;
        }).join('');
        lucide.createIcons();
    }

    function showChapterView(chapCode, chapInfo) {
        updateBreadcrumb(['LIGIE', 'Capítulo ' + chapCode]);
        
        const headings = Object.entries(ligieData.headings).filter(([k, v]) => v.parent === chapCode);
        
        contentView.innerHTML = `
            <div class="detail-card">
                <div class="detail-header">
                    <h2>Capítulo ${chapCode}</h2>
                    <p>${chapInfo.description}</p>
                </div>
                
                <h3 style="margin-bottom: 12px; font-weight: 500;">Partidas en este capítulo:</h3>
                <table class="fractions-table">
                    <thead>
                        <tr>
                            <th>Partida</th>
                            <th>Descripción</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${headings.map(([hCode, hInfo]) => `
                            <tr>
                                <td class="frac-code">${hCode}</td>
                                <td>${hInfo.description}</td>
                            </tr>
                        `).join('') || '<tr><td colspan="2">No hay partidas listadas</td></tr>'}
                    </tbody>
                </table>
            </div>
        `;
    }

    function showHeadingView(headCode, headInfo) {
        const chapCode = headInfo.parent || headCode.split('.')[0];
        updateBreadcrumb(['LIGIE', 'Capítulo ' + chapCode, 'Partida ' + headCode]);
        
        const subs = Object.entries(ligieData.subheadings).filter(([k, v]) => v.parent === headCode);
        
        contentView.innerHTML = `
            <div class="detail-card">
                <div class="detail-header">
                    <h2>Partida ${headCode}</h2>
                    <p>${headInfo.description}</p>
                </div>
                
                <h3 style="margin-bottom: 12px; font-weight: 500;">Subpartidas:</h3>
                <table class="fractions-table">
                    <thead>
                        <tr>
                            <th>Subpartida</th>
                            <th>Descripción</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${subs.map(([sCode, sInfo]) => `
                            <tr>
                                <td class="frac-code">${sCode}</td>
                                <td>${sInfo.description}</td>
                            </tr>
                        `).join('') || '<tr><td colspan="2">No hay subpartidas listadas</td></tr>'}
                    </tbody>
                </table>
            </div>
        `;
    }

    function showSubheadingView(subCode, subInfo) {
        const headCode = subInfo.parent;
        const chapCode = headCode ? headCode.split('.')[0] : subCode.split('.')[0];
        updateBreadcrumb(['LIGIE', 'Capítulo ' + chapCode, 'Partida ' + headCode, 'Subpartida ' + subCode]);
        
        const fracs = Object.entries(ligieData.fractions).filter(([k, v]) => v.parent === subCode);
        
        contentView.innerHTML = `
            <div class="detail-card">
                <div class="detail-header">
                    <h2>Subpartida ${subCode}</h2>
                    <p>${subInfo.description}</p>
                </div>
                
                <h3 style="margin-bottom: 12px; font-weight: 500;">Fracciones Arancelarias:</h3>
                <table class="fractions-table">
                    <thead>
                        <tr>
                            <th>Fracción</th>
                            <th>Descripción</th>
                            <th>ACCIÓN</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${fracs.map(([fCode, fInfo]) => `
                            <tr>
                                <td class="frac-code">${fCode}</td>
                                <td>${fInfo.description}</td>
                                <td><button style="padding:4px 8px; border-radius:4px; background:var(--primary-color); border:none; color:white; cursor:pointer;" onclick="alert('Detalles de la fracción ${fCode} y aranceles no parseados en esta demo.')">Ver Arancel</button></td>
                            </tr>
                        `).join('') || '<tr><td colspan="3">No hay fracciones listadas</td></tr>'}
                    </tbody>
                </table>
            </div>
        `;
    }

    // Search Box Implementation
    let searchTimeout = null;
    
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase().trim();
        
        clearTimeout(searchTimeout);
        
        // Immediate UI feedback
        if (term) {
            treeNav.innerHTML = `<div style="padding:16px; color:var(--text-muted); font-size: 0.9rem;">Buscando resultados...</div>`;
        }
        
        searchTimeout = setTimeout(() => {
            if (!term) {
                renderInitialTree();
                contentView.innerHTML = `
                    <div class="welcome-message">
                        <i data-lucide="globe-2" class="huge-icon"></i>
                        <h1>Sistema de Consulta LIGIE 2022</h1>
                        <p>Selecciona un capítulo o partida en el menú lateral para explorar la tarifa actualizada...</p>
                    </div>
                `;
                lucide.createIcons();
                return;
            }

            // Fuzzy search logic across fractions
            if (!ligieData || !ligieData.fractions) return;
            
            const matchedFracs = Object.entries(ligieData.fractions).filter(([code, info]) => {
                return code.includes(term) || (info.description && info.description.toLowerCase().includes(term));
            }).slice(0, 50); // limit to up to 50 results
            
            treeNav.innerHTML = `<div style="padding:16px; color:var(--text-muted); font-size: 0.9rem;">Búsqueda completada.</div>`;
            
            contentView.innerHTML = `
                <div class="detail-card">
                    <div class="detail-header">
                        <h2>Resultados de Búsqueda para: "${term}"</h2>
                        <p>Mostrando ${matchedFracs.length} fracciones de la LIGIE.</p>
                    </div>
                    <table class="fractions-table">
                        <thead>
                            <tr>
                                <th>Fracción</th>
                                <th>Descripción</th>
                                <th>Subpartida</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${matchedFracs.map(([fCode, fInfo]) => `
                                <tr>
                                    <td class="frac-code">${fCode}</td>
                                    <td>${fInfo.description}</td>
                                    <td style="font-size:0.8rem; color:var(--text-muted)">${fInfo.parent || 'N/A'}</td>
                                </tr>
                            `).join('') || '<tr><td colspan="3">No se encontraron resultados</td></tr>'}
                        </tbody>
                    </table>
                </div>
            `;
        }, 300); // 300ms debounce
    });
});
