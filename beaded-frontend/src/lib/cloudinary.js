const UPLOAD = '/image/upload/';
const isCloudinary = (url) => typeof url === 'string' && url.includes('res.cloudinary.com') && url.includes(UPLOAD);

/* Asks Cloudinary for a modern format at the width actually needed. */
export function cld(url, width) {
  if (!url) return '';
  if (!isCloudinary(url)) return url;
  return url.replace(UPLOAD, `${UPLOAD}f_auto,q_auto,w_${width}/`);
}

export function cldSrcSet(url, widths) {
  if (!isCloudinary(url)) return undefined;
  return widths.map((width) => `${cld(url, width)} ${width}w`).join(', ');
}
