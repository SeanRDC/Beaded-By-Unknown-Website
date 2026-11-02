import { useEffect, useRef } from 'react';

import { StrandEngine } from '../../lib/strand.js';
import { gsap, reduced, ScrollTrigger } from '../../motion/gsap.js';

const REBUILD_DELAY_MS = 120;
const FIRST_DRAW_DELAY_S = 0.9;

export function Strand({ ringRef, firstVisit }) {
  const svg = useRef(null);
  const path = useRef(null);
  const riders = useRef(null);

  useEffect(() => {
    const calm = reduced();
    const ring = ringRef.current;
    const box = riders.current;
    const engine = new StrandEngine({ svg: svg.current, path: path.current, riders: box, getRing: () => ring });
    engine.ringDone = calm;

    let timer;
    const rebuild = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (!engine.build()) return;
        ScrollTrigger.refresh();
        engine.place(calm ? engine.total : Math.min(engine.head || engine.minHead, engine.total));
      }, REBUILD_DELAY_MS);
    };

    if (engine.build()) engine.place(calm ? engine.total : 0);

    const head = { length: 0 };
    let follow = null;
    let trigger = null;
    let intro = null;

    if (!calm) {
      ring?.reveal(0);
      const startFollowing = () => {
        follow = gsap.quickTo(head, 'length', { duration: 0.7, ease: 'power3.out', onUpdate: () => engine.place(head.length) });
        trigger = ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (self) => follow(engine.lengthForScroll(self.scroll())) });
        follow(engine.lengthForScroll(window.scrollY));
      };
      intro = gsap.fromTo(head, { length: 0 }, {
        length: () => engine.minHead,
        delay: firstVisit ? FIRST_DRAW_DELAY_S : 0,
        duration: firstVisit ? 1.2 : 0.5,
        ease: 'power2.inOut',
        onUpdate: () => engine.place(head.length),
        onComplete: startFollowing
      });
    }

    const observer = new ResizeObserver(rebuild);
    observer.observe(document.querySelector('.site'));
    document.fonts?.ready.then(rebuild);
    if (ring) ring.onResized = rebuild;

    return () => {
      clearTimeout(timer);
      observer.disconnect();
      intro?.kill();
      trigger?.kill();
      gsap.killTweensOf(head);
      if (ring) ring.onResized = null;
      box.replaceChildren();
    };
  }, [ringRef, firstVisit]);

  return (
    <>
      <svg className="strand" ref={svg} aria-hidden="true"><path ref={path} d="" /></svg>
      <div className="riders" ref={riders} aria-hidden="true" />
    </>
  );
}
