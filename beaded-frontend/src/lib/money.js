/* Written by hand because building a number formatter costs real time during start-up. */
export function peso(amount) {
  const value = Number(amount) || 0;
  const text = value.toFixed(Number.isInteger(value) ? 0 : 2);
  return `₱${text.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}
