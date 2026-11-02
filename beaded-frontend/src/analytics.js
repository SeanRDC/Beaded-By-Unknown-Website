const MEASUREMENT_ID = 'G-Q3SXPSRK7V';

/* Lives in a bundled file so the content security policy needs no inline script. */
export function startAnalytics() {
  if (import.meta.env.DEV) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', MEASUREMENT_ID, { send_page_view: false });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.append(script);
}

export function trackPage(path) {
  window.gtag?.('event', 'page_view', { page_path: path });
}
