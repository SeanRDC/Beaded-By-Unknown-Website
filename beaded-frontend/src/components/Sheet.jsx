import { useEffect, useRef } from 'react';

import { gsap, reduced } from '../motion/gsap.js';

const ENTRY = {
  right: { from: { xPercent: 100 }, to: { xPercent: 0 } },
  left: { from: { xPercent: -100 }, to: { xPercent: 0 } },
  top: { from: { yPercent: -100 }, to: { yPercent: 0 } },
  center: { from: { y: 22, opacity: 0, scale: 0.98 }, to: { y: 0, opacity: 1, scale: 1 } }
};

/* Every overlay is a real modal dialog, so focus, Escape and the inert page behind come for free. */
export function Sheet({ open, onClose, side = 'center', label, className = '', closeButton = true, children }) {
  const dialog = useRef(null);

  useEffect(() => {
    const el = dialog.current;
    const { from, to } = ENTRY[side];

    if (open && !el.open) {
      el.showModal();
      (el.querySelector('[data-autofocus]') || el).focus();
      if (!reduced()) gsap.fromTo(el, from, { ...to, duration: side === 'center' ? 0.36 : 0.48, ease: 'power3.out', clearProps: 'transform,opacity' });
    } else if (!open && el.open) {
      if (reduced()) {
        el.close();
      } else {
        gsap.to(el, { ...from, duration: 0.28, ease: 'power2.in', onComplete: () => { el.close(); gsap.set(el, { clearProps: 'all' }); } });
      }
    }
  }, [open, side]);

  return (
    <dialog
      ref={dialog}
      tabIndex={-1}
      className={`sheet sheet--${side} ${className}`}
      aria-label={label}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onMouseDown={(event) => {
        if (event.target === dialog.current) onClose();
      }}
    >
      {open && (
        <>
          {closeButton && <button type="button" className="sheet__close" onClick={onClose}>Close</button>}
          {children}
        </>
      )}
    </dialog>
  );
}
