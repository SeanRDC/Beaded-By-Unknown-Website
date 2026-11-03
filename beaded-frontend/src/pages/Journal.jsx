import { useRef } from 'react';
import { Link } from 'react-router-dom';

import { useSeo } from '../components/Chrome.jsx';
import { ProductImage } from '../components/media.jsx';
import { slugify } from '../lib/slug.js';
import { rise, useMotion } from '../motion/gsap.js';
import { useShop } from '../store/shop.jsx';

export default function Journal() {
  useSeo('Journal', 'Stories, styling and the thinking behind the beads.');
  const { blogs } = useShop();
  const root = useRef(null);

  useMotion(() => {
    rise('.page-head > *', '.page-head', { start: 'top 96%' });
    if (blogs.length) rise('.posts > li', '.posts', { start: 'top 90%' });
  }, { scope: root, dependencies: [blogs.length] });

  return (
    <div className="page" ref={root}>
      <header className="page-head">
        <h1 className="t-head">Journal</h1>
        <p className="soft">Stories, styling and the thinking behind the beads.</p>
      </header>

      {blogs.length === 0 ? <p className="soft">Nothing here yet.</p> : (
        <ul className="posts">
          {blogs.map((post) => (
            <li key={post._id}>
              <Link to={`/journal/${slugify(post.title)}`}>
                <span className="pic pic--fill posts__pic"><ProductImage src={post.img} alt="" sizes="(max-width: 860px) 100vw, 33vw" /></span>
                <span className="soft">{post.date}</span>
                <span className="t-lead">{post.title}</span>
                <span>{post.ex}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
