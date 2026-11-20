import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import ProductCard, { ProductImage } from '../components/ProductCard';
import { collections, products, productsIn, getProduct, heroProduct } from '../data/products';
import { useReveal } from '../hooks/useProductImage';

const COL_BG = {
  riviera: 'radial-gradient(80% 80% at 70% 20%, #f6d2a6 0%, #efe6d8 70%)',
  nocturne: 'radial-gradient(80% 80% at 30% 20%, #f2c3cd 0%, #ece2dc 70%)',
  meridian: 'radial-gradient(80% 80% at 60% 10%, #ece0c0 0%, #e6e2d8 70%)',
  atelier: 'radial-gradient(70% 70% at 50% 30%, #2b1a3d 0%, #0a0909 75%)',
};
const COL_FEATURE = { riviera: 'portofino', nocturne: 'vesper-noir', meridian: 'meridian', atelier: 'atelier-obsidian' };

function Marquee() {
  const words = ['Handmade in Italy', 'Polarized mineral glass', 'Free express shipping over €250', 'Lifetime hinge warranty', '30-day returns', 'Prescription-ready'];
  const row = [...words, ...words];
  return (
    <div className="marquee mono" aria-hidden="true">
      <div className="marquee__track">
        {row.map((w, i) => (
          <span key={i}>{w}</span>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const ref = useReveal();
  const bestsellers = products.filter((p) => p.bestseller).slice(0, 4);
  const atelier = getProduct('atelier-obsidian');
  const craftCw = heroProduct.colorways[1];

  return (
    <div ref={ref}>
      <Hero />
      <Marquee />

      <section className="section container">
        <div className="statement-row">
          <h2 className="statement reveal">
            Vesper is the hour the sun goes low and everything turns <em>gold.</em> We make sunglasses for it.
          </h2>
          <p className="reveal">
            Twelve frames, four collections, one obsession: the light at the end of the day. Every pair is cut, tumbled
            and polished by hand, then fitted with polarized mineral glass tuned for warm, low sun.
          </p>
        </div>
      </section>

      <section className="container" style={{ paddingBottom: 'clamp(80px,12vw,180px)' }}>
        <div className="section-head reveal">
          <div>
            <div className="mono">Collections</div>
            <h2>
              Four ways to <em>meet</em> the evening
            </h2>
          </div>
          <Link to="/shop" className="link-arrow">
            Shop all frames <span>→</span>
          </Link>
        </div>
        <div className="col-grid">
          {collections.map((c) => {
            const fp = getProduct(COL_FEATURE[c.slug]);
            const dark = c.slug === 'atelier';
            return (
              <Link key={c.slug} to={`/collections/${c.slug}`} className={`col-card reveal${dark ? ' col-card--dark' : ''}`}>
                <div className="col-card__bg" style={{ background: COL_BG[c.slug] }} />
                <span className="col-card__tag mono">{c.kicker}</span>
                <span className="col-card__count mono">{productsIn(c.slug).length} frames</span>
                <div className="col-card__img" style={{ aspectRatio: '16/10' }}>
                  <ProductImage product={fp} colorway={fp.colorways[0]} view="angle" width={1000} height={620} alt="" />
                </div>
                <div className="col-card__meta">
                  <div>
                    <h3>{c.name}</h3>
                    <p>{c.tagline}</p>
                  </div>
                  <span className="mono">Explore →</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="container" style={{ paddingBottom: 'clamp(80px,12vw,180px)' }}>
        <div className="section-head reveal">
          <div>
            <div className="mono">Most worn</div>
            <h2>
              The <em>bestsellers</em>
            </h2>
          </div>
          <Link to="/shop" className="link-arrow">
            View all <span>→</span>
          </Link>
        </div>
        <div className="p-grid">
          {bestsellers.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>

      <section className="container" style={{ paddingBottom: 'clamp(80px,12vw,180px)' }} id="craft">
        <div className="craft">
          <div className="craft__media reveal" style={{ position: 'relative' }}>
            <span className="mono" style={{ top: 20, left: 22 }}>{heroProduct.number} — Havana</span>
            <span className="mono" style={{ bottom: 20, right: 22 }}>Side profile</span>
            <div style={{ position: 'relative', width: '100%', aspectRatio: '1' }}>
              <ProductImage product={heroProduct} colorway={craftCw} view="side" width={1100} height={1100} alt="The Riviera in havana acetate, side profile" />
            </div>
          </div>
          <div className="reveal">
            <div className="mono">The making of a Vesper</div>
            <h2 className="statement" style={{ fontSize: 'clamp(34px,4vw,64px)', marginTop: 12 }}>
              Thirty days for <em>one</em> frame.
            </h2>
            <ol className="craft__steps">
              {[
                ['Block', 'Each front starts as a single 8 mm block of Italian cellulose acetate, cured for weeks.'],
                ['Cut', 'Milled, then shaped by hand: the brow, the bridge, the bevel along the cheek.'],
                ['Tumble', 'Three days in wooden barrels with chips and wax, until the edges turn soft.'],
                ['Glaze', 'Polished by hand and fitted with polarized mineral glass and five-barrel hinges.'],
              ].map(([t, d], i) => (
                <li key={t}>
                  <span className="mono">0{i + 1}</span>
                  <div>
                    <h4>{t}</h4>
                    <p>{d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="atelier section">
        <div className="container atelier__grid">
          <div className="reveal">
            <span className="mono" style={{ opacity: 0.6 }}>Atelier · Limited edition</span>
            <h2>
              Numbered.
              <br />
              <span className="grad-text">Never repeated.</span>
            </h2>
            <p>{atelier.description}</p>
            <div className="stock mono">
              {atelier.left} of {atelier.edition} remaining
              <div className="stock__bar">
                <i style={{ width: `${(atelier.left / atelier.edition) * 100}%` }} />
              </div>
            </div>
            <Link to={`/product/${atelier.slug}`} className="btn btn--grad">
              Discover {atelier.name.split(' — ')[1]} <span className="arrow">→</span>
            </Link>
          </div>
          <div className="reveal" style={{ position: 'relative', aspectRatio: '16/11' }}>
            <ProductImage product={atelier} colorway={atelier.colorways[0]} view="angle" width={1400} height={960} className="atelier__img" alt={atelier.name} />
          </div>
        </div>
      </section>

      <section className="section container">
        <div className="services">
          {[
            ['01', 'Free express shipping', 'On every order over €250, delivered in a hand-stitched case.'],
            ['02', '30-day returns', 'Wear them to dinner. If it is not love, send them back.'],
            ['03', 'Lifetime hinge warranty', 'Our five-barrel hinges are repaired free, forever.'],
            ['04', 'Prescription-ready', 'Every frame can take your prescription in polarized glass.'],
          ].map(([n, t, d]) => (
            <div key={n} className="reveal">
              <span className="mono" style={{ color: 'var(--muted)' }}>{n}</span>
              <h4>{t}</h4>
              <p>{d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
