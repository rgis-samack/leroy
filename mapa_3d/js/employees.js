import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

export const animatedWorkers = [];

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

    leftArm.name = 'leftArm';
    rightArm.name = 'rightArm';
    head.name = 'head';

    // We will leave the hat out of the base person group so we can add it dynamically
    const personBaseGroup = new THREE.Group();
    personBaseGroup.name = 'personBaseGroup';
    personBaseGroup.add(legs, torso, head, leftArm, rightArm, holdBox);
    
    // Position person on the ladder
    personBaseGroup.position.set(0, 10, 2); // Standing around step 3/4

    // 3. FULL ASSEMBLY (Ladder + Person)
    const fullAssembly = new THREE.Group();
    fullAssembly.add(ladderGroup);
    fullAssembly.add(personBaseGroup);

    // 3.5 WALKING ASSEMBLY (Just person)
    const walkingAssembly = new THREE.Group();
    const walkingPersonGroup = personBaseGroup.clone();
    walkingPersonGroup.position.set(0, 0, 0); // Ground level
    walkingAssembly.add(walkingPersonGroup);

    // 4. SCATTERING AROUND SECTORS
    sectorsData.forEach(sector => {
        const ladderWorkerCount = 1 + Math.floor(Math.random() * 2);
        const walkingWorkerCount = 2 + Math.floor(Math.random() * 4); // 2 to 5 walking

        const createWorker = (assembly, isWalking) => {
            const workerClone = assembly.clone();

            // Add hat to head directly so it scales/moves with the head
            const hatGeo = new THREE.CylinderGeometry(1.6, 2, 1.5, 16);
            const hatColor = hatColors[Math.floor(Math.random() * hatColors.length)];
            const customHatMat = new THREE.MeshStandardMaterial({ color: hatColor, roughness: 0.3 });
            const hat = new THREE.Mesh(hatGeo, customHatMat);
            hat.position.set(0, 2.5, 0); // Relative to head
            hat.castShadow = true;
            
            const headMesh = workerClone.getObjectByName('head');
            if (headMesh) headMesh.add(hat);

            // Sector Bounds
            const hw = (sector.width / 2) * 0.8;
            const hl = (sector.length / 2) * 0.8;
            
            const randomX = sector.x + (Math.random() * 2 - 1) * hw;
            const randomZ = sector.z + (Math.random() * 2 - 1) * hl;

            workerClone.position.set(randomX, 0, randomZ);
            workerClone.rotation.y = Math.random() * Math.PI * 2;

            const randomScale = 0.9 + Math.random() * 0.2;
            workerClone.scale.set(randomScale, randomScale, randomScale);

            scene.add(workerClone);
            
            animatedWorkers.push({
                isWalking: isWalking,
                group: workerClone,
                person: workerClone.getObjectByName('personBaseGroup'),
                leftArm: workerClone.getObjectByName('leftArm'),
                rightArm: workerClone.getObjectByName('rightArm'),
                head: headMesh,
                offset: Math.random() * Math.PI * 2,
                // Walking specifics
                target: isWalking ? new THREE.Vector3(
                    sector.x + (Math.random() * 2 - 1) * hw,
                    0,
                    sector.z + (Math.random() * 2 - 1) * hl
                ) : null,
                sectorBounds: { x: sector.x, z: sector.z, hw, hl },
                speed: 15 + Math.random() * 10
            });
        };

        for (let i = 0; i < ladderWorkerCount; i++) createWorker(fullAssembly, false);
        for (let i = 0; i < walkingWorkerCount; i++) createWorker(walkingAssembly, true);
    });
}

// Global clock for delta time
const clock = new THREE.Clock();

export function updateEmployees() {
    const time = clock.getElapsedTime();
    const delta = clock.getDelta();

    animatedWorkers.forEach(worker => {
        const t = time * 2 + worker.offset;
        
        if (!worker.isWalking) {
            // LADDER WORKER ANIMATION
            if(worker.head) worker.head.rotation.y = Math.sin(t * 0.5) * 0.5;
            if(worker.leftArm) worker.leftArm.rotation.x = -Math.PI / 3 + Math.sin(t) * 0.2;
            if(worker.rightArm) worker.rightArm.rotation.x = -Math.PI / 6 + Math.cos(t) * 0.1;
            if(worker.person) worker.person.position.y = 10 + Math.sin(t * 1.5) * 0.5;
        } else {
            // WALKING WORKER ANIMATION
            if (!worker.target) return;

            // Move towards target
            const currentPos = worker.group.position;
            const distance = currentPos.distanceTo(worker.target);

            if (distance < 2) {
                // Reached target, pick a new one
                const bounds = worker.sectorBounds;
                worker.target.set(
                    bounds.x + (Math.random() * 2 - 1) * bounds.hw,
                    0,
                    bounds.z + (Math.random() * 2 - 1) * bounds.hl
                );
            } else {
                // Move logic (simplified without delta for smooth look using time)
                // Just use basic vector math
                const dir = new THREE.Vector3().subVectors(worker.target, currentPos).normalize();
                
                // Rotation (smooth lookAt)
                const targetAngle = Math.atan2(dir.x, dir.z);
                
                // Simple lerp for rotation
                let rotDiff = targetAngle - worker.group.rotation.y;
                // Normalize diff to -PI to PI
                while(rotDiff > Math.PI) rotDiff -= Math.PI * 2;
                while(rotDiff < -Math.PI) rotDiff += Math.PI * 2;
                worker.group.rotation.y += rotDiff * 0.1;

                // Move forward
                worker.group.position.addScaledVector(dir, worker.speed * 0.016); // assume 60fps delta
                
                // Bobbing while walking
                worker.person.position.y = Math.abs(Math.sin(time * 8 + worker.offset)) * 1.5;
                
                // Swinging arms
                if(worker.leftArm) worker.leftArm.rotation.x = Math.sin(time * 8 + worker.offset) * 0.8;
                if(worker.rightArm) worker.rightArm.rotation.x = -Math.sin(time * 8 + worker.offset) * 0.8;
                if(worker.head) worker.head.rotation.y = Math.sin(t * 0.3) * 0.2;
            }
        }
    });
}
