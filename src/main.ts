import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';

//scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0f0f0f); // White background

//camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
//renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Shader material for the letter
const letterMaterial = new THREE.ShaderMaterial({
  uniforms: {
      lightPosition: { value: new THREE.Vector3() },
      lightIntensity: { value: 1.0 },
      ambientIntensity: { value: 0.237 },
      diffuseColor: { value: new THREE.Color(0x191d88) }, // Updated color for the letter
      specularColor: { value: new THREE.Color(1.0, 1.0, 1.0) },
      shininess: { value: 20.0 }
  },
  vertexShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;
      void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
  `,
  fragmentShader: `
      uniform vec3 lightPosition;
      uniform float lightIntensity;
      uniform float ambientIntensity;
      uniform vec3 diffuseColor;
      uniform vec3 specularColor;
      uniform float shininess;

      varying vec3 vNormal;
      varying vec3 vPosition;

      void main() {
          float distance = length(lightPosition - vPosition);
          float attenuation = lightIntensity / (1.0 + 0.1 * distance * distance);

          vec3 lightDir = normalize(lightPosition - vPosition);
          vec3 viewDir = normalize(-vPosition);
          vec3 reflectDir = reflect(-lightDir, vNormal);

          vec3 ambient = ambientIntensity * diffuseColor;
          float diff = max(dot(vNormal, lightDir), 0.0);
          vec3 diffuse = diff * diffuseColor * attenuation;
          float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
          vec3 specular = spec * specularColor * attenuation;

          gl_FragColor = vec4(ambient + diffuse + specular, 1.0);
      }
  `
});

// Shader material for the number
const numberMaterial = new THREE.ShaderMaterial({
  uniforms: {
      lightPosition: { value: new THREE.Vector3() },
      lightIntensity: { value: 1.0 },
      ambientIntensity: { value: 0.237 },
      diffuseColor: { value: new THREE.Color(0xe6e277) }, // Updated color for the number
      specularColor: { value: new THREE.Color(1.0, 1.0, 1.0) },
      shininess: { value: 20.0 }
  },
  vertexShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;
      void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
  `,
  fragmentShader: `
      uniform vec3 lightPosition;
      uniform float ambientIntensity;
      uniform vec3 diffuseColor;
      uniform vec3 specularColor;
      uniform float shininess;

      varying vec3 vNormal;
      varying vec3 vPosition;

      void main() {
          vec3 lightDir = normalize(lightPosition - vPosition);
          vec3 viewDir = normalize(-vPosition);
          vec3 halfDir = normalize(lightDir + viewDir);

          vec3 ambient = ambientIntensity * diffuseColor;
          float diff = max(dot(vNormal, lightDir), 0.0);
          vec3 diffuse = diff * diffuseColor;
          float spec = pow(max(dot(vNormal, halfDir), 0.0), shininess);
          vec3 specular = spec * specularColor;

          gl_FragColor = vec4(ambient + diffuse + specular, 1.0);
      }
  `
});

// Add glowing cube at the center of the scene
const glowMaterial = new THREE.ShaderMaterial({
  uniforms: {
      time: { value: 0.0 }
  },
  vertexShader: `
      void main() {
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
  `,
  fragmentShader: `
      void main() {
          vec3 color = vec3(1.0, 1.0, 1.0); // White glow
          float intensity = 1.0 - length(gl_PointCoord - 0.5) * 2.0; // Glow intensity
          intensity = pow(intensity, 2.0); // Smooth falloff
          gl_FragColor = vec4(color * intensity, intensity);
      }
  `,
  transparent: true
});

// Geometry for the glowing cube
const cubeGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
const glowCube = new THREE.Mesh(cubeGeometry, glowMaterial);
glowCube.position.set(0, 0, 0);
scene.add(glowCube);

// Add a point light at the cube's position
const pointLight = new THREE.PointLight(0xffffff, 1, 10);
pointLight.position.set(0, 0, 0);
pointLight.castShadow = true;
scene.add(pointLight);

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
    letterMesh.position.x = -3;
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

  letterMaterial.uniforms.lightPosition.value = glowCube.position;

  numberMaterial.uniforms.lightPosition.value = glowCube.position;

  pointLight.intensity = 10; // Sync light intensity for point light

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
document.body.appendChild(renderer.domElement);
animate();

// Handle window resize
window.addEventListener('resize', onWindowResize, false);

// Event listener for key press
window.addEventListener('keydown', (event) => {
  switch (event.key) {
      case 'w': // Move cube up
          glowCube.position.y += 0.1;
          pointLight.position.y = glowCube.position.y; // Keep light in sync
          break;
      case 's': // Move cube down
          glowCube.position.y -= 0.1;
          pointLight.position.y = glowCube.position.y; // Keep light in sync
          break;
      case 'a': // Move camera left
          camera.position.x -= 0.1;
          break;
      case 'd': // Move camera right
          camera.position.x += 0.1;
          break;
      default:
          break;
  }
});


function onWindowResize(): void {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
