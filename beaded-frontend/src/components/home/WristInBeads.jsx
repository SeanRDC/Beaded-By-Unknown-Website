import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { COLLECTIONS } from '../../data/beads.js';
import { fit } from '../../lib/fit.js';
import { peso } from '../../lib/money.js';
import { rise, useMotion } from '../../motion/gsap.js';
import { BeadPicture, BeadRing } from '../BeadRing.jsx';

const CHOICES = ['rs3', 'ij6', 'ce8', 'ma10', 'ip12'].map((id) => COLLECTIONS.find((c) => c.id === id));
const SWATCHES = 9;

export function WristInBeads({ ringRef }) {
  const root = useRef(null);
  const [cm, setCm] = useState(16.5);
  const [collection, setCollection] = useState(CHOICES[2]);
  const [colors, setColors] = useState(['Blue', 'White']);
  const { count, total } = useMemo(() => fit(cm, collection), [cm, collection]);

  useMotion(() => {
    rise(root.current.querySelectorAll('.fit__controls > *'), '.fit__controls', { y: 24, stagger: 0.07, start: 'top 74%' });
  }, { scope: root, defer: true });

  const chooseCollection = (next) => {
    setCollection(next);
    const kept = colors.filter((name) => next.colors.includes(name));
    setColors(kept.length ? kept : next.colors.slice(0, 2));
  };

  const toggleColour = (name) => {
    const next = colors.includes(name) ? colors.filter((item) => item !== name) : [colors[colors.length - 1], name].filter(Boolean);
    setColors(next.length ? next : [name]);
  };

  return (
    <section className="fit" id="fit" ref={root}>
      <div className="fit__ring" id="ring-wrap">
        <BeadRing ringRef={ringRef} collection={collection} cm={cm} pattern={colors} label={`A bracelet of ${count} beads, drawn to scale`} />
        <div className="fit__count">
          <b className="nums">{count}</b>
          <span className="soft">beads</span>
        </div>
      </div>

      <div className="fit__controls">
        <h2 className="t-head">Your wrist, in beads</h2>
        <p className="fit__intro">Every bracelet is sized by counting. Move the thread to your wrist and the count, the price and the bracelet change with it.</p>

        <div className="ctl">
          <label className="ctl__row" htmlFor="wrist">
            <span>Wrist</span>
            <output htmlFor="wrist" className="nums">{cm} cm</output>
          </label>
          <input id="wrist" className="thread-range" type="range" min="13" max="22" step="0.5" value={cm} onChange={(event) => setCm(Number(event.target.value))} />
        </div>

        <div className="ctl">
          <div className="ctl__row"><span>Bead</span><span className="soft">{collection.type}, {collection.size} mm</span></div>
          <div className="chips">
            {CHOICES.map((choice) => (
              <button key={choice.id} type="button" className="chip" aria-pressed={choice.id === collection.id} onClick={() => chooseCollection(choice)}>
                {choice.type} {choice.size} mm
              </button>
            ))}
          </div>
        </div>

        <div className="ctl">
          <div className="ctl__row"><span>Colour</span><span className="soft">{colors.join(' and ')}</span></div>
          <div className="swatches">
            {collection.colors.slice(0, SWATCHES).map((name) => (
              <button key={name} type="button" className="swatch" aria-label={name} aria-pressed={colors.includes(name)} onClick={() => toggleColour(name)}>
                <BeadPicture name={name} type={collection.type} px={40} />
              </button>
            ))}
          </div>
        </div>

        <div className="fit__total">
          <strong className="t-lead nums">{peso(total)}</strong>
          <Link className="btn" to="/custom" state={{ cm, collectionId: collection.id, colors }}>String this one</Link>
        </div>
      </div>
    </section>
  );
}
