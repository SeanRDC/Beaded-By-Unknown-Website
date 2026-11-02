import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { api } from '../api/client.js';
import { useSeo } from '../components/Chrome.jsx';
import { lineKey } from '../lib/cart.js';
import { cld } from '../lib/cloudinary.js';
import { peso } from '../lib/money.js';
import { shippingFor } from '../lib/shipping.js';
import { useAuth } from '../store/auth.jsx';
import { useCart } from '../store/cart.jsx';
import { useShop } from '../store/shop.jsx';
import { useUi } from '../store/ui.jsx';

const STEPS = ['Your details', 'Shipping', 'Payment'];
const EMPTY = { firstName: '', lastName: '', email: '', phone: '', street: '', barangay: '', city: '', province: '', postalCode: '' };

function Input({ label, ...input }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input className="input" required {...input} />
    </label>
  );
}

function startingForm(user) {
  const saved = user?.shippingAddress || {};
  return {
    ...EMPTY,
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    street: saved.street || '',
    barangay: saved.barangay || '',
    city: saved.city || '',
    province: saved.province || '',
    postalCode: saved.postalCode || ''
  };
}

function CheckoutSteps({ user }) {
  const { lines, subtotal } = useCart();
  const { settings } = useShop();
  const { flash } = useUi();
  const [params, setParams] = useSearchParams();
  const regions = Object.keys(settings.shippingRates);

  const [step, setStep] = useState(1);
  const [form, setForm] = useState(() => startingForm(user));
  const [region, setRegion] = useState(user?.shippingAddress?.region || regions[0]);
  const [paying, setPaying] = useState(false);

  const fee = shippingFor(subtotal, region, settings);
  const total = subtotal + fee;

  useEffect(() => {
    if (params.get('canceled') === 'true') {
      flash('The payment was cancelled. Your bag is still here.', 'error');
      setParams({}, { replace: true });
    }
  }, [params, setParams, flash]);

  const set = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const pay = async () => {
    setPaying(true);
    try {
      const session = await api('/create-checkout-session', { method: 'POST', body: { cart: lines, checkoutForm: form, shippingRegion: region } });
      window.location.href = session.checkout_url;
    } catch (err) {
      flash(err.message, 'error');
      setPaying(false);
    }
  };

  if (lines.length === 0) {
    return (
      <div className="page empty">
        <h1 className="t-title">Your bag is empty</h1>
        <Link className="link" to="/shop">See the pieces</Link>
      </div>
    );
  }

  return (
    <div className="page checkout">
      <header className="page-head">
        <h1 className="t-title">Checkout</h1>
        <ol className="steps steps--plain">
          {STEPS.map((label, index) => <li key={label} aria-current={step === index + 1 ? 'step' : undefined}>{label}</li>)}
        </ol>
      </header>

      <div className="checkout__grid">
        <div>
          {step === 1 && (
            <form
              className="stack"
              onSubmit={(event) => {
                event.preventDefault();
                setStep(2);
              }}
            >
              <div className="two">
                <Input label="Email" type="email" value={form.email} onChange={set('email')} autoComplete="email" />
                <Input label="Mobile number" type="tel" value={form.phone} onChange={set('phone')} autoComplete="tel" />
              </div>
              <div className="two">
                <Input label="First name" value={form.firstName} onChange={set('firstName')} autoComplete="given-name" />
                <Input label="Last name" value={form.lastName} onChange={set('lastName')} autoComplete="family-name" />
              </div>
              <Input label="House or unit, building, street" value={form.street} onChange={set('street')} autoComplete="street-address" />
              <Input label="Barangay" value={form.barangay} onChange={set('barangay')} />
              <div className="three">
                <Input label="City" value={form.city} onChange={set('city')} autoComplete="address-level2" />
                <Input label="Province" value={form.province} onChange={set('province')} autoComplete="address-level1" />
                <Input label="Postal code" value={form.postalCode} onChange={set('postalCode')} autoComplete="postal-code" />
              </div>
              <label className="field">
                <span>Region</span>
                <select className="input" value={region} onChange={(event) => setRegion(event.target.value)}>
                  {regions.map((name) => <option key={name}>{name}</option>)}
                </select>
              </label>
              <button type="submit" className="btn btn--wide">Continue to shipping</button>
            </form>
          )}

          {step === 2 && (
            <div className="stack">
              <div className="panel">
                <p className="t-lead">J&amp;T Express</p>
                <p className="soft">Made to order in 7 to 14 days, then shipped to {region}.</p>
                <p className="nums">{fee === 0 ? 'Free' : peso(fee)}</p>
              </div>
              <div className="checkout__nav">
                <button type="button" className="link" onClick={() => setStep(1)}>Back</button>
                <button type="button" className="btn" onClick={() => setStep(3)}>Continue to payment</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="stack">
              <div className="panel">
                <p className="t-lead">Pay on PayMongo</p>
                <p className="soft">You'll go to PayMongo to pay by GCash, Maya, QR Ph or card.</p>
              </div>
              {settings.showcase && (
                <p className="panel panel--note">This is a portfolio project. You'll be charged ₱1 through PayMongo and nothing will ship.</p>
              )}
              <div className="checkout__nav">
                <button type="button" className="link" onClick={() => setStep(2)}>Back</button>
                <button type="button" className="btn" disabled={paying} onClick={pay}>
                  {paying ? 'One moment' : settings.showcase ? 'Continue to PayMongo' : `Pay ${peso(total)}`}
                </button>
              </div>
            </div>
          )}
        </div>

        <aside className="summary" aria-label="Order summary">
          <h2 className="t-lead">Your order</h2>
          <ul>
            {lines.map((line) => (
              <li key={lineKey(line)}>
                <span className={`pic bag__thumb ${line.img ? '' : 'bag__thumb--blank'}`}>
                  {line.img ? <img src={cld(line.img, 120)} alt="" loading="lazy" /> : <span className="t-small soft">Yours</span>}
                </span>
                <span>{line.name}<small className="soft"> × {line.qty}</small></span>
                <span className="nums">{peso(line.price * line.qty)}</span>
              </li>
            ))}
          </ul>
          <dl className="sum">
            <div><dt>Subtotal</dt><dd className="nums">{peso(subtotal)}</dd></div>
            <div><dt>Shipping to {region}</dt><dd className="nums">{fee === 0 ? 'Free' : peso(fee)}</dd></div>
            <div className="sum__total"><dt>Total</dt><dd className="nums">{peso(total)}</dd></div>
          </dl>
        </aside>
      </div>
    </div>
  );
}

export default function Checkout() {
  useSeo('Checkout');
  const { user } = useAuth();
  return <CheckoutSteps key={user?.email || 'guest'} user={user} />;
}
