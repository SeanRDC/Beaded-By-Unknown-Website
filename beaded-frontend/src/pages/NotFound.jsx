import { Link } from 'react-router-dom';

import { useSeo } from '../components/Chrome.jsx';

export default function NotFound() {
  useSeo('Page not found');
  return (
    <div className="page empty">
      <h1 className="t-head">This one slipped off the string</h1>
      <p>I can't find that page.</p>
      <p className="empty__links">
        <Link className="link" to="/">Home</Link>
        <Link className="link" to="/shop">The pieces</Link>
      </p>
    </div>
  );
}
