import * as THREE from 'three';

// Perspective camera for the main view
export const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 10, 10000);

// Set initial position - looking diagonally from above
camera.position.set(0, 1500, 1800);

// Camera animation helper using GSAP
export function moveCameraTo(targetPosition, targetLookAt, duration = 1.5, controls) {
    if (!window.gsap) {
        console.warn('GSAP is not loaded');
        return;
    }

    // Animate camera position
    gsap.to(camera.position, {
        x: targetPosition.x,
        y: targetPosition.y,
        z: targetPosition.z,
        duration: duration,
        ease: "power3.inOut"
    });

    // Animate controls target (lookAt)
    gsap.to(controls.target, {
        x: targetLookAt.x,
        y: targetLookAt.y,
        z: targetLookAt.z,
        duration: duration,
        ease: "power3.inOut",
        onUpdate: () => {
            controls.update();
        }
    });
}
