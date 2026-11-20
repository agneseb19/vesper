import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { buildSunglasses } from '../three/buildSunglasses';
import { createStage, frameObject } from '../three/stage';
import { VIEWS } from '../three/studio';

// Interactive product viewer: drag to rotate, eases back into a slow idle turn.
export default function Viewer3D({ product, colorway, view = 'angle', onInteract }) {
  const canvas = useRef(null);
  const api = useRef(null);
  const interact = useRef(onInteract);
  interact.current = onInteract;

  useEffect(() => {
    const stage = createStage({ canvas: canvas.current, fov: 24 });
    const pivot = new THREE.Group();
    stage.scene.add(pivot);
    const s = { rx: 0.1, ry: -0.5, trx: 0.1, try: -0.5, vy: 0, dragging: false, idle: 0, model: null, framed: false };

    const fit = () => {
      if (!s.model) return;
      const r = pivot.rotation.clone();
      pivot.rotation.set(0.1, -0.5, 0);
      pivot.updateMatrixWorld(true);
      frameObject(stage.camera, pivot, 1.25);
      stage.camera.position.x = 0;
      stage.camera.lookAt(0, 0, 0);
      pivot.rotation.copy(r);
    };

    const setModel = (p, c) => {
      if (s.model) {
        pivot.remove(s.model.group);
        s.model.dispose();
      }
      s.model = buildSunglasses(p, c);
      const box = new THREE.Box3().setFromObject(s.model.group);
      const center = box.getCenter(new THREE.Vector3());
      s.model.group.position.set(-center.x, -center.y, -center.z);
      pivot.add(s.model.group);
      fit();
    };

    const resize = () => {
      const r = canvas.current.getBoundingClientRect();
      stage.resize(r.width, r.height);
      fit();
    };

    let last = null;
    const down = (e) => {
      s.dragging = true;
      last = { x: e.clientX, y: e.clientY };
      canvas.current.setPointerCapture(e.pointerId);
      interact.current?.();
    };
    const move = (e) => {
      if (!s.dragging) return;
      const dx = e.clientX - last.x, dy = e.clientY - last.y;
      last = { x: e.clientX, y: e.clientY };
      s.try += dx * 0.01;
      s.trx = THREE.MathUtils.clamp(s.trx + dy * 0.006, -0.6, 0.8);
      s.vy = dx * 0.01;
      s.idle = 0;
    };
    const up = () => (s.dragging = false);
    const c = canvas.current;
    c.addEventListener('pointerdown', down);
    c.addEventListener('pointermove', move);
    c.addEventListener('pointerup', up);
    c.addEventListener('pointercancel', up);

    let raf;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!s.dragging) {
        s.idle += 1;
        s.try += s.vy;
        s.vy *= 0.92;
        if (s.idle > 180 && !reduce) s.try += 0.0025;
      }
      s.rx += (s.trx - s.rx) * 0.1;
      s.ry += (s.try - s.ry) * 0.1;
      pivot.rotation.set(s.rx, s.ry, 0);
      stage.renderer.render(stage.scene, stage.camera);
    };

    api.current = {
      setModel,
      setView: (v) => {
        const target = VIEWS[v];
        if (!target) return; // 'free' = user is dragging, keep the current angle
        // rotate the short way round
        const turns = Math.round((s.try - target.ry) / (Math.PI * 2));
        s.try = target.ry + turns * Math.PI * 2;
        s.trx = target.rx;
        s.idle = 0;
        s.vy = 0;
      },
    };

    const ro = new ResizeObserver(resize);
    ro.observe(c);
    resize();
    loop();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      c.removeEventListener('pointerdown', down);
      c.removeEventListener('pointermove', move);
      c.removeEventListener('pointerup', up);
      c.removeEventListener('pointercancel', up);
      s.model?.dispose();
      stage.dispose();
      api.current = null;
    };
  }, []);

  useEffect(() => {
    api.current?.setModel(product, colorway);
  }, [product, colorway]);

  useEffect(() => {
    api.current?.setView(view);
  }, [view]);

  return <canvas ref={canvas} aria-label={`3D view of ${product.name}, drag to rotate`} role="img" />;
}
