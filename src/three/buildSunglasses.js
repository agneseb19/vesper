import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { makeMaterials } from './materials';

/*
  Procedural sunglasses.
  Units are roughly centimetres. +x = wearer's left / viewer's right, +y up,
  +z towards the viewer. The front sits on z≈0, temples run back to z≈-14.
  Only the right half is modelled; the left half is a mirrored clone.
*/

const TAU = Math.PI * 2;
const V2 = (x, y) => new THREE.Vector2(x, y);
const clamp01 = (v) => Math.min(1, Math.max(0, v));

function superellipse(t, a, b, n) {
  const c = Math.cos(t), s = Math.sin(t);
  return [a * Math.sign(c) * Math.abs(c) ** (2 / n), b * Math.sign(s) * Math.abs(s) ** (2 / n)];
}

// Lens outlines are written for the right eye: +x = outer side, -x = nose side.
export const SHAPES = {
  wayfarer: {
    w: 5.3, h: 3.8, n: 4, rim: 0.4, brow: 1.1, outer: 0.15, hinge: 0.5, gap: 2.0, rivets: true,
    mod: (x, y, a, b) => {
      const tx = x / a, ty = y / b;
      x *= 1 + 0.09 * ty;                               // wider at the top
      if (ty < 0 && tx < 0) x *= 1 - 0.14 * -ty;         // taper towards the nose
      y += 0.1 * b * clamp01(tx) * clamp01(ty);          // lift outer brow
      return [x, y];
    },
  },
  oversized: {
    w: 6.0, h: 5.0, n: 5, rim: 0.5, brow: 0.8, outer: 0.1, hinge: 0.48, gap: 1.9, rivets: true,
    mod: (x, y, a, b) => {
      const ty = y / b;
      x *= 1 + 0.06 * ty;
      return [x, y];
    },
  },
  cateye: {
    w: 5.4, h: 3.9, n: 2.8, rim: 0.4, brow: 0.5, outer: 0.9, hinge: 0.55, gap: 1.8,
    mod: (x, y, a, b) => {
      const tx = x / a, ty = y / b;
      y += 0.62 * b * clamp01(tx) ** 2.5 * clamp01(ty + 0.35); // the "wing"
      x += 0.08 * a * clamp01(tx) * clamp01(ty);
      x *= 1 + 0.07 * ty;
      if (ty < 0) y *= 0.9;
      return [x, y];
    },
  },
  round: {
    w: 4.8, h: 4.7, n: 2, rim: 0.45, brow: 0.15, outer: 0, hinge: 0.2, gap: 2.0,
    mod: (x, y) => [x, y],
  },
  aviator: {
    w: 5.7, h: 4.9, n: 2.1, rim: 0.0, brow: 0, outer: 0, hinge: 0.55, gap: 1.5,
    mod: (x, y, a, b) => {
      const tx = x / a, ty = y / b;
      if (ty > 0) { y *= 0.62; x *= 1 + 0.08 * ty; }            // flat, wide top
      else { x -= 0.32 * a * -ty * (1 - Math.abs(tx)) ** 0.7; y *= 1.08; } // teardrop leans to the nose
      return [x, y];
    },
  },
};

function outline(shapeKey, segs = 144) {
  const s = SHAPES[shapeKey];
  const a = s.w / 2, b = s.h / 2;
  const pts = [];
  for (let i = 0; i < segs; i++) {
    let [x, y] = superellipse((i / segs) * TAU, a, b, s.n);
    [x, y] = s.mod(x, y, a, b);
    pts.push(V2(x, y));
  }
  return pts;
}

// Offset a CCW polygon along its outward normals. `brow` thickens the top,
// `outer` thickens the outer-top corner (cat-eye wing).
function offset(pts, d, brow = 0, outer = 0) {
  const n = pts.length;
  return pts.map((p, i) => {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[(i + 1) % n];
    const tx = p1.x - p0.x, ty = p1.y - p0.y;
    const l = Math.hypot(tx, ty) || 1;
    const nx = ty / l, ny = -tx / l;
    const k = d * (1 + brow * Math.max(0, ny) ** 1.5 + outer * Math.max(0, nx) * Math.max(0, ny));
    return V2(p.x + nx * k, p.y + ny * k);
  });
}

function bounds(pts) {
  const b = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity };
  for (const p of pts) {
    b.minX = Math.min(b.minX, p.x); b.maxX = Math.max(b.maxX, p.x);
    b.minY = Math.min(b.minY, p.y); b.maxY = Math.max(b.maxY, p.y);
  }
  return b;
}

function lensGeometry(pts, a, b) {
  const geo = new THREE.ShapeGeometry(new THREE.Shape(pts), 1);
  const pos = geo.attributes.position;
  const bb = bounds(pts);
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i);
    pos.setZ(i, 0.14 * (1 - 0.55 * (x / a) ** 2 - 0.35 * (y / b) ** 2)); // gentle base curve
    uv[i * 2] = (x - bb.minX) / (bb.maxX - bb.minX);
    uv[i * 2 + 1] = (y - bb.minY) / (bb.maxY - bb.minY);
  }
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  geo.computeVertexNormals();
  return geo;
}

// Side profile of a temple arm, as a 2D shape in (u = distance back, v = height).
function templeCenter(u, L) {
  const k = 0.76 * L;
  if (u <= k) return [0, 0];
  const t = (u - k) / (L - k);
  return [-2.3 * t * t, -4.6 * t / (L - k)]; // [y, dy/du]
}

function acetateTempleGeometry(L, h0, h1, thick) {
  const N = 64, top = [], bot = [];
  for (let i = 0; i <= N; i++) {
    const u = (i / N) * L;
    const [cy, d] = templeCenter(u, L);
    const l = Math.hypot(-d, 1);
    const nx = -d / l, ny = 1 / l;
    const h = (h0 + (h1 - h0) * (u / L)) / 2;
    top.push(V2(u + nx * h, cy + ny * h));
    bot.push(V2(u - nx * h, cy - ny * h));
  }
  const shape = new THREE.Shape([...top, ...bot.reverse()]);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: thick, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 2, curveSegments: 1,
  });
  geo.rotateY(Math.PI / 2); // u → -z, thickness → +x
  geo.translate(-thick / 2, 0, 0);
  return geo;
}

function templePath(L, from = 0, to = L) {
  const pts = [];
  const N = 40;
  for (let i = 0; i <= N; i++) {
    const u = from + ((to - from) * i) / N;
    pts.push(new THREE.Vector3(0, templeCenter(u, L)[0], -u));
  }
  return new THREE.CatmullRomCurve3(pts);
}

export function buildSunglasses(product, colorway) {
  const S = SHAPES[product.shape];
  const isMetal = product.material === 'metal';
  const m = makeMaterials(product, colorway);
  const geos = [];
  const G = (g) => (geos.push(g), g);

  const a = S.w / 2, b = S.h / 2;
  const lensPts = outline(product.shape);
  const lb = bounds(lensPts);
  const D = product.limited ? 0.72 : isMetal ? 0.16 : 0.56;  // front thickness
  const gap = S.gap;
  const wrap = 0.07;
  const L = 14;

  const root = new THREE.Group();
  const half = new THREE.Group();          // right half, pivot on the nose-side edge
  half.position.x = gap / 2;
  half.rotation.y = -wrap;
  const eye = new THREE.Group();           // lens-local coordinates
  eye.position.x = -lb.minX;
  half.add(eye);

  let outerPts = lensPts;
  if (!isMetal) {
    outerPts = offset(lensPts, S.rim, S.brow, S.outer);
    const shape = new THREE.Shape(outerPts);
    shape.holes.push(new THREE.Path(lensPts));
    const g = G(new THREE.ExtrudeGeometry(shape, {
      depth: D, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.06, bevelSegments: 4, curveSegments: 1,
    }));
    g.translate(0, 0, -D / 2);
    eye.add(new THREE.Mesh(g, m.frame));
  } else {
    const rimPts = offset(lensPts, 0.05).map((p) => new THREE.Vector3(p.x, p.y, 0.02));
    const g = G(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rimPts, true), 220, 0.075, 10, true));
    eye.add(new THREE.Mesh(g, m.frame));
  }

  // Lens (slightly larger than the hole so its edge hides inside the rim)
  const lensMesh = new THREE.Mesh(G(lensGeometry(offset(lensPts, isMetal ? 0.02 : 0.1), a, b)), m.lens);
  lensMesh.renderOrder = 2;
  eye.add(lensMesh);

  // Hinge position: outermost point of the frame at hinge height
  const hy = lb.minY + (lb.maxY - lb.minY) * (0.5 + S.hinge * 0.5) - (isMetal ? 0 : 0.1);
  let xo = -Infinity;
  for (const p of outerPts) if (Math.abs(p.y - hy) < 0.35) xo = Math.max(xo, p.x);
  if (!isFinite(xo)) xo = lb.maxX;

  const hingeAnchor = new THREE.Object3D();
  const lensAnchor = new THREE.Object3D();
  const templeAnchor = new THREE.Object3D();
  lensAnchor.position.set((lb.minX + lb.maxX) / 2, 0, 0);
  eye.add(lensAnchor, hingeAnchor, templeAnchor);

  const temple = new THREE.Group();
  temple.name = 'temple';
  temple.rotation.y = -0.035 + wrap; // splay out slightly, cancel the front wrap
  eye.add(temple);

  if (!isMetal) {
    // End piece (block that carries the hinge backwards)
    const end = new THREE.Mesh(G(new RoundedBoxGeometry(0.42, 0.85, 0.55, 3, 0.12)), m.frame);
    end.position.set(xo - 0.24, hy, -D / 2 - 0.18);
    eye.add(end);

    // Five-barrel hinge
    const barrel = G(new THREE.CylinderGeometry(0.085, 0.085, 0.1, 20));
    for (let i = 0; i < 5; i++) {
      const c = new THREE.Mesh(barrel, m.metal);
      c.position.set(xo - 0.52, hy - 0.26 + i * 0.13, -D / 2 - 0.42);
      eye.add(c);
    }
    // Hinge plate + pins ride on the temple so they fold with it
    const plate = new THREE.Mesh(G(new RoundedBoxGeometry(0.05, 0.5, 1.1, 2, 0.02)), m.metal);
    plate.position.set(-0.2, 0, -0.51);
    temple.add(plate);
    const pin = G(new THREE.CylinderGeometry(0.05, 0.05, 0.05, 12));
    [-0.41, -0.81].forEach((z) => {
      const p = new THREE.Mesh(pin, m.metal);
      p.rotation.z = Math.PI / 2;
      p.position.set(-0.23, 0, z);
      temple.add(p);
    });

    // Temple arm
    const tg = G(acetateTempleGeometry(L, 0.72, 0.36, 0.3));
    const arm = new THREE.Mesh(tg, m.frame);
    temple.position.set(xo - 0.27, hy, -D / 2 - 0.44);
    temple.add(arm);

    // Signature rivets on the front
    if (S.rivets) {
      const rv = G(new THREE.CylinderGeometry(0.075, 0.075, 0.06, 16));
      [0.5, 0.82].forEach((dx) => {
        const r = new THREE.Mesh(rv, m.metal);
        r.rotation.x = Math.PI / 2;
        r.position.set(xo - dx, hy + 0.15, D / 2 + 0.07);
        eye.add(r);
      });
    }
    hingeAnchor.position.set(xo - 0.5, hy, -D / 2 - 0.6);
  } else {
    // Metal end piece + small hinge
    const endCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(xo - 0.1, hy, 0.02),
      new THREE.Vector3(xo + 0.2, hy, -0.1),
      new THREE.Vector3(xo + 0.25, hy, -0.55),
    ]);
    eye.add(new THREE.Mesh(G(new THREE.TubeGeometry(endCurve, 20, 0.08, 10)), m.frame));
    const barrel = G(new THREE.CylinderGeometry(0.075, 0.075, 0.1, 16));
    for (let i = 0; i < 3; i++) {
      const c = new THREE.Mesh(barrel, m.metal);
      c.position.set(xo + 0.25, hy - 0.11 + i * 0.11, -0.6);
      eye.add(c);
    }
    temple.position.set(xo + 0.25, hy, -0.62);
    temple.add(new THREE.Mesh(G(new THREE.TubeGeometry(templePath(L, 0, L * 0.8), 60, 0.055, 8)), m.frame));
    temple.add(new THREE.Mesh(G(new THREE.TubeGeometry(templePath(L, L * 0.66, L), 50, 0.13, 12)), m.tip));

    // Nose pad on a wire arm
    const padPos = new THREE.Vector3(lb.minX + 0.35, -b * 0.2, -0.75);
    const armCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(lb.minX + 0.1, b * 0.25, 0),
      new THREE.Vector3(lb.minX + 0.15, 0, -0.35),
      padPos.clone(),
    ]);
    eye.add(new THREE.Mesh(G(new THREE.TubeGeometry(armCurve, 20, 0.035, 8)), m.frame));
    const pad = new THREE.Mesh(G(new THREE.SphereGeometry(0.32, 20, 14)), m.pad);
    pad.scale.set(0.35, 1, 0.7);
    pad.position.copy(padPos);
    eye.add(pad);
    hingeAnchor.position.set(xo + 0.25, hy, -0.6);
  }
  templeAnchor.position.set(xo, hy, -6);

  root.add(half);
  const left = half.clone(true);
  left.position.x = -gap / 2;
  left.rotation.y = wrap;
  left.scale.x = -1;
  root.add(left);

  // ── Bridge ────────────────────────────────────────────
  const innerTop = Math.max(...outerPts.filter((p) => p.x < lb.minX + 1.2).map((p) => p.y));
  if (!isMetal) {
    const bx = gap / 2 - S.rim * 0.4; // reaches into both rims
    const top = innerTop - 0.22;
    const shape = new THREE.Shape();
    shape.moveTo(-bx, top);
    shape.lineTo(bx, top);
    shape.lineTo(bx, top - 1.25);
    shape.quadraticCurveTo(0, top - 0.25, -bx, top - 1.25);
    shape.closePath();
    const g = G(new THREE.ExtrudeGeometry(shape, {
      depth: D * 0.92, bevelEnabled: true, bevelThickness: 0.07, bevelSize: 0.05, bevelSegments: 3, curveSegments: 24,
    }));
    g.translate(0, 0, -D * 0.46);
    root.add(new THREE.Mesh(g, m.frame));
  } else {
    const ix = gap / 2 + 0.05;
    const topY = innerTop * (product.shape === 'aviator' ? 0.86 : 0.55);
    const bar = (pts, r) => root.add(new THREE.Mesh(G(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, r, 8)), m.frame));
    // Lower (nose) bridge: arch
    bar([
      new THREE.Vector3(-ix, topY * 0.45, 0.02),
      new THREE.Vector3(0, topY * 0.45 + 0.55, 0.12),
      new THREE.Vector3(ix, topY * 0.45, 0.02),
    ], 0.07);
    if (product.shape === 'aviator') {
      // Brow bar spanning the whole front
      bar([
        new THREE.Vector3(-ix - 0.6, innerTop - 0.05, 0.0),
        new THREE.Vector3(0, innerTop - 0.1, 0.1),
        new THREE.Vector3(ix + 0.6, innerTop - 0.05, 0.0),
      ], 0.06);
    }
  }

  root.updateMatrixWorld(true);
  const toLocal = (o) => root.worldToLocal(o.getWorldPosition(new THREE.Vector3()));
  const anchors = {
    center: new THREE.Vector3(0, 0, 0),
    lens: toLocal(lensAnchor),
    hinge: toLocal(hingeAnchor),
    temple: toLocal(templeAnchor),
  };

  const temples = [half, left].map((h) => h.getObjectByName('temple'));
  const baseRot = temples[0].rotation.y;

  return {
    group: root,
    anchors,
    // 0 = open, 1 = folded flat behind the lenses
    setFold(v) {
      temples.forEach((t) => (t.rotation.y = baseRot + v * 1.62));
    },
    dispose() {
      geos.forEach((g) => g.dispose());
      m.list.forEach((mat) => mat.dispose());
    },
  };
}
