/* Shared by the three concept boards. Catalogue, prices and the wrist formula are
   copied from beaded-frontend/src/App.jsx, so every number on the boards is real. */
(function () {
  const TONE = {
    'Dark Blue': '#1F3A7A', 'Navy Blue': '#1B2A5B', 'Light Blue': '#A9D3E8', 'Sky Blue': '#86C5E6', 'Blue': '#2E7FC9',
    'Pink': '#F2A9BE', 'Purple': '#9A7BC8', 'Red': '#C8343C', 'Orange': '#EE9336', 'Yellow': '#F2C62E',
    'Dark Green': '#1F5A3E', 'Light Green': '#A6D89A', 'Green': '#3E9A5A', 'Moss Green': '#7E8F55',
    'White': '#F4F2EC', 'Dirty White': '#E9E3D2', 'Black': '#1A1A1C', 'Gray': '#8C8F95', 'Brown': '#7A4A2C'
  };

  const COLLECTIONS = [
    ['rs3', 'Regular Seed', 3, 0.5, ['Dark Blue', 'Light Blue', 'Pink', 'Dark Green', 'Light Green', 'White', 'Black', 'Yellow', 'Red', 'Purple']],
    ['gs3', 'Glass Seed', 3, 0.5, ['White', 'Dirty White', 'Orange', 'Pink', 'Purple', 'Blue', 'Light Green', 'Green', 'Gray', 'Black']],
    ['ac6', 'Acrylic', 6, 1, ['Navy Blue', 'Purple', 'Pink', 'Red', 'White', 'Yellow', 'Brown', 'Moss Green', 'Orange', 'Black', 'Gray']],
    ['ac8', 'Acrylic', 8, 1, ['Navy Blue', 'Purple', 'Pink', 'Red', 'White', 'Yellow', 'Brown', 'Moss Green', 'Orange', 'Black', 'Gray']],
    ['cr8', 'Cracked', 8, 1, ['Blue', 'Purple', 'Pink', 'Red', 'White', 'Yellow', 'Brown', 'Green']],
    ['ij4', 'Imitation Jade', 4, 1, ['Dark Blue', 'Light Blue', 'Purple', 'Pink', 'Red', 'White', 'Green', 'Orange', 'Black']],
    ['ij6', 'Imitation Jade', 6, 2, ['Dark Blue', 'Light Blue', 'Purple', 'Pink', 'Red', 'Brown', 'Green', 'Gray']],
    ['ij8', 'Imitation Jade', 8, 2, ['Dark Blue', 'Light Blue', 'Purple', 'Pink', 'Red', 'Green', 'Gray']],
    ['ij10', 'Imitation Jade', 10, 3, ['Sky Blue', 'Purple', 'Pink', 'Red', 'Green', 'Brown', 'Gray', 'Black']],
    ['ce8', 'Cat Eye', 8, 2, ['Black', 'Gray', 'Brown', 'Blue', 'Green', 'Yellow', 'Orange', 'Pink', 'Purple', 'Red', 'White']],
    ['ce10', 'Cat Eye', 10, 3, ['Black', 'Gray', 'Brown', 'Blue', 'Green', 'Yellow', 'Orange', 'Pink', 'Purple', 'Red', 'White']],
    ['ce12', 'Cat Eye', 12, 5, ['Black', 'Gray', 'Brown', 'Blue', 'Green', 'Yellow', 'Orange', 'Pink', 'Purple', 'Red', 'White']],
    ['ma8', 'Mermaid Acrylic', 8, 2, ['Blue', 'Green', 'Orange', 'Pink', 'Purple', 'White', 'Yellow']],
    ['ma10', 'Mermaid Acrylic', 10, 3, ['Blue', 'Green', 'Orange', 'Pink', 'Purple', 'White', 'Yellow']],
    ['ip3', 'Imitation Pearl', 3, 0.5, ['Dirty White', 'White']],
    ['ip4', 'Imitation Pearl', 4, 1, ['Dirty White', 'White']],
    ['ip6', 'Imitation Pearl', 6, 1.5, ['Dirty White', 'White']],
    ['ip8', 'Imitation Pearl', 8, 2, ['Dirty White', 'White']],
    ['ip10', 'Imitation Pearl', 10, 3, ['Dirty White', 'White']],
    ['ip12', 'Imitation Pearl', 12, 4, ['Dirty White', 'White']]
  ].map(([id, type, size, price, colors]) => ({ id, type, size, price, colors, name: `${type} (${size}mm)` }));

  const BASE = 25;       // base setting
  const STRING = 8;      // stretchable nylon, the builder's default

  /* The same sums the builder runs: floor(wrist in mm / bead size), never fewer than 5. */
  function fit(cm, coll) {
    const count = Math.max(5, Math.floor((cm * 10) / coll.size));
    const beads = count * coll.price;
    return { count, beads, total: BASE + beads + STRING };
  }

  const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const mix = (a, b, t) => {
    const A = rgb(a), B = rgb(b);
    return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',')})`;
  };

  const sprites = new Map();

  /* One bead as a small painted picture, cached by colour, kind and size. */
  function sprite(name, type, px) {
    const col = TONE[name] || name;
    const key = `${col}|${type}|${Math.round(px)}`;
    if (sprites.has(key)) return sprites.get(key);

    const scale = 2;
    const size = Math.ceil(px * scale) + 4;
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const x = c.getContext('2d');
    const r = (px * scale) / 2;
    const cx = size / 2, cy = size / 2;

    x.save();
    x.beginPath();
    x.arc(cx, cy, r, 0, Math.PI * 2);
    x.clip();

    let g = x.createRadialGradient(cx - r * 0.38, cy - r * 0.42, r * 0.05, cx, cy, r * 1.04);
    g.addColorStop(0, mix(col, '#ffffff', 0.58));
    g.addColorStop(0.36, mix(col, '#ffffff', 0.16));
    g.addColorStop(0.74, col);
    g.addColorStop(1, mix(col, '#000000', 0.44));
    x.fillStyle = g;
    x.fillRect(0, 0, size, size);

    if (type === 'Cat Eye') {
      x.save();
      x.translate(cx, cy);
      x.rotate(-0.55);
      const b = x.createLinearGradient(0, -r * 0.55, 0, r * 0.55);
      b.addColorStop(0, 'rgba(255,255,255,0)');
      b.addColorStop(0.5, 'rgba(255,255,255,.72)');
      b.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = b;
      x.fillRect(-r * 1.2, -r * 0.55, r * 2.4, r * 1.1);
      x.restore();
    }

    if (type === 'Imitation Pearl') {
      const s = x.createRadialGradient(cx - r * 0.2, cy - r * 0.25, r * 0.1, cx, cy, r);
      s.addColorStop(0, 'rgba(255,255,255,.75)');
      s.addColorStop(0.7, 'rgba(255,248,240,.15)');
      s.addColorStop(1, 'rgba(160,140,120,.3)');
      x.fillStyle = s;
      x.fillRect(0, 0, size, size);
    }

    if (type === 'Imitation Jade') {
      x.globalAlpha = 0.2;
      for (let i = 0; i < 7; i++) {
        const a = i * 2.4, d = r * (0.25 + (i % 3) * 0.22);
        x.fillStyle = i % 2 ? '#ffffff' : mix(col, '#000000', 0.4);
        x.beginPath();
        x.ellipse(cx + Math.cos(a) * d, cy + Math.sin(a) * d, r * 0.34, r * 0.18, a, 0, Math.PI * 2);
        x.fill();
      }
      x.globalAlpha = 1;
    }

    if (type === 'Mermaid Acrylic' && x.createConicGradient) {
      const m = x.createConicGradient(1.1, cx, cy);
      ['#ffb3d9', '#a6e6ff', '#d6c2ff', '#b8ffd9', '#ffb3d9'].forEach((s, i) => m.addColorStop(i / 4, s));
      x.globalAlpha = 0.38;
      x.fillStyle = m;
      x.fillRect(0, 0, size, size);
      x.globalAlpha = 1;
    }

    if (type === 'Cracked') {
      x.strokeStyle = 'rgba(255,255,255,.5)';
      x.lineWidth = Math.max(0.6, r * 0.03);
      for (let i = 0; i < 6; i++) {
        const a = i * 1.7;
        x.beginPath();
        x.moveTo(cx + Math.cos(a) * r * 0.1, cy + Math.sin(a) * r * 0.1);
        x.lineTo(cx + Math.cos(a + 0.5) * r * 0.5, cy + Math.sin(a + 0.5) * r * 0.5);
        x.lineTo(cx + Math.cos(a + 0.2) * r * 0.95, cy + Math.sin(a + 0.2) * r * 0.95);
        x.stroke();
      }
    }

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

    sprites.set(key, c);
    return c;
  }

  /* Paints a bracelet at true proportion: the ring is the wrist, the beads are their real size. */
  class Ring {
    constructor(canvas, opts = {}) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.thread = opts.thread || null;      // colour of the cord, or null when the page draws it
      this.shadow = opts.shadow !== false;
      this.cm = 16.5;
      this.coll = COLLECTIONS[9];
      this.pattern = ['Blue', 'White'];
      this.scales = [];
      this.onChange = opts.onChange || null;
      this.dirty = true;
      this.fit();
      this.sync(false);
      gsap.ticker.add(() => this.draw());
      window.addEventListener('resize', () => { this.fit(); this.dirty = true; });
    }

    fit() {
      const w = this.canvas.clientWidth || 480;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      this.canvas.width = w * dpr;
      this.canvas.height = w * dpr;
      this.dpr = dpr;
      this.w = w;
      this.k = (w * 0.47) / (35 + 6);   // px per mm, so a 22 cm wrist with 12 mm beads still fits
    }

    get radius() { return ((this.cm * 10) / (2 * Math.PI)) * this.k; }
    get info() { return fit(this.cm, this.coll); }

    sync(animate = true) {
      const n = this.info.count;
      while (this.scales.length < n) {
        const b = { s: animate ? 0 : 1 };
        this.scales.push(b);
        if (animate) gsap.to(b, { s: 1, duration: 0.4, ease: 'power3.out', onUpdate: () => { this.dirty = true; } });
      }
      this.scales.length = n;
      this.dirty = true;
    }

    set(patch) {
      Object.assign(this, patch);
      this.sync(true);
      if (this.onChange) this.onChange(this);
    }

    /* shows the beads the thread has reached so far (0 to 1) */
    reveal(p) {
      const n = this.scales.length;
      this.scales.forEach((b, i) => { b.s = Math.max(0, Math.min(1, (p * n - i) / 1.6)); });
      this.dirty = true;
    }

    /* strings the beads on one at a time, in order around the ring */
    string(duration = 1.5) {
      this.scales.forEach((b) => { b.s = 0; });
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
      const { ctx: x, dpr, w } = this;
      x.setTransform(dpr, 0, 0, dpr, 0, 0);
      x.clearRect(0, 0, w, w);
      const cx = w / 2, cy = w / 2, R = this.radius, d = this.coll.size * this.k, n = this.scales.length;

      if (this.thread) {
        x.strokeStyle = this.thread;
        x.lineWidth = 2;
        x.beginPath();
        x.arc(cx, cy, R, 0, Math.PI * 2);
        x.stroke();
      }

      const order = this.scales.map((_, i) => i);
      for (const i of order) {
        const s = this.scales[i].s;
        if (s <= 0.01) continue;
        const a = Math.PI / 2 - (i / n) * Math.PI * 2;
        const px = cx + Math.cos(a) * R, py = cy + Math.sin(a) * R;
        const name = this.pattern[i % this.pattern.length];
        const img = sprite(name, this.coll.type, Math.max(6, d));
        const size = d * s * 1.02;
        if (this.shadow) {
          x.fillStyle = 'rgba(40,30,20,.13)';
          x.beginPath();
          x.ellipse(px + d * 0.1, py + d * 0.2, size * 0.46, size * 0.36, 0, 0, Math.PI * 2);
          x.fill();
        }
        x.drawImage(img, px - size / 2, py - size / 2, size, size);
      }
    }
  }

  window.Beads = { COLLECTIONS, TONE, BASE, STRING, fit, sprite, Ring, mix };
})();
