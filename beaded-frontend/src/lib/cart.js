const productId = (item) => item._id ?? item.id ?? item.name;

/* A bag line is one product in one size. */
export const lineKey = (item) => `${productId(item)}|${item.sz}`;

export function addLine(lines, product, { size = 'M', qty = 1 } = {}) {
  const key = lineKey({ ...product, sz: size });
  if (lines.some((line) => lineKey(line) === key)) {
    return lines.map((line) => (lineKey(line) === key ? { ...line, qty: line.qty + qty } : line));
  }
  return [...lines, { ...product, _id: productId(product), id: productId(product), qty, sz: size }];
}

export const removeLine = (lines, key) => lines.filter((line) => lineKey(line) !== key);

export const setLineQty = (lines, key, qty) => lines.map((line) => (lineKey(line) === key ? { ...line, qty: Math.max(1, qty) } : line));

export const cartCount = (lines) => lines.reduce((sum, line) => sum + line.qty, 0);

export const cartSubtotal = (lines) => lines.reduce((sum, line) => sum + line.price * line.qty, 0);
