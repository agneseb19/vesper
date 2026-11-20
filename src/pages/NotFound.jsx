import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="confirm">
      <div>
        <div className="mono">404</div>
        <h1>
          Lost in the <span className="grad-text">glare.</span>
        </h1>
        <Link to="/" className="btn btn--ink">Back to the light</Link>
      </div>
    </div>
  );
}
