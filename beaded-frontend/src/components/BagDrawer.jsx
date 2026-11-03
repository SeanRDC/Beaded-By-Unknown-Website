import { useRef } from 'react';
import { Link } from 'react-router-dom';

import { lineKey } from '../lib/cart.js';
import { cld } from '../lib/cloudinary.js';
import { peso } from '../lib/money.js';
import { gsap, reduced, useGSAP } from '../motion/gsap.js';
import { useCart } from '../store/cart.jsx';
import { useShop } from '../store/shop.jsx';
import { useUi } from '../store/ui.jsx';
import { Sheet } from './Sheet.jsx';

const BEADS = 12;

/* Progress to free shipping, shown as a thread filling with beads. */
export function FreeShippingLine({ subtotal }) {
  const { freeShippingOver } = useShop().settings;
  const root = useRef(null);
  const filled = Math.min(BEADS, Math.floor((subtotal / freeShippingOver) * BEADS));
  const left = freeShippingOver - subtotal;

  useGSAP(() => {
    if (reduced()) return;
    gsap.from('.is-on', { scale: 0.4, duration: 0.3, stagger: 0.03, ease: 'power3.out' });
  }, { scope: root, dependencies: [filled] });

  return (
    <div className="freeline" ref={root}>
      <p className="t-small">{left > 0 ? `${peso(left)} away from free shipping` : 'Free shipping is on'}</p>
      <div className="freeline__beads" aria-hidden="true">
        {Array.from({ length: BEADS }, (_, i) => <i key={i} className={`freeline__bead ${i < filled ? 'is-on' : ''}`} />)}
      </div>
    </div>
  );
}

function BagLine({ line }) {
  const { remove, setQty } = useCart();
  const key = lineKey(line);
  return (
    <li className="bag__line">
      <span className={`pic bag__thumb ${line.img ? '' : 'bag__thumb--blank'}`}>
        {line.img ? <img src={cld(line.img, 160)} alt="" loading="lazy" /> : <span className="t-small soft">Yours</span>}
      </span>
      <div>
        <p>{line.name}</p>
        <p className="t-small soft">{line.customOrderId ? line.mat : `Size ${line.sz}`}</p>
        <div className="qty" role="group" aria-label={`Quantity of ${line.name}`}>
          <button type="button" aria-label="One less" onClick={() => setQty(key, line.qty - 1)}>−</button>
          <span className="nums">{line.qty}</span>
          <button type="button" aria-label="One more" onClick={() => setQty(key, line.qty + 1)}>+</button>
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <p className="nums">{peso(line.price * line.qty)}</p>
        <button type="button" className="link t-small" onClick={() => remove(key)}>Remove</button>
      </div>
    </li>
  );
}

export function BagDrawer() {
  const { panel, closePanel } = useUi();
  const { lines, count, subtotal, clear } = useCart();

  return (
    <Sheet open={panel === 'bag'} onClose={closePanel} side="right" label="Your bag">
      <div className="bag">
        <div className="bag__head">
          <h2 className="t-lead">Your bag <span className="soft nums">{count}</span></h2>
          {lines.length > 0 && <button type="button" className="link t-small" onClick={clear}>Clear</button>}
        </div>

        {lines.length === 0 ? (
          <div style={{ padding: '12px 22px' }}>
            <p className="soft">Nothing here yet.</p>
            <p style={{ marginTop: 12 }}><Link className="link" to="/shop" onClick={closePanel}>See the pieces</Link></p>
          </div>
        ) : (
          <>
            <ul className="bag__list">
              {lines.map((line) => <BagLine key={lineKey(line)} line={line} />)}
            </ul>
            <div className="bag__foot">
              <FreeShippingLine subtotal={subtotal} />
              <div className="signin__row">
                <span>Subtotal</span>
                <span className="t-lead nums">{peso(subtotal)}</span>
              </div>
              <Link className="btn btn--wide" to="/checkout" onClick={closePanel}>Checkout</Link>
            </div>
          </>
        )}
      </div>
    </Sheet>
  );
}
