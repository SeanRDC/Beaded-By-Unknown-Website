import { TONES } from '../data/beads.js';
import { fit } from './fit.js';
import { gsap } from '../motion/gsap.js';

const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const mix = (a, b, t) => {
  const A = rgb(a);
  const B = rgb(b);
  return `rgb(${A.map((value, i) => Math.round(value + (B[i] - value) * t)).join(',')})`;
};

const sprites = new Map();

function catEyeBand(x, cx, cy, r) {
  x.save();
  x.translate(cx, cy);
  x.rotate(-0.55);
  const band = x.createLinearGradient(0, -r * 0.55, 0, r * 0.55);
  band.addColorStop(0, 'rgba(255,255,255,0)');
  band.addColorStop(0.5, 'rgba(255,255,255,.72)');
  band.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = band;
  x.fillRect(-r * 1.2, -r * 0.55, r * 2.4, r * 1.1);
  x.restore();
}

function pearlSheen(x, cx, cy, r, size) {
  const sheen = x.createRadialGradient(cx - r * 0.2, cy - r * 0.25, r * 0.1, cx, cy, r);
  sheen.addColorStop(0, 'rgba(255,255,255,.75)');
  sheen.addColorStop(0.7, 'rgba(255,248,240,.15)');
  sheen.addColorStop(1, 'rgba(160,140,120,.3)');
  x.fillStyle = sheen;
  x.fillRect(0, 0, size, size);
}

function jadeCloud(x, cx, cy, r, colour) {
  x.globalAlpha = 0.2;
  for (let i = 0; i < 7; i += 1) {
    const angle = i * 2.4;
    const distance = r * (0.25 + (i % 3) * 0.22);
    x.fillStyle = i % 2 ? '#ffffff' : mix(colour, '#000000', 0.4);
    x.beginPath();
    x.ellipse(cx + Math.cos(angle) * distance, cy + Math.sin(angle) * distance, r * 0.34, r * 0.18, angle, 0, Math.PI * 2);
    x.fill();
  }
  x.globalAlpha = 1;
}

function mermaidShift(x, cx, cy, size) {
  if (!x.createConicGradient) return;
  const shift = x.createConicGradient(1.1, cx, cy);
  ['#ffb3d9', '#a6e6ff', '#d6c2ff', '#b8ffd9', '#ffb3d9'].forEach((stop, i) => shift.addColorStop(i / 4, stop));
  x.globalAlpha = 0.38;
  x.fillStyle = shift;
  x.fillRect(0, 0, size, size);
  x.globalAlpha = 1;
}

function cracks(x, cx, cy, r) {
  x.strokeStyle = 'rgba(255,255,255,.5)';
  x.lineWidth = Math.max(0.6, r * 0.03);
  for (let i = 0; i < 6; i += 1) {
    const angle = i * 1.7;
    x.beginPath();
    x.moveTo(cx + Math.cos(angle) * r * 0.1, cy + Math.sin(angle) * r * 0.1);
    x.lineTo(cx + Math.cos(angle + 0.5) * r * 0.5, cy + Math.sin(angle + 0.5) * r * 0.5);
    x.lineTo(cx + Math.cos(angle + 0.2) * r * 0.95, cy + Math.sin(angle + 0.2) * r * 0.95);
    x.stroke();
  }
}

/* One bead as a small painted picture, cached by colour, kind and size. */
export function sprite(name, type, px) {
  const colour = TONES[name] || name;
  const key = `${colour}|${type}|${Math.round(px)}`;
  if (sprites.has(key)) return sprites.get(key);

  const scale = 2;
  const size = Math.ceil(px * scale) + 4;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const x = canvas.getContext('2d');
  const r = (px * scale) / 2;
  const cx = size / 2;
  const cy = size / 2;

  x.save();
  x.beginPath();
  x.arc(cx, cy, r, 0, Math.PI * 2);
  x.clip();

  const body = x.createRadialGradient(cx - r * 0.38, cy - r * 0.42, r * 0.05, cx, cy, r * 1.04);
  body.addColorStop(0, mix(colour, '#ffffff', 0.58));
  body.addColorStop(0.36, mix(colour, '#ffffff', 0.16));
  body.addColorStop(0.74, colour);
  body.addColorStop(1, mix(colour, '#000000', 0.44));
  x.fillStyle = body;
  x.fillRect(0, 0, size, size);

  if (type === 'Cat Eye') catEyeBand(x, cx, cy, r);
  if (type === 'Imitation Pearl') pearlSheen(x, cx, cy, r, size);
  if (type === 'Imitation Jade') jadeCloud(x, cx, cy, r, colour);
  if (type === 'Mermaid Acrylic') mermaidShift(x, cx, cy, size);
  if (type === 'Cracked') cracks(x, cx, cy, r);

  /* light bounced up from the table */
  const rim = x.createRadialGradient(cx + r * 0.42, cy + r * 0.52, r * 0.04, cx + r * 0.3, cy + r * 0.34, r * 0.72);
  rim.addColorStop(0, 'rgba(255,255,255,.34)');
  rim.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = rim;
  x.fillRect(0, 0, size, size);

  /* window highlight */
  x.fillStyle = 'rgba(255,255,255,.85)';
  x.filter = `blur(${Math.max(0.6, r * 0.05)}px)`;
  x.beginPath();
  x.ellipse(cx - r * 0.36, cy - r * 0.42, r * 0.19, r * 0.12, -0.7, 0, Math.PI * 2);
  x.fill();
  x.filter = 'none';
  x.restore();

  sprites.set(key, canvas);
  return canvas;
}

/* Paints a bracelet at true proportion: the ring is the wrist, the beads are their real size. */
export class Ring {
  constructor(canvas, { thread = null, shadow = true, collection, cm, pattern }) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.thread = thread;
    this.shadow = shadow;
    this.collection = collection;
    this.cm = cm;
    this.pattern = pattern;
    this.scales = [];
    this.charm = null;
    this.dirty = true;
    this.measure();
    this.sync(false);
    this.tick = () => this.draw();
    gsap.ticker.add(this.tick);
  }

  destroy() {
    gsap.ticker.remove(this.tick);
    gsap.killTweensOf(this.scales);
  }

  measure() {
    const width = this.canvas.clientWidth || 480;
    const ratio = Math.min(2, window.devicePixelRatio || 1);
    this.canvas.width = width * ratio;
    this.canvas.height = width * ratio;
    this.ratio = ratio;
    this.width = width;
    this.scale = (width * 0.47) / (35 + 6); // pixels per mm, so a 22 cm wrist with 12 mm beads still fits
    this.dirty = true;
  }

  get radius() {
    return ((this.cm * 10) / (2 * Math.PI)) * this.scale;
  }

  get count() {
    return this.exactCount ?? fit(this.cm, this.collection).count;
  }

  sync(animate = true) {
    const { count } = this;
    while (this.scales.length < count) {
      const bead = { s: animate ? 0 : 1 };
      this.scales.push(bead);
      if (animate) {
        gsap.to(bead, { s: 1, duration: 0.4, ease: 'power3.out', onUpdate: () => { this.dirty = true; } });
      }
    }
    this.scales.length = count;
    this.dirty = true;
  }

  update(changes, animate = true) {
    Object.assign(this, changes);
    this.sync(animate);
  }

  /* Shows the beads the thread has reached so far, from 0 to 1. */
  reveal(progress) {
    const total = this.scales.length;
    this.scales.forEach((bead, i) => {
      bead.s = Math.max(0, Math.min(1, (progress * total - i) / 1.6));
    });
    this.dirty = true;
  }

  /* Strings the beads on one at a time, in order around the ring. */
  string(duration = 1.5) {
    this.scales.forEach((bead) => { bead.s = 0; });
    this.dirty = true;
    return gsap.to(this.scales, {
      s: 1,
      duration: 0.42,
      ease: 'power3.out',
      stagger: duration / Math.max(1, this.scales.length),
      onUpdate: () => { this.dirty = true; }
    });
  }

  draw() {
    if (!this.dirty) return;
    this.dirty = false;
    const { context: x, ratio, width, radius, scales, pattern, collection } = this;
    x.setTransform(ratio, 0, 0, ratio, 0, 0);
    x.clearRect(0, 0, width, width);

    const cx = width / 2;
    const cy = width / 2;
    const bead = collection.size * this.scale;
    const total = scales.length;

    if (this.thread) {
      x.strokeStyle = this.thread;
      x.lineWidth = 2;
      x.beginPath();
      x.arc(cx, cy, radius, 0, Math.PI * 2);
      x.stroke();
    }

    scales.forEach(({ s }, i) => {
      if (s <= 0.01) return;
      const angle = Math.PI / 2 - (i / total) * Math.PI * 2;
      const px = cx + Math.cos(angle) * radius;
      const py = cy + Math.sin(angle) * radius;
      const size = bead * s * 1.02;
      const picture = sprite(pattern[i % pattern.length], collection.type, Math.max(6, bead));
      if (this.shadow) {
        x.fillStyle = 'rgba(40,30,20,.13)';
        x.beginPath();
        x.ellipse(px + bead * 0.1, py + bead * 0.2, size * 0.46, size * 0.36, 0, 0, Math.PI * 2);
        x.fill();
      }
      x.drawImage(picture, px - size / 2, py - size / 2, size, size);
    });
  }
}
