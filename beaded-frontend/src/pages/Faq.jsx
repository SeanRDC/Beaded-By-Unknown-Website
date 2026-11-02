import { useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';

import { useSeo } from '../components/Chrome.jsx';
import { faqItems } from '../data/faq.js';
import { gsap, useMotion } from '../motion/gsap.js';
import { useShop } from '../store/shop.jsx';

export default function Faq() {
  useSeo('Questions', 'Making times, shipping, sizes, materials, returns and payment.');
  const { settings } = useShop();
  const items = useMemo(() => faqItems(settings), [settings]);
  const root = useRef(null);

  useMotion(() => {
    gsap.from('details', { x: 26, opacity: 0, duration: 0.7, stagger: 0.05, ease: 'power3.out' });
  }, { scope: root });

  return (
    <div className="page" ref={root}>
      <div className="qa qa--page">
        <div className="qa__head">
          <h1 className="t-head">Questions</h1>
          <p>Still unsure? Write to me at <a className="link" href="mailto:beadedbyunknown@gmail.com">beadedbyunknown@gmail.com</a>.</p>
          <p><Link className="link" to="/size-guide">Size guide</Link></p>
        </div>
        <div className="qa__list">
          {items.map((item, index) => (
            <details key={item.question} open={index === 0}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
