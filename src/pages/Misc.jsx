import { Link, useLocation, useParams } from 'react-router-dom';
import { formatPrice } from '../data/products';

export function OrderConfirmed() {
  const { id } = useParams();
  const { state } = useLocation();
  return (
    <div className="confirm">
      <div>
        <div className="mono">Order {id}</div>
        <h1>
          Thank you{state?.name ? `, ${state.name}` : ''}.
          <br />
          <span className="grad-text">See you at golden hour.</span>
        </h1>
        <p style={{ color: 'var(--ink-2)', maxWidth: 460, margin: '0 auto 28px' }}>
          {state?.total ? `Your demo order of ${formatPrice(state.total)} is confirmed. ` : ''}
          In a real store, your frames would now be cleaned, checked and packed in their leather case.
        </p>
        <Link to="/shop" className="btn btn--ink">Continue shopping</Link>
      </div>
    </div>
  );
}
