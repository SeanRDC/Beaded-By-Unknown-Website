import { Link } from 'react-router-dom';

import { useSeo } from '../components/Chrome.jsx';
import { ProductCard } from '../components/ProductCard.jsx';
import { useCart } from '../store/cart.jsx';
import { useShop } from '../store/shop.jsx';

export default function Wishlist() {
  useSeo('Saved pieces');
  const { wish, clearWish } = useCart();
  const { products } = useShop();
  const saved = products.filter((product) => wish.includes(product._id));

  return (
    <div className="page">
      <header className="page-head">
        <h1 className="t-head">Saved</h1>
        {saved.length > 0 && <button type="button" className="link" onClick={clearWish}>Clear all</button>}
      </header>

      {saved.length === 0 ? (
        <div className="empty">
          <p className="t-lead">Nothing saved yet.</p>
          <Link className="link" to="/shop">See the pieces</Link>
        </div>
      ) : (
        <div className="even-grid">
          {saved.map((product) => <ProductCard key={product._id} product={product} sizes="(max-width: 860px) 100vw, 33vw" />)}
        </div>
      )}
    </div>
  );
}
