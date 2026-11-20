import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

// Shared renderer setup: soft studio reflections + a warm key light.
export function createStage({ canvas, alpha = true, preserve = false, fov = 28 } = {}) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha,
    preserveDrawingBuffer: preserve,
    powerPreference: 'high-performance',
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envRT = pmrem.fromScene(new RoomEnvironment(), 0.035);
  scene.environment = envRT.texture;
  pmrem.dispose();

  const key = new THREE.DirectionalLight('#ffe2c2', 2.2);
  key.position.set(6, 9, 10);
  const rim = new THREE.DirectionalLight('#d9a0ff', 1.2);
  rim.position.set(-10, 4, -6);
  scene.add(key, rim, new THREE.AmbientLight('#ffffff', 0.25));

  const camera = new THREE.PerspectiveCamera(fov, 1, 0.05, 400);

  return {
    renderer,
    scene,
    camera,
    resize(w, h, dpr = Math.min(window.devicePixelRatio || 1, 2)) {
      renderer.setPixelRatio(dpr);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    },
    dispose() {
      envRT.dispose();
      renderer.dispose();
    },
  };
}

// Place the camera so that `object` fills the frame with some padding.
export function frameObject(camera, object, padding = 1.18) {
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const vfov = THREE.MathUtils.degToRad(camera.fov);
  const hfov = 2 * Math.atan(Math.tan(vfov / 2) * camera.aspect);
  const dist = Math.max(size.y / 2 / Math.tan(vfov / 2), size.x / 2 / Math.tan(hfov / 2)) * padding;
  camera.position.set(center.x, center.y, box.max.z + dist);
  camera.lookAt(center);
}
