import * as THREE from 'three';
import { METALS } from '../data/products';

// Textures are cached for the lifetime of the page (there are only a handful).
const texCache = new Map();

function canvasTexture(key, size, draw, repeat = 1) {
  if (texCache.has(key)) return texCache.get(key);
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  draw(ctx, size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat, repeat);
  t.anisotropy = 4;
  texCache.set(key, t);
  return t;
}

// Seeded random so every render of a tortoise frame looks identical.
function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

export function tortoiseTexture(base) {
  return canvasTexture(
    `tortoise:${base}`,
    512,
    (ctx, S) => {
      const r = rng(base.split('').reduce((a, ch) => a + ch.charCodeAt(0) * 31, 7));
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, S, S);
      const blobs = (n, colors, min, max, blur) => {
        ctx.filter = `blur(${blur}px)`;
        for (let i = 0; i < n; i++) {
          const x = r() * S, y = r() * S, rad = min + r() * (max - min);
          ctx.fillStyle = colors[Math.floor(r() * colors.length)];
          ctx.globalAlpha = 0.35 + r() * 0.55;
          ctx.beginPath();
          ctx.ellipse(x, y, rad * (0.6 + r()), rad, r() * Math.PI, 0, Math.PI * 2);
          ctx.fill();
          // wrap for tiling
          ctx.beginPath();
          ctx.ellipse((x + S / 2) % S, (y + S / 2) % S, rad, rad * 0.7, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      };
      blobs(120, ['#7a3f14', '#a8611f', '#5c2c0e'], 20, 60, 22);
      blobs(60, ['#d0903f', '#b9732a'], 8, 22, 12);
      blobs(45, ['#120804', '#1d0e06'], 10, 28, 14);
      ctx.filter = 'none';
      ctx.globalAlpha = 1;
    },
    0.16,
  );
}

export function lensTexture(lens) {
  return canvasTexture(`lens:${lens.top}:${lens.bottom}:${lens.mirror}`, 256, (ctx, S) => {
    const g = ctx.createLinearGradient(0, 0, 0, S);
    g.addColorStop(0, lens.top);
    g.addColorStop(0.45, lens.top);
    g.addColorStop(1, lens.bottom);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, S, S);
    if (lens.mirror) {
      // a soft diagonal sheen baked into mirrored lenses
      const s = ctx.createLinearGradient(0, 0, S, S);
      s.addColorStop(0.0, 'rgba(255,255,255,0)');
      s.addColorStop(0.42, 'rgba(255,255,255,0.18)');
      s.addColorStop(0.5, 'rgba(255,255,255,0)');
      ctx.fillStyle = s;
      ctx.fillRect(0, 0, S, S);
    }
  });
}

export function makeMaterials(product, colorway) {
  const isMetal = product.material === 'metal';
  const f = colorway.frame;
  const metalColor = METALS[colorway.metal] ?? '#c9ccd1';

  const metal = new THREE.MeshStandardMaterial({ color: metalColor, metalness: 1, roughness: 0.22 });

  let frame;
  if (isMetal) {
    frame = new THREE.MeshStandardMaterial({ color: f.color, metalness: 1, roughness: 0.26 });
  } else if (f.pattern === 'crystal') {
    frame = new THREE.MeshPhysicalMaterial({
      color: f.color,
      roughness: 0.08,
      clearcoat: 1,
      clearcoatRoughness: 0.04,
      transparent: true,
      opacity: 0.72,
      sheen: 0.5,
      sheenColor: new THREE.Color(f.color),
    });
  } else if (f.pattern === 'tortoise') {
    frame = new THREE.MeshPhysicalMaterial({
      map: tortoiseTexture(f.color),
      roughness: 0.2,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
    });
  } else {
    frame = new THREE.MeshPhysicalMaterial({
      color: f.color,
      roughness: 0.24,
      clearcoat: 1,
      clearcoatRoughness: 0.06,
    });
  }

  const tip = isMetal
    ? new THREE.MeshPhysicalMaterial({ color: '#17110e', roughness: 0.3, clearcoat: 1 })
    : frame;

  const L = colorway.lens;
  const lens = new THREE.MeshPhysicalMaterial({
    map: lensTexture(L),
    transparent: true,
    opacity: L.mirror ? 0.97 : 0.9,
    roughness: 0.04,
    metalness: L.mirror ? 0.55 : 0.08,
    clearcoat: 1,
    clearcoatRoughness: 0.02,
    iridescence: L.mirror ? 0.9 : 0.12,
    iridescenceIOR: 1.6,
    iridescenceThicknessRange: [180, 620],
    envMapIntensity: L.mirror ? 1.9 : 1.2,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  const pad = new THREE.MeshPhysicalMaterial({
    color: '#ffffff',
    transparent: true,
    opacity: 0.55,
    roughness: 0.15,
    clearcoat: 1,
  });

  return { frame, metal, tip, lens, pad, list: [metal, frame, tip, lens, pad] };
}
