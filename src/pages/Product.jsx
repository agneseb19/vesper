import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Viewer3D from '../components/Viewer3D';
import ProductCard, { Swatch } from '../components/ProductCard';
import { formatPrice, getCollection, getProduct, LENS_UPGRADES, products, SHAPE_LABELS } from '../data/products';
import { useCart } from '../context/CartContext';
import { useReveal } from '../hooks/useProductImage';
import NotFound from './NotFound';

export default function Product() {
  const { slug } = useParams();
  const product = getProduct(slug);
  if (!product) return <NotFound />;
  return <ProductView key={slug} product={product} />;
}

function ProductView({ product }) {
  const { add } = useCart();
  const [cwId, setCwId] = useState(product.colorways[0].id);
  const [lens, setLens] = useState('standard');
  const [view, setView] = useState('angle');
  const ref = useReveal();
  const cw = product.colorways.find((c) => c.id === cwId);
  const col = getCollection(product.collection);
  const upgrade = LENS_UPGRADES.find((l) => l.id === lens);
  const total = product.price + upgrade.price;

  const related = [
    ...products.filter((p) => p.collection === product.collection && p.slug !== product.slug),
    ...products.filter((p) => p.collection !== product.collection && p.bestseller),
  ].slice(0, 4);

  return (
    <div ref={ref}>
      <div className="container pdp">
        <div className="pdp__stage">
          <Viewer3D product={product} colorway={cw} view={view} onInteract={() => setView('free')} />
          <div className="pdp__views" role="group" aria-label="Camera">
            {['front', 'angle', 'side'].map((v) => (
              <button key={v} className="mono" aria-pressed={view === v} onClick={() => setView(v)}>
                {v}
              </button>
            ))}
          </div>
          <div className="pdp__hint mono">Drag to rotate</div>
        </div>

        <div className="pdp__info">
          <div className="crumbs mono">
            <Link to="/shop">Shop</Link> / <Link to={`/collections/${col.slug}`}>{col.name}</Link> / <span>{product.number}</span>
          </div>
          <h1>{product.name}</h1>
          <p className="pdp__tagline">{product.tagline}</p>
          <div className="pdp__price">{formatPrice(total)}</div>
          <p className="pdp__desc">{product.description}</p>

          {product.limited && (
            <div className="limited">
              <div className="mono" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Atelier · Numbered edition</span>
                <span>{product.left} / {product.edition} left</span>
              </div>
              <div className="stock__bar" style={{ height: 2, background: 'rgba(255,255,255,.15)', marginTop: 12 }}>
                <i style={{ display: 'block', height: '100%', width: `${(product.left / product.edition) * 100}%`, background: 'var(--grad)' }} />
              </div>
            </div>
          )}

          <div className="pdp__block">
            <div className="pdp__block-head">
              <strong>Colour</strong>
              <span style={{ color: 'var(--muted)' }}>{cw.name}</span>
            </div>
            <div className="pdp__swatches">
              {product.colorways.map((c) => (
                <button key={c.id} className="swatch-btn" aria-pressed={c.id === cwId} aria-label={c.name} onClick={() => setCwId(c.id)}>
                  <Swatch colorway={c} large />
                </button>
              ))}
            </div>
          </div>

          <div className="pdp__block">
            <div className="pdp__block-head">
              <strong>Lenses</strong>
              <span style={{ color: 'var(--muted)' }}>{cw.lens.name}</span>
            </div>
            <div className="lens-opts">
              {LENS_UPGRADES.map((l) => (
                <label key={l.id} className="lens-opt">
                  <span>
                    <input type="radio" name="lens" value={l.id} checked={lens === l.id} onChange={() => setLens(l.id)} />
                    {l.name}
                  </span>
                  <span style={{ color: 'var(--muted)' }}>{l.price ? `+ ${formatPrice(l.price)}` : 'Included'}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pdp__cta">
            <button className="btn btn--ink" style={{ flex: 1 }} onClick={() => add(product.slug, cwId, lens)}>
              Add to bag — {formatPrice(total)}
            </button>
          </div>
          <div className="pdp__perks">
            <span>✦ Free express shipping over €250</span>
            <span>✦ 30-day returns</span>
            <span>✦ Lifetime hinge warranty</span>
            <span>✦ Hand-stitched leather case</span>
          </div>

          <div style={{ marginTop: 32 }}>
            <details className="acc" open>
              <summary>Dimensions</summary>
              <div className="acc__body">
                <div className="spec-table">
                  {[
                    ['Lens width', product.specs.lens],
                    ['Bridge', product.specs.bridge],
                    ['Temple', product.specs.temple],
                    ['Weight', product.specs.weight],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <span className="mono" style={{ color: 'var(--muted)' }}>{k}</span>
                      <b>{v}</b>
                    </div>
                  ))}
                </div>
              </div>
            </details>
            <details className="acc">
              <summary>Materials & lenses</summary>
              <div className="acc__body">
                {product.material === 'metal'
                  ? 'Beta-titanium front and temples with a PVD finish, adjustable silicone nose pads and acetate temple tips.'
                  : 'Italian cellulose acetate, cut from a single block, tumbled for three days and polished by hand. Sterling silver five-barrel hinges.'}{' '}
                {SHAPE_LABELS[product.shape]} silhouette. Mineral glass lenses with 100% UV400 protection, category 3.
              </div>
            </details>
            <details className="acc">
              <summary>Shipping & returns</summary>
              <div className="acc__body">
                Ships in 1–2 working days from our studio. Free express shipping over €250. Returns are free within 30 days,
                in original condition.
              </div>
            </details>
          </div>
        </div>
      </div>

      <section className="container section">
        <div className="section-head">
          <h2 style={{ fontSize: 'clamp(36px,4vw,64px)' }}>
            Complete the <em>look</em>
          </h2>
        </div>
        <div className="p-grid">
          {related.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
