import { useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useSeo } from '../components/Chrome.jsx';
import { ProductCard } from '../components/ProductCard.jsx';
import { gsap, rise, useMotion } from '../motion/gsap.js';
import { useShop } from '../store/shop.jsx';

const SORTS = {
  Featured: (a, b) => (a.isAvailable === false) - (b.isAvailable === false),
  'Price: low to high': (a, b) => a.price - b.price,
  'Price: high to low': (a, b) => b.price - a.price
};

const GROUP = 3;

/* One large piece beside two smaller ones, swapping sides on each group. */
const placement = (index) => {
  const group = Math.floor(index / GROUP);
  return index % GROUP === 0 ? { gridColumn: group % 2 ? 2 : 1, gridRow: 'span 2' } : undefined;
};

export default function Shop() {
  useSeo('Shop', 'Bracelets and necklaces strung by hand and made to order.');
  const { products, productsReady, productsFailed, settings } = useShop();
  const [params, setParams] = useSearchParams();
  const [sort, setSort] = useState('Featured');
  const root = useRef(null);
  const category = params.get('category') || 'All';

  const shown = useMemo(() => {
    const list = category === 'All' ? products : products.filter((product) => product.cat === category);
    return [...list].sort(SORTS[sort]);
  }, [products, category, sort]);

  const choose = (next) => setParams(next === 'All' ? {} : { category: next });

  useMotion(() => {
    rise('.page-head > *', '.page-head', { start: 'top 96%' });
    gsap.utils.toArray('.card', root.current).forEach((card) => {
      gsap.from(card, { y: 30, opacity: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: card, start: 'top 92%', once: true } });
    });
  }, { scope: root, dependencies: [productsReady, category, sort] });

  return (
    <div className="page" ref={root}>
      <header className="page-head">
        <h1 className="t-head">The pieces</h1>
        <p className="soft">{productsReady ? `${shown.length} ${shown.length === 1 ? 'piece' : 'pieces'}` : 'Finding the pieces'}</p>
      </header>

      <div className="shop-bar">
        <div className="chips">
          {['All', ...settings.categories].map((name) => (
            <button key={name} type="button" className="chip" aria-pressed={category === name} onClick={() => choose(name)}>{name}</button>
          ))}
        </div>
        <label className="shop-sort">
          <span className="soft">Sort</span>
          <select className="input" value={sort} onChange={(event) => setSort(event.target.value)}>
            {Object.keys(SORTS).map((name) => <option key={name}>{name}</option>)}
          </select>
        </label>
      </div>

      {!productsReady && (
        <div className="shop-grid" aria-busy="true">
          <div className="ghost ghost--large" style={placement(0)} />
          <div className="ghost" />
          <div className="ghost" />
        </div>
      )}

      {productsReady && productsFailed && <p className="soft">The pieces could not load. Please refresh the page.</p>}

      {productsReady && !productsFailed && shown.length === 0 && (
        <div className="empty">
          <p className="t-lead">Nothing here yet.</p>
          <button type="button" className="link" onClick={() => choose('All')}>See all the pieces</button>
        </div>
      )}

      {shown.length > 0 && (
        <div className="shop-grid">
          {shown.map((product, index) => (
            <div key={product._id} style={placement(index)}>
              <ProductCard product={product} large={index % GROUP === 0} sizes={index % GROUP === 0 ? '(max-width: 860px) 100vw, 58vw' : '(max-width: 860px) 100vw, 40vw'} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
