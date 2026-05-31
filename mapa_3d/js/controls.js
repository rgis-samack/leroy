import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export function setupControls(camera, renderer) {
    const controls = new OrbitControls(camera, renderer.domElement);
    
    // Smooth damping
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Movement types
    controls.enablePan = true;
    controls.enableRotate = true;
    controls.enableZoom = true;

    // Mouse buttons mapping
    controls.mouseButtons = {
        LEFT: THREE.MOUSE.PAN,    // Drag to pan (like Google Maps)
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.ROTATE // Right click to rotate
    };

    // Limits
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // Prevent going below ground
    controls.minDistance = 600;  // Limite de aproximação para não perder o foco
    controls.maxDistance = 2800; // Reduzido para evitar que o mapa fique muito pequeno
    
    // Pan limits (approximate floor bounds)
    const panBoundary = 2500;
    
    // Hook into update to restrict pan
    const _update = controls.update.bind(controls);
    controls.update = function() {
        // Enforce pan boundaries
        if (this.target.x > panBoundary) this.target.x = panBoundary;
        if (this.target.x < -panBoundary) this.target.x = -panBoundary;
        if (this.target.z > panBoundary) this.target.z = panBoundary;
        if (this.target.z < -panBoundary) this.target.z = -panBoundary;
        
        _update();
    };

    return controls;
}
