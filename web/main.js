import * as THREE from 'three';
import { GLTFLoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x020812, 0.0007);
const camera = new THREE.PerspectiveCamera(65, innerWidth / innerHeight, 0.1, 2e4);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0x789bc0, 1.5));
const sun = new THREE.DirectionalLight(0xffffff, 3);
sun.position.set(20, 30, 10);
scene.add(sun);

const planet = new THREE.Mesh(
  new THREE.SphereGeometry(300, 64, 32),
  new THREE.MeshStandardMaterial({ color: 0x1767c5, roughness: 0.82, metalness: 0.05, emissive: 0x07152f, emissiveIntensity: 0.25 })
);
planet.position.set(-700, 260, -1400);
scene.add(planet);
const atmosphere = new THREE.Mesh(
  new THREE.SphereGeometry(315, 64, 32),
  new THREE.MeshBasicMaterial({ color: 0xd66bff, transparent: true, opacity: 0.18, side: THREE.BackSide })
);
atmosphere.position.copy(planet.position);
scene.add(atmosphere);
const clouds = new THREE.Mesh(
  new THREE.SphereGeometry(304, 64, 32),
  new THREE.MeshBasicMaterial({ color: 0x39b86a, transparent: true, opacity: 0.22, wireframe: true })
);
clouds.position.copy(planet.position);
scene.add(clouds);

// Enemies — each keeps its own health in userData.hp
const corsair = new THREE.Mesh(
  new THREE.ConeGeometry(7, 22, 6),
  new THREE.MeshStandardMaterial({ color: 0xb52d4a, roughness: 0.55, metalness: 0.35 })
);
corsair.rotation.x = Math.PI / 2;
corsair.position.set(0, 0, -420);
corsair.userData.hp = 100;
scene.add(corsair);
const enemies = [corsair];
for (const [x, y, z] of [[-120, 35, -520], [150, -30, -650]]) {
  const enemy = corsair.clone();
  enemy.position.set(x, y, z);
  enemy.material = enemy.material.clone();
  enemy.material.color.set(0x8f2944);
  enemy.userData.hp = 100;
  scene.add(enemy);
  enemies.push(enemy);
}

// Starfield
const starGeo = new THREE.BufferGeometry();
const starPos = [];
for (let i = 0; i < 3000; i++) starPos.push((Math.random() - 0.5) * 6000, (Math.random() - 0.5) * 6000, (Math.random() - 0.5) * 6000);
starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0x9dccff, size: 2.2, sizeAttenuation: true })));

// Player ship
const ui = {
  speed: document.querySelector('#speed'),
  boost: document.querySelector('#boost'),
  hull: document.querySelector('#hull'),
  shields: document.querySelector('#shields'),
  arrow: document.querySelector('#enemyArrow'),
  target: document.querySelector('#target'),
  status: document.querySelector('#status'),
};
const ship = new THREE.Group();
scene.add(ship);
new GLTFLoader().load(
  'assets/Starfall_Interceptor.glb',
  (gltf) => {
    const model = gltf.scene;
    model.rotation.x = -Math.PI / 2;
    ship.add(model);
    ui.status.textContent = 'INTERCEPTOR READY';
  },
  undefined,
  () => (ui.status.textContent = 'MODEL LOAD FAILED — CHECK web/assets')
);

// Input
const keys = new Set();
let mx = 0, my = 0;
onkeydown = (e) => keys.add(e.code);
onkeyup = (e) => keys.delete(e.code);
onmousemove = (e) => {
  if (document.pointerLockElement) { mx += e.movementX; my += e.movementY; }
};
renderer.domElement.onclick = () => renderer.domElement.requestPointerLock();

// State
const clock = new THREE.Clock();
const shots = [];
const shotGeo = new THREE.SphereGeometry(0.16, 8, 8);
const shotMat = new THREE.MeshBasicMaterial({ color: 0x55eaff });
let shotCooldown = 0, boost = 100, speed = 0, hull = 100, shields = 100;
const cameraLook = new THREE.Vector3();

function updateShots(dt) {
  for (let i = shots.length - 1; i >= 0; i--) {
    const shot = shots[i];
    shot.mesh.position.addScaledVector(shot.velocity, dt);
    const hit = enemies.find((e) => e.visible && shot.mesh.position.distanceTo(e.position) < 18);
    if (hit) {
      hit.userData.hp -= 34;
      if (hit.userData.hp <= 0) hit.visible = false;
    }
    if (hit || shot.mesh.position.distanceTo(ship.position) > 1800) {
      scene.remove(shot.mesh);
      shots.splice(i, 1);
    }
  }
  if (keys.has('Space') && shotCooldown <= 0) {
    const beam = new THREE.Mesh(shotGeo, shotMat);
    beam.position.copy(ship.position);
    beam.quaternion.copy(ship.quaternion);
    const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(ship.quaternion);
    scene.add(beam);
    shots.push({ mesh: beam, velocity: direction.multiplyScalar(420) });
    shotCooldown = 0.16;
  }
}

function updateFlight(dt) {
  const thrust = (keys.has('KeyW') ? 1 : 0) - (keys.has('KeyS') ? 0.55 : 0);
  const boosting = keys.has('ShiftLeft') && thrust > 0 && boost > 0;
  speed += thrust * (boosting ? 90 : 45) * dt;
  speed *= Math.pow(0.32, dt);
  if (keys.has('KeyX')) speed *= Math.pow(0.02, dt); // brake
  speed = THREE.MathUtils.clamp(speed, -35, boosting ? 240 : 120);
  boost = boosting ? Math.max(0, boost - 30 * dt) : Math.min(100, boost + 18 * dt);

  ship.translateZ(-speed * dt);
  ship.rotation.y -= mx * 0.0018 - ((keys.has('KeyA') ? 1 : 0) - (keys.has('KeyD') ? 1 : 0)) * 1.2 * dt;
  ship.rotation.x += my * 0.0018;
  ship.rotation.z = THREE.MathUtils.lerp(ship.rotation.z, 0, 1 - Math.pow(0.001, dt));
  ship.rotation.z += ((keys.has('KeyQ') ? 1 : 0) - (keys.has('KeyE') ? 1 : 0)) * 1.8 * dt;
  ship.rotation.x = THREE.MathUtils.clamp(ship.rotation.x, -1.2, 1.2);
  ship.rotation.z = THREE.MathUtils.clamp(ship.rotation.z, -1.2, 1.2);
  mx = my = 0;
}

function updateCamera(dt) {
  const camPos = ship.localToWorld(new THREE.Vector3(0, 4.5, 14));
  camera.position.lerp(camPos, 1 - Math.pow(0.0008, dt));
  const levelLook = ship.localToWorld(new THREE.Vector3(0, 5, -30));
  cameraLook.lerp(levelLook, 1 - Math.pow(0.0008, dt));
  camera.up.copy(ship.up);
  camera.lookAt(cameraLook);
}

function updateHud(dt) {
  ui.speed.textContent = String(Math.round(Math.abs(speed))).padStart(3, '0');
  ui.boost.style.width = boost + '%';
  ui.hull.textContent = Math.round(hull);
  ui.shields.textContent = Math.round(shields);

  const live = enemies.find((e) => e.visible);
  if (live) {
    if (ship.position.distanceTo(live.position) < 24) {
      if (shields > 0) shields = Math.max(0, shields - 24 * dt);
      else hull = Math.max(0, hull - 12 * dt);
    }
    const local = ship.worldToLocal(live.position.clone());
    const angle = Math.atan2(local.x, -local.z);
    ui.arrow.style.display = '';
    ui.arrow.style.transform = `translate(-50%,-50%) rotate(${angle}rad)`;
    ui.target.textContent = 'CORSAIR // ' + Math.max(0, Math.round(live.userData.hp)) + ' HULL';
  } else {
    ui.arrow.style.display = 'none';
    ui.target.textContent = 'SECTOR CLEAR';
  }
}

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  shotCooldown -= dt;
  updateShots(dt);
  updateFlight(dt);
  updateCamera(dt);
  updateHud(dt);
  renderer.render(scene, camera);
}

onresize = () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
};
animate();
