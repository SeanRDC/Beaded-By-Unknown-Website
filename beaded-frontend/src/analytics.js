import { CONSENT_EVENT, getConsent } from './lib/consent.js';

const MEASUREMENT_ID = 'G-Q3SXPSRK7V';
const LOAD_DELAY_MS = 3000;
let enabled = false;

/* Loads Google Analytics. Lives in a bundled file so the content security policy needs no inline script. */
function enable({ delay }) {
  if (enabled) return;
  enabled = true;
  window[`ga-disable-${MEASUREMENT_ID}`] = false;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', MEASUREMENT_ID, { send_page_view: false });

  const load = () => {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
    document.head.append(script);
  };
  if (!delay) load();
  else if (document.readyState === 'complete') setTimeout(load, LOAD_DELAY_MS);
  else window.addEventListener('load', () => setTimeout(load, LOAD_DELAY_MS), { once: true });
}

/* Stops collection straight away and removes the cookies Analytics left behind. */
function disable() {
  window[`ga-disable-${MEASUREMENT_ID}`] = true;
  const domains = ['', location.hostname, `.${location.hostname.replace(/^www\./, '')}`];
  document.cookie.split(';').map((part) => part.split('=')[0].trim()).filter((name) => name.startsWith('_ga')).forEach((name) => {
    domains.forEach((domain) => {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domain ? `; domain=${domain}` : ''}`;
    });
  });
}

/* Nothing is sent until the visitor accepts in the cookie banner. */
export function startAnalytics() {
  if (import.meta.env.DEV) return;
  if (getConsent() === 'granted') enable({ delay: true });

  window.addEventListener(CONSENT_EVENT, (event) => {
    if (event.detail === 'granted') {
      const wasOff = !enabled || window[`ga-disable-${MEASUREMENT_ID}`];
      enable({ delay: false });
      window[`ga-disable-${MEASUREMENT_ID}`] = false;
      if (wasOff) trackPage(location.pathname);
    } else {
      disable();
    }
  });
}

export function trackPage(path) {
  if (getConsent() !== 'granted') return;
  window.gtag?.('event', 'page_view', { page_path: path });
}
