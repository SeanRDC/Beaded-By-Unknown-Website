const MEASUREMENT_ID = 'G-Q3SXPSRK7V';

/* Lives in a bundled file so the content security policy needs no inline script. */
export function startAnalytics() {
  if (import.meta.env.DEV) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', MEASUREMENT_ID);

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.append(script);
}

/* The theme is a shop setting now. localStorage only avoids a flash on the next visit. */
export function applyTheme(theme) {
  localStorage.setItem('beaded_theme', theme);
}
