import * as THREE from 'three';
import { scene, renderer, ambientLight, dirLight, hemiLight, onWindowResize } from './scene.js';
import { camera } from './camera.js';
import { setupControls } from './controls.js';
import { buildFloor, buildSectors, sectorMeshes } from './store.js';
import { buildShelves } from './shelves.js';
import { createLabels } from './labels.js';
import { setupSearch, setupSidebar, selectSector, populateSectorList, setupKeyboardNavigation, startTour, stopTour } from './search.js';
import { sectorsData } from './store.js';
import { buildEmployees } from './employees.js';

// Get container
const container = document.getElementById('canvas-container');
container.appendChild(renderer.domElement);

// Setup controls
const controls = setupControls(camera, renderer);

// Build World
const floor = buildFloor(scene);
buildSectors(scene);
buildShelves(scene, sectorsData);
buildEmployees(scene, sectorsData);

function normalizeString(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
}

function processDynamicData(reportData) {
    sectorsData.forEach(sector => {
        const sectorNorm = normalizeString(sector.name);
        
        // Find all rows where Categoria matches our sector name
        // Handling special case for JARDIM / JARDINS
        const matchingRows = reportData.filter(row => {
            const catNorm = normalizeString(row.Categoria);
            return catNorm.includes(sectorNorm) || sectorNorm.includes(catNorm) || 
                   (catNorm === 'JARDINS' && sectorNorm === 'JARDIM');
        });

        if (matchingRows.length > 0) {
            let totalArea = 0;
            let totalContadas = 0;
            let totalFaltantes = 0;
            
            // Agrupar por Setor para o breakdown (ex: juntar múltiplos C050 da mesma Categoria)
            const groupedBySetor = {};

            matchingRows.forEach(row => {
                totalArea += row.Total_Area;
                totalContadas += row.Areas_Contadas;
                totalFaltantes += row.Areas_Faltantes;
                
                if (!groupedBySetor[row.Setor]) {
                    groupedBySetor[row.Setor] = { area: 0, contadas: 0, faltantes: 0 };
                }
                groupedBySetor[row.Setor].area += row.Total_Area;
                groupedBySetor[row.Setor].contadas += row.Areas_Contadas;
                groupedBySetor[row.Setor].faltantes += row.Areas_Faltantes;
            });

            // Converter objeto agrupado em array para a interface
            const breakdown = Object.keys(groupedBySetor).map(k => {
                const g = groupedBySetor[k];
                const p = g.area > 0 ? (g.contadas / g.area) * 100 : 0;
                return {
                    setor: k,
                    faltantes: g.faltantes,
                    progresso: parseFloat(p.toFixed(2))
                };
            });

            const progresso_num = totalArea > 0 ? (totalContadas / totalArea) * 100 : 0;
            
            sector.progress = {
                Progresso_Num: parseFloat(progresso_num.toFixed(2)),
                Areas_Faltantes: totalFaltantes,
                Total_Area: totalArea,
                Areas_Contadas: totalContadas,
                Breakdown: breakdown
            };
        } else {
            sector.progress = { Progresso_Num: 0.0, Areas_Faltantes: 0, Total_Area: 0, Areas_Contadas: 0, Breakdown: [] };
        }
    });

    createLabels(scene, sectorsData);
    populateSectorList(camera, controls);
}

// Renderização inicial vazia para não quebrar o layout antes da chegada dos dados
sectorsData.forEach(sector => {
    sector.progress = { Progresso_Num: 0.0, Areas_Faltantes: 0, Total_Area: 0, Areas_Contadas: 0, Breakdown: [] };
});
createLabels(scene, sectorsData);
populateSectorList(camera, controls);

// Receive data from parent window (Python Dashboard)
window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'REPORT_DATA') {
        processDynamicData(event.data.data);
    }
});

// Avisar o painel Python (HTML Pai) que o mapa 3D carregou e está pronto para receber os dados
if (window.parent !== window) {
    window.parent.postMessage({ type: 'MAPA_READY' }, '*');
}

// Setup UI components
setupSidebar();
setupSearch(camera, controls);
setupKeyboardNavigation(camera, controls);

// Raycaster for clicking
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseDoubleClick(event) {
    // Calculate mouse position in normalized device coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    // Intersect sector meshes
    const intersects = raycaster.intersectObjects(sectorMeshes);

    if (intersects.length > 0) {
        const selectedMesh = intersects[0].object;
        if (selectedMesh.userData.isSector) {
            selectSector(selectedMesh.userData.sectorData, camera, controls);
        }
    }
}
window.addEventListener('dblclick', onMouseDoubleClick, false);
window.addEventListener('resize', () => onWindowResize(camera), false);

// --- Idle Timeout Logic ---
let idleTimer = null;
const IDLE_TIMEOUT = 5000; // 5 segundos

function resetIdleTimer() {
    stopTour();
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
        startTour(camera, controls);
    }, IDLE_TIMEOUT);
}

// Escuta varios eventos para considerar que o usuario esta ativo
['mousemove', 'keydown', 'mousedown', 'touchstart', 'wheel'].forEach(evt => {
    window.addEventListener(evt, resetIdleTimer, { passive: true });
});

// Inicia o timer pela primeira vez
resetIdleTimer();

// Animation Loop
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    // Update controls (required for damping)
    controls.update();

    // Render main scene
    renderer.render(scene, camera);

}

// Start loop
animate();
