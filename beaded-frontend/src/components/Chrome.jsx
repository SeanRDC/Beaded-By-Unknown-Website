import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigationType } from 'react-router-dom';

import { gsap, reduced, ScrollTrigger } from '../motion/gsap.js';
import { trackPage } from '../analytics.js';
import { useShop } from '../store/shop.jsx';
import { useUi } from '../store/ui.jsx';
import { Sheet } from './Sheet.jsx';
import { SmallName } from './SmallName.jsx';

const NOTICE_KEY = 'beaded_notice_seen';
const NOTICE_DELAY_MS = 900;
const SHOP_NAME = 'Beaded by Unknown';
const SHOP_LINE = 'Bracelets and necklaces strung by hand, one bead at a time.';

/* Sets the tab title and description for a page. */
export function useSeo(title, description = SHOP_LINE) {
  useEffect(() => {
    document.title = title ? `${title} | ${SHOP_NAME}` : `${SHOP_NAME} | ${SHOP_LINE}`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', description);
  }, [title, description]);
}

export function Toast() {
  const { toast } = useUi();
  if (!toast) return null;
  return <div className={`toast ${toast.type === 'error' ? 'toast--error' : ''}`} role="status">{toast.message}</div>;
}

/* New pages start at the top. The back button keeps the browser's own position. */
export function ScrollManager() {
  const { pathname, hash } = useLocation();
  const type = useNavigationType();

  useLayoutEffect(() => {
    if (type !== 'POP' && !hash) window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname, hash, type]);

  useEffect(() => {
    trackPage(pathname);
    const timer = setTimeout(() => ScrollTrigger.refresh(), 400);
    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}

/* A thread sweeps across, then a ground-coloured panel lifts off the new page. */
export function PageTransition() {
  const { pathname } = useLocation();
  const panel = useRef(null);
  const thread = useRef(null);
  const first = useRef(true);

  useLayoutEffect(() => {
    if (first.current) {
      first.current = false;
      return undefined;
    }
    if (reduced()) return undefined;

    const timeline = gsap.timeline()
      .set(panel.current, { clipPath: 'inset(0 0 0% 0)' })
      .fromTo(thread.current, { scaleX: 0 }, { scaleX: 1, duration: 0.24, ease: 'power2.inOut' })
      .to(panel.current, { clipPath: 'inset(0 0 100% 0)', duration: 0.24, ease: 'power2.inOut' })
      .set(thread.current, { scaleX: 0 });
    return () => timeline.progress(1).kill();
  }, [pathname]);

  return <div className="wipe" ref={panel} aria-hidden="true"><i ref={thread} /></div>;
}

/* Tells visitors the shop is a portfolio project. Goes away by itself once checkout is live. */
export function ShowcaseNotice() {
  const { settings } = useShop();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!settings.showcase || sessionStorage.getItem(NOTICE_KEY)) return undefined;
    const timer = setTimeout(() => setOpen(true), NOTICE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [settings.showcase]);

  const close = () => {
    sessionStorage.setItem(NOTICE_KEY, '1');
    setOpen(false);
  };

  return (
    <Sheet open={open && settings.showcase} onClose={close} side="center" label="This shop is a portfolio project">
      <div className="notice">
        <h2>This shop is a portfolio project</h2>
        <p>Everything works, but nothing here is really for sale. Please don't place an order, because it won't arrive. Checkout runs in test mode at ₱1.</p>
        <button type="button" className="btn btn--wide" onClick={close}>I understand</button>
      </div>
    </Sheet>
  );
}

/* A pared-back top bar for checkout, with one way back. */
export function CheckoutBar() {
  const { openPanel } = useUi();
  return (
    <header className="top">
      <Link to="/" aria-label="Beaded by Unknown, home"><SmallName /></Link>
      <span />
      <button type="button" className="top__right" onClick={() => openPanel('bag')}>Back to bag</button>
    </header>
  );
}

export function PageLoading() {
  return <div className="loading" aria-hidden="true" />;
}
