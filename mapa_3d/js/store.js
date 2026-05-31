import * as THREE from 'three';

export const storeWidth = 4000;
export const storeLength = 2500;

export const sectorsData = [
    { id: 1, name: "Materiais Básicos", x: -1400, z: -800, width: 800, length: 600, color: "#FF9800", gondolas: 40, corredores: 4 },
    { id: 2, name: "Madeiras", x: -450, z: -800, width: 800, length: 600, color: "#8D6E63", gondolas: 30, corredores: 3 },
    { id: 3, name: "Elétrica", x: 450, z: -800, width: 800, length: 600, color: "#FBC02D", gondolas: 50, corredores: 5 },
    { id: 4, name: "Ferramentas", x: 1400, z: -800, width: 800, length: 600, color: "#9E9E9E", gondolas: 45, corredores: 5 },
    
    { id: 5, name: "Pisos Laminados", x: -1400, z: -100, width: 800, length: 600, color: "#A1887F", gondolas: 20, corredores: 2 },
    { id: 6, name: "Cerâmicas", x: -450, z: -100, width: 800, length: 600, color: "#E0E0E0", gondolas: 30, corredores: 3 },
    { id: 7, name: "Sanitários", x: 450, z: -100, width: 800, length: 600, color: "#03A9F4", gondolas: 25, corredores: 3 },
    { id: 8, name: "Encanamentos", x: 1400, z: -100, width: 800, length: 600, color: "#4DD0E1", gondolas: 40, corredores: 4 },
    
    { id: 9, name: "Jardim", x: -1400, z: 600, width: 800, length: 600, color: "#4CAF50", gondolas: 35, corredores: 4 },
    { id: 10, name: "Ferragens", x: -450, z: 600, width: 800, length: 600, color: "#607D8B", gondolas: 55, corredores: 6 },
    { id: 11, name: "Pintura", x: 450, z: 600, width: 800, length: 600, color: "#E91E63", gondolas: 40, corredores: 4 },
    { id: 12, name: "Decoração e Tapetes", x: 1400, z: 600, width: 800, length: 600, color: "#9C27B0", gondolas: 30, corredores: 3 },
    
    { id: 13, name: "Iluminação", x: -900, z: 1300, width: 800, length: 400, color: "#FFF59D", gondolas: 35, corredores: 4 },
    { id: 14, name: "Organização", x: 0, z: 1300, width: 800, length: 400, color: "#00BCD4", gondolas: 30, corredores: 3 },
    { id: 15, name: "Cozinhas Planejadas", x: 900, z: 1300, width: 800, length: 400, color: "#FF5722", gondolas: 20, corredores: 2 }
];

export const sectorMeshes = [];

export function buildFloor(scene) {
    // Main Floor
    const floorGeo = new THREE.PlaneGeometry(storeWidth, storeLength);
    const floorMat = new THREE.MeshStandardMaterial({ 
        color: 0x2a2a2a, 
        roughness: 0.9,
        metalness: 0.05
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    return floor;
}

export function buildSectors(scene) {
    sectorsData.forEach(sector => {
        // Create Sector Area (Glass/Premium look)
        const geometry = new THREE.PlaneGeometry(sector.width, sector.length);
        const material = new THREE.MeshPhysicalMaterial({ 
            color: sector.color, 
            transparent: true,
            opacity: 0.15,
            roughness: 0.1,
            metalness: 0.2,
            clearcoat: 1.0,
            depthWrite: false
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.set(sector.x, 2, sector.z); // Slightly above grid
        mesh.userData = { isSector: true, sectorData: sector };
        
        scene.add(mesh);
        sectorMeshes.push(mesh);
        
        // Outline for sector
        const edges = new THREE.EdgesGeometry(geometry);
        const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: sector.color, linewidth: 2 }));
        line.rotation.x = -Math.PI / 2;
        line.position.set(sector.x, 2.1, sector.z);
        scene.add(line);
    });
}
