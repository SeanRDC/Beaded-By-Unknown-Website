import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { useSeo } from '../components/Chrome.jsx';
import { Picture } from '../components/media.jsx';
import { reduced, rise, useMotion } from '../motion/gsap.js';

const SLIDES = [
  { name: 'studio-1', alt: 'A necklace of blue and white beads on gold chain, on a linen stand' },
  { name: 'studio-2', alt: 'A necklace of iridescent shells and stars on a jute stand' },
  { name: 'studio-3', alt: 'Two bracelets of green and grey beads on a stone slab' },
  { name: 'studio-4', alt: 'A lilac cat eye bead bracelet on a stone slab' }
];
const SLIDE_MS = 7000;

export default function Story() {
  useSeo('Our story', 'Beaded by Unknown began as a late-night hobby. Every bead is still strung by hand.');
  const root = useRef(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (reduced()) return undefined;
    const timer = setInterval(() => setActive((value) => (value + 1) % SLIDES.length), SLIDE_MS);
    return () => clearInterval(timer);
  }, []);

  useMotion(() => {
    rise('.story__text > *', '.story__text', { start: 'top 96%' });
  }, { scope: root });

  return (
    <div className="page story" ref={root}>
      <div className="story__text">
        <h1 className="t-head">It began as a late-night hobby</h1>
        <p className="t-lead">Beaded by Unknown started as a simple spark of imagination, fuelled by a love for colour and form.</p>
        <p>I believed jewellery shouldn't just be an accessory, but a wearable piece of a dream that keeps you grounded through the day.</p>
        <p>What started with a single strand has grown into a practice of stringing every bead by hand. I use durable materials and a careful eye, and I make small companions for your daily journey.</p>
        <p className="t-lead story__sign">Unknown</p>
        <Link className="btn" to="/shop">See the pieces</Link>
      </div>
      <div className="pic story__slides">
        {SLIDES.map((slide, index) => (
          <figure key={slide.name} className={`story__slide ${index === active ? 'is-on' : ''}`} aria-hidden={index !== active}>
            <Picture name={slide.name} alt={slide.alt} sizes="(max-width: 860px) 100vw, 50vw" eager={index === 0} />
          </figure>
        ))}
      </div>
    </div>
  );
}
