import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatPrice } from '../data/products';
import { useCart, lineDetails, FREE_SHIPPING } from '../context/CartContext';
import { ProductImage } from '../components/ProductCard';

const SHIPPING = [
  { id: 'express', name: 'Express (1–2 days)', price: 18 },
  { id: 'standard', name: 'Standard (3–5 days)', price: 8 },
];

export default function Checkout() {
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const [ship, setShip] = useState('express');

  if (!items.length) {
    return (
      <div className="confirm">
        <div>
          <div className="mono">Checkout</div>
          <h1>Your bag is empty.</h1>
          <Link to="/shop" className="btn btn--ink">Shop all frames</Link>
        </div>
      </div>
    );
  }

  const method = SHIPPING.find((s) => s.id === ship);
  const shipCost = subtotal >= FREE_SHIPPING && ship === 'express' ? 0 : method.price;
  const total = subtotal + shipCost;

  const submit = (e) => {
    e.preventDefault();
    const order = `VSP-${Math.floor(100000 + Math.random() * 899999)}`;
    const name = new FormData(e.currentTarget).get('first') || '';
    clear();
    navigate(`/order/${order}`, { state: { name, total } });
  };

  return (
    <form className="container checkout" onSubmit={submit}>
      <div>
        <div className="mono">Checkout</div>
        <h1>Almost golden.</h1>

        <fieldset className="fieldset" style={{ marginTop: 0 }}>
          <legend>Contact</legend>
          <div className="form-grid">
            <div className="field full">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" required autoComplete="email" />
            </div>
          </div>
        </fieldset>

        <fieldset className="fieldset">
          <legend>Delivery</legend>
          <div className="form-grid">
            <div className="field"><label htmlFor="first">First name</label><input id="first" name="first" required autoComplete="given-name" /></div>
            <div className="field"><label htmlFor="last">Last name</label><input id="last" name="last" required autoComplete="family-name" /></div>
            <div className="field full"><label htmlFor="addr">Address</label><input id="addr" name="addr" required autoComplete="street-address" /></div>
            <div className="field"><label htmlFor="city">City</label><input id="city" name="city" required autoComplete="address-level2" /></div>
            <div className="field"><label htmlFor="zip">Postcode</label><input id="zip" name="zip" required autoComplete="postal-code" /></div>
            <div className="field full">
              <label htmlFor="country">Country</label>
              <select id="country" name="country" defaultValue="IT">
                {[['IT', 'Italy'], ['FR', 'France'], ['DE', 'Germany'], ['ES', 'Spain'], ['GB', 'United Kingdom'], ['US', 'United States']].map(([v, n]) => (
                  <option key={v} value={v}>{n}</option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset className="fieldset">
          <legend>Shipping</legend>
          <div className="lens-opts">
            {SHIPPING.map((s) => (
              <label key={s.id} className="lens-opt">
                <span>
                  <input type="radio" name="ship" checked={ship === s.id} onChange={() => setShip(s.id)} />
                  {s.name}
                </span>
                <span>{s.id === 'express' && subtotal >= FREE_SHIPPING ? 'Free' : formatPrice(s.price)}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="fieldset">
          <legend>Payment</legend>
          <p className="demo-note">
            This is a demo store. No payment details are collected and no order is charged: placing the order simply
            shows the confirmation page.
          </p>
        </fieldset>

        <button className="btn btn--grad btn--block" style={{ marginTop: 28 }}>
          Place demo order — {formatPrice(total)}
        </button>
      </div>

      <aside className="summary">
        <strong style={{ fontSize: 20 }}>Order summary</strong>
        {items.map((it) => {
          const d = lineDetails(it);
          return (
            <div className="line-item" key={it.key}>
              <div className="line-item__img" style={{ position: 'relative' }}>
                <ProductImage product={d.product} colorway={d.colorway} view="front" width={400} height={260} />
              </div>
              <div>
                <h4>{d.product.name} × {it.qty}</h4>
                <p>{d.colorway.name}</p>
                <p>{d.lens.name}</p>
              </div>
              <strong>{formatPrice(d.total)}</strong>
            </div>
          );
        })}
        <div className="drawer__row" style={{ marginTop: 16 }}><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
        <div className="drawer__row" style={{ margin: '6px 0 10px' }}><span>Shipping</span><span>{shipCost ? formatPrice(shipCost) : 'Free'}</span></div>
        <div className="summary__total"><span>Total</span><span>{formatPrice(total)}</span></div>
      </aside>
    </form>
  );
}
