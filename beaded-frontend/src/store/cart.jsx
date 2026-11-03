import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { addLine, cartCount, cartSubtotal, removeLine, setLineQty } from '../lib/cart.js';
import { useUi } from './ui.jsx';

const CartContext = createContext(null);

const BAG_KEY = 'beaded_bag';
const WISH_KEY = 'beaded_wish';

function read(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

/* The bag and wishlist. A refresh on any page keeps them. */
export function CartProvider({ children }) {
  const { flash, openPanel } = useUi();
  const [lines, setLines] = useState(() => read(BAG_KEY));
  const [wish, setWish] = useState(() => read(WISH_KEY));

  useEffect(() => localStorage.setItem(BAG_KEY, JSON.stringify(lines)), [lines]);
  useEffect(() => localStorage.setItem(WISH_KEY, JSON.stringify(wish)), [wish]);

  const add = useCallback((product, { size, qty = 1, quiet = false } = {}) => {
    setLines((current) => addLine(current, product, { size, qty }));
    if (!quiet) openPanel('bag');
  }, [openPanel]);

  const remove = useCallback((key) => setLines((current) => removeLine(current, key)), []);
  const setQty = useCallback((key, qty) => setLines((current) => setLineQty(current, key, qty)), []);
  const clear = useCallback(() => setLines([]), []);

  const toggleWish = useCallback((id) => {
    setWish((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
    flash('Wishlist updated');
  }, [flash]);

  const clearWish = useCallback(() => setWish([]), []);

  /* An account's saved bag replaces the guest bag only when it has something in it. */
  const hydrate = useCallback(({ cart = [], wishlist = [] }) => {
    setLines((current) => (cart.length ? cart : current));
    setWish((current) => (wishlist.length ? wishlist : current));
  }, []);

  const value = useMemo(() => ({
    lines,
    wish,
    count: cartCount(lines),
    subtotal: cartSubtotal(lines),
    add,
    remove,
    setQty,
    clear,
    toggleWish,
    clearWish,
    hydrate
  }), [lines, wish, add, remove, setQty, clear, toggleWish, clearWish, hydrate]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
