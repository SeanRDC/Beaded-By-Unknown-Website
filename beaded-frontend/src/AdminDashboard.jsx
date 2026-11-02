import './styles/admin.css';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { Catalogue, PieceForm } from './admin/Catalogue.jsx';
import { Categories } from './admin/Categories.jsx';
import { Designs } from './admin/Designs.jsx';
import { Gate } from './admin/Gate.jsx';
import { Journal } from './admin/Journal.jsx';
import { Orders } from './admin/Orders.jsx';
import { Overview } from './admin/Overview.jsx';
import { Confirm } from './admin/parts.jsx';
import { Reviews } from './admin/Reviews.jsx';
import { Settings } from './admin/Settings.jsx';
import { useStudio } from './admin/useStudio.js';
import { Sheet } from './components/Sheet.jsx';

const KEY_STORE = 'beaded_admin_key';
const NAME_STORE = 'beaded_admin_name';
const OWNERS = ['Iyesha', 'Sean'];
const TOAST_MS = 3500;

/* The way around the studio: three short runs along one thread. */
const GROUPS = [
  [['overview', 'Overview'], ['orders', 'Orders'], ['designs', 'Custom designs']],
  [['catalogue', 'Catalogue'], ['piece', 'Add a piece'], ['categories', 'Categories']],
  [['journal', 'Journal'], ['reviews', 'Reviews'], ['settings', 'Store settings']]
];

const COUNTS = { orders: 'orders', designs: 'designs', catalogue: 'products' };

function Way({ view, data, editing, onGo }) {
  return (
    <ul className="studio-way">
      {GROUPS.flat().map(([id, label], index) => {
        const total = COUNTS[id] && data[COUNTS[id]].length;
        return (
          <li key={id} className={index > 0 && index % 3 === 0 ? 'is-new-run' : ''}>
            <button type="button" aria-current={view === id ? 'page' : undefined} onClick={() => onGo(id)}>
              <span>{id === 'piece' && editing ? 'Edit a piece' : label}</span>
              {total > 0 && <span className="soft nums">{total}</span>}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function Studio({ studioKey, onLock }) {
  const { data, server, update, reload } = useStudio(studioKey, onLock);
  const [view, setView] = useState('overview');
  const [editing, setEditing] = useState(null);
  const [menu, setMenu] = useState(false);
  const [request, setRequest] = useState(null);
  const [toast, setToast] = useState(null);
  const [owner, setOwner] = useState(() => localStorage.getItem(NAME_STORE) || OWNERS[0]);
  const timer = useRef(null);

  const flash = useCallback((message, type = 'success') => {
    clearTimeout(timer.current);
    setToast({ message, type });
    timer.current = setTimeout(() => setToast(null), TOAST_MS);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  /* The studio wears the same theme as the shop. */
  useEffect(() => {
    if (data.settings?.theme) document.documentElement.dataset.theme = data.settings.theme;
  }, [data.settings?.theme]);

  const go = (id) => {
    setEditing(null);
    setView(id);
    setMenu(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const edit = (item) => {
    setEditing(item);
    setView('piece');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const switchOwner = () => {
    const next = OWNERS[(OWNERS.indexOf(owner) + 1) % OWNERS.length];
    setOwner(next);
    localStorage.setItem(NAME_STORE, next);
  };

  const shared = { data, studioKey, update, reload, flash, ask: setRequest };

  return (
    <div className="site studio">
      <a className="skip" href="#main">Skip to content</a>

      <header className="studio-top">
        <button type="button" className="studio-top__menu" onClick={() => setMenu(true)}>Menu</button>
        <p className="mini">beeeaded <span className="soft">studio</span></p>
        <div className="studio-top__tools">
          <button type="button" className="studio-top__hello" onClick={switchOwner}>Hello, {owner}</button>
          <span className="studio-top__tool studio-server" data-server={server}>
            {{ online: 'Server live', offline: 'Server offline', checking: 'Checking the server' }[server]}
          </span>
          <a className="studio-top__tool" href="/">View the shop</a>
          <button type="button" onClick={onLock}>Lock</button>
        </div>
      </header>

      <nav className="studio-nav" aria-label="Studio"><Way view={view} data={data} editing={editing} onGo={go} /></nav>

      <main id="main" tabIndex={-1} className="studio-view" key={`${view}-${editing?._id || ''}`}>
        {view === 'overview' && <Overview data={data} />}
        {view === 'orders' && <Orders {...shared} />}
        {view === 'designs' && <Designs {...shared} />}
        {view === 'catalogue' && <Catalogue {...shared} onEdit={edit} onAdd={() => go('piece')} />}
        {view === 'piece' && <PieceForm {...shared} editing={editing} onDone={() => go('catalogue')} />}
        {view === 'categories' && <Categories {...shared} />}
        {view === 'journal' && <Journal {...shared} />}
        {view === 'reviews' && <Reviews {...shared} />}
        {view === 'settings' && data.settings && <Settings {...shared} />}
      </main>

      <Sheet open={menu} onClose={() => setMenu(false)} side="left" label="Studio menu">
        <div className="menu"><Way view={view} data={data} editing={editing} onGo={go} /></div>
      </Sheet>

      <Confirm request={request} onClose={() => setRequest(null)} />

      {toast && <div className={`toast ${toast.type === 'error' ? 'toast--error' : ''}`} role="status">{toast.message}</div>}
    </div>
  );
}

export default function AdminDashboard() {
  const [studioKey, setStudioKey] = useState(() => sessionStorage.getItem(KEY_STORE) || '');

  useLayoutEffect(() => {
    document.documentElement.dataset.surface = 'site';
    return () => delete document.documentElement.dataset.surface;
  }, []);

  const open = (key) => {
    sessionStorage.setItem(KEY_STORE, key);
    setStudioKey(key);
  };

  const lock = useCallback(() => {
    sessionStorage.removeItem(KEY_STORE);
    setStudioKey('');
  }, []);

  return studioKey ? <Studio studioKey={studioKey} onLock={lock} /> : <Gate onOpen={open} />;
}
