import { Link } from 'react-router-dom';

import { useSeo } from '../components/Chrome.jsx';

export default function Terms() {
  useSeo('Terms and privacy', 'What I collect, how orders work, and who owns what.');
  return (
    <div className="page reading">
      <h1 className="t-head">Terms and privacy</h1>
      <p className="soft">Last updated November 2026</p>

      <h2 className="t-lead">The information I collect</h2>
      <p>When you use Beaded by Unknown, I collect what I need to run your account and fill your orders.</p>
      <ul>
        <li><strong>Account details.</strong> Your name and email, from Google or from registering, and the phone number and address you choose to save.</li>
        <li><strong>Bag and saved pieces.</strong> Stored in my database so you can reach them on other devices.</li>
        <li><strong>Payments.</strong> I never store card details. All payments go through PayMongo.</li>
        <li><strong>Analytics.</strong> Google Analytics counts visits to this site.</li>
      </ul>

      <h2 className="t-lead">The pieces</h2>
      <p>Everything is made by hand from seed and glass beads, acrylic, imitation jade and imitation pearl. Small differences in colour, shape and size are expected, and they make your piece your own.</p>

      <h2 className="t-lead">Orders and shipping</h2>
      <p>Items are made to order, in 7 to 14 days, and shipped by J&amp;T Express at the <Link className="link" to="/shipping">rate for your region</Link>. Once I have started a custom piece, I cannot accept a cancellation, so please check your wrist measurement against the <Link className="link" to="/size-guide">size guide</Link>.</p>

      <h2 className="t-lead">Ownership</h2>
      <p>The designs, photographs and journal stories on this site belong to Beaded by Unknown. Please do not reuse them without asking.</p>

      <h2 className="t-lead">Questions</h2>
      <p>Write to me at <a className="link" href="mailto:beadedbyunknown@gmail.com">beadedbyunknown@gmail.com</a>.</p>
    </div>
  );
}
