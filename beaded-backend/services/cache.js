const store = new Map();

/* Holds the promise, so a burst of readers shares one database query. */
function cached(key, ttlMs, load) {
  const hit = store.get(key);
  if (hit && hit.expires > Date.now()) return hit.value;

  const value = Promise.resolve().then(load);
  store.set(key, { value, expires: Date.now() + ttlMs });
  value.catch(() => store.delete(key));
  return value;
}

function clear(prefix = '') {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
}

const publicCache = (req, res, next) => {
  res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=120');
  next();
};

module.exports = { cached, clear, publicCache };
