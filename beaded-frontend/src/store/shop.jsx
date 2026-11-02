import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { api } from '../api/client.js';
import { DEFAULT_SHIPPING } from '../lib/shipping.js';

const ShopContext = createContext(null);

const SETTINGS_KEY = 'beaded_settings';
const WAKE_RETRIES = 6;

const FALLBACK = {
  topBannerText: 'A gift for your friends, family, and yourself',
  featureOne: 'Free shipping over ₱500',
  featureTwo: 'Handmade',
  featureThree: 'Pre-order 7 to 14 days',
  categories: ['Bracelet', 'Necklace', 'Phone Strap', 'Keychain'],
  theme: 'brown',
  showcase: true,
  ...DEFAULT_SHIPPING
};

function savedSettings() {
  try {
    return { ...FALLBACK, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') };
  } catch {
    return FALLBACK;
  }
}

/* Catalogue and shop settings. Render may take a while to wake, so each load retries on its own. */
export function ShopProvider({ children }) {
  const [settings, setSettings] = useState(savedSettings);
  const [products, setProducts] = useState([]);
  const [productsReady, setProductsReady] = useState(false);
  const [productsFailed, setProductsFailed] = useState(false);
  const [bestsellers, setBestsellers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    const load = (path, onData, onFail = () => {}) => api(path, { retries: WAKE_RETRIES, signal })
      .then(onData)
      .catch((err) => {
        if (err.name !== 'AbortError') onFail();
      });

    load('/products', (data) => {
      setProducts(Array.isArray(data) ? data : []);
      setProductsReady(true);
    }, () => {
      setProductsFailed(true);
      setProductsReady(true);
    });
    load('/settings', (data) => {
      setSettings({ ...FALLBACK, ...data });
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(data));
    });
    load('/bestsellers', (data) => setBestsellers(Array.isArray(data) ? data : []));
    load('/reviews', (data) => setReviews(Array.isArray(data) ? data : []));
    load('/blogs', (data) => setBlogs(Array.isArray(data) ? data : []));

    return () => controller.abort();
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
  }, [settings.theme]);

  const value = useMemo(
    () => ({ settings, products, productsReady, productsFailed, bestsellers, reviews, blogs }),
    [settings, products, productsReady, productsFailed, bestsellers, reviews, blogs]
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export const useShop = () => useContext(ShopContext);
