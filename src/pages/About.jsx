import { Link } from 'react-router-dom';
import { ProductImage } from '../components/ProductCard';
import { getProduct } from '../data/products';
import { useReveal } from '../hooks/useProductImage';

export default function About() {
  const ref = useReveal();
  const riviera = getProduct('the-riviera');
  const gilda = getProduct('gilda');

  return (
    <div ref={ref}>
      <section className="container about-hero">
        <div className="mono">Our story</div>
        <h1 className="page-title">
          An hour,
          <br />
          not a <span className="serif" style={{ fontStyle: 'italic', letterSpacing: '-0.03em' }}>logo.</span>
        </h1>
      </section>

      <section className="container" style={{ paddingBottom: 140 }}>
        <div className="about-grid">
          <div className="about-media reveal" style={{ position: 'relative' }}>
            <div style={{ position: 'relative', width: '90%', aspectRatio: '16/10' }}>
              <ProductImage product={riviera} colorway={riviera.colorways[0]} view="angle" width={1200} height={750} alt="The Riviera" />
            </div>
          </div>
          <div className="reveal">
            <h2 className="statement" style={{ fontSize: 'clamp(32px,3.4vw,56px)' }}>
              Vesper began with one question: <em>why do sunglasses stop at sunset?</em>
            </h2>
            <p>
              We design for the hour when the light turns warm and low: long lunches by the sea, the walk to dinner, the
              last drink on a terrace. Our lenses are tuned for it, with gradients that soften glare without flattening
              the colour of the evening.
            </p>
            <p>
              Every frame is made in small batches by a family workshop in the Dolomites, from acetate cut, tumbled and
              polished by hand.
            </p>
          </div>
        </div>
      </section>

      <section className="container" style={{ paddingBottom: 140 }} id="craft">
        <div className="values">
          {[
            ['01', 'Made slowly', 'Thirty days from block to frame. We would rather sell out than speed up.'],
            ['02', 'Made to last', 'Five-barrel sterling hinges, replaceable lenses, and repairs for life.'],
            ['03', 'Made to be seen', 'Bold shapes, honest materials, no visible logos. The frame is the signature.'],
          ].map(([n, t, d]) => (
            <div key={n} className="reveal">
              <span className="mono" style={{ color: 'var(--muted)' }}>{n}</span>
              <h3>{t}</h3>
              <p>{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="atelier section">
        <div className="container about-grid">
          <div className="reveal" id="warranty">
            <span className="mono" style={{ opacity: 0.6 }}>Care & warranty</span>
            <h2 className="statement" style={{ fontSize: 'clamp(32px,3.6vw,60px)', margin: '14px 0 18px' }}>
              Repaired for <span className="grad-text">life.</span>
            </h2>
            <p style={{ color: 'rgba(250,247,242,.7)' }}>
              Hinges, screws and nose pads are covered forever. Scratched a lens? We replace it at cost. Send your Vesper
              back to the workshop and it returns adjusted, polished and cleaned.
            </p>
            <p style={{ color: 'rgba(250,247,242,.7)' }} id="shipping">
              Free express shipping over €250 · 30-day free returns · Ships in a hand-stitched leather case.
            </p>
            <p style={{ color: 'rgba(250,247,242,.7)' }} id="contact">
              Questions? Write to the studio at hello@vesper.example (a fictional address).
            </p>
          </div>
          <div className="reveal" style={{ position: 'relative', aspectRatio: '16/11' }}>
            <ProductImage product={gilda} colorway={gilda.colorways[0]} view="side" width={1200} height={820} alt="Gilda, side view" />
          </div>
        </div>
      </section>

      <section className="container section" style={{ textAlign: 'center' }}>
        <h2 className="statement reveal" style={{ margin: '0 auto 28px' }}>
          Find your <em>evening.</em>
        </h2>
        <Link to="/shop" className="btn btn--ink">Shop all frames <span className="arrow">→</span></Link>
      </section>
    </div>
  );
}
