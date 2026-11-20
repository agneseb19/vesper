import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { collections, formatPrice } from '../data/products';
import { useCart, lineDetails, FREE_SHIPPING } from '../context/CartContext';
import { ProductImage } from './ProductCard';

export function Header() {
  const { count, setOpen } = useCart();
  return (
    <header className="header">
      <Link to="/" className="header__logo" aria-label="Vesper — home">
        VESPER
      </Link>
      <nav className="header__nav" aria-label="Main">
        <NavLink to="/shop">Shop all</NavLink>
        <NavLink to="/collections/riviera">Collections</NavLink>
        <NavLink to="/about">Our story</NavLink>
      </nav>
      <div className="header__right">
        <button onClick={() => setOpen(true)} aria-label={`Open bag, ${count} items`}>
          + BAG ({count})
        </button>
      </div>
    </header>
  );
}

export function CartDrawer() {
  const { items, open, setOpen, setQty, subtotal } = useCart();
  const navigate = useNavigate();
  const left = Math.max(0, FREE_SHIPPING - subtotal);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setOpen]);

  return (
    <>
      <div className={`drawer-scrim${open ? ' open' : ''}`} onClick={() => setOpen(false)} />
      <aside className={`drawer${open ? ' open' : ''}`} aria-label="Shopping bag" aria-hidden={!open} data-lenis-prevent>
        <div className="drawer__head">
          <strong>Your bag</strong>
          <button className="mono" onClick={() => setOpen(false)}>
            Close ✕
          </button>
        </div>
        <div className="drawer__body">
          {items.length === 0 ? (
            <div className="drawer__empty">
              <h3>Nothing here yet.</h3>
              <p style={{ color: 'var(--muted)' }}>The golden hour is waiting.</p>
              <button
                className="btn btn--ink"
                style={{ marginTop: 16 }}
                onClick={() => {
                  setOpen(false);
                  navigate('/shop');
                }}
              >
                Shop all frames
              </button>
            </div>
          ) : (
            items.map((it) => {
              const d = lineDetails(it);
              return (
                <div className="line-item" key={it.key}>
                  <div className="line-item__img" style={{ position: 'relative' }}>
                    <ProductImage product={d.product} colorway={d.colorway} view="front" width={400} height={260} />
                  </div>
                  <div>
                    <h4>{d.product.name}</h4>
                    <p>{d.colorway.name}</p>
                    <p>{d.lens.name}</p>
                    <div className="qty">
                      <button onClick={() => setQty(it.key, it.qty - 1)} aria-label="Decrease quantity">−</button>
                      <span>{it.qty}</span>
                      <button onClick={() => setQty(it.key, it.qty + 1)} aria-label="Increase quantity">+</button>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 600 }}>{formatPrice(d.total)}</div>
                    <button className="remove" onClick={() => setQty(it.key, 0)}>
                      Remove
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
        {items.length > 0 && (
          <div className="drawer__foot">
            <div className="ship-bar">
              {left > 0 ? (
                <>You are {formatPrice(left)} away from free express shipping.</>
              ) : (
                <>Free express shipping unlocked.</>
              )}
              <div className="ship-bar__track">
                <i style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING) * 100)}%` }} />
              </div>
            </div>
            <div className="drawer__row">
              <span>Subtotal</span>
              <strong>{formatPrice(subtotal)}</strong>
            </div>
            <button
              className="btn btn--ink btn--block"
              onClick={() => {
                setOpen(false);
                navigate('/checkout');
              }}
            >
              Checkout <span className="arrow">→</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

export function Footer() {
  const [sent, setSent] = useState(false);
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__cols">
          <div>
            <h5 className="mono">Letters from Vesper</h5>
            <p style={{ maxWidth: 360, opacity: 0.75, marginTop: 0 }}>
              New drops, Atelier releases and the occasional sunset. Twice a month, never more.
            </p>
            {sent ? (
              <p className="mono" style={{ color: 'var(--amber)' }}>Thank you — see you at golden hour.</p>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSent(true);
                }}
                style={{ display: 'flex', gap: 8, maxWidth: 420 }}
              >
                <label className="sr-only" htmlFor="foot-email">Email</label>
                <input
                  id="foot-email"
                  type="email"
                  required
                  placeholder="Email address"
                  style={{ flex: 1, minWidth: 0, height: 46, borderRadius: 99, border: '1px solid rgba(255,255,255,.2)', background: 'transparent', padding: '0 18px' }}
                />
                <button className="btn btn--light" style={{ height: 46 }}>Join</button>
              </form>
            )}
          </div>
          <div>
            <h5 className="mono">Shop</h5>
            <ul>
              <li><Link to="/shop">All frames</Link></li>
              {collections.map((c) => (
                <li key={c.slug}><Link to={`/collections/${c.slug}`}>{c.name}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h5 className="mono">House</h5>
            <ul>
              <li><Link to="/about">Our story</Link></li>
              <li><Link to="/about#craft">Craft</Link></li>
              <li><Link to="/about#warranty">Care & repairs</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="mono">Help</h5>
            <ul>
              <li><Link to="/about#shipping">Shipping & returns</Link></li>
              <li><Link to="/about#warranty">Lifetime warranty</Link></li>
              <li><Link to="/about#contact">Contact</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer__word" aria-hidden="true">Vesper</div>
        <div className="footer__legal mono">
          <span>© 2027 Vesper® — a concept brand made for a design study.</span>
          <span>Products, specs and prices are fictional.</span>
        </div>
      </div>
    </footer>
  );
}

export default function Layout() {
  const { pathname } = useLocation();
  return (
    <>
      <Header />
      <main key={pathname}>
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </>
  );
}
