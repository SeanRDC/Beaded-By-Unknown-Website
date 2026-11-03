import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { CORNER, gutter } from '../../lib/strand.js';
import { fitText, threadCenter } from '../../lib/type.js';
import { gsap, useMotion } from '../../motion/gsap.js';
import { Picture } from '../media.jsx';

const LETTERS = [...'beeeaded'];
export const NAME_SEEN = 'beaded_name_seen';

export function Hero({ firstVisit }) {
  const root = useRef(null);
  const name = useRef(null);
  const word = useRef(null);
  const line = useRef(null);
  const [ready, setReady] = useState(false);

  const measure = useCallback(() => {
    const box = name.current;
    const padding = parseFloat(getComputedStyle(box).paddingLeft);
    fitText(word.current, box.clientWidth - padding * 2);
    const width = document.documentElement.clientWidth;
    line.current.style.top = `${threadCenter(word.current, box) - 1}px`;
    line.current.style.width = `${width - gutter(width) - CORNER}px`;
  }, []);

  /* The stylesheet already sizes the name, so nothing here has to measure before the first paint. */
  useEffect(() => {
    let live = true;
    const settle = () => {
      if (!live) return;
      measure();
      setReady(true);
    };
    if (document.fonts?.ready) document.fonts.ready.then(settle);
    else settle();
    window.addEventListener('resize', measure);
    return () => {
      live = false;
      window.removeEventListener('resize', measure);
    };
  }, [measure]);

  /* The name is strung, first letter first, each travelling in along the thread. */
  useMotion(() => {
    if (!ready) return;
    const scope = root.current;

    if (firstVisit) {
      const width = document.documentElement.clientWidth;
      const letters = gsap.utils.toArray('.word__letter', scope);
      gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => sessionStorage.setItem(NAME_SEEN, '1') })
        .from(line.current, { scaleX: 0, duration: 1.05, ease: 'power3.inOut' })
        .from(letters, { x: (i, el) => width - el.getBoundingClientRect().left + 30, duration: 1.1, stagger: 0.085 }, 0.42)
        .from(gsap.utils.toArray('.hero__by, .hero__lead, .hero__note, .hero__acts', scope), { y: 22, opacity: 0, duration: 0.8, stagger: 0.08 }, 0.95)
        .from('#hero-pic img', { scale: 1.1, duration: 2.2, ease: 'power2.out' }, 0);
    }

    gsap.to('#hero-pic img', {
      yPercent: -12,
      ease: 'none',
      scrollTrigger: { trigger: '#hero-pic', start: 'top top', end: 'bottom top', scrub: true }
    });
  }, { scope: root, dependencies: [ready] });

  return (
    <section className="hero" ref={root}>
      <h1 className={`name ${ready ? 'is-ready' : ''}`} ref={name}>
        <span className="sr-only">Beaded by Unknown</span>
        <i className="name__line" ref={line} id="hero-line" aria-hidden="true" />
        <span className="word" ref={word} aria-hidden="true">
          {LETTERS.map((letter, index) => <span className="word__letter" key={index}>{letter}</span>)}
        </span>
      </h1>

      <div className="hero__row">
        <div className="hero__text">
          <div>
            <p className="t-head hero__by" aria-hidden="true">by Unknown</p>
            <p className="t-lead hero__lead">Beaded pieces made by hand, one bead at a time.</p>
            <p className="soft hero__note">Made to order in 7 to 14 days. Free shipping over ₱500.</p>
          </div>
          <div className="hero__acts">
            <Link className="btn" to="/shop">Shop the pieces</Link>
            <Link className="link" to="/custom">String your own</Link>
          </div>
        </div>
        <figure className="pic hero__pic" id="hero-pic">
          <Picture name="hero-flatlay" alt="Five pieces laid out on stone tiles over linen: two charm pins, a star necklace, a pearl and shell strap and a pair of charm hair clips" sizes="(max-width: 860px) 100vw, 66vw" eager />
        </figure>
      </div>
    </section>
  );
}
