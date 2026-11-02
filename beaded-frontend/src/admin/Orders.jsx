import { useState } from 'react';

import { Sheet } from '../components/Sheet.jsx';
import { peso } from '../lib/money.js';
import { studio } from './client.js';
import { Empty, PageHead, State } from './parts.jsx';

const NEXT = {
  Paid: { status: 'Shipped', label: 'Mark shipped' },
  Shipped: { status: 'Delivered', label: 'Mark delivered' }
};

const when = (date) => new Date(date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });

function OrderDetails({ order }) {
  const { shippingAddress: to, items = [], amountPaid, chargedAmount } = order;
  const lineTotal = (item) => (item.amount / 100) * (item.quantity || 1);
  const shipping = amountPaid - items.reduce((sum, item) => sum + lineTotal(item), 0);

  return (
    <div className="notice">
      <h2>{order.customerName}</h2>
      <p className="soft">{when(order.createdAt)}</p>

      <dl className="studio-facts">
        <div><dt>Email</dt><dd>{order.customerEmail}</dd></div>
        <div><dt>Mobile</dt><dd>{order.contactNumber || 'None given'}</dd></div>
        <div>
          <dt>Ship to</dt>
          <dd>
            {to?.street ? (
              <>
                {to.street}<br />
                Brgy. {to.barangay}, {to.city}, {to.province}<br />
                {to.region}, {to.postalCode}
              </>
            ) : 'No address recorded'}
          </dd>
        </div>
      </dl>

      <ul className="rows">
        {items.map((item, index) => (
          <li key={index} className="row row--pair">
            <span>{item.quantity} × {item.name}{item.color ? `, ${item.color}` : ''}</span>
            <span className="nums">{peso(lineTotal(item))}</span>
          </li>
        ))}
        {shipping > 0 && (
          <li className="row row--pair">
            <span>Shipping</span>
            <span className="nums">{peso(shipping)}</span>
          </li>
        )}
      </ul>
      <p className="row--pair"><span>Total</span><span className="nums">{peso(amountPaid)}</span></p>
      {chargedAmount !== undefined && chargedAmount !== amountPaid && (
        <p className="row--pair soft t-small"><span>Actually charged, showcase mode</span><span className="nums">{peso(chargedAmount)}</span></p>
      )}
    </div>
  );
}

export function Orders({ data, studioKey, update, reload, flash }) {
  const [open, setOpen] = useState(null);

  const advance = async (order, status) => {
    update('orders', (orders) => orders.map((item) => (item._id === order._id ? { ...item, status } : item)));
    try {
      await studio(`/admin/orders/${order._id}/status`, { key: studioKey, method: 'PATCH', body: { status } });
      flash(`${order.customerName} is now ${status.toLowerCase()}. I emailed them.`);
    } catch (err) {
      flash(err.message, 'error');
      reload('orders');
    }
  };

  return (
    <>
      <PageHead title="Orders" note="The latest 50 paid orders." />

      {data.orders.length === 0 ? <Empty>No orders yet. They appear here once someone pays.</Empty> : (
        <ul className="rows">
          {data.orders.map((order) => (
            <li key={order._id} className="row row--order">
              <div>
                <button type="button" className="link" onClick={() => setOpen(order)}>{order.customerName}</button>
                <p className="soft t-small">{order.customerEmail}</p>
              </div>
              <p className="t-small">{order.items?.map((item) => `${item.quantity} × ${item.name}`).join(', ')}</p>
              <p className="soft t-small">{when(order.createdAt)}</p>
              <p className="nums">{peso(order.amountPaid)}</p>
              <State value={order.status} />
              <div>
                {NEXT[order.status] && (
                  <button type="button" className="btn btn--small" onClick={() => advance(order, NEXT[order.status].status)}>
                    {NEXT[order.status].label}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <Sheet open={Boolean(open)} onClose={() => setOpen(null)} label="Order details" className="studio-sheet">
        {open && <OrderDetails order={open} />}
      </Sheet>
    </>
  );
}
