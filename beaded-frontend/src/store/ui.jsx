import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

const UiContext = createContext(null);

const TOAST_MS = 3200;

/* Which overlay is open, and the short messages shown at the bottom of the screen. */
export function UiProvider({ children }) {
  const [toast, setToast] = useState(null);
  const [panel, setPanel] = useState(null);
  const [quickView, setQuickView] = useState(null);
  const timer = useRef(null);

  const flash = useCallback((message, type = 'info') => {
    clearTimeout(timer.current);
    setToast({ message, type });
    timer.current = setTimeout(() => setToast(null), TOAST_MS);
  }, []);

  const closePanel = useCallback(() => setPanel(null), []);

  const value = useMemo(
    () => ({ toast, flash, panel, openPanel: setPanel, closePanel, quickView, setQuickView }),
    [toast, flash, panel, closePanel, quickView]
  );

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

export const useUi = () => useContext(UiContext);
