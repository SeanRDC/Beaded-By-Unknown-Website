const jwt = require('jsonwebtoken');

const { HttpError } = require('../middleware/errors');

const CERTS_URL = 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';

const refuse = () => new HttpError(401, 'Google sign-in failed. Please try again.');

let certs = {};
let certsExpire = 0;

/* Google publishes its signing certificates and says how long to keep them. */
async function signingCerts() {
  if (Date.now() < certsExpire) return certs;
  const res = await fetch(CERTS_URL);
  if (!res.ok) throw new HttpError(503, 'Google sign-in is unavailable right now.');
  const maxAge = /max-age=(\d+)/.exec(res.headers.get('cache-control') || '');
  certs = await res.json();
  certsExpire = Date.now() + (maxAge ? Number(maxAge[1]) * 1000 : 60 * 60 * 1000);
  return certs;
}

const firebase = {
  /* Proves the token came from this Firebase project, and returns who it was issued to. */
  async verifyIdToken(token) {
    const projectId = process.env.FIREBASE_PROJECT_ID || 'beaded-shop';
    const decoded = jwt.decode(token, { complete: true });
    const cert = decoded && (await signingCerts())[decoded.header.kid];
    if (!cert) throw refuse();

    let claims;
    try {
      claims = jwt.verify(token, cert, {
        algorithms: ['RS256'],
        audience: projectId,
        issuer: `https://securetoken.google.com/${projectId}`
      });
    } catch {
      throw refuse();
    }

    if (!claims.sub || !claims.email || claims.email_verified !== true) throw refuse();

    const [firstName, ...rest] = (claims.name || '').trim().split(/\s+/);
    return { email: claims.email, firstName: firstName || claims.email.split('@')[0], lastName: rest.join(' ') };
  },

  /* For tests. */
  resetCerts() {
    certs = {};
    certsExpire = 0;
  }
};

module.exports = firebase;
