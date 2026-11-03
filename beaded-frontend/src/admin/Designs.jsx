import { peso } from '../lib/money.js';
import { studio } from './client.js';
import { Empty, PageHead, State } from './parts.jsx';

const NEXT = {
  'Pending Studio Review': { status: 'Crafting', label: 'Start crafting' },
  Crafting: { status: 'Shipped', label: 'Mark shipped' },
  Shipped: { status: 'Delivered', label: 'Mark delivered' }
};

const RING_PERCENT = 31;
const MIN_BEAD = 8;
const BEAD_SCALE = 2.2;

/* Older designs saved beads and charms as plain names. */
const beadOf = (bead) => (typeof bead === 'string' ? { name: bead, hex: 'var(--faint)' } : bead);
const charmOf = (charm) => (typeof charm === 'string' ? { name: charm, em: '' } : charm);

const place = (index, total) => {
  const angle = (index / Math.max(total, 1)) * Math.PI * 2 - Math.PI / 2;
  return { left: `${50 + Math.cos(angle) * RING_PERCENT}%`, top: `${50 + Math.sin(angle) * RING_PERCENT}%` };
};

function Ring({ beads, charms, size }) {
  const total = beads.length + (charms.length ? 1 : 0);
  const gap = Math.floor(total / 2);
  const px = Math.max(MIN_BEAD, (parseInt(size, 10) || 8) * BEAD_SCALE);

  return (
    <div className="studio-ring" aria-hidden="true">
      {beads.map((bead, index) => (
        <i key={index} style={{ ...place(charms.length && index >= gap ? index + 1 : index, total), width: px, height: px, backgroundColor: bead.hex }} />
      ))}
      {charms.length > 0 && <span style={place(gap, total)}>{charms[0].em}</span>}
    </div>
  );
}

function Design({ design, onAdvance }) {
  const beads = (design.beads || []).map(beadOf);
  const charms = (design.charms || []).map(charmOf);
  const counts = beads.reduce((all, { name }) => ({ ...all, [name]: (all[name] || 0) + 1 }), {});
  const next = NEXT[design.status];

  return (
    <li className="studio-design">
      <Ring beads={beads} charms={charms} size={design.beadSize} />

      <div className="studio-design__body">
        <div className="studio-design__top">
          <div>
            <h2 className="t-lead">{design.name}</h2>
            <p className="soft t-small">{design.email}</p>
          </div>
          <State value={design.status} />
        </div>

        <dl className="studio-facts studio-facts--row">
          <div><dt>Bead</dt><dd>{design.beadType || 'Not recorded'}</dd></div>
          <div><dt>Size</dt><dd>{design.beadSize || 'Not recorded'}</dd></div>
          <div><dt>Wrist</dt><dd>{design.wristSize || 'Not recorded'}</dd></div>
          <div><dt>String</dt><dd>{design.string || 'Not recorded'}</dd></div>
        </dl>

        {next && <button type="button" className="btn btn--small" onClick={() => onAdvance(design, next.status)}>{next.label}</button>}
      </div>

      <div className="studio-design__parts">
        <p className="row--pair"><span>Total</span><span className="nums">{peso(design.totalPrice)}</span></p>
        <p className="t-small soft">
          {charms.length ? `Charms: ${charms.map(({ em, name }) => `${em} ${name}`.trim()).join(', ')}` : 'No charms'}
        </p>
        <ul className="t-small">
          {Object.entries(counts).map(([name, count]) => (
            <li key={name} className="row--pair"><span>{name}</span><span className="nums soft">× {count}</span></li>
          ))}
        </ul>
      </div>
    </li>
  );
}

export function Designs({ data, studioKey, update, reload, flash }) {
  const advance = async (design, status) => {
    update('designs', (designs) => designs.map((item) => (item._id === design._id ? { ...item, status } : item)));
    try {
      await studio(`/admin/custom-orders/${design._id}/status`, { key: studioKey, method: 'PATCH', body: { status } });
    } catch (err) {
      flash(err.message, 'error');
      reload('designs');
    }
  };

  return (
    <>
      <PageHead title="Custom designs" note="Paid designs waiting for the studio." />
      {data.designs.length === 0 ? <Empty>No custom designs yet.</Empty> : (
        <ul className="studio-designs">
          {data.designs.map((design) => <Design key={design._id} design={design} onAdvance={advance} />)}
        </ul>
      )}
    </>
  );
}
