import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigationType } from 'react-router-dom';

import { gsap, reduced, ScrollTrigger } from '../motion/gsap.js';
import { trackPage } from '../analytics.js';
import { CONSENT_EVENT, getConsent, setConsent } from '../lib/consent.js';
import { arriveAt, watchPlaces } from '../lib/places.js';
import { useShop } from '../store/shop.jsx';
import { useUi } from '../store/ui.jsx';
import { Sheet } from './Sheet.jsx';
import { SmallName } from './SmallName.jsx';

const NOTICE_KEY = 'beaded_notice_seen';
const NOTICE_DELAY_MS = 900;
const SHOP_NAME = 'Beaded by Unknown';
const SHOP_LINE = 'Beaded pieces made by hand, one bead at a time.';

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

/* New pages start at the top. A reload or the back button returns to the same place. */
export function ScrollManager() {
  const { pathname, hash, key } = useLocation();
  const type = useNavigationType();

  useLayoutEffect(() => watchPlaces(), []);

  useLayoutEffect(() => {
    const letGo = arriveAt(`${key}:${pathname}`, type);
    if (type !== 'POP' && !hash) window.scrollTo({ top: 0, behavior: 'instant' });
    return letGo;
  }, [pathname, hash, key, type]);

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
    <Sheet open={open && settings.showcase} onClose={close} side="center" label="This shop is a portfolio project" closeButton={false}>
      <div className="notice">
        <h2>This shop is a portfolio project</h2>
        <p>Everything works, but nothing here is really for sale. Please don't place an order, because it won't arrive. Checkout runs in test mode at ₱1.</p>
        <button type="button" className="btn btn--wide" data-autofocus onClick={close}>I understand</button>
      </div>
    </Sheet>
  );
}

/* Asks once whether Google Analytics may run. Slides up from the bottom and never blocks the page. */
export function CookieBanner() {
  const [choice, setChoice] = useState(getConsent);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const follow = (event) => setChoice(event.detail ?? null);
    window.addEventListener(CONSENT_EVENT, follow);
    return () => window.removeEventListener(CONSENT_EVENT, follow);
  }, []);

  /* Mount first, then raise, so the slide plays. */
  useEffect(() => {
    if (choice) return undefined;
    const frame = requestAnimationFrame(() => setShown(true));
    return () => {
      cancelAnimationFrame(frame);
      setShown(false);
    };
  }, [choice]);

  if (choice) return null;

  return (
    <section className={`consent ${shown ? 'is-shown' : ''}`} aria-label="Cookie choice">
      <p>
        I use Google Analytics to count visits and see how the site performs. Signing in and your bag work either way.{' '}
        <Link className="link" to="/terms">Terms and privacy</Link>
      </p>
      <div className="consent__actions">
        <button type="button" className="btn consent__no" onClick={() => setConsent('denied')}>Decline</button>
        <button type="button" className="btn consent__yes" onClick={() => setConsent('granted')}>Accept</button>
      </div>
    </section>
  );
}

/* Reopens the cookie banner from the footer. */
export function CookieSettingsLink({ className = 'link' }) {
  return <button type="button" className={className} onClick={() => setConsent(null)}>Cookie settings</button>;
}

/* A pared-back top bar for checkout, with one way back. */
export function CheckoutBar() {
  const { openPanel } = useUi();
  return (
    <header className="top">
      <Link to="/" aria-label="beeeaded, Beaded by Unknown home"><SmallName /></Link>
      <span />
      <button type="button" className="top__right" onClick={() => openPanel('bag')}>Back to bag</button>
    </header>
  );
}

export function PageLoading() {
  return <div className="loading" aria-hidden="true" />;
}
