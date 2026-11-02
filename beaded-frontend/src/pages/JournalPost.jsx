import { useRef } from 'react';
import { Link, useParams } from 'react-router-dom';

import { useSeo } from '../components/Chrome.jsx';
import { ProductImage } from '../components/media.jsx';
import { findBySlug } from '../lib/slug.js';
import { rise, useMotion } from '../motion/gsap.js';
import { useShop } from '../store/shop.jsx';

export default function JournalPost() {
  const { slug } = useParams();
  const { blogs } = useShop();
  const post = findBySlug(blogs, slug, 'title');
  useSeo(post?.title || 'Journal', post?.ex);
  const root = useRef(null);

  useMotion(() => {
    if (post) rise('.article > *', '.article', { y: 20, stagger: 0.06, start: 'top 96%' });
  }, { scope: root, dependencies: [post?._id] });

  if (!post) {
    return (
      <div className="page empty">
        <h1 className="t-title">That story is no longer here</h1>
        <Link className="link" to="/journal">Back to the journal</Link>
      </div>
    );
  }

  return (
    <div className="page" ref={root}>
      <article className="article">
        <p className="soft">{post.date}</p>
        <h1 className="t-title">{post.title}</h1>
        {post.ex && <p className="t-lead">{post.ex}</p>}
        <span className="pic pic--fill article__pic"><ProductImage src={post.img} alt="" sizes="(max-width: 860px) 100vw, 760px" eager /></span>
        {(post.content || '').split('\n').filter((line) => line.trim()).map((line, index) => <p key={index}>{line}</p>)}
        <p><Link className="link" to="/journal">Back to the journal</Link></p>
      </article>
    </div>
  );
}
