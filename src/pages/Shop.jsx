import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { collections, products, SHAPE_LABELS } from '../data/products';
import { useReveal } from '../hooks/useProductImage';

const SORTS = {
  featured: { label: 'Featured', fn: () => 0 },
  'price-asc': { label: 'Price: low to high', fn: (a, b) => a.price - b.price },
  'price-desc': { label: 'Price: high to low', fn: (a, b) => b.price - a.price },
  name: { label: 'Name', fn: (a, b) => a.name.localeCompare(b.name) },
};

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const col = params.get('collection') ?? 'all';
  const shape = params.get('shape') ?? 'all';
  const lens = params.get('lens') ?? 'all';
  const sort = params.get('sort') ?? 'featured';

  const update = (k, v) => {
    const next = new URLSearchParams(params);
    if (v === 'all' || v === 'featured') next.delete(k);
    else next.set(k, v);
    setParams(next, { replace: true });
  };

  const list = useMemo(() => {
    return products
      .filter((p) => col === 'all' || p.collection === col)
      .filter((p) => shape === 'all' || p.shape === shape)
      .filter((p) => lens === 'all' || p.colorways.some((c) => (lens === 'mirror' ? c.lens.mirror : !c.lens.mirror)))
      .slice()
      .sort(SORTS[sort]?.fn ?? SORTS.featured.fn);
  }, [col, shape, lens, sort]);

  const ref = useReveal();
  const shapes = [...new Set(products.map((p) => p.shape))];

  return (
    <div className="container page-top" ref={ref} key={list.map((p) => p.slug).join()}>
      <div className="mono">Shop · {products.length} frames</div>
      <h1 className="page-title">All frames</h1>

      <div className="filters">
        <div className="chips" role="group" aria-label="Collection">
          {[{ slug: 'all', name: 'All' }, ...collections].map((c) => (
            <button key={c.slug} className="chip" aria-pressed={col === c.slug} onClick={() => update('collection', c.slug)}>
              {c.name}
            </button>
          ))}
        </div>
        <div className="chips" role="group" aria-label="Shape and lens">
          <select className="select" value={shape} onChange={(e) => update('shape', e.target.value)} aria-label="Shape">
            <option value="all">Any shape</option>
            {shapes.map((s) => (
              <option key={s} value={s}>{SHAPE_LABELS[s]}</option>
            ))}
          </select>
          <select className="select" value={lens} onChange={(e) => update('lens', e.target.value)} aria-label="Lens">
            <option value="all">Any lens</option>
            <option value="gradient">Gradient</option>
            <option value="mirror">Mirror</option>
          </select>
          <select className="select" value={sort} onChange={(e) => update('sort', e.target.value)} aria-label="Sort">
            {Object.entries(SORTS).map(([k, s]) => (
              <option key={k} value={k}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {list.length ? (
        <div className="p-grid p-grid--3" style={{ paddingBottom: 140 }}>
          {list.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      ) : (
        <div className="empty">
          <p>No frames match those filters.</p>
          <button className="btn btn--ghost" onClick={() => setParams({})}>Clear filters</button>
        </div>
      )}
    </div>
  );
}
