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

const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

function cubicAt(p0, p1, p2, p3, t) {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return { x: a * p0.x + b * p1.x + c * p2.x + d * p3.x, y: a * p0.y + b * p1.y + c * p2.y + d * p3.y };
}

/* Each piece of the thread as a fine run of points. Measuring in JavaScript is far cheaper
   than asking the browser for hundreds of points along a live SVG path. */
function lineSteps(a, b) {
  const steps = Math.max(1, Math.ceil(distance(a, b) / SAMPLE_STEP));
  return Array.from({ length: steps }, (_, i) => ({ x: a.x + ((b.x - a.x) * (i + 1)) / steps, y: a.y + ((b.y - a.y) * (i + 1)) / steps }));
}

function cubicSteps(p0, p1, p2, p3) {
  const reach = distance(p0, p1) + distance(p1, p2) + distance(p2, p3);
  const steps = Math.max(8, Math.ceil(reach / 6));
  return Array.from({ length: steps }, (_, i) => cubicAt(p0, p1, p2, p3, (i + 1) / steps));
}

function arcSteps(cx, cy, r, from, to) {
  const steps = Math.max(8, Math.ceil((Math.abs(to - from) * r) / 6));
  return Array.from({ length: steps }, (_, i) => {
    const angle = from + ((to - from) * (i + 1)) / steps;
    return { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r };
  });
}

/* Walks a run of points and returns them evenly spaced, with the running length at each mark. */
function evenPoints(raw, marks) {
  const points = [raw[0]];
  const lengths = {};
  let walked = 0;
  let next = SAMPLE_STEP;
  for (let i = 1; i < raw.length; i += 1) {
    const a = raw[i - 1];
    const b = raw[i];
    const piece = distance(a, b);
    while (walked + piece >= next) {
      const t = (next - walked) / piece;
      points.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
      next += SAMPLE_STEP;
    }
    walked += piece;
    if (marks.has(i)) lengths[marks.get(i)] = walked;
  }
  return { points, lengths, total: walked };
}
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

  setPath(d, total) {
    this.path.setAttribute('d', d);
    this.path.setAttribute('pathLength', total);
    this.path.style.strokeDasharray = total;
    this.total = total;
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

    const start = { x: lineEnd, y: y0 };
    const right = { x: W - gut, y: y0 + CORNER };
    const heroEnd = { x: W - gut, y: heroBottom + 10 };
    const crossMiddle = { x: W * 0.5, y: crossY };
    const leftTop = { x: gut, y: crossY + 110 };
    const leftEnd = { x: gut, y: low - 230 };
    const ringStart = { x: cx, y: low };
    const c1 = { x: W - gut, y: heroBottom + (crossY - heroBottom) * 0.9 };
    const c2 = { x: W * 0.8, y: crossY };
    const c3 = { x: W * 0.2, y: crossY };
    const c4 = { x: gut, y: crossY + 8 };
    const c5 = { x: gut, y: low - 40 };
    const c6 = { x: cx - 200, y: low };

    const toRing = [
      start,
      ...arcSteps(lineEnd, y0 + CORNER, CORNER, -Math.PI / 2, 0),
      ...lineSteps(right, heroEnd),
      ...cubicSteps(heroEnd, c1, c2, crossMiddle),
      ...cubicSteps(crossMiddle, c3, c4, leftTop),
      ...lineSteps(leftTop, leftEnd),
      ...cubicSteps(leftEnd, c5, c6, ringStart)
    ];
    const loop = arcSteps(cx, cy, R, Math.PI / 2, -1.5 * Math.PI);

    const seg1 = `M ${start.x} ${start.y} A ${CORNER} ${CORNER} 0 0 1 ${right.x} ${right.y} L ${heroEnd.x} ${heroEnd.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${crossMiddle.x} ${crossMiddle.y} C ${c3.x} ${c3.y}, ${c4.x} ${c4.y}, ${leftTop.x} ${leftTop.y} L ${leftEnd.x} ${leftEnd.y} C ${c5.x} ${c5.y}, ${c6.x} ${c6.y}, ${ringStart.x} ${ringStart.y}`;
    const seg2 = `A ${R} ${R} 0 1 0 ${cx - 0.01} ${low}`;

    let away;
    let awayPoints;
    const edge = { x: W - gut, y: 0 };
    if (W < NARROW) {
      const landing = { x: edge.x, y: low + 44 };
      const k1 = { x: cx + 110, y: low };
      const k2 = { x: edge.x, y: low };
      away = `C ${k1.x} ${k1.y}, ${k2.x} ${k2.y}, ${landing.x} ${landing.y}`;
      awayPoints = cubicSteps(ringStart, k1, k2, landing);
      edge.y = landing.y;
    } else {
      const under = { x: W * 0.74, y: exitY };
      const landing = { x: edge.x, y: exitY + 110 };
      const k1 = { x: cx + 220, y: low };
      const k2 = { x: W * 0.6, y: exitY };
      const k3 = { x: W * 0.9, y: exitY };
      const k4 = { x: edge.x, y: exitY + 10 };
      away = `C ${k1.x} ${k1.y}, ${k2.x} ${k2.y}, ${under.x} ${under.y} C ${k3.x} ${k3.y}, ${k4.x} ${k4.y}, ${landing.x} ${landing.y}`;
      awayPoints = [...cubicSteps(ringStart, k1, k2, under), ...cubicSteps(under, k3, k4, landing)];
      edge.y = landing.y;
    }

    const lastY = endY - FOOT_CORNER;
    const fromRing = [
      ...awayPoints,
      ...lineSteps(edge, { x: edge.x, y: lastY }),
      ...arcSteps(W - gut - FOOT_CORNER, lastY, FOOT_CORNER, 0, Math.PI / 2)
    ];
    const seg3 = `${away} L ${edge.x} ${lastY} A ${FOOT_CORNER} ${FOOT_CORNER} 0 0 1 ${W - gut - FOOT_CORNER} ${endY}`;

    const raw = [...toRing, ...loop, ...fromRing];
    const marks = new Map([[toRing.length - 1, 'ringFrom'], [toRing.length + loop.length - 1, 'ringTo']]);
    const { points, lengths, total } = evenPoints(raw, marks);
    this.points = points;
    this.ringFrom = lengths.ringFrom;
    this.ringTo = lengths.ringTo;
    this.setPath(`${seg1} ${seg2} ${seg3}`, total);

    this.sample(low);
    this.placeStops();
    this.minHead = Math.min(CORNER * 1.6 + (heroBottom - y0 - CORNER) * 0.8, this.total * 0.2);
    return true;
  }

  /* Maps scroll position to thread length. The loop around the bracelet takes a set distance. */
  sample(low) {
    this.scrollMap = [];
    let last = -Infinity;
    this.points.forEach((point, index) => {
      const length = index * SAMPLE_STEP;
      let reach = point.y;
      if (length > this.ringFrom && length < this.ringTo) {
        reach = low - 40 + ((length - this.ringFrom) / (this.ringTo - this.ringFrom)) * 240;
      }
      reach = Math.max(reach, last + 0.01);
      this.scrollMap.push(reach);
      last = reach;
    });
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
