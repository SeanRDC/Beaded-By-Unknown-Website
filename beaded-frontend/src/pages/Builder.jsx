import { useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { api } from '../api/client.js';
import { BeadPicture, BeadRing } from '../components/BeadRing.jsx';
import { useSeo } from '../components/Chrome.jsx';
import { BASE_SETTING, CHARMS, COLLECTIONS, EXTENDER_PRICE, STRINGS } from '../data/beads.js';
import { designTotal, fit } from '../lib/fit.js';
import { peso } from '../lib/money.js';
import { gsap, reduced } from '../motion/gsap.js';
import { useCart } from '../store/cart.jsx';
import { useAuth } from '../store/auth.jsx';
import { useUi } from '../store/ui.jsx';

const STEPS = ['Bead type', 'String beads', 'String', 'Charm', 'Wrist fit', 'Review'];
const LOCKS = ['Gold', 'Silver'];
const MIN_BEADS = 5;
const DEFAULT_COLLECTION = COLLECTIONS[7];

const stringLabel = (string, lock, extender) => (string.id === 's2' ? `${string.name} (${lock}${extender ? ' w/ Extender' : ''})` : string.name);

/* Beads that arrive from the home page bracelet, already strung in their pattern. */
function startingBeads(state) {
  const collection = COLLECTIONS.find((c) => c.id === state?.collectionId);
  if (!collection || !state?.colors?.length) return [];
  const { count } = fit(state.cm, collection);
  return Array.from({ length: count }, (_, i) => ({ name: state.colors[i % state.colors.length] }));
}

export default function Builder() {
  useSeo('String your own', 'Choose your beads, string and charm, and I will string it to your wrist.');
  const { state } = useLocation();
  const { add } = useCart();
  const { flash } = useUi();
  const { user } = useAuth();
  const ringRef = useRef(null);
  const panel = useRef(null);

  const [step, setStep] = useState(state?.collectionId ? 2 : 1);
  const [collection, setCollection] = useState(() => COLLECTIONS.find((c) => c.id === state?.collectionId) || DEFAULT_COLLECTION);
  const [beads, setBeads] = useState(() => startingBeads(state));
  const [cm, setCm] = useState(state?.cm || 16.5);
  const [string, setString] = useState(STRINGS[0]);
  const [lock, setLock] = useState(LOCKS[0]);
  const [extender, setExtender] = useState(false);
  const [charm, setCharm] = useState(null);
  const [email, setEmail] = useState(user?.email || '');
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const wrist = Number(cm) || 16.5;
  const ideal = useMemo(() => fit(wrist, collection).count, [wrist, collection]);
  const difference = ideal - beads.length;
  const pattern = useMemo(() => (beads.length ? beads.map((bead) => bead.name) : ['White']), [beads]);
  const charms = charm ? [charm] : [];
  const total = designTotal({ collection, beads, string, extender, charms });
  const beadCost = beads.length * collection.price;

  const go = (next) => {
    if (next === 3 && step <= 2 && beads.length < MIN_BEADS) {
      flash(`String at least ${MIN_BEADS} beads to continue.`, 'error');
      return;
    }
    setStep(next);
    if (!reduced()) gsap.fromTo(panel.current, { x: 18, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, ease: 'power3.out' });
  };

  const chooseCollection = (next) => {
    setCollection(next);
    setBeads([]);
  };

  const adjustToFit = () => {
    if (difference > 0) {
      const last = beads[beads.length - 1];
      if (last) setBeads([...beads, ...Array.from({ length: difference }, () => last)]);
    } else {
      setBeads(beads.slice(0, ideal));
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const design = await api('/custom-orders', {
        method: 'POST',
        body: {
          email,
          name: name || 'Custom Bracelet',
          collectionId: collection.id,
          beads,
          stringId: string.id,
          lockColor: lock,
          extender,
          charmIds: charms.map((item) => item.id),
          wristCm: wrist
        }
      });
      const material = `Custom: ${collection.name} for a ${wrist} cm wrist`;
      add({ id: design._id, name: design.name, price: design.totalPrice, img: '', mat: material, customOrderId: design._id }, { size: 'Custom' });
      flash('Your design is saved and in your bag.', 'success');
    } catch (err) {
      flash(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page builder">
      <header className="page-head">
        <h1 className="t-head">String your own</h1>
      </header>

      <ol className="steps">
        {STEPS.map((label, index) => (
          <li key={label}>
            <button type="button" className="steps__item" aria-current={step === index + 1 ? 'step' : undefined} disabled={index + 1 > step} onClick={() => go(index + 1)}>{label}</button>
          </li>
        ))}
      </ol>

      <div className="builder__grid">
        <aside className="builder__stage">
          <div className="fit__ring">
            <BeadRing ringRef={ringRef} collection={collection} cm={wrist} pattern={pattern} exactCount={beads.length} threaded shadow={false} label={`Your bracelet so far, ${beads.length} beads`} />
            <div className="fit__count">
              <b className="nums">{beads.length}</b>
              <span className="soft">of about {ideal} beads</span>
            </div>
            {charm && <span className="builder__charm" aria-label={charm.name}>{charm.em}</span>}
          </div>
          <dl className="sum">
            <div><dt>Setting</dt><dd className="nums">{peso(BASE_SETTING)}</dd></div>
            <div><dt>{beads.length} × {collection.name}</dt><dd className="nums">{peso(beadCost)}</dd></div>
            <div><dt>String</dt><dd className="nums">{peso(string.price + (extender && string.id === 's2' ? EXTENDER_PRICE : 0))}</dd></div>
            {charm && <div><dt>Charm</dt><dd className="nums">{peso(charm.price)}</dd></div>}
            <div className="sum__total"><dt>Total</dt><dd className="nums">{peso(total)}</dd></div>
          </dl>
        </aside>

        <div className="builder__panel" ref={panel}>
          {step === 1 && (
            <section>
              <h2 className="t-lead">Choose your bead</h2>
              <div className="options options--two">
                {COLLECTIONS.map((option) => (
                  <button key={option.id} type="button" className="option" aria-pressed={option.id === collection.id} onClick={() => chooseCollection(option)}>
                    <BeadPicture name={option.colors[0]} type={option.type} px={36} />
                    <span>{option.type}<small className="soft">{option.size} mm, {peso(option.price)} each</small></span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {step === 2 && (
            <section>
              <h2 className="t-lead">String your beads</h2>
              <p className="soft">Choose colours in the order you want them. For a {wrist} cm wrist you need about {ideal} beads.</p>
              <div className="options options--colours">
                {collection.colors.map((colour) => (
                  <button key={colour} type="button" className="option option--stack" aria-label={`Add a ${colour} bead`} onClick={() => setBeads([...beads, { name: colour }])}>
                    <BeadPicture name={colour} type={collection.type} px={40} />
                    <small>{colour}</small>
                  </button>
                ))}
              </div>
              {beads.length > 0 && (
                <div className="strung">
                  <div className="signin__row">
                    <span>On the string, {beads.length}</span>
                    <button type="button" className="link link--danger t-small" onClick={() => setBeads([])}>Clear all</button>
                  </div>
                  <div className="strung__beads">
                    {beads.map((bead, index) => (
                      <button key={index} type="button" aria-label={`Remove bead ${index + 1}, ${bead.name}`} onClick={() => setBeads(beads.filter((_, i) => i !== index))}>
                        <BeadPicture name={bead.name} type={collection.type} px={22} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {step === 3 && (
            <section>
              <h2 className="t-lead">Choose your string</h2>
              <div className="options">
                {STRINGS.map((option) => (
                  <button key={option.id} type="button" className="option option--wide" aria-pressed={option.id === string.id} onClick={() => setString(option)}>
                    <span>{option.name}<small className="soft">{option.desc}</small></span>
                    <span className="nums">{peso(option.price)}</span>
                  </button>
                ))}
              </div>
              {string.id === 's2' && (
                <>
                  <div className="ctl">
                    <div className="ctl__row"><span>Clasp colour</span></div>
                    <div className="chips">
                      {LOCKS.map((option) => <button key={option} type="button" className="chip" aria-pressed={lock === option} onClick={() => setLock(option)}>{option}</button>)}
                    </div>
                  </div>
                  <div className="ctl">
                    <div className="ctl__row"><span>Extender chain, for an adjustable fit</span></div>
                    <div className="chips">
                      <button type="button" className="chip" aria-pressed={!extender} onClick={() => setExtender(false)}>No thanks</button>
                      <button type="button" className="chip" aria-pressed={extender} onClick={() => setExtender(true)}>Yes, {peso(EXTENDER_PRICE)}</button>
                    </div>
                  </div>
                </>
              )}
            </section>
          )}

          {step === 4 && (
            <section>
              <h2 className="t-lead">Add a charm</h2>
              <p className="soft">Optional. Choose one, or none.</p>
              <div className="options options--charms">
                {CHARMS.map((option) => (
                  <button key={option.id} type="button" className="option option--stack" aria-pressed={charm?.id === option.id} onClick={() => setCharm(charm?.id === option.id ? null : option)}>
                    <span className="option__emoji" aria-hidden="true">{option.em}</span>
                    <small>{option.name}</small>
                  </button>
                ))}
              </div>
            </section>
          )}

          {step === 5 && (
            <section>
              <h2 className="t-lead">Check the fit</h2>
              <p className="soft">Wrap a soft tape around your wrist, snug but not tight, and enter the size in centimetres.</p>
              <label className="field builder__wrist">
                <span>Wrist in centimetres</span>
                <input className="input" type="number" step="0.5" min="10" max="25" value={cm} onChange={(event) => setCm(event.target.value)} />
              </label>
              <div className="fitnote">
                <p className="t-lead">{difference === 0 ? 'That is a perfect fit' : `You need ${ideal} beads, and you have ${beads.length}`}</p>
                <p className="soft">This count leaves a little room, so the bracelet sits comfortably.</p>
                {difference !== 0 && (
                  <button type="button" className="btn btn--quiet" onClick={adjustToFit}>
                    {difference > 0 ? `Add ${difference} more, ${peso(difference * collection.price)}` : `Remove ${Math.abs(difference)}`}
                  </button>
                )}
              </div>
            </section>
          )}

          {step === 6 && (
            <form onSubmit={submit}>
              <h2 className="t-lead">Review your design</h2>
              <dl className="sum sum--plain">
                <div><dt>Beads</dt><dd>{beads.length} × {collection.name}</dd></div>
                <div><dt>Wrist</dt><dd>{wrist} cm</dd></div>
                <div><dt>String</dt><dd>{stringLabel(string, lock, extender)}</dd></div>
                <div><dt>Charm</dt><dd>{charm ? charm.name : 'None'}</dd></div>
              </dl>
              <div className="stack">
                <label className="field">
                  <span>Your email. I will send a photo of your finished piece here.</span>
                  <input className="input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
                </label>
                <label className="field">
                  <span>Name your bracelet, if you like</span>
                  <input className="input" value={name} onChange={(event) => setName(event.target.value)} maxLength={120} />
                </label>
                <button type="submit" className="btn btn--wide" disabled={saving}>{saving ? 'One moment' : `Add to bag, ${peso(total)}`}</button>
              </div>
            </form>
          )}

          <div className="builder__nav">
            {step > 1 ? <button type="button" className="link" onClick={() => go(step - 1)}>Back</button> : <span />}
            {step < STEPS.length && <button type="button" className="btn" onClick={() => go(step + 1)}>Next</button>}
          </div>
        </div>
      </div>
    </div>
  );
}
