import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { cld } from '../lib/cloudinary.js';
import { peso } from '../lib/money.js';
import { slugify } from '../lib/slug.js';
import { useShop } from '../store/shop.jsx';
import { useUi } from '../store/ui.jsx';
import { Sheet } from './Sheet.jsx';

function matches(product, query) {
  return [product.name, product.cat, product.mat].some((value) => value?.toLowerCase().includes(query));
}

export function SearchOverlay() {
  const { panel, closePanel } = useUi();
  const { products } = useShop();
  const [text, setText] = useState('');
  const query = text.trim().toLowerCase();
  const hits = useMemo(() => (query ? products.filter((product) => matches(product, query)) : []), [products, query]);

  const close = () => {
    setText('');
    closePanel();
  };

  return (
    <Sheet open={panel === 'search'} onClose={close} side="top" label="Search">
      <div className="finder">
        <input
          className="finder__input"
          type="search"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Search pieces or beads"
          aria-label="Search pieces or beads"
          data-autofocus
        />
        {query && hits.length === 0 && <p className="soft">Nothing matches "{text}". Try "necklace" or "seed beads".</p>}
        {hits.length > 0 && (
          <ul className="finder__hits">
            {hits.map((product) => (
              <li key={product._id}>
                <Link to={`/shop/${slugify(product.name)}`} onClick={close}>
                  <span className="pic finder__thumb"><img src={cld(product.img, 120)} alt="" loading="lazy" /></span>
                  <span>{product.name}</span>
                  <span className="nums">{peso(product.price)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Sheet>
  );
}
