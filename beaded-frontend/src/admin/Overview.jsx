import { peso } from '../lib/money.js';
import { PageHead } from './parts.jsx';

const DAYS = 7;
const WIDTH = 700;
const HEIGHT = 170;
const ROOM = 16;

function lastWeek(orders) {
  return Array.from({ length: DAYS }, (_, index) => {
    const day = new Date();
    day.setDate(day.getDate() - (DAYS - 1 - index));
    const same = day.toLocaleDateString();
    const total = orders
      .filter((order) => new Date(order.createdAt).toLocaleDateString() === same)
      .reduce((sum, order) => sum + (order.amountPaid || 0), 0);
    return { label: day.toLocaleDateString('en-PH', { weekday: 'short' }), total };
  });
}

function threadThrough(points) {
  return points.slice(1).reduce((path, point, index) => {
    const before = points[index];
    const middle = (before.x + point.x) / 2;
    return `${path} C ${middle},${before.y} ${middle},${point.y} ${point.x},${point.y}`;
  }, `M ${points[0].x},${points[0].y}`);
}

export function Overview({ data }) {
  const { products, orders, stats } = data;
  const week = lastWeek(orders);
  const highest = Math.max(...week.map((day) => day.total), 1);
  const points = week.map((day, index) => ({
    x: ((index + 0.5) * WIDTH) / DAYS,
    y: HEIGHT - ROOM - (day.total / highest) * (HEIGHT - ROOM * 2)
  }));
  const weekTotal = week.reduce((sum, day) => sum + day.total, 0);

  return (
    <>
      <PageHead title="Overview" />

      <div className="studio-figures">
        <p><b className="nums">{peso(stats.revenue)}</b><span className="soft">Revenue</span></p>
        <p><b className="nums">{stats.totalOrders}</b><span className="soft">{stats.totalOrders === 1 ? 'Order' : 'Orders'}</span></p>
        <p><b className="nums">{products.length}</b><span className="soft">{products.length === 1 ? 'Piece' : 'Pieces'} in the catalogue</span></p>
      </div>

      <section className="studio-trend" aria-labelledby="trend-title">
        <h2 className="t-lead" id="trend-title">The last seven days</h2>
        <p className="soft">{peso(weekTotal)} in sales</p>
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={`Sales for the last seven days, ${peso(weekTotal)} in total`}>
          <path d={threadThrough(points)} />
          {points.map((point) => <circle key={point.x} cx={point.x} cy={point.y} r="6" />)}
        </svg>
        <ol className="studio-days">
          {week.map((day, index) => (
            <li key={index}>
              <span className="soft">{day.label}</span>
              <span className="nums">{peso(day.total)}</span>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
