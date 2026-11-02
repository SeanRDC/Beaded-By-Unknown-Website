import { useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

import { gsap, useMotion } from '../motion/gsap.js';
import { useShop } from '../store/shop.jsx';
import { threadCenter } from '../lib/type.js';

const WORD = 'beeeeeeeeeaded';

export function Footer() {
  const { settings } = useShop();
  const root = useRef(null);
  const word = useRef(null);
  const line = useRef(null);

  const placeLine = useCallback(() => {
    line.current.style.top = `${threadCenter(word.current, word.current.parentElement) - 1}px`;
  }, []);

  useEffect(() => {
    placeLine();
    document.fonts?.ready.then(placeLine);
    window.addEventListener('resize', placeLine);
    return () => window.removeEventListener('resize', placeLine);
  }, [placeLine]);

  /* The name keeps gaining beads as the page runs out. */
  useMotion(() => {
    gsap.fromTo(word.current, { x: 0 }, {
      x: () => -Math.max(0, word.current.scrollWidth - window.innerWidth + 30),
      ease: 'none',
      scrollTrigger: { trigger: root.current, start: 'top 80%', end: 'bottom bottom', scrub: 0.5, invalidateOnRefresh: true }
    });
    gsap.from(line.current, {
      scaleX: 0,
      ease: 'none',
      scrollTrigger: { trigger: root.current, start: 'top 90%', end: 'top 30%', scrub: 0.5 }
    });
  }, { scope: root });

  return (
    <footer className="foot" ref={root} id="site-foot">
      <div className="close" id="site-close" aria-hidden="true">
        <i className="close__line" ref={line} id="close-line" />
        <div className="close__word" ref={word}>
          {[...WORD].map((letter, index) => <span key={index}>{letter}</span>)}
        </div>
      </div>
      <div className="foot__grid">
        <ul>
          <li><Link to="/shop">Shop</Link></li>
          <li><Link to="/custom">String your own</Link></li>
          <li><Link to="/story">Our story</Link></li>
          <li><Link to="/journal">Journal</Link></li>
        </ul>
        <ul>
          <li><Link to="/faq">Questions</Link></li>
          <li><Link to="/size-guide">Size guide</Link></li>
          <li><Link to="/shipping">Shipping and returns</Link></li>
          <li><Link to="/terms">Terms and privacy</Link></li>
        </ul>
        <ul>
          <li><a href="https://www.instagram.com/beeeaded_/" target="_blank" rel="noreferrer">Instagram</a></li>
          <li><a href="https://www.tiktok.com/@beeeaded_" target="_blank" rel="noreferrer">TikTok</a></li>
        </ul>
        <p>
          © 2026 Beaded by Unknown
          <br />
          <a className="link" href="https://www.linkedin.com/in/sean-rhani-dela-cruz-834573334/" target="_blank" rel="noreferrer">Developed by Sean Rhani Dela Cruz</a>
          {settings.showcase && (
            <>
              <br />
              Portfolio project. Orders are not fulfilled.
            </>
          )}
        </p>
      </div>
    </footer>
  );
}
