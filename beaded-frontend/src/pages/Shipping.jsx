import { Link } from 'react-router-dom';

import { useSeo } from '../components/Chrome.jsx';
import { peso } from '../lib/money.js';
import { useShop } from '../store/shop.jsx';

export default function Shipping() {
  useSeo('Shipping and returns', 'Making times, shipping rates by region, and my returns policy.');
  const { settings } = useShop();

  return (
    <div className="page reading">
      <h1 className="t-head">Shipping and returns</h1>

      <h2 className="t-lead">Making and shipping</h2>
      <p>Everything is a pre-order. Allow 7 to 14 days for me to make, check and pack your piece. Then it ships by J&amp;T Express.</p>

      <table className="table">
        <thead>
          <tr><th scope="col">Region</th><th scope="col">Rate</th></tr>
        </thead>
        <tbody>
          {Object.entries(settings.shippingRates).map(([region, rate]) => (
            <tr key={region}><th scope="row">{region}</th><td className="nums">{peso(rate)}</td></tr>
          ))}
        </tbody>
      </table>
      <p>Shipping is free on orders of {peso(settings.freeShippingOver)} or more.</p>

      <h2 className="t-lead">Returns and cancellations</h2>
      <p>I want you to love your piece, but each one is made to your preferences, so all sales are final.</p>
      <p>Once I have started a piece, I cannot accept cancellations, returns or exchanges. Please check your wrist measurement against the <Link className="link" to="/size-guide">size guide</Link> before you order.</p>
    </div>
  );
}
