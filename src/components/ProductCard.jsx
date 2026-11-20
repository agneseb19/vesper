import { Link } from 'react-router-dom';
import { formatPrice, getCollection, SHAPE_LABELS } from '../data/products';
import { useProductImage } from '../hooks/useProductImage';

export function Swatch({ colorway, large }) {
  return (
    <span
      className={`swatch${large ? ' swatch--lg' : ''}`}
      style={{ '--f': colorway.frame.color, '--l': colorway.lens.bottom }}
      aria-hidden="true"
    />
  );
}

export function ProductImage({ product, colorway, view = 'angle', className, width, height, eager, alt = '' }) {
  const [src, ref] = useProductImage(product, colorway, { view, width, height, eager });
  return (
    <>
      <span ref={ref} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
      {src ? <img src={src} alt={alt} className={className} /> : <span className="skeleton" />}
    </>
  );
}

export default function ProductCard({ product }) {
  const cw = product.colorways[0];
  const col = getCollection(product.collection);
  return (
    <Link to={`/product/${product.slug}`} className="p-card reveal">
      <div className="p-card__media">
        <ProductImage product={product} colorway={cw} view="front" className="main" alt={`${product.name}, ${cw.name}`} />
        <ProductImage product={product} colorway={cw} view="angle" className="alt" />
        {product.limited ? (
          <span className="p-card__badge p-card__badge--grad mono">{product.left} of {product.edition} left</span>
        ) : product.bestseller ? (
          <span className="p-card__badge mono">Bestseller</span>
        ) : null}
        <span className="p-card__num mono">{product.number}</span>
      </div>
      <div className="p-card__info">
        <div>
          <h3>{product.name}</h3>
          <p>
            {col.name} · {SHAPE_LABELS[product.shape]}
          </p>
          <div className="p-card__swatches">
            {product.colorways.map((c) => (
              <Swatch key={c.id} colorway={c} />
            ))}
          </div>
        </div>
        <span className="p-card__price">{formatPrice(product.price)}</span>
      </div>
    </Link>
  );
}
