import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

export function buildEmployees(scene, sectorsData) {
    // Array of possible hard hat colors
    const hatColors = [0xffffff, 0xffcc00, 0x0055ff, 0xffaa00];

    // Shared Materials
    const uniformMat = new THREE.MeshStandardMaterial({ color: 0x78B833, roughness: 0.8 }); // Green
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xffccaa, roughness: 0.6 });
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.9 });
    const boxMat = new THREE.MeshStandardMaterial({ color: 0xc09e7a, roughness: 0.9 });
    const ladderMat = new THREE.MeshStandardMaterial({ color: 0x999999, metalness: 0.5, roughness: 0.5 });
    
    // We will build a base group for the employee + ladder
    // Then we can clone it, change the hat color, and place it.

    // 1. LADDER
    const ladderGroup = new THREE.Group();
    const poleGeo = new THREE.CylinderGeometry(0.5, 0.5, 25);
    const pole1 = new THREE.Mesh(poleGeo, ladderMat);
    pole1.position.set(-2.5, 12.5, 0);
    pole1.castShadow = true;
    const pole2 = new THREE.Mesh(poleGeo, ladderMat);
    pole2.position.set(2.5, 12.5, 0);
    pole2.castShadow = true;
    ladderGroup.add(pole1, pole2);
    
    for(let i=0; i<6; i++) {
        const step = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 5), ladderMat);
        step.rotation.z = Math.PI / 2;
        step.position.set(0, 3 + i*4, 0);
        step.castShadow = true;
        ladderGroup.add(step);
    }

    // 2. PERSON
    // Legs
    const legsGeo = new THREE.BoxGeometry(3.5, 6, 2.5);
    const legs = new THREE.Mesh(legsGeo, pantsMat);
    legs.position.set(0, 3, 0);
    legs.castShadow = true;

    // Torso (Green Uniform)
    const torsoGeo = new THREE.BoxGeometry(4.5, 7, 3);
    const torso = new THREE.Mesh(torsoGeo, uniformMat);
    torso.position.set(0, 9.5, 0);
    torso.castShadow = true;

    // Head
    const headGeo = new THREE.BoxGeometry(3, 3, 3);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.set(0, 14.5, 0);
    head.castShadow = true;

    // Arms
    const armGeo = new THREE.BoxGeometry(1.5, 6, 1.5);
    
    // Left Arm (reaching up/forward to box)
    const leftArm = new THREE.Mesh(armGeo, uniformMat);
    leftArm.position.set(-3, 11, 2);
    leftArm.rotation.x = -Math.PI / 3;
    leftArm.castShadow = true;

    // Right Arm (holding ladder)
    const rightArm = new THREE.Mesh(armGeo, uniformMat);
    rightArm.position.set(3, 9, 1);
    rightArm.rotation.x = -Math.PI / 6;
    rightArm.castShadow = true;

    // Box in hand
    const holdBoxGeo = new THREE.BoxGeometry(5, 4, 4);
    const holdBox = new THREE.Mesh(holdBoxGeo, boxMat);
    holdBox.position.set(-2, 14, 4);
    holdBox.castShadow = true;

    // We will leave the hat out of the base person group so we can add it dynamically
    const personBaseGroup = new THREE.Group();
    personBaseGroup.add(legs, torso, head, leftArm, rightArm, holdBox);
    
    // Position person on the ladder
    personBaseGroup.position.set(0, 10, 2); // Standing around step 3/4

    // 3. FULL ASSEMBLY (Ladder + Person)
    const fullAssembly = new THREE.Group();
    fullAssembly.add(ladderGroup);
    fullAssembly.add(personBaseGroup);

    // 4. SCATTERING AROUND SECTORS
    // We will place 1 to 3 workers per sector randomly
    sectorsData.forEach(sector => {
        // Quantidade de trabalhadores baseada no tamanho do setor (1 a 3)
        const workerCount = 1 + Math.floor(Math.random() * 3);

        for (let i = 0; i < workerCount; i++) {
            const workerClone = fullAssembly.clone();

            // Create a custom hat for this clone
            const hatGeo = new THREE.CylinderGeometry(1.6, 2, 1.5, 16);
            // Pick random color
            const hatColor = hatColors[Math.floor(Math.random() * hatColors.length)];
            const customHatMat = new THREE.MeshStandardMaterial({ color: hatColor, roughness: 0.3 });
            const hat = new THREE.Mesh(hatGeo, customHatMat);
            
            // Position hat on head (relative to personBaseGroup which is at y=10)
            hat.position.set(0, 26, 2); // 10 (base) + 14.5 (head) + 1.5 (offset)
            hat.castShadow = true;
            workerClone.add(hat);

            // Calculate a random position within the sector boundaries
            // Sector x, z is center. Width and length are dimensions.
            // Shrink bounds slightly so they don't clip into walls
            const hw = (sector.width / 2) * 0.8;
            const hl = (sector.length / 2) * 0.8;
            
            const randomX = sector.x + (Math.random() * 2 - 1) * hw;
            const randomZ = sector.z + (Math.random() * 2 - 1) * hl;

            workerClone.position.set(randomX, 0, randomZ);

            // Random rotation so they face different directions
            workerClone.rotation.y = Math.random() * Math.PI * 2;

            // Scale slightly to match the world sizing
            // A shelf is ~55 units high. Our assembly is ~30 units high. This fits well!
            const randomScale = 0.9 + Math.random() * 0.2; // 0.9 to 1.1
            workerClone.scale.set(randomScale, randomScale, randomScale);

            scene.add(workerClone);
        }
    });
}
