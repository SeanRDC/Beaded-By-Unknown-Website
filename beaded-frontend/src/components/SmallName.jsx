import { useRef } from 'react';

import { gsap, reduced, useGSAP } from '../motion/gsap.js';
import { useCart } from '../store/cart.jsx';

const BASE_E = 3;
const MAX_EXTRA = 5;

/* The short name. Every piece in the bag strings one more e on to it, up to five. */
export function SmallName() {
  const { count } = useCart();
  const extra = Math.min(count, MAX_EXTRA);
  const letters = [...`b${'e'.repeat(BASE_E + extra)}aded`];
  const root = useRef(null);
  const previous = useRef(extra);

  useGSAP(() => {
    if (extra > previous.current && !reduced()) {
      gsap.from(root.current.children[BASE_E + extra], { x: 36, opacity: 0, duration: 0.45, ease: 'power3.out' });
    }
    previous.current = extra;
  }, { dependencies: [extra], scope: root });

  return (
    <span className="mini" ref={root} aria-hidden="true">
      {letters.map((letter, index) => <span key={index}>{letter}</span>)}
    </span>
  );
}
