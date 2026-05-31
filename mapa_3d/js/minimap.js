import * as THREE from 'three';
import { storeWidth, storeLength } from './store.js';

let minimapCamera;
let minimapRenderer;
let minimapScene;

export function setupMinimap(scene, floor) {
    const canvas = document.getElementById('minimap-canvas');
    if (!canvas) return;

    // Use an orthographic camera for a top-down 2D map view
    const aspect = canvas.clientWidth / canvas.clientHeight;
    const viewSize = Math.max(storeWidth, storeLength) + 500;
    
    minimapCamera = new THREE.OrthographicCamera(
        -viewSize/2 * aspect, viewSize/2 * aspect,
        viewSize/2, -viewSize/2,
        1, 10000
    );
    
    // Look straight down
    minimapCamera.position.set(0, 4000, 0);
    minimapCamera.lookAt(0, 0, 0);

    minimapRenderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    minimapRenderer.setSize(canvas.clientWidth, canvas.clientHeight);
    minimapRenderer.setPixelRatio(window.devicePixelRatio);
    
    // Create a dot to represent the main camera
    const dotGeo = new THREE.CircleGeometry(80, 32);
    const dotMat = new THREE.MeshBasicMaterial({ color: 0xff0000, depthTest: false });
    const cameraDot = new THREE.Mesh(dotGeo, dotMat);
    cameraDot.rotation.x = -Math.PI / 2;
    cameraDot.position.y = 1000;
    scene.add(cameraDot);

    minimapScene = scene;

    return { minimapCamera, minimapRenderer, cameraDot };
}

export function renderMinimap(mainCamera, cameraDot) {
    if (!minimapRenderer) return;
    
    // Update camera dot position based on main camera
    cameraDot.position.x = mainCamera.position.x;
    cameraDot.position.z = mainCamera.position.z;
    
    minimapRenderer.render(minimapScene, minimapCamera);
}
