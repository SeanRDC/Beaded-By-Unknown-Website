import { useEffect, useRef } from 'react';

import { Ring, sprite } from '../lib/beads-canvas.js';
import { reduced } from '../motion/gsap.js';

/* A bracelet at true proportion. ringRef exposes the painter to whoever drives it. */
export function BeadRing({ ringRef, collection, cm, pattern, exactCount, shadow = true, threaded = false, label }) {
  const canvas = useRef(null);
  const previous = useRef(collection);

  useEffect(() => {
    const thread = threaded ? getComputedStyle(document.documentElement).getPropertyValue('--thread').trim() : null;
    const ring = new Ring(canvas.current, { thread, shadow, collection, cm, pattern });
    ring.update({ exactCount }, false);
    ringRef.current = ring;

    const onResize = () => {
      ring.measure();
      ring.onResized?.();
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      ring.destroy();
      ringRef.current = null;
    };
    // The painter is created once. Later prop changes go through update() below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const ring = ringRef.current;
    if (!ring) return;
    const swapped = previous.current !== collection;
    previous.current = collection;

    if (swapped) ring.scales.length = 0;
    ring.update({ cm, collection, pattern, exactCount }, !swapped);
    if (swapped && !reduced()) ring.string(0.9);
    ring.onResized?.();
  }, [ringRef, cm, collection, pattern, exactCount]);

  return <canvas ref={canvas} width="660" height="660" role="img" aria-label={label} />;
}

/* A single painted bead, for swatches and the sizes line. */
export function BeadPicture({ name, type, px, size = px }) {
  const canvas = useRef(null);

  useEffect(() => {
    const painted = sprite(name, type, px);
    canvas.current.width = painted.width;
    canvas.current.height = painted.height;
    canvas.current.getContext('2d').drawImage(painted, 0, 0);
  }, [name, type, px]);

  return <canvas ref={canvas} style={{ width: size, height: size }} aria-hidden="true" />;
}
