import { Link } from 'react-router-dom';

import { useSeo } from '../components/Chrome.jsx';
import { SizeTable } from '../components/SizeTable.jsx';

export default function SizeGuide() {
  useSeo('Size guide', 'How to measure your wrist and choose a size.');
  return (
    <div className="page reading">
      <h1 className="t-head">Size guide</h1>
      <p className="t-lead">Wrap a soft tape around your wrist, snug but not tight, and read it in centimetres.</p>
      <SizeTable />
      <p>Building your own? The builder counts the exact number of beads for your wrist, so you only need the measurement.</p>
      <p><Link className="link" to="/custom">String your own</Link></p>
    </div>
  );
}
