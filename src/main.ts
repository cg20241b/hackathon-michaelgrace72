import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';

//scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff); // White background

//camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

//renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Shader material for the animation effect
const letterMaterial = new THREE.ShaderMaterial({
    uniforms: {
        time: { value: 0 }
    },
    vertexShader: `
        uniform float time;
        void main() {
            vec3 pos = position;
            pos.y += sin(time + position.x) * 0.1;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
    `,
    fragmentShader: `
        void main() {
            gl_FragColor = vec4(0.09, 0.11, 0.53, 1.0); // #8B008B Dark Magenta
        }
    `
});

const numberMaterial = new THREE.ShaderMaterial({
    uniforms: {
        time: { value: 0 }
    },
    vertexShader: `
        uniform float time;
        void main() {
            vec3 pos = position;
            pos.y += sin(time + position.x) * 0.1;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
    `,
    fragmentShader: `
        void main() {
            gl_FragColor = vec4(0.9, 0.88, 0.46, 1.0); // #008B00 Complementary color
        }
    `
});

// Load font for 3D text
const loader = new FontLoader();
loader.load('https://threejs.org/examples/fonts/helvetiker_bold.typeface.json', (font: THREE.Font) => {
    // Create geometry for the letter 'l' on the left side
    const letterGeometry = new TextGeometry('A', {
        font: font,
        size: 1,
        height: 0.2,
    });
    const letterMesh = new THREE.Mesh(letterGeometry, letterMaterial);
    letterMesh.position.x = -2;
    letterMesh.position.y = 0;
    letterMesh.position.z = 0;
    scene.add(letterMesh);

    // Create geometry for the number '0' on the right side
    const numberGeometry = new TextGeometry('7', {
        font: font,
        size: 1,
        height: 0.2,
    });
    const numberMesh = new THREE.Mesh(numberGeometry, numberMaterial);
    numberMesh.position.x = 2;
    numberMesh.position.y = 0;
    numberMesh.position.z = 0;  
    scene.add(numberMesh);
});

// Set camera position
camera.position.z = 5;

// Function to animate the scene
function animate(): void {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

// Handle window resize
window.addEventListener('resize', onWindowResize, false);

function onWindowResize(): void {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
