import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { faqItems } from '../../data/faq.js';
import { peso } from '../../lib/money.js';
import { slugify } from '../../lib/slug.js';
import { gsap, reduced, rise, useMotion, wipe } from '../../motion/gsap.js';
import { useShop } from '../../store/shop.jsx';
import { BeadPicture } from '../BeadRing.jsx';
import { ProductImage, Picture } from '../media.jsx';
import { ProductCard } from '../ProductCard.jsx';

const PIECES = 3;

/* Bestsellers first, then the newest, with anything sold out last. */
function pickPieces(bestsellers, products) {
  const seen = new Set();
  const available = (item) => item.isAvailable !== false;
  const ordered = [...bestsellers, ...[...products].reverse().filter(available), ...products.filter((item) => !available(item))];
  return ordered.filter((item) => {
    if (seen.has(item._id)) return false;
    seen.add(item._id);
    return true;
  }).slice(0, PIECES);
}

export function Pieces() {
  const { products, productsReady, productsFailed, bestsellers } = useShop();
  const root = useRef(null);
  const pieces = useMemo(() => pickPieces(bestsellers, products), [bestsellers, products]);
  const loaded = pieces.length > 0;

  useMotion(() => {
    if (!loaded) return;
    rise('#pieces-title', '#pieces-title', { y: 34 });
    const main = root.current.querySelector('.card--large .card__pic');
    if (main) wipe(main, { start: 'top 82%' });
    gsap.utils.toArray('.pieces__stack .card', root.current).forEach((card) => {
      gsap.from(card, { y: 34, opacity: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: card, start: 'top 90%', once: true } });
    });
  }, { scope: root, dependencies: [loaded] });

  if (productsReady && !productsFailed && !loaded) return null;

  return (
    <section className="pieces" id="pieces" ref={root}>
      <h2 className="t-head" id="pieces-title">The pieces</h2>
      {productsFailed && <p className="soft pieces__state">The pieces could not load. Please refresh the page.</p>}
      {!productsReady && (
        <div className="pieces__grid" aria-busy="true">
          <div className="ghost ghost--large" />
          <div className="pieces__stack"><div className="ghost" /><div className="ghost" /></div>
        </div>
      )}
      {loaded && (
        <div className="pieces__grid">
          <ProductCard product={pieces[0]} large sizes="(max-width: 860px) 100vw, 58vw" />
          <div className="pieces__stack">
            {pieces.slice(1).map((product) => <ProductCard key={product._id} product={product} sizes="(max-width: 860px) 100vw, 40vw" />)}
          </div>
        </div>
      )}
    </section>
  );
}

const SIZES = [
  { mm: 3, from: 0.5, colour: 'Sky Blue', type: 'Glass Seed' },
  { mm: 4, from: 1, colour: 'Pink', type: 'Imitation Jade' },
  { mm: 6, from: 1, colour: 'Moss Green', type: 'Acrylic' },
  { mm: 8, from: 1, colour: 'Yellow', type: 'Acrylic' },
  { mm: 10, from: 3, colour: 'Dark Blue', type: 'Cat Eye' },
  { mm: 12, from: 4, colour: 'Dirty White', type: 'Imitation Pearl' }
];
const TOTAL_MM = SIZES.reduce((sum, size) => sum + size.mm, 0);

/* Beads at true relative scale on one straight thread. */
export function SizesLine() {
  const root = useRef(null);
  const track = useRef(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const measure = () => setWidth(track.current.clientWidth);
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const narrow = width < 560;
  const unit = Math.min(14, (width * (narrow ? 0.5 : 0.66)) / TOTAL_MM);
  const gap = (width - TOTAL_MM * unit) / SIZES.length;
  let walked = gap / 2;
  const placed = SIZES.map((size) => {
    const px = size.mm * unit;
    const left = walked + px / 2;
    walked += px + gap;
    return { ...size, px, left };
  });

  useMotion(() => {
    if (!width) return;
    gsap.from(gsap.utils.toArray('.size', root.current), {
      x: (i) => -width * (0.1 + i * 0.05),
      opacity: 0,
      ease: 'power2.out',
      stagger: 0.06,
      scrollTrigger: { trigger: track.current, start: 'top 92%', end: 'top 58%', scrub: 0.6 }
    });
  }, { scope: root, dependencies: [width > 0] });

  return (
    <section className="line-of-sizes" ref={root}>
      <h2 className="t-head">Six sizes, sold by the bead</h2>
      <div className="sizes-track" ref={track}>
        {width > 0 && placed.map((size) => (
          <div className="size" key={size.mm} style={{ left: size.left }}>
            <BeadPicture name={size.colour} type={size.type} px={Math.round(size.px)} size={size.px} />
            <div className="size__cap" style={{ top: size.px / 2 + 14 }}>
              {size.mm} mm
              <span className="soft">{narrow ? '' : 'from '}{peso(size.from)}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Letter() {
  const root = useRef(null);

  useMotion(() => {
    gsap.from(root.current, { scale: 0.95, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top 96%', end: 'top 45%', scrub: 0.5 } });
    rise('.letter__text > *', '.letter__text', { stagger: 0.09, start: 'top 76%' });
  }, { scope: root });

  return (
    <section className="letter" ref={root}>
      <figure className="pic pic--fill letter__pic">
        <Picture name="heroimage" alt="A grey and black beaded necklace on a jute stand" sizes="(max-width: 860px) 100vw, 50vw" style={{ objectPosition: '50% 78%' }} />
      </figure>
      <div className="letter__text">
        <h2 className="t-title">It began as a late-night hobby</h2>
        <p>Beaded by Unknown started with my love for colour and form, and a belief that jewellery can be a wearable piece of a dream, something that keeps you grounded through the day.</p>
        <p>What started with a single strand grew into a practice of stringing every bead by hand. I make small companions for your daily journey.</p>
        <p className="t-lead letter__sign">Unknown</p>
        <Link className="link" to="/story">Read my story</Link>
      </div>
    </section>
  );
}

export function SlowWords() {
  const { settings } = useShop();
  const root = useRef(null);
  const words = [settings.featureTwo, settings.featureThree, settings.topBannerText, settings.featureOne].filter(Boolean);

  useMotion(() => {
    gsap.fromTo('.words__line', { x: '4%' }, {
      x: '-36%',
      ease: 'none',
      scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: 0.4 }
    });
  }, { scope: root });

  return (
    <section className="words" ref={root} aria-label={words.join('. ')}>
      <p className="words__line" aria-hidden="true">{[...words, ...words].map((word, index) => <span key={index}>{word}</span>)}</p>
    </section>
  );
}

const QUOTE_MS = 7000;

export function Quotes() {
  const { reviews } = useShop();
  const root = useRef(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const usable = useMemo(() => reviews.filter((review) => review.text.trim().length >= 12), [reviews]);
  const quote = usable[index % Math.max(1, usable.length)];

  useEffect(() => {
    if (usable.length < 2 || paused || reduced()) return undefined;
    const timer = setInterval(() => setIndex((value) => value + 1), QUOTE_MS);
    return () => clearInterval(timer);
  }, [usable.length, paused]);

  useMotion(() => {
    if (!quote) return;
    gsap.from('.quote > *', { y: 18, opacity: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out' });
  }, { scope: root, dependencies: [index, Boolean(quote)] });

  if (!quote) return null;

  return (
    <section className="quotes" ref={root} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)}>
      <figure className="quote">
        <blockquote className="t-title">{quote.text}</blockquote>
        <figcaption className="soft">{quote.author}</figcaption>
      </figure>
      {usable.length > 1 && <button type="button" className="link" onClick={() => setIndex((value) => value + 1)}>Next</button>}
    </section>
  );
}

export function BeforeYouOrder() {
  const { settings } = useShop();
  const root = useRef(null);
  const items = useMemo(() => faqItems(settings).slice(0, 3), [settings]);

  useMotion(() => {
    gsap.from('details', { x: 26, opacity: 0, duration: 0.7, stagger: 0.07, ease: 'power3.out', scrollTrigger: { trigger: '.qa__list', start: 'top 80%', once: true } });
  }, { scope: root });

  return (
    <section className="qa" ref={root}>
      <div className="qa__head">
        <h2 className="t-head">Before you order</h2>
        <p><Link className="link" to="/faq">All questions</Link></p>
      </div>
      <div className="qa__list">
        {items.map((item, index) => (
          <details key={item.question} open={index === 0}>
            <summary>{item.question}</summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function LatestPost() {
  const { blogs } = useShop();
  const root = useRef(null);
  const post = blogs[0];

  useMotion(() => {
    if (post) rise('.latest > *', '.latest');
  }, { scope: root, dependencies: [Boolean(post)] });

  if (!post) return null;

  return (
    <section className="latest-wrap" ref={root}>
      <Link className="latest" to={`/journal/${slugify(post.title)}`}>
        <span className="pic pic--fill latest__pic"><ProductImage src={post.img} alt="" sizes="(max-width: 860px) 100vw, 33vw" /></span>
        <span>
          <span className="soft">From the journal</span>
          <span className="t-title latest__title">{post.title}</span>
          <span>{post.ex}</span>
        </span>
      </Link>
    </section>
  );
}
