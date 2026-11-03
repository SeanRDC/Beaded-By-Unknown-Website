/* Puts visitors back where they were after a reload or a trip back. The browser tries this
   too, but it gives up once the document has loaded, and these pages only grow tall after
   that. Each place belongs to one history entry and lasts as long as the tab. */

const STORE = 'beaded_places';
const SETTLE_MS = 2500;
const TAKEOVER_EVENTS = ['wheel', 'touchstart', 'pointerdown', 'keydown'];

let places = {};
let here = null;
let opening = true;

function savedPlaces() {
  try {
    return JSON.parse(sessionStorage.getItem(STORE)) || {};
  } catch {
    return {};
  }
}

const note = () => {
  if (here) places[here] = Math.round(window.scrollY);
};

const keep = () => {
  note();
  sessionStorage.setItem(STORE, JSON.stringify(places));
};

/* True during the very first render of a page load, and never again after it. */
export const isOpening = () => opening;

export const reopened = () => ['reload', 'back_forward'].includes(performance.getEntriesByType('navigation')[0]?.type);

export function watchPlaces() {
  places = savedPlaces();
  window.history.scrollRestoration = 'manual';
  window.addEventListener('scroll', note, { passive: true });
  window.addEventListener('pagehide', keep);
  return () => {
    window.removeEventListener('scroll', note);
    window.removeEventListener('pagehide', keep);
  };
}

/* Holds the page at its old place while it grows, until the visitor takes over. */
function holdPlace(target = 0) {
  const place = () => {
    const room = document.documentElement.scrollHeight - window.innerHeight;
    if (room >= target) window.scrollTo({ top: target, behavior: 'instant' });
  };
  place();
  if (!target) return undefined;

  const growth = new ResizeObserver(place);
  let timer = null;
  const release = () => {
    clearTimeout(timer);
    growth.disconnect();
    TAKEOVER_EVENTS.forEach((name) => window.removeEventListener(name, release));
  };
  timer = setTimeout(release, SETTLE_MS);
  TAKEOVER_EVENTS.forEach((name) => window.addEventListener(name, release, { passive: true }));
  growth.observe(document.querySelector('.site'));
  return release;
}

/* Called on every change of page. Returns a function that lets go of the page. */
export function arriveAt(id, navigationType) {
  const returning = navigationType === 'POP' && (!opening || reopened());
  opening = false;
  here = id;
  return returning ? holdPlace(places[id]) : undefined;
}
