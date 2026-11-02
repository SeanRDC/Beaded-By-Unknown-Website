export function peso(amount) {
  const value = Number(amount) || 0;
  const digits = Number.isInteger(value) ? 0 : 2;
  return `₱${value.toLocaleString('en-PH', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
}
