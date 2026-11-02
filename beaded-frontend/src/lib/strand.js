import { sprite } from './beads-canvas.js';

/* The gold thread on the home page: it turns down the margin from the name, crosses to the
   other side, loops around the bracelet, and ends through the footer name. Positions are
   sampled once into a table, so scrolling only ever does lookups. */

export const CORNER = 46;
const SAMPLE_STEP = 12;
const FOOT_CORNER = 70;
const NARROW = 860;

const RIDER_NAMES = ['Yellow', 'Sky Blue', 'White', 'Dark Blue', 'Yellow', 'Sky Blue', 'White', 'Dark Blue', 'Pink', 'Moss Green', 'White', 'Sky Blue', 'Yellow', 'White', 'Dark Blue', 'Sky Blue', 'Pink'];

export function gutter(width) {
  if (width < NARROW) return 7;
  const margin = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--m')) || Math.min(26, Math.max(16, width * 0.017));
  return margin / 2 + 1;
}

const q = (selector) => document.querySelector(selector);
const pageTop = (el) => el.getBoundingClientRect().top + window.scrollY;
const pageBottom = (el) => el.getBoundingClientRect().bottom + window.scrollY;

export class StrandEngine {
  constructor({ svg, path, riders, getRing }) {
    this.svg = svg;
    this.path = path;
    this.ridersBox = riders;
    this.getRing = getRing;
    this.head = 0;
    this.total = 0;
    this.points = [];
    this.scrollMap = [];
    this.stops = [];
    this.beads = [];
    this.minHead = 0;
    this.ringFrom = 0;
    this.ringTo = 0;
    this.ringDone = false;
    this.makeRiders();
  }

  makeRiders() {
    const big = window.innerWidth < NARROW ? 13 : 18;
    RIDER_NAMES.forEach((name, i) => {
      const px = i === 0 ? big : big - (i % 3) * 2;
      const painted = sprite(name, 'Acrylic', px);
      const canvas = document.createElement('canvas');
      canvas.width = painted.width;
      canvas.height = painted.height;
      canvas.style.width = `${px}px`;
      canvas.style.height = `${px}px`;
      canvas.getContext('2d').drawImage(painted, 0, 0);
      this.ridersBox.append(canvas);
      this.beads.push({ el: canvas, px });
    });
  }

  setPath(d) {
    this.path.setAttribute('d', d);
    this.total = this.path.getTotalLength();
    this.path.style.strokeDasharray = this.total;
  }

  build() {
    const ring = this.getRing();
    const line = q('#hero-line');
    const pic = q('#hero-pic');
    const title = q('#pieces-title') || q('#fit');
    const wrap = q('#ring-wrap');
    const fitSection = q('#fit');
    const closeLine = q('#close-line');
    if (!line || !pic || !title || !wrap || !closeLine || !ring) return false;

    const doc = document.documentElement;
    const W = doc.clientWidth;
    const H = doc.scrollHeight;
    this.svg.setAttribute('width', W);
    this.svg.setAttribute('height', H);
    this.svg.style.height = `${H}px`;

    const gut = gutter(W);
    const lineBox = line.getBoundingClientRect();
    const y0 = lineBox.top + window.scrollY + 1;
    const lineEnd = W - gut - CORNER;

    const heroBottom = pageBottom(pic);
    const titleTop = pageTop(title);
    const crossY = Math.min(titleTop - 44, heroBottom + (titleTop - heroBottom) * 0.6);

    const size = wrap.getBoundingClientRect().width;
    const cx = wrap.getBoundingClientRect().left + size / 2;
    const cy = pageTop(wrap) + size / 2;
    const R = ring.radius * (size / ring.width);
    const low = cy + R;
    const fitBottom = pageBottom(fitSection);
    const exitY = Math.max(low + 40, fitBottom - 60);
    const endY = pageTop(closeLine) + 1;

    const seg1 = [
      `M ${lineEnd} ${y0}`,
      `A ${CORNER} ${CORNER} 0 0 1 ${W - gut} ${y0 + CORNER}`,
      `L ${W - gut} ${heroBottom + 10}`,
      `C ${W - gut} ${heroBottom + (crossY - heroBottom) * 0.9}, ${W * 0.8} ${crossY}, ${W * 0.5} ${crossY}`,
      `C ${W * 0.2} ${crossY}, ${gut} ${crossY + 8}, ${gut} ${crossY + 110}`,
      `L ${gut} ${low - 230}`,
      `C ${gut} ${low - 40}, ${cx - 200} ${low}, ${cx} ${low}`
    ].join(' ');
    const seg2 = `A ${R} ${R} 0 1 0 ${cx - 0.01} ${low}`;
    const away = W < NARROW
      ? `C ${cx + 110} ${low}, ${W - gut} ${low}, ${W - gut} ${low + 44}`
      : `C ${cx + 220} ${low}, ${W * 0.6} ${exitY}, ${W * 0.74} ${exitY} C ${W * 0.9} ${exitY}, ${W - gut} ${exitY + 10}, ${W - gut} ${exitY + 110}`;
    const seg3 = [away, `L ${W - gut} ${endY - FOOT_CORNER}`, `A ${FOOT_CORNER} ${FOOT_CORNER} 0 0 1 ${W - gut - FOOT_CORNER} ${endY}`].join(' ');

    this.setPath(seg1);
    this.ringFrom = this.total;
    this.setPath(`${seg1} ${seg2}`);
    this.ringTo = this.total;
    this.setPath(`${seg1} ${seg2} ${seg3}`);

    this.sample(low);
    this.placeStops();
    this.minHead = Math.min(CORNER * 1.6 + (heroBottom - y0 - CORNER) * 0.8, this.total * 0.2);
    return true;
  }

  /* Maps scroll position to thread length. The loop around the bracelet takes a set distance. */
  sample(low) {
    this.points = [];
    this.scrollMap = [];
    let last = -Infinity;
    for (let length = 0; length <= this.total; length += SAMPLE_STEP) {
      const { x, y } = this.path.getPointAtLength(length);
      this.points.push({ x, y });
      let reach = y;
      if (length > this.ringFrom && length < this.ringTo) {
        reach = low - 40 + ((length - this.ringFrom) / (this.ringTo - this.ringFrom)) * 240;
      }
      reach = Math.max(reach, last + 0.01);
      this.scrollMap.push(reach);
      last = reach;
    }
  }

  /* The small beads rest in four short runs, touching, like a part-strung cord. */
  placeStops() {
    const after = this.ringTo + (this.total - this.ringTo) * 0.2;
    const later = this.ringTo + (this.total - this.ringTo) * 0.68;
    const runs = [this.ringFrom * 0.5, this.ringFrom * 0.86, after, later];
    this.stops = [];
    let bead = 1;
    runs.forEach((start) => {
      let walked = start;
      for (let i = 0; i < 4 && bead < this.beads.length; i += 1, bead += 1) {
        this.stops.push(walked);
        walked += this.beads[bead].px * 0.96;
      }
    });
    this.stops.sort((a, b) => a - b);
  }

  pointAt(length) {
    const index = Math.max(0, Math.min(this.points.length - 1, Math.round(length / SAMPLE_STEP)));
    return this.points[index];
  }

  place(length) {
    if (!this.points.length) return;
    this.head = length;
    this.path.style.strokeDashoffset = this.total - length;

    if (!this.ringDone && this.ringTo > this.ringFrom) {
      const progress = Math.max(0, Math.min(1, (length - this.ringFrom) / (this.ringTo - this.ringFrom)));
      this.getRing()?.reveal(progress);
      if (progress >= 1) this.ringDone = true;
    }

    let tail = 0;
    this.beads.forEach((bead, i) => {
      tail += bead.px * 0.96;
      const at = i === 0 ? length : Math.min(length - tail, this.stops[i - 1] ?? length);
      const { x, y } = this.pointAt(Math.max(0, at));
      bead.el.style.opacity = at > 2 ? 1 : 0;
      bead.el.style.transform = `translate(${x - bead.px / 2}px, ${y - bead.px / 2}px)`;
    });
  }

  /* The tip stays near the bottom of the screen, and closes through the footer as the page ends. */
  lengthForScroll(scroll) {
    const viewport = window.innerHeight;
    const max = document.documentElement.scrollHeight - viewport;
    const closing = Math.max(0, Math.min(1, (scroll - (max - viewport * 0.5)) / (viewport * 0.5)));
    if (closing >= 1) return this.total;

    const reach = scroll + viewport * (0.92 + closing * 0.4);
    let low = 0;
    let high = this.scrollMap.length - 1;
    while (low < high) {
      const middle = Math.ceil((low + high) / 2);
      if (this.scrollMap[middle] <= reach) low = middle;
      else high = middle - 1;
    }
    return Math.min(this.total, Math.max(low * SAMPLE_STEP, this.minHead));
  }
}
