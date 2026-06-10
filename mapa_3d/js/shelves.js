import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

export function buildShelves(scene, sectorsData) {
    const shelfWidth = 14;
    const shelfHeight = 55;
    const shelfLength = 70;
    
    // Construção de uma gôndola mais realista
    const baseGeom = new THREE.BoxGeometry(shelfWidth + 4, 4, shelfLength + 2);
    baseGeom.translate(0, 2 - shelfHeight/2, 0);
    
    const pillarGeom = new THREE.BoxGeometry(4, shelfHeight - 4, shelfLength - 2);
    pillarGeom.translate(0, 2, 0);

    const shelf1 = new THREE.BoxGeometry(shelfWidth + 2, 1.5, shelfLength);
    shelf1.translate(0, -shelfHeight/4, 0);

    const shelf2 = new THREE.BoxGeometry(shelfWidth + 2, 1.5, shelfLength);
    shelf2.translate(0, 5, 0);

    const topGeom = new THREE.BoxGeometry(shelfWidth + 2, 1.5, shelfLength);
    topGeom.translate(0, shelfHeight/2 - 2, 0);

    let geometry;
    try {
        geometry = BufferGeometryUtils.mergeGeometries([baseGeom, pillarGeom, shelf1, shelf2, topGeom]);
    } catch(e) {
        geometry = new THREE.BoxGeometry(shelfWidth, shelfHeight, shelfLength);
    }

    // Geometria dos "Produtos" (Caixas simulando estoque nas prateleiras)
    const prod1 = new THREE.BoxGeometry(shelfWidth, 8, shelfLength * 0.4);
    prod1.translate(0, -shelfHeight/4 + 5, -shelfLength * 0.2);

    const prod2 = new THREE.BoxGeometry(shelfWidth - 2, 12, shelfLength * 0.5);
    prod2.translate(0, 5 + 7, shelfLength * 0.15);

    const prod3 = new THREE.BoxGeometry(shelfWidth - 4, 6, shelfLength * 0.3);
    prod3.translate(0, shelfHeight/2 - 2 + 4, 0);

    let productsGeom;
    try {
        productsGeom = BufferGeometryUtils.mergeGeometries([prod1, prod2, prod3]);
    } catch(e) {
        productsGeom = new THREE.BoxGeometry(shelfWidth - 2, 10, shelfLength - 4);
    }

    // Material Premium e Leve (Sleek Metal) para a Gôndola
    const material = new THREE.MeshPhysicalMaterial({ 
        color: 0xf5f5f5,
        roughness: 0.2,
        metalness: 0.3,
        clearcoat: 0.4,
        clearcoatRoughness: 0.1
    });

    // Material fosco para os Produtos
    const productsMaterial = new THREE.MeshStandardMaterial({
        roughness: 0.8,
        metalness: 0.1
    });

    let totalGondolas = 0;
    sectorsData.forEach(s => totalGondolas += s.gondolas);

    // Create InstancedMeshes
    const instancedMesh = new THREE.InstancedMesh(geometry, material, totalGondolas);
    instancedMesh.castShadow = true;
    instancedMesh.receiveShadow = true;

    const productsInstancedMesh = new THREE.InstancedMesh(productsGeom, productsMaterial, totalGondolas);
    productsInstancedMesh.castShadow = true;
    productsInstancedMesh.receiveShadow = true;

    let instanceIdx = 0;
    const dummy = new THREE.Object3D();
    const colorObj = new THREE.Color();

    sectorsData.forEach(sector => {
        const rows = sector.corredores;
        const gondolasPerRow = Math.ceil(sector.gondolas / rows);
        
        const startX = sector.x - sector.width/2 + shelfWidth*2;
        const startZ = sector.z - sector.length/2 + shelfLength;
        
        const spacingX = (sector.width - shelfWidth*4) / (rows > 1 ? rows - 1 : 1);
        const spacingZ = (sector.length - shelfLength*2) / (gondolasPerRow > 1 ? gondolasPerRow - 1 : 1);

        let count = 0;
        for(let r=0; r<rows; r++) {
            for(let g=0; g<gondolasPerRow; g++) {
                if (count >= sector.gondolas) break;
                
                const px = startX + r * spacingX;
                const pz = startZ + g * spacingZ;
                
                dummy.position.set(px, shelfHeight/2, pz);
                
                const heightScale = 0.8 + Math.random() * 0.4;
                dummy.scale.set(1, heightScale, 1);
                
                dummy.updateMatrix();
                
                // Set matrix for both gondola and products
                instancedMesh.setMatrixAt(instanceIdx, dummy.matrix);
                productsInstancedMesh.setMatrixAt(instanceIdx, dummy.matrix);

                // Variar levemente a cor base do setor para os produtos não ficarem monocromáticos demais
                colorObj.set(sector.color);
                colorObj.offsetHSL(0, (Math.random() - 0.5) * 0.2, (Math.random() - 0.5) * 0.2);
                productsInstancedMesh.setColorAt(instanceIdx, colorObj);
                
                instanceIdx++;
                count++;
            }
        }
    });

    instancedMesh.instanceMatrix.needsUpdate = true;
    productsInstancedMesh.instanceMatrix.needsUpdate = true;
    if (productsInstancedMesh.instanceColor) productsInstancedMesh.instanceColor.needsUpdate = true;

    scene.add(instancedMesh);
    scene.add(productsInstancedMesh);
}
