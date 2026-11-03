/* The visitor's answer to the cookie banner. Signing in, the bag and saved pieces never depend on it;
   only Google Analytics waits for a yes. */
export const CONSENT_KEY = 'beaded_cookie_choice';
export const CONSENT_EVENT = 'beaded:consent';
const CHOICES = ['granted', 'denied'];

export function getConsent() {
  try {
    const value = localStorage.getItem(CONSENT_KEY);
    return CHOICES.includes(value) ? value : null;
  } catch {
    return null;
  }
}

/* Pass null to ask again, which is what "Cookie settings" in the footer does. */
export function setConsent(choice) {
  try {
    if (choice) localStorage.setItem(CONSENT_KEY, choice);
    else localStorage.removeItem(CONSENT_KEY);
  } catch {
    /* Storage can be blocked; the choice then lasts for this page only. */
  }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: choice }));
}
