import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { heroProduct, formatPrice } from '../data/products';
import { useCart } from '../context/CartContext';

gsap.registerPlugin(ScrollTrigger);

/*
  Scroll-driven hero film, drawn on one 2D canvas (sticky viewport, ~7 screens of scroll).

  p 0.00–0.25  clip 1 (/hero/seq1): she turns to camera and lowers the sunglasses
  p 0.25–0.35  everything but the real sunglasses dissolves to black (cutout: /hero/glasses.png)
  p 0.35–0.45  the sunglasses glide to the centre, to where clip 2 starts
  p 0.45–0.86  clip 2 (/hero/seq2): the product turns and the camera moves in · 3 chapters
               (until clip 2 exists, the cutout holds centre stage with a slow push-in)
  p 0.86–1.00  the sunglasses lift away while the buy panel rises

  Frames are produced by scripts/extract_frames.py from the clips in /hero-src.
*/

const BASE = import.meta.env.BASE_URL; // '/' locally, '/vesper/' on GitHub Pages
const SEQ1 = `${BASE}hero/seq1`;
const SEQ2 = `${BASE}hero/seq2`;
const GLASSES = `${BASE}hero/glasses.png`;
const CLIP2_START_WIDTH = 0.58; // glasses width in clip 2's first frame (hero-src/kling-start-frame.png)

const CHAPTERS = [
  {
    side: 'left',
    in: [0.47, 0.5],
    out: [0.58, 0.61],
    text: 'Polarized mineral glass with a mirror that fades from dusk-violet to amber, so the last hour of sun keeps every colour.',
    specs: [['Polarization', '99%'], ['Protection', 'UV400'], ['Coating', '11 layers']],
  },
  {
    side: 'left',
    in: [0.61, 0.64],
    out: [0.71, 0.74],
    text: 'Eight millimetres of Italian acetate, polished for thirty days. Twin silver rivets mark every Vesper front.',
    specs: [['Curing', '30 days'], ['Rivets', 'Sterling silver'], ['Weight', '31 g']],
  },
  {
    side: 'left',
    in: [0.74, 0.77],
    out: [0.84, 0.87],
    text: 'Five-barrel hinges, riveted through the front so they never loosen. Repaired free, for life.',
    specs: [['Barrels', '5'], ['Finish', 'Sterling silver'], ['Warranty', 'Lifetime']],
  },
];

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const seg = (p, a, b) => clamp01((p - a) / (b - a));
const smooth = (t) => t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;

function loadSequence(base) {
  return fetch(`${base}/manifest.json`)
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`no ${base}`))))
    .then((m) => {
      const frames = Array.from({ length: m.count }, (_, i) => {
        const img = new Image();
        img.decoding = 'async';
        img.src = `${base}/${String(i + 1).padStart(4, '0')}.${m.ext || 'webp'}`;
        return img;
      });
      const edges = [frames[0], frames[frames.length - 1]].map((im) => im.decode().catch(() => {}));
      return Promise.all(edges).then(() => ({ ...m, frames, aspect: m.width / m.height }));
    });
}

const loaded = (img) => img && img.complete && img.naturalWidth > 0;

// Nearest frame that has finished loading (frames keep streaming in while you read the intro).
function frameAt(seq, t) {
  const want = Math.round(clamp01(t) * (seq.frames.length - 1));
  for (let d = 0; d < seq.frames.length; d++) {
    if (loaded(seq.frames[want - d])) return seq.frames[want - d];
    if (loaded(seq.frames[want + d])) return seq.frames[want + d];
  }
  return null;
}

// Where clip 1 is drawn. Landscape: cover. Portrait: zoomed onto her face.
function layoutClip1(W, H, aspect, g) {
  if (W / H >= 0.8) {
    const w = Math.max(W, H * aspect);
    const h = w / aspect;
    return { x: (W - w) * 0.62, y: (H - h) * 0.35, w, h };
  }
  const w = Math.max(W * 2.3, H * 0.72 * aspect); // tall enough to sit behind the title
  const h = w / aspect;
  return { x: W / 2 - (g.x + g.w / 2) * w, y: H * 0.34 - (g.y + g.h / 2) * h, w, h, tall: true };
}

// Where clip 2 is drawn (and where the cutout must land so the hand-off is seamless).
function layoutClip2(W, H, aspect) {
  if (W / H >= 0.8) {
    const w = Math.max(W, H * aspect);
    const h = w / aspect;
    return { x: (W - w) / 2, y: (H - h) / 2, w, h };
  }
  const w = (W * 0.86) / CLIP2_START_WIDTH;
  const h = w / aspect;
  return { x: (W - w) / 2, y: H * 0.36 - h / 2, w, h };
}

export default function Hero() {
  const product = heroProduct;
  const colorway = product.colorways[0];
  const { add } = useCart();
  const [ready, setReady] = useState(false);

  const section = useRef(null);
  const canvas = useRef(null);
  const el = useRef({});
  const set = (k) => (node) => (el.current[k] = node);

  useEffect(() => {
    let alive = true;
    const media = { seq1: null, seq2: null, glasses: null };
    const size = { w: 1, h: 1, dpr: 1 };
    let target = 0, p = 0, dirty = true;

    loadSequence(SEQ1)
      .then((s) => {
        if (!alive) return;
        media.seq1 = s;
        setReady(true);
        dirty = true;
      })
      .catch(() => {});
    loadSequence(SEQ2)
      .then((s) => {
        if (alive) (media.seq2 = s), (dirty = true);
      })
      .catch(() => {}); // clip 2 is optional until it exists
    const gl = new Image();
    gl.src = GLASSES;
    gl.decode().then(() => alive && ((media.glasses = gl), (dirty = true))).catch(() => {});

    const cv = canvas.current;
    const ctx = cv.getContext('2d');

    const resize = () => {
      const r = cv.parentElement.getBoundingClientRect();
      size.w = r.width;
      size.h = r.height;
      size.dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(r.width * size.dpr);
      cv.height = Math.round(r.height * size.dpr);
      dirty = true;
    };

    function drawImage(img, L) {
      if (img) ctx.drawImage(img, L.x, L.y, L.w, L.h);
    }

    function draw(p) {
      const W = size.w, H = size.h;
      const { seq1, seq2, glasses } = media;
      ctx.setTransform(size.dpr, 0, 0, size.dpr, 0, 0);
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, W, H);
      if (!seq1) return;

      const g = seq1.glasses;
      const L1 = layoutClip1(W, H, seq1.aspect, g);
      const L2 = layoutClip2(W, H, seq2 ? seq2.aspect : 16 / 9);

      const black = smooth(seg(p, 0.25, 0.35));
      const glide = smooth(seg(p, 0.35, 0.45));
      const exit = smooth(seg(p, 0.86, 0.96));

      // The sunglasses as they sit on her face in the last frame of clip 1…
      const face = { x: L1.x + g.x * L1.w, y: L1.y + g.y * L1.h, w: g.w * L1.w, h: g.h * L1.h };
      // …and where they are in the first frame of clip 2.
      const cw = CLIP2_START_WIDTH * L2.w;
      const ch = cw * (face.h / face.w);
      const centre = { x: L2.x + (L2.w - cw) / 2, y: L2.y + (L2.h - ch) / 2, w: cw, h: ch };

      // Exit: lift up and grow while the buy panel rises (applied to whatever is on stage).
      const lift = (R) => {
        if (!exit) return R;
        const s = 1 + 0.5 * exit;
        const cx = R.x + R.w / 2, cy = R.y + R.h / 2 - H * 0.55 * exit;
        return { x: cx - (R.w * s) / 2, y: cy - (R.h * s) / 2, w: R.w * s, h: R.h * s };
      };

      if (black < 1) {
        // Clip 1, scrubbed by scroll, with a slow push-in
        const zoom = 1.06 - 0.06 * smooth(seg(p, 0, 0.25));
        const Z = { w: L1.w * zoom, h: L1.h * zoom };
        Z.x = face.x + face.w / 2 - (face.x + face.w / 2 - L1.x) * zoom;
        Z.y = face.y + face.h / 2 - (face.y + face.h / 2 - L1.y) * zoom;
        drawImage(frameAt(seq1, seg(p, 0, 0.25)), p < 0.25 ? Z : L1);
        if (L1.tall) {
          // phones: fade the bottom of the clip into black, behind the title
          const top = L1.y + L1.h * 0.72;
          const grad = ctx.createLinearGradient(0, top, 0, L1.y + L1.h);
          grad.addColorStop(0, 'rgba(0,0,0,0)');
          grad.addColorStop(1, 'rgba(0,0,0,1)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, top, W, H - top);
        }
      }
      if (black > 0) {
        ctx.fillStyle = `rgba(0, 0, 0, ${black})`;
        ctx.fillRect(0, 0, W, H);
      }

      const onClip2 = seq2 && p >= 0.45;
      if (onClip2) {
        const t2 = seg(p, 0.45, 0.86);
        drawImage(frameAt(seq2, t2), lift(L2));
      } else if (glasses && p >= 0.25) {
        // The real sunglasses, cut out of clip 1: stay put, glide to centre, then hold
        let R = {
          x: lerp(face.x, centre.x, glide),
          y: lerp(face.y, centre.y, glide),
          w: lerp(face.w, centre.w, glide),
          h: lerp(face.h, centre.h, glide),
        };
        if (!seq2 && p > 0.45) {
          // placeholder until clip 2 exists: slow push-in with a gentle float
          const k = smooth(seg(p, 0.45, 0.86));
          const s = 1 + 0.22 * k;
          const cx = R.x + R.w / 2, cy = R.y + R.h / 2 - H * 0.02 * Math.sin(k * Math.PI);
          R = { x: cx - (R.w * s) / 2, y: cy - (R.h * s) / 2, w: R.w * s, h: R.h * s };
        }
        drawImage(glasses, lift(R));
      }
    }

    function updateDom(p) {
      const E = el.current;
      const introOut = smooth(seg(p, 0.03, 0.14));
      if (E.intro) {
        E.intro.style.opacity = 1 - introOut;
        E.intro.style.transform = `translateY(${-40 * introOut}px)`;
      }
      if (E.poster) E.poster.style.opacity = media.seq1 ? 0 : 1;

      CHAPTERS.forEach((c, i) => {
        const node = E[`ch${i}`];
        if (!node) return;
        const v = smooth(seg(p, c.in[0], c.in[1])) * (1 - smooth(seg(p, c.out[0], c.out[1])));
        node.style.opacity = v;
        node.style.translate = `0 ${(1 - v) * 24}px`;
      });
      if (E.pager) E.pager.style.opacity = seg(p, 0.44, 0.47) * (1 - seg(p, 0.86, 0.88));
      if (E.pagerFill) E.pagerFill.style.transform = `scaleX(${seg(p, 0.47, 0.87)})`;
      if (E.pagerNum) E.pagerNum.textContent = `0${p < 0.61 ? 1 : p < 0.74 ? 2 : 3}`;

      const buy = smooth(seg(p, 0.87, 0.98));
      if (E.buy) {
        E.buy.style.transform = `translateY(${(1 - buy) * 101}%)`;
        E.buy.style.pointerEvents = buy > 0.9 ? 'auto' : 'none';
      }
    }

    const st = ScrollTrigger.create({
      trigger: section.current,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => (target = self.progress),
    });

    const tick = () => {
      const next = p + (target - p) * 0.18;
      const moving = Math.abs(target - p) > 0.00005;
      if (!moving && !dirty) return;
      p = moving ? next : target;
      dirty = false;
      draw(p);
      updateDom(p);
    };
    gsap.ticker.add(tick);

    // keep drawing while frames stream in, so late frames replace their neighbours
    const streaming = setInterval(() => (dirty = true), 250);

    const ro = new ResizeObserver(resize);
    ro.observe(cv.parentElement);
    resize();

    return () => {
      alive = false;
      clearInterval(streaming);
      gsap.ticker.remove(tick);
      st.kill();
      ro.disconnect();
    };
  }, []);

  return (
    <section className="hero" ref={section} aria-label={`${product.name}, scroll story`}>
      <div className="hero__sticky">
        <img
          className="hero__poster"
          ref={set('poster')}
          src={`${BASE}hero/hero-a.jpg`}
          alt="A woman in an ivory silk shirt at sunset, Vesper sunglasses in her hair"
          style={{ opacity: ready ? 0 : 1 }}
        />
        <canvas
          className="hero__canvas"
          ref={canvas}
          role="img"
          aria-label="She turns to the camera and lowers her Vesper sunglasses. Then everything fades to black around the frame."
        />

        <div className="hero__intro" ref={set('intro')}>
          <div className="hero__title-wrap">
            <div className="hero__eyebrow mono">Model {product.number} — {product.name}</div>
            <h1 className="hero__title">Vesper</h1>
            <p className="hero__sub">Evening optics for the last light of the day.</p>
          </div>
          <div className="hero__aside">
            <span className="mono">(Drop 01) &nbsp; (Summer 27) &nbsp; ↓ Scroll</span>
          </div>
        </div>

        {CHAPTERS.map((c, i) => (
          <div key={i} className="hero__chapter" data-side={c.side} ref={set(`ch${i}`)}>
            <span className="accent" />
            <h3>{c.text}</h3>
            <dl>
              {c.specs.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}

        <div className="hero__pager mono" ref={set('pager')} aria-hidden="true">
          <span ref={set('pagerNum')}>01</span>
          <span className="hero__pager-track">
            <span className="hero__pager-fill" ref={set('pagerFill')} />
          </span>
          <span>03</span>
        </div>

        <div className="hero__buy" ref={set('buy')}>
          <div className="hero__buy-grid">
            <div>
              <div className="mono" style={{ opacity: 0.55 }}>
                Model {product.number} — {product.name}
              </div>
              <h2>
                Wear the golden hour
                <br />
                <span className="grad-text">long after it&rsquo;s gone.</span>
              </h2>
            </div>
            <div className="hero__buy-card">
              <div className="hero__buy-media">
                <img src={GLASSES} alt={`${product.name} in ${colorway.name}`} />
              </div>
              <div className="hero__buy-row">
                <div className="hero__buy-price">
                  {formatPrice(product.price)}
                  <small>{colorway.name}</small>
                </div>
                <button className="btn btn--grad" onClick={() => add(product.slug, colorway.id)}>
                  Add to bag <span className="arrow">→</span>
                </button>
              </div>
            </div>
          </div>
          <div className="hero__buy-foot mono">
            © 2027 Vesper® — Vesper is a concept brand made for a design study. Products, specs and prices are fictional.
          </div>
        </div>
      </div>
    </section>
  );
}
