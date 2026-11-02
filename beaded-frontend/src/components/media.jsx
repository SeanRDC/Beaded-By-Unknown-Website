import images from '../data/images.json';
import { cld, cldSrcSet } from '../lib/cloudinary.js';

const fallbackWidth = (widths) => (widths.includes(1024) ? 1024 : widths[widths.length - 1]);

/* One of the site's own pictures, in AVIF and WebP at the sizes the image script produced. */
export function Picture({ name, alt, sizes = '100vw', eager = false, style }) {
  const { width, height, widths } = images[name];
  const set = (ext) => widths.map((w) => `/img/${name}-${w}.${ext} ${w}w`).join(', ');
  return (
    <picture>
      <source type="image/avif" srcSet={set('avif')} sizes={sizes} />
      <source type="image/webp" srcSet={set('webp')} sizes={sizes} />
      <img
        src={`/img/${name}-${fallbackWidth(widths)}.webp`}
        alt={alt}
        width={width}
        height={height}
        loading={eager ? 'eager' : 'lazy'}
        fetchPriority={eager ? 'high' : undefined}
        decoding="async"
        style={style}
      />
    </picture>
  );
}

const PRODUCT_WIDTHS = [320, 640, 960, 1280];

/* A product photo from Cloudinary, in a modern format at the width each screen needs. */
export function ProductImage({ src, alt, sizes = '(max-width: 860px) 100vw, 50vw', eager = false, style, className }) {
  if (!src) return null;
  return (
    <img
      src={cld(src, 960)}
      srcSet={cldSrcSet(src, PRODUCT_WIDTHS)}
      sizes={sizes}
      fetchPriority={eager ? 'high' : undefined}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      style={style}
      className={className}
    />
  );
}
