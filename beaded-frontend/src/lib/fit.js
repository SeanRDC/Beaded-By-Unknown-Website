import { BASE_SETTING, EXTENDER_PRICE, STRINGS } from '../data/beads.js';

const DEFAULT_STRING = STRINGS[0];

/* The builder's sum: floor(wrist in mm / bead size), never fewer than five beads. */
export function fit(cm, collection, string = DEFAULT_STRING) {
  const count = Math.max(5, Math.floor((cm * 10) / collection.size));
  const beads = count * collection.price;
  return { count, beads, total: BASE_SETTING + beads + string.price };
}

export function designTotal({ collection, beads, string, extender = false, charms = [] }) {
  const charmCost = charms.reduce((sum, charm) => sum + charm.price, 0);
  const extenderCost = extender && string?.id === 's2' ? EXTENDER_PRICE : 0;
  return BASE_SETTING + beads.length * collection.price + (string?.price || 0) + charmCost + extenderCost;
}
