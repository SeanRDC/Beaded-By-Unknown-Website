import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export const NO_REDUCED = '(prefers-reduced-motion: no-preference)';

export const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Runs setup only for people who have not asked for less motion, and cleans up with the component. */
export function useMotion(setup, { scope, dependencies = [] } = {}) {
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(NO_REDUCED, setup);
    return () => mm.revert();
  }, { scope, dependencies, revertOnUpdate: true });
}

/* A heading, text and picture arriving in reading order, once. */
export function rise(targets, trigger, { y = 26, stagger = 0.08, start = 'top 82%' } = {}) {
  gsap.from(targets, {
    y,
    opacity: 0,
    duration: 0.85,
    stagger,
    ease: 'power3.out',
    scrollTrigger: { trigger, start, once: true }
  });
}

/* A picture opening from one edge while settling from a slight scale. */
export function wipe(frame, { from = 'inset(0 100% 0 0)', start = 'top 84%' } = {}) {
  const scrollTrigger = { trigger: frame, start, once: true };
  gsap.fromTo(frame, { clipPath: from }, {
    clipPath: 'inset(0 0% 0 0%)',
    duration: 1.15,
    ease: 'power3.inOut',
    clearProps: 'clipPath',
    scrollTrigger
  });
  const picture = frame.querySelector('img');
  if (picture) gsap.from(picture, { scale: 1.1, duration: 1.5, ease: 'power2.out', clearProps: 'transform', scrollTrigger });
}

export { gsap, ScrollTrigger, useGSAP };
