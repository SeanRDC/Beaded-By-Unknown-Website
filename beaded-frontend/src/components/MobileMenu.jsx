import { Link } from 'react-router-dom';

import { useAuth } from '../store/auth.jsx';
import { useUi } from '../store/ui.jsx';
import { MAIN_LINKS } from './Header.jsx';
import { Sheet } from './Sheet.jsx';

export function MobileMenu() {
  const { panel, closePanel, openPanel } = useUi();
  const { user } = useAuth();

  return (
    <Sheet open={panel === 'menu'} onClose={closePanel} side="left" label="Menu">
      <nav className="menu" aria-label="Menu">
        <Link to="/" onClick={closePanel}>Home</Link>
        {MAIN_LINKS.map((link) => <Link key={link.to} to={link.to} onClick={closePanel}>{link.label}</Link>)}
        <button type="button" onClick={() => openPanel('search')}>Search</button>
        <Link to="/wishlist" onClick={closePanel}>Saved</Link>
        {user
          ? <Link to="/account" onClick={closePanel}>{user.firstName}</Link>
          : <button type="button" onClick={() => openPanel('login')}>Sign in</button>}
        <div className="menu__small">
          <Link to="/faq" onClick={closePanel}>Questions</Link>
          <Link to="/size-guide" onClick={closePanel}>Size guide</Link>
          <Link to="/shipping" onClick={closePanel}>Shipping</Link>
          <Link to="/terms" onClick={closePanel}>Terms</Link>
        </div>
      </nav>
    </Sheet>
  );
}
