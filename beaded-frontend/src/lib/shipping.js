/* Used until settings arrive. The server's settings are the source of truth. */
export const DEFAULT_SHIPPING = {
  shippingRates: { 'Metro Manila': 85, Luzon: 100, Visayas: 120, Mindanao: 130 },
  freeShippingOver: 500
};

export function shippingFor(subtotal, region, settings = DEFAULT_SHIPPING) {
  if (subtotal >= settings.freeShippingOver) return 0;
  return settings.shippingRates[region] ?? 0;
}
