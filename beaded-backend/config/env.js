const REQUIRED = ['JWT_SECRET', 'ADMIN_SECRET', 'MONGODB_URI', 'CLIENT_URL'];

/* Refuses to start with a missing secret, so a bad deploy fails loudly instead of running open. */
function assertEnv(env = process.env) {
  const missing = REQUIRED.filter((key) => !env[key]);
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

/* Anything other than an explicit "live" keeps checkout at the one peso test charge. */
function checkoutMode(env = process.env) {
  return env.CHECKOUT_MODE === 'live' ? 'live' : 'showcase';
}

function clientUrl(env = process.env) {
  return (env.CLIENT_URL || '').split(',')[0].trim().replace(/\/$/, '');
}

/* CLIENT_URL may list several origins. Each also allows its www or bare twin. */
function allowedOrigins(env = process.env) {
  const origins = new Set();
  for (const raw of (env.CLIENT_URL || '').split(',')) {
    const origin = raw.trim().replace(/\/$/, '');
    if (!origin) continue;
    origins.add(origin);
    origins.add(origin.includes('://www.') ? origin.replace('://www.', '://') : origin.replace('://', '://www.'));
  }
  if (env.NODE_ENV !== 'production') {
    origins.add('http://localhost:5173');
    origins.add('http://localhost:4173');
  }
  return [...origins];
}

module.exports = { allowedOrigins, assertEnv, checkoutMode, clientUrl };
