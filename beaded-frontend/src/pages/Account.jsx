import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useSeo } from '../components/Chrome.jsx';
import { Sheet } from '../components/Sheet.jsx';
import { peso } from '../lib/money.js';
import { useAuth } from '../store/auth.jsx';
import { useShop } from '../store/shop.jsx';
import { useUi } from '../store/ui.jsx';

const TABS = ['Orders', 'Details'];
const FILTERS = { All: () => true, Preparing: (order) => ['Paid', 'Pending Studio Review', 'Crafting'].includes(order.status), Shipped: (order) => order.status === 'Shipped', Delivered: (order) => order.status === 'Delivered' };
const shown = (status) => (status === 'Paid' ? 'Preparing' : status);

function Orders() {
  const { orders, loadOrders } = useAuth();
  const { flash } = useUi();
  const [filter, setFilter] = useState('All');
  const list = useMemo(() => orders.filter(FILTERS[filter]), [orders, filter]);

  useEffect(() => {
    loadOrders().catch((err) => flash(err.message, 'error'));
  }, [loadOrders, flash]);

  if (orders.length === 0) {
    return (
      <div className="empty">
        <p className="t-lead">No orders yet.</p>
        <Link className="link" to="/shop">See the pieces</Link>
      </div>
    );
  }

  return (
    <>
      <div className="chips">
        {Object.keys(FILTERS).map((name) => <button key={name} type="button" className="chip" aria-pressed={filter === name} onClick={() => setFilter(name)}>{name}</button>)}
      </div>
      {list.length === 0 && <p className="soft" style={{ marginTop: 18 }}>No orders with that status.</p>}
      <ul className="orders">
        {list.map((order) => (
          <li key={order._id} className="panel">
            <div className="signin__row">
              <span>{new Date(order.createdAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              <span>{shown(order.status)}</span>
            </div>
            <ul>
              {order.items?.map((item, index) => (
                <li key={index} className="signin__row">
                  <span>{item.quantity} × {item.name} <small className="soft">({item.color})</small></span>
                  <span className="nums">{peso(item.amount / 100)}</span>
                </li>
              ))}
            </ul>
            <p className="nums">Total {peso(order.amountPaid)}</p>
          </li>
        ))}
      </ul>
    </>
  );
}

function Details() {
  const { user, updateProfile } = useAuth();
  const { settings } = useShop();
  const { flash } = useUi();
  const saved = user.shippingAddress || {};
  const [form, setForm] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    phone: user.phone || '',
    street: saved.street || '',
    barangay: saved.barangay || '',
    city: saved.city || '',
    province: saved.province || '',
    postalCode: saved.postalCode || '',
    region: saved.region || Object.keys(settings.shippingRates)[0]
  });
  const [changed, setChanged] = useState(false);

  const set = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setChanged(true);
  };

  const save = async (event) => {
    event.preventDefault();
    const { firstName, lastName, phone, ...shippingAddress } = form;
    try {
      await updateProfile({ firstName, lastName, phone, shippingAddress });
      setChanged(false);
      flash('Your details are saved.', 'success');
    } catch (err) {
      flash(err.message, 'error');
    }
  };

  const text = (field, label, extra = {}) => (
    <label className="field">
      <span>{label}</span>
      <input className="input" value={form[field]} onChange={set(field)} {...extra} />
    </label>
  );

  return (
    <form className="stack details-form" onSubmit={save}>
      <div className="two">{text('firstName', 'First name', { required: true })}{text('lastName', 'Last name')}</div>
      {text('phone', 'Mobile number')}
      <label className="field">
        <span>Email, which cannot be changed</span>
        <input className="input" value={user.email} disabled />
      </label>
      <h2 className="t-lead">Default address</h2>
      {text('street', 'House or unit, building, street')}
      {text('barangay', 'Barangay')}
      <div className="three">{text('city', 'City')}{text('province', 'Province')}{text('postalCode', 'Postal code')}</div>
      <label className="field">
        <span>Region</span>
        <select className="input" value={form.region} onChange={set('region')}>
          {Object.keys(settings.shippingRates).map((name) => <option key={name}>{name}</option>)}
        </select>
      </label>
      <button type="submit" className="btn" disabled={!changed}>{changed ? 'Save details' : 'Saved'}</button>
    </form>
  );
}

function DeleteAccount({ open, onClose }) {
  const { requestDelete, confirmDelete } = useAuth();
  const { flash } = useUi();
  const navigate = useNavigate();
  const [stage, setStage] = useState('warning');
  const [code, setCode] = useState('');

  const close = () => {
    setStage('warning');
    setCode('');
    onClose();
  };

  const send = async () => {
    try {
      await requestDelete();
      setStage('code');
    } catch (err) {
      flash(err.message, 'error');
    }
  };

  const confirm = async (event) => {
    event.preventDefault();
    try {
      await confirmDelete(code.trim());
      close();
      navigate('/');
      flash('Your account has been deleted.');
    } catch (err) {
      flash(err.message, 'error');
    }
  };

  return (
    <Sheet open={open} onClose={close} side="center" label="Delete your account">
      <div className="notice">
        <h2>Delete your account</h2>
        {stage === 'warning' ? (
          <>
            <p>This cannot be undone. You will lose your order history, saved pieces and address.</p>
            <button type="button" className="btn btn--wide" onClick={send}>Email me a deletion code</button>
          </>
        ) : (
          <form className="stack" onSubmit={confirm}>
            <label className="field">
              <span>The 6-digit code I emailed you</span>
              <input className="input signin__code" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" required />
            </label>
            <button type="submit" className="btn btn--wide">Delete my account</button>
          </form>
        )}
      </div>
    </Sheet>
  );
}

export default function Account() {
  useSeo('Your account');
  const { user, signOut } = useAuth();
  const { openPanel } = useUi();
  const navigate = useNavigate();
  const [tab, setTab] = useState(TABS[0]);
  const [deleting, setDeleting] = useState(false);

  if (!user) {
    return (
      <div className="page empty">
        <h1 className="t-title">Sign in to see your orders</h1>
        <button type="button" className="btn" onClick={() => openPanel('login')}>Sign in</button>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page-head">
        <h1 className="t-head">Hello, {user.firstName}</h1>
        <p className="soft">{user.email}</p>
      </header>

      <div className="chips account-tabs">
        {TABS.map((name) => <button key={name} type="button" className="chip" aria-pressed={tab === name} onClick={() => setTab(name)}>{name}</button>)}
      </div>

      {tab === 'Orders' ? <Orders /> : <Details />}

      <div className="account-end">
        <button type="button" className="link" onClick={() => { signOut(); navigate('/'); }}>Sign out</button>
        <button type="button" className="link link--danger" onClick={() => setDeleting(true)}>Delete my account</button>
      </div>

      <DeleteAccount open={deleting} onClose={() => setDeleting(false)} />
    </div>
  );
}
