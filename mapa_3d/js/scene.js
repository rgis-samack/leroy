import * as THREE from 'three';

export const scene = new THREE.Scene();
scene.background = new THREE.Color(0x2a2a2a);

// Renderer
export const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Lights
export const ambientLight = new THREE.AmbientLight(0xffffff, 0.4); 
scene.add(ambientLight);

export const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.4);
hemiLight.position.set(0, 1000, 0);
scene.add(hemiLight);

export const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(1000, 1500, 1000);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
dirLight.shadow.camera.near = 100;
dirLight.shadow.camera.far = 4000;
dirLight.shadow.camera.left = -2000;
dirLight.shadow.camera.right = 2000;
dirLight.shadow.camera.top = 2000;
dirLight.shadow.camera.bottom = -2000;
scene.add(dirLight);

export function onWindowResize(camera) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
