import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../store/auth.jsx';
import { useCart } from '../store/cart.jsx';
import { useUi } from '../store/ui.jsx';
import { SmallName } from './SmallName.jsx';

const SHOW_AFTER = 320;

export const MAIN_LINKS = [
  { to: '/shop', label: 'Shop' },
  { to: '/custom', label: 'String your own' },
  { to: '/story', label: 'Story' },
  { to: '/journal', label: 'Journal' }
];

function BagButton() {
  const { count } = useCart();
  const { openPanel } = useUi();
  return (
    <button type="button" data-bag-target onClick={() => openPanel('bag')} aria-label={`Bag, ${count} ${count === 1 ? 'piece' : 'pieces'}`}>
      Bag <span className="count nums">{count}</span>
    </button>
  );
}

export function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { wish } = useCart();
  const { openPanel } = useUi();

  return (
    <header className="top">
      <div>
        <button type="button" className="top__menu" onClick={() => openPanel('menu')}>Menu</button>
        <nav aria-label="Main" className="top__links">
          <ul>
            {MAIN_LINKS.map((link) => <li key={link.to}><NavLink to={link.to}>{link.label}</NavLink></li>)}
          </ul>
        </nav>
      </div>

      {pathname === '/' ? <span /> : <Link to="/" aria-label="beeeaded, Beaded by Unknown home"><SmallName /></Link>}

      <ul className="top__right">
        <li className="top__tool"><button type="button" onClick={() => openPanel('search')}>Search</button></li>
        <li className="top__tool"><Link to="/wishlist">Saved <span className="count nums">{wish.length}</span></Link></li>
        <li className="top__tool">
          <button type="button" onClick={() => (user ? navigate('/account') : openPanel('login'))}>{user ? user.firstName : 'Sign in'}</button>
        </li>
        <li><BagButton /></li>
      </ul>
    </header>
  );
}

/* The compact bar that appears once the top of the page has scrolled away. */
export function FloatingBar() {
  const [on, setOn] = useState(false);
  const { openPanel } = useUi();

  useEffect(() => {
    const check = () => setOn(window.scrollY > SHOW_AFTER);
    const frame = requestAnimationFrame(check);
    window.addEventListener('scroll', check, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', check);
    };
  }, []);

  return (
    <div className={`pill ${on ? 'is-on' : ''}`} inert={!on}>
      <Link to="/" aria-label="beeeaded, Beaded by Unknown home"><SmallName /></Link>
      <ul>
        <li className="pill__link"><Link to="/shop">Shop</Link></li>
        <li className="pill__link"><Link to="/custom">String your own</Link></li>
        <li className="pill__link"><Link to="/story">Story</Link></li>
        <li className="pill__link"><button type="button" onClick={() => openPanel('search')}>Search</button></li>
        <li><button type="button" className="pill__menu" onClick={() => openPanel('menu')}>Menu</button></li>
        <li><BagButton /></li>
      </ul>
    </div>
  );
}
