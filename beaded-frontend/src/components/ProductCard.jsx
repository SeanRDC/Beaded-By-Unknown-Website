import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { peso } from '../lib/money.js';
import { slugify } from '../lib/slug.js';
import { flyToBag } from '../motion/flyToBag.js';
import { useCart } from '../store/cart.jsx';
import { useUi } from '../store/ui.jsx';
import { ProductImage } from './media.jsx';
import { Sheet } from './Sheet.jsx';

export const productPath = (product) => `/shop/${slugify(product.name)}`;

export function productSizes(product) {
  return Array.isArray(product.sizes) && product.sizes.length > 0 ? product.sizes : ['S', 'M', 'L'];
}

const middleSize = (product) => {
  const sizes = productSizes(product);
  return sizes[Math.floor(sizes.length / 2)];
};

export function ProductCard({ product, sizes, large = false }) {
  const { add, wish, toggleWish } = useCart();
  const { setQuickView } = useUi();
  const button = useRef(null);
  const soldOut = product.isAvailable === false;
  const saved = wish.includes(product._id);

  const addToBag = async () => {
    await flyToBag(button.current);
    add(product, { size: middleSize(product) });
  };

  return (
    <article className={`card ${large ? 'card--large' : ''} ${soldOut ? 'is-out' : ''}`}>
      <div className="card__frame">
        <Link className="pic card__pic" to={productPath(product)} aria-label={product.name}>
          <ProductImage src={product.img} alt={product.name} sizes={sizes} />
          {product.img2 && <ProductImage src={product.img2} alt="" sizes={sizes} />}
        </Link>
        <button type="button" className="card__save" aria-pressed={saved} aria-label={saved ? `Remove ${product.name} from saved` : `Save ${product.name}`} onClick={() => toggleWish(product._id)}>
          {saved ? 'Saved' : 'Save'}
        </button>
      </div>
      <div className="card__row">
        <h3 className="t-lead"><Link to={productPath(product)}>{product.name}</Link></h3>
        <span className="nums">{peso(product.price)}</span>
      </div>
      <div className="card__row card__row--tight">
        <span className="soft">{soldOut ? 'Sold out' : product.mat || product.cat}</span>
        {soldOut ? <span className="soft">Back soon</span> : (
          <span className="card__acts">
            <button type="button" className="link card__quick" onClick={() => setQuickView(product)}>Quick view</button>
            <button type="button" className="link" ref={button} onClick={addToBag}>Add to bag</button>
          </span>
        )}
      </div>
    </article>
  );
}

export function QuickView() {
  const { quickView: product, setQuickView } = useUi();
  const { add } = useCart();
  const [size, setSize] = useState(null);
  const [qty, setQty] = useState(1);
  const close = () => {
    setQuickView(null);
    setSize(null);
    setQty(1);
  };

  return (
    <Sheet open={Boolean(product)} onClose={close} side="center" label={product?.name || 'Quick view'} className="sheet--wide">
      {product && (
        <div className="quick">
          <span className="pic pic--fill quick__pic"><ProductImage src={product.img} alt={product.name} sizes="(max-width: 700px) 100vw, 450px" eager /></span>
          <div className="quick__body">
            <h2 className="t-lead">{product.name}</h2>
            <p className="nums">{peso(product.price)}</p>
            {product.desc && <p className="soft">{product.desc}</p>}
            <div className="sizes" role="group" aria-label="Size">
              {productSizes(product).map((option) => (
                <button key={option} type="button" className="chip size-chip" aria-pressed={(size || middleSize(product)) === option} onClick={() => setSize(option)}>{option}</button>
              ))}
            </div>
            <div className="qty qty--large" role="group" aria-label="Quantity" style={{ alignSelf: 'flex-start' }}>
              <button type="button" aria-label="One less" onClick={() => setQty((value) => Math.max(1, value - 1))}>−</button>
              <span className="nums">{qty}</span>
              <button type="button" aria-label="One more" onClick={() => setQty((value) => value + 1)}>+</button>
            </div>
            <button type="button" className="btn btn--wide" style={{ marginTop: 'auto' }} onClick={() => { add(product, { size: size || middleSize(product), qty }); close(); }}>
              Add to bag, {peso(product.price * qty)}
            </button>
            <Link className="link" to={productPath(product)} onClick={close}>See full details</Link>
          </div>
        </div>
      )}
    </Sheet>
  );
}
