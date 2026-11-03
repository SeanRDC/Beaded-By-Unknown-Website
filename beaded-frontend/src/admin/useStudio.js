import { useCallback, useEffect, useState } from 'react';

import { studio } from './client.js';

const SOURCES = {
  products: { path: '/products' },
  blogs: { path: '/blogs' },
  reviews: { path: '/reviews' },
  settings: { path: '/settings' },
  orders: { path: '/admin/orders', locked: true },
  designs: { path: '/custom-orders', locked: true },
  stats: { path: '/admin/stats', locked: true }
};

const EMPTY = {
  products: [],
  blogs: [],
  reviews: [],
  orders: [],
  designs: [],
  stats: { revenue: 0, totalOrders: 0 },
  settings: null
};

/* Everything the studio shows, loaded with the key and refreshed by name after each change. */
export function useStudio(studioKey, onRefused) {
  const [data, setData] = useState(EMPTY);
  const [server, setServer] = useState('checking');

  const update = useCallback((name, change) => {
    setData((current) => ({ ...current, [name]: typeof change === 'function' ? change(current[name]) : change }));
  }, []);

  const reload = useCallback(async (...names) => {
    await Promise.all(names.map(async (name) => {
      const { path, locked } = SOURCES[name];
      try {
        update(name, await studio(path, { key: locked ? studioKey : undefined }));
        setServer('online');
      } catch (err) {
        if (err.status === 403) onRefused();
        else if (name === 'products') setServer('offline');
      }
    }));
  }, [studioKey, update, onRefused]);

  useEffect(() => {
    if (studioKey) reload(...Object.keys(SOURCES));
  }, [studioKey, reload]);

  return { data, server, update, reload };
}
