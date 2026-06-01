import { sectorsData, sectorMeshes } from './store.js';
import { moveCameraTo } from './camera.js';
import * as THREE from 'three';

export function setupSearch(camera, controls) {
    const input = document.getElementById('search-input');
    const btn = document.getElementById('search-btn');
    const resultsContainer = document.getElementById('search-results');

    function removeAccents(str) {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    function performSearch() {
        const query = removeAccents(input.value.toLowerCase().trim());
        resultsContainer.innerHTML = '';
        
        if (query.length === 0) {
            resultsContainer.classList.add('hidden');
            return;
        }

        const matches = sectorsData.filter(s => removeAccents(s.name.toLowerCase()).includes(query));
        
        if (matches.length > 0) {
            resultsContainer.classList.remove('hidden');
            matches.forEach(sector => {
                const div = document.createElement('div');
                div.className = 'search-result-item';
                div.textContent = sector.name;
                div.onclick = () => {
                    selectSector(sector, camera, controls);
                    resultsContainer.classList.add('hidden');
                    input.value = '';
                };
                resultsContainer.appendChild(div);
            });
        } else {
            resultsContainer.classList.add('hidden');
        }
    }

    input.addEventListener('input', performSearch);
    btn.addEventListener('click', performSearch);
}

let currentSectorIndex = -1;
let sortedSectorsCache = [];

export function populateSectorList(camera, controls) {
    const sectorList = document.getElementById('sector-list');
    if (!sectorList) return;
    
    sectorList.innerHTML = ''; // Limpa caso chame de novo
    
    // Create a sorted copy by progress (highest first)
    const sortedSectors = [...sectorsData].sort((a, b) => {
        const progA = a.progress ? a.progress.Progresso_Num : 0;
        const progB = b.progress ? b.progress.Progresso_Num : 0;
        return progB - progA;
    });
    
    sortedSectorsCache = sortedSectors;
    
    sortedSectors.forEach(sector => {
        const prog = sector.progress ? sector.progress.Progresso_Num : 0;
        
        const item = document.createElement('div');
        item.className = 'sector-list-item';
        item.style.display = 'flex';
        item.style.justifyContent = 'space-between';
        item.style.alignItems = 'center';
        item.style.borderLeftColor = sector.color;
        
        const nameSpan = document.createElement('span');
        nameSpan.textContent = sector.name;
        
        const progSpan = document.createElement('span');
        progSpan.textContent = `${prog}%`;
        progSpan.style.fontWeight = 'bold';
        progSpan.style.color = prog > 0 ? 'var(--primary)' : '#999';
        progSpan.style.fontSize = '11px';
        
        item.appendChild(nameSpan);
        item.appendChild(progSpan);
        
        item.onclick = () => selectSector(sector, camera, controls);
        sectorList.appendChild(item);
    });
}

export function setupKeyboardNavigation(camera, controls) {
    window.addEventListener('keydown', (e) => {
        if (sortedSectorsCache.length === 0) return;
        
        // Block keyboard navigation if typing in the search box
        if (document.activeElement.id === 'search-input') return;

        if (e.key === 'ArrowRight' || e.key === ' ' || e.code === 'Space') {
            e.preventDefault(); // Prevent page scroll on space
            currentSectorIndex = (currentSectorIndex + 1) % sortedSectorsCache.length;
            selectSector(sortedSectorsCache[currentSectorIndex], camera, controls);
        } 
        else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            currentSectorIndex = (currentSectorIndex - 1 + sortedSectorsCache.length) % sortedSectorsCache.length;
            selectSector(sortedSectorsCache[currentSectorIndex], camera, controls);
        }
    });
}

export function selectSector(sectorData, camera, controls) {
    if (sortedSectorsCache.length > 0) {
        currentSectorIndex = sortedSectorsCache.indexOf(sectorData);
    }
    // Show sidebar
    const sidebar = document.getElementById('sidebar-panel');
    sidebar.classList.remove('hidden');
    
    // Populate data
    document.getElementById('sector-title').textContent = sectorData.name;
    document.getElementById('sector-title').style.color = sectorData.color;
    
    if (document.getElementById('sector-faltantes')) {
        const prog = sectorData.progress;
        document.getElementById('sector-faltantes').textContent = prog ? prog.Areas_Faltantes : 0;
        document.getElementById('sector-progresso').textContent = prog ? `${prog.Progresso_Num}%` : '0%';
        
        const breakdownContainer = document.getElementById('sector-breakdown');
        if (breakdownContainer) {
            if (prog && prog.Breakdown && prog.Breakdown.length > 0) {
                let html = '<div style="font-weight:bold; margin-bottom:5px; color:#555;">Composição:</div>';
                prog.Breakdown.forEach(b => {
                    const color = b.faltantes > 0 ? 'var(--danger, #dc3545)' : 'var(--success, #28a745)';
                    html += `<div style="display:flex; justify-content:space-between; margin-top:4px; border-bottom: 1px solid #eee; padding-bottom: 2px;">
                                <span><strong>${b.setor}</strong> (${b.progresso}%)</span>
                                <span style="color:${color}; font-weight:bold;">${b.faltantes} faltantes</span>
                             </div>`;
                });
                breakdownContainer.innerHTML = html;
                breakdownContainer.style.display = 'block';
            } else {
                breakdownContainer.style.display = 'none';
            }
        }
    }

    // Move camera
    const targetPos = new THREE.Vector3(sectorData.x, 800, sectorData.z + 800);
    const lookAtPos = new THREE.Vector3(sectorData.x, 0, sectorData.z);
    
    moveCameraTo(targetPos, lookAtPos, 1.5, controls);
}

export function setupSidebar() {
    const closeBtn = document.getElementById('close-btn');
    const sidebar = document.getElementById('sidebar-panel');
    
    closeBtn.addEventListener('click', () => {
        sidebar.classList.add('hidden');
    });
}

// --- Tour Automatic Logic ---
let tourInterval = null;

export function cycleNextSector(camera, controls) {
    if (sortedSectorsCache.length === 0) return;
    currentSectorIndex = (currentSectorIndex + 1) % sortedSectorsCache.length;
    selectSector(sortedSectorsCache[currentSectorIndex], camera, controls);
}

export function startTour(camera, controls) {
    if (tourInterval) return;
    // Pula pro proximo imediatamente e entao de 4 em 4 segundos
    cycleNextSector(camera, controls);
    tourInterval = setInterval(() => {
        cycleNextSector(camera, controls);
    }, 4000);
}

export function stopTour() {
    if (tourInterval) {
        clearInterval(tourInterval);
        tourInterval = null;
    }
}

