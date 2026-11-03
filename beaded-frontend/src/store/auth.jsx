import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { api } from '../api/client.js';
import { useCart } from './cart.jsx';
import { useUi } from './ui.jsx';

const AuthContext = createContext(null);

const TOKEN_KEY = 'beaded_token';
const SYNC_DELAY_MS = 600;

const token = () => localStorage.getItem(TOKEN_KEY);

/* Firebase is large, so it loads only when someone actually signs in with Google. */
async function googleIdToken() {
  const [{ signInWithPopup }, { auth, googleProvider }] = await Promise.all([import('firebase/auth'), import('../firebase.js')]);
  googleProvider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, googleProvider);
  return result.user.getIdToken();
}

export function AuthProvider({ children }) {
  const { flash, closePanel } = useUi();
  const { lines, wish, hydrate, clear, clearWish } = useCart();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const synced = useRef(false);

  const enter = useCallback((session) => {
    localStorage.setItem(TOKEN_KEY, session.token);
    setUser(session.user);
    hydrate(session);
    closePanel();
    flash(`Welcome, ${session.user.firstName}`, 'success');
  }, [hydrate, closePanel, flash]);

  const forget = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setOrders([]);
    clear();
    clearWish();
  }, [clear, clearWish]);

  useEffect(() => {
    if (!token()) return;
    api('/user/me', { token: token(), retries: 3 })
      .then((data) => {
        setUser(data.user);
        hydrate(data);
      })
      .catch((err) => {
        if (err.status === 401) localStorage.removeItem(TOKEN_KEY);
      });
  }, [hydrate]);

  useEffect(() => {
    if (!user) {
      synced.current = false;
      return undefined;
    }
    /* The first run after sign-in only marks the bag as loaded. */
    if (!synced.current) {
      synced.current = true;
      return undefined;
    }
    const timer = setTimeout(() => {
      api('/user/sync', { method: 'POST', token: token(), body: { cart: lines, wishlist: wish } }).catch(() => {});
    }, SYNC_DELAY_MS);
    return () => clearTimeout(timer);
  }, [user, lines, wish]);

  const loadOrders = useCallback(async () => {
    const data = await api('/user/orders', { token: token() });
    setOrders(Array.isArray(data) ? data : []);
  }, []);

  const signIn = useCallback((email, password) => api('/login', { method: 'POST', body: { email, password } }), []);
  const register = useCallback((details) => api('/register', { method: 'POST', body: details }), []);
  const resendCode = useCallback((email) => api('/resend-otp', { method: 'POST', body: { email } }), []);
  const forgotPassword = useCallback((email) => api('/forgot-password', { method: 'POST', body: { email } }), []);
  const checkResetCode = useCallback((email, otp) => api('/verify-otp', { method: 'POST', body: { email, otp } }), []);
  const resetPassword = useCallback((email, otp, newPassword) => api('/reset-password', { method: 'POST', body: { email, otp, newPassword } }), []);

  const verifyCode = useCallback(async (email, otp) => {
    enter(await api('/verify-login-otp', { method: 'POST', body: { email, otp } }));
  }, [enter]);

  const signInWithGoogle = useCallback(async () => {
    const idToken = await googleIdToken();
    enter(await api('/google-login', { method: 'POST', body: { idToken } }));
  }, [enter]);

  const updateProfile = useCallback(async (profile) => {
    const data = await api('/user/profile', { method: 'PUT', token: token(), body: profile });
    setUser(data.user);
  }, []);

  const requestDelete = useCallback(() => api('/user/request-delete', { method: 'POST', token: token() }), []);

  const confirmDelete = useCallback(async (otp) => {
    await api('/user/delete', { method: 'DELETE', token: token(), body: { otp } });
    forget();
  }, [forget]);

  const value = useMemo(() => ({
    user,
    orders,
    loadOrders,
    signIn,
    register,
    resendCode,
    verifyCode,
    signInWithGoogle,
    forgotPassword,
    checkResetCode,
    resetPassword,
    updateProfile,
    requestDelete,
    confirmDelete,
    signOut: forget
  }), [user, orders, loadOrders, signIn, register, resendCode, verifyCode, signInWithGoogle, forgotPassword, checkResetCode, resetPassword, updateProfile, requestDelete, confirmDelete, forget]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
