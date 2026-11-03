import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { api } from '../api/client.js';
import { useSeo } from '../components/Chrome.jsx';
import { useCart } from '../store/cart.jsx';
import { useShop } from '../store/shop.jsx';

export default function Confirmed() {
  useSeo('Order received');
  const [params] = useSearchParams();
  const { clear } = useCart();
  const { settings } = useShop();
  const ref = params.get('ref');
  const [status, setStatus] = useState(ref ? 'checking' : 'unknown');
  const asked = useRef(false);

  useEffect(() => {
    if (asked.current) return;
    asked.current = true;
    clear();
    if (!ref) return;
    api('/orders/confirm', { method: 'POST', body: { ref }, retries: 3 })
      .then((data) => setStatus(data.status))
      .catch(() => setStatus('unknown'));
  }, [ref, clear]);

  const paid = status !== 'checking' && status !== 'unknown' && status !== 'Pending Payment';

  return (
    <div className="page empty">
      <h1 className="t-title">{status === 'checking' ? 'Checking your payment' : paid ? 'Thank you' : 'Your payment is still processing'}</h1>
      {paid && settings.showcase && <p>Your test payment went through. This shop is a portfolio project, so nothing will ship.</p>}
      {paid && !settings.showcase && <p>I have your order, and a receipt is on its way to your email. I will write again when it ships.</p>}
      {(status === 'unknown' || status === 'Pending Payment') && <p>If your payment went through, a receipt will reach your email shortly.</p>}
      <p><Link className="link" to="/shop">Back to the shop</Link></p>
    </div>
  );
}
