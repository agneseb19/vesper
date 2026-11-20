import { Link, useParams } from 'react-router-dom';
import ProductCard, { ProductImage } from '../components/ProductCard';
import { collections, getCollection, productsIn } from '../data/products';
import { useReveal } from '../hooks/useProductImage';
import NotFound from './NotFound';

export default function Collection() {
  const { slug } = useParams();
  const col = getCollection(slug);
  const ref = useReveal();
  if (!col) return <NotFound />;
  const items = productsIn(slug);
  const lead = items[0];
  const others = collections.filter((c) => c.slug !== slug);

  return (
    <div ref={ref}>
      <section className="col-hero">
        <div className="col-hero__glow" style={{ background: col.tone }} />
        <div className="container col-hero__grid">
          <div>
            <div className="crumbs mono">
              <Link to="/shop">Shop</Link> / <span>{col.kicker}</span>
            </div>
            <h1 className="page-title">{col.name}</h1>
            <p className="serif" style={{ fontSize: 30, margin: '18px 0 10px', color: 'var(--ink)' }}>{col.tagline}</p>
            <p>{col.description}</p>
          </div>
          <div style={{ position: 'relative', aspectRatio: '16/10' }}>
            <ProductImage product={lead} colorway={lead.colorways[0]} view="angle" width={1200} height={750} eager alt={lead.name} />
          </div>
        </div>
      </section>

      <section className="container" style={{ paddingBottom: 120 }}>
        <div className="p-grid p-grid--3">
          {items.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>

      <section className="container" style={{ paddingBottom: 140 }}>
        <div className="section-head">
          <h2 style={{ fontSize: 'clamp(32px,3.6vw,56px)' }}>
            Other <em>collections</em>
          </h2>
        </div>
        <div className="chips">
          {others.map((c) => (
            <Link key={c.slug} to={`/collections/${c.slug}`} className="btn btn--ghost">
              {c.name} <span className="arrow">→</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
