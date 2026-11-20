import { buildSunglasses } from './buildSunglasses';
import { createStage, frameObject } from './stage';

/*
  One offscreen WebGL renderer turns the procedural models into PNG "product
  photos" for every card in the shop. Renders are queued (one per frame) and
  cached by product/colorway/view.
*/

export const VIEWS = {
  front: { rx: 0.06, ry: 0 },
  angle: { rx: 0.1, ry: -0.5 },
  side: { rx: 0.04, ry: -1.35 },
};

let stage = null;
const cache = new Map();
const queue = [];
let busy = false;

function getStage() {
  if (!stage) stage = createStage({ canvas: document.createElement('canvas'), preserve: true, fov: 22 });
  return stage;
}

function renderNow(product, colorway, view, w, h) {
  const st = getStage();
  st.resize(w, h, 1);
  const model = buildSunglasses(product, colorway);
  const v = VIEWS[view] ?? VIEWS.angle;
  model.group.rotation.set(v.rx, v.ry, 0);
  st.scene.add(model.group);
  frameObject(st.camera, model.group, view === 'side' ? 1.08 : 1.15);
  st.renderer.render(st.scene, st.camera);
  const url = st.renderer.domElement.toDataURL('image/png');
  st.scene.remove(model.group);
  model.dispose();
  return url;
}

function pump() {
  if (busy || !queue.length) return;
  busy = true;
  requestAnimationFrame(() => {
    const job = queue.shift();
    try {
      job.resolve(renderNow(job.product, job.colorway, job.view, job.w, job.h));
    } catch (e) {
      job.reject(e);
    }
    busy = false;
    pump();
  });
}

export function renderProductImage(product, colorway, { view = 'angle', width = 900, height = 560 } = {}) {
  const key = `${product.slug}|${colorway.id}|${view}|${width}x${height}`;
  if (!cache.has(key)) {
    cache.set(
      key,
      new Promise((resolve, reject) => {
        queue.push({ product, colorway, view, w: width, h: height, resolve, reject });
        pump();
      }),
    );
  }
  return cache.get(key);
}
