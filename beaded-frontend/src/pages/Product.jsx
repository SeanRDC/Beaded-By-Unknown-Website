import { useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { useSeo } from '../components/Chrome.jsx';
import { ProductImage } from '../components/media.jsx';
import { productSizes } from '../components/ProductCard.jsx';
import { SizeTable } from '../components/SizeTable.jsx';
import { peso } from '../lib/money.js';
import { findBySlug } from '../lib/slug.js';
import { flyToBag } from '../motion/flyToBag.js';
import { rise, useMotion, wipe } from '../motion/gsap.js';
import { useCart } from '../store/cart.jsx';
import { useShop } from '../store/shop.jsx';

function ProductPage({ slug }) {
  const { products, productsReady } = useShop();
  const { add, wish, toggleWish } = useCart();
  const product = findBySlug(products, slug);
  useSeo(product?.name || 'Piece', product?.desc || product?.mat);

  const root = useRef(null);
  const button = useRef(null);
  const [size, setSize] = useState(null);
  const [qty, setQty] = useState(1);

  useMotion(() => {
    if (!product) return;
    const first = root.current.querySelector('.pdp__pic');
    if (first) wipe(first, { from: 'inset(0 0 100% 0)', start: 'top 100%' });
    rise('.pdp__details > *', '.pdp__details', { y: 20, stagger: 0.05, start: 'top 96%' });
  }, { scope: root, dependencies: [product?._id] });

  if (!productsReady) {
    return <div className="page"><div className="pdp" aria-busy="true"><div className="ghost ghost--large" /></div></div>;
  }

  if (!product) {
    return (
      <div className="page empty">
        <h1 className="t-title">That piece is no longer here</h1>
        <Link className="link" to="/shop">See the other pieces</Link>
      </div>
    );
  }

  const sizes = productSizes(product);
  const chosen = size || sizes[Math.floor(sizes.length / 2)];
  const soldOut = product.isAvailable === false;
  const saved = wish.includes(product._id);

  const addToBag = async () => {
    await flyToBag(button.current);
    add(product, { size: chosen, qty });
  };

  return (
    <div className="page" ref={root}>
      <div className="pdp">
        <div className="pdp__pics">
          {[product.img, product.img2].filter(Boolean).map((src, index) => (
            <span className="pic pdp__pic" key={src}>
              <ProductImage src={src} alt={index === 0 ? product.name : `${product.name}, another view`} sizes="(max-width: 860px) 100vw, 55vw" eager={index === 0} />
            </span>
          ))}
        </div>

        <div className="pdp__details">
          <h1 className="t-title">{product.name}</h1>
          <p className="t-lead nums">{peso(product.price)}</p>
          {product.desc && <p>{product.desc}</p>}
          {soldOut && <p className="soft">Sold out for now.</p>}

          {!soldOut && (
            <>
              {sizes.length > 1 && (
                <div>
                  <p className="ctl__row"><span>Size</span></p>
                  <div className="sizes" role="group" aria-label="Size">
                    {sizes.map((option) => (
                      <button key={option} type="button" className="chip size-chip" aria-pressed={chosen === option} onClick={() => setSize(option)}>{option}</button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <p className="ctl__row"><span>Quantity</span></p>
                <div className="qty qty--large" role="group" aria-label="Quantity">
                  <button type="button" aria-label="One less" onClick={() => setQty((value) => Math.max(1, value - 1))}>−</button>
                  <span className="nums">{qty}</span>
                  <button type="button" aria-label="One more" onClick={() => setQty((value) => value + 1)}>+</button>
                </div>
              </div>
              <button type="button" className="btn btn--wide pdp__add" ref={button} onClick={addToBag}>Add to bag, {peso(product.price * qty)}</button>
            </>
          )}

          <div className="pdp__row">
            <button type="button" className="link" aria-pressed={saved} onClick={() => toggleWish(product._id)}>{saved ? 'Saved' : 'Save for later'}</button>
            <Link className="link" to="/custom">String your own instead</Link>
          </div>

          <div className="details-list">
            {/* The size guide measures wrists, so only bracelets carry it. */}
            {product.cat === 'Bracelet' && (
              <details>
                <summary>Size guide</summary>
                <SizeTable />
              </details>
            )}
            <details>
              <summary>Materials and care</summary>
              <p>{product.mat ? `${product.mat}. ` : ''}Take it off before swimming, and store it in its pouch.</p>
            </details>
            <details>
              <summary>Making and shipping</summary>
              <p>Made to order in 7 to 14 days, then shipped by J&amp;T Express. <Link className="link" to="/shipping">Rates by region</Link></p>
            </details>
          </div>
        </div>
      </div>

      {!soldOut && (
        <div className="pdp__bar">
          <span className="nums">{peso(product.price * qty)}</span>
          <button type="button" className="btn" onClick={() => add(product, { size: chosen, qty })}>Add to bag</button>
        </div>
      )}
    </div>
  );
}

export default function Product() {
  const { slug } = useParams();
  return <ProductPage key={slug} slug={slug} />;
}
