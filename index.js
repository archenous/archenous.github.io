import * as THREE from "three";
import { OrbitControls } from "jsm/controls/OrbitControls.js"; 

import Stats from "https://cdnjs.cloudflare.com/ajax/libs/stats.js/17/Stats.js"

const stats = new Stats()
stats.showPanel(0) 
document.body.appendChild(stats.dom)


//////////

const w = window.innerWidth;
const h = window.innerHeight;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
const container = document.querySelector('.star-animation');
container.appendChild(renderer.domElement);

// Dynamic plane size based on canvas
const aspect = window.innerWidth / window.innerHeight;
const planeWidth = 20; // Adjust as needed for mesh density
const planeHeight = planeWidth / aspect;

// Plane geometry
const planeGeometry = new THREE.PlaneGeometry(planeWidth, planeHeight, 100, 100);
const planeMaterial = new THREE.MeshStandardMaterial({
  color: 0x000000,
  side: THREE.DoubleSide,
//   wireframe: true, // Solid plane material
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(plane);

// EdgesGeometry to remove diagonals
const edges = new THREE.EdgesGeometry(planeGeometry); // Generates only outer edges
const edgesMaterial = new THREE.LineBasicMaterial({ color: 0x0077ff });
const wireframe = new THREE.LineSegments(edges, edgesMaterial);
scene.add(wireframe);

// Ball geometries
const ballMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const balls = [];



// Star shaders
const shaders = {
    dynamicVertexShader: `
      varying vec2 vUv;
  
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    starFragmentShader: `
      uniform float time;
      uniform vec3 starColor; // Characteristic color of the star
      uniform float highTemp;
      uniform float lowTemp;
  
      varying vec2 vUv;
  
      // Simple pseudo-random noise function
      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
      }
  
      // Grainy effect using noise
      float grainyNoise(vec2 st, float scale) {
        return random(st * scale + time * 0.1);
      }
  
      void main() {
        // Add grainy noise
        float noise = grainyNoise(vUv, 50.0); // Adjust scale for grain density
  
        // Combine the star's base color with the noise
        vec3 grainyColor = starColor + vec3(noise * 0.2);
  
        gl_FragColor = vec4(grainyColor, 1.0);
      }
    `
  };
  
/////////////////


// Create multiple balls
const numBalls = 3;
const radius = 3; // Circular motion radius

const starColorArr = [
    1.0, 0.5, 0.2, // Orange
    199/255, 216/255, 255/255, // Lighter blue
    175/255, 201/255, 255/255 // Light blue
];

const starRadiusArr = [0.1, 0.4, 0.2];
const starMassArr = [1, 3, 1.5];

for (let i = 0; i < numBalls; i++) {

  // Star color
  var starMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: 0,
      scale: 1,
      highTemp: {type: "f", value: 5000},
      lowTemp: {type: "f", value: 3000},
      starColor: { type: "v3", value: new THREE.Color(starColorArr[3*i], starColorArr[3*i+1], starColorArr[3*i+2])} 
    },
    vertexShader: shaders.dynamicVertexShader,
    fragmentShader: shaders.starFragmentShader,
    transparent: false,
    // polygonOffset: -.1,
    // usePolygonOffset: true
  });

  const ballGeometry = new THREE.SphereGeometry(starRadiusArr[i], 32, 32);
  const ball = new THREE.Mesh(ballGeometry, starMaterial);
  ball.position.set(0, 0.5, 0.5);

  const mass = starMassArr[i];

  balls.push({ mesh: ball, angleOffset: (i * Math.PI * 2) / numBalls, mass });
  scene.add(ball);
}








// Lights
const directionalLight = new THREE.DirectionalLight(0x00fffc, 0.9)
scene.add(directionalLight)

directionalLight.position.set(0, 0.5, 5);
// directionalLight.target = (0,0,0);
// scene.add( directionalLight.target );

// Camera position
camera.position.z = 6;
camera.lookAt(0, 0, 0);

const controls = new OrbitControls(camera, renderer.domElement);









// Deformation function
function deformMesh() {
  const vertices = planeGeometry.attributes.position;
  for (let i = 0; i < vertices.count; i++) {
    const vertex = new THREE.Vector3(
      vertices.getX(i),
      vertices.getY(i),
    );
    // Sum the deformation effect of all balls
    let totalDeformation = 0;
    for (const { mesh, mass } of balls) {
      const distance = vertex.distanceTo(mesh.position);
      if (distance < 2) { // Deform within a radius
        // const sigma = 1/mass;
        const sigma = 0.1*mass;
        totalDeformation += -3*Math.E**(-(distance**2)/(2*sigma))/Math.sqrt(2*Math.PI*sigma)*mass;
      }
    }
    vertices.setZ(i, totalDeformation);
  }
  vertices.needsUpdate = true;
  // Update the edges
  wireframe.geometry.dispose();
  wireframe.geometry = new THREE.EdgesGeometry(planeGeometry);
}

// Animation loop
let angle = 0;
function animate() {
  requestAnimationFrame(animate);

  stats.begin();
  // Update ball positions (circular motion)
  angle += 0.03;
  balls.forEach(({ mesh, angleOffset }) => {
    mesh.position.x = Math.cos(angle + angleOffset) * radius;
    mesh.position.y = Math.sin(angle + angleOffset) * radius;
  });
  // Deform the mesh
  deformMesh();
  renderer.render(scene, camera);

  stats.end();
}
// Handle window resize
window.addEventListener('resize', () => {
  const newAspect = window.innerWidth / window.innerHeight;
  camera.aspect = newAspect;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

container.style.opacity = "1";
animate();