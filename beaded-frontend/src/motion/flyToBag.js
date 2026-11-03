import { sprite } from '../lib/beads-canvas.js';
import { gsap, reduced } from './gsap.js';

const SIZE = 22;

function visibleBag() {
  return [...document.querySelectorAll('[data-bag-target]')].find((el) => {
    const box = el.getBoundingClientRect();
    return box.width > 0 && box.top >= 0 && box.bottom <= window.innerHeight && !el.closest('[inert]');
  });
}

/* A bead leaves the button and lands in the bag. Resolves when it arrives. */
export function flyToBag(from) {
  const target = visibleBag();
  if (!from || !target || reduced()) return Promise.resolve();

  return new Promise((resolve) => {
    const start = from.getBoundingClientRect();
    const end = target.getBoundingClientRect();
    const painted = sprite('Yellow', 'Acrylic', SIZE);

    const bead = document.createElement('canvas');
    bead.width = painted.width;
    bead.height = painted.height;
    bead.getContext('2d').drawImage(painted, 0, 0);
    Object.assign(bead.style, { position: 'fixed', zIndex: 80, left: '0', top: '0', width: `${SIZE}px`, height: `${SIZE}px`, pointerEvents: 'none' });
    document.body.append(bead);

    const x0 = start.left + start.width / 2 - SIZE / 2;
    const y0 = start.top + start.height / 2 - SIZE / 2;
    const x1 = end.left + end.width / 2 - SIZE / 2;
    const y1 = end.top + end.height / 2 - SIZE / 2;

    gsap.timeline({ onComplete: () => { bead.remove(); resolve(); } })
      .set(bead, { x: x0, y: y0, scale: 0.4 })
      .to(bead, { x: x1, duration: 0.6, ease: 'power1.inOut' }, 0)
      .to(bead, { y: y1, duration: 0.6, ease: 'power3.in' }, 0)
      .to(bead, { scale: 1, duration: 0.2, ease: 'power2.out' }, 0)
      .to(bead, { scale: 0.5, duration: 0.14, ease: 'power2.in' }, 0.46);
  });
}
