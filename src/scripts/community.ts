import { gsap } from 'gsap';
import { MENU, ANY_MOTION, onceInView, settleNiche, fadeUps } from './motion';

// The page's entrances. The niche photo settles on load; each entry plays once as it enters; the slab
// fades up. Nothing is scroll-driven. Reduced motion shows every final state.
export function initCommunity() {
  settleNiche();
  initEntries();
  fadeUps();
}

// Each entry, once 20% in view: its rail segment grows from the top (scaleY 0 to 1, 0.5s, menu curve),
// then its photo and text rise 24px and fade in, 0.12s apart (0.6s, movement on the menu curve,
// the fade on sine). Plays once per entry.
function initEntries() {
  const items = [...document.querySelectorAll<HTMLElement>('[data-entry]')];
  if (!items.length) return;

  gsap.matchMedia().add(ANY_MOTION, () => {
    const parts = items.map((entry) => ({
      entry,
      rail: entry.querySelector<HTMLElement>('[data-entry-rail]'),
      rise: [...entry.querySelectorAll<HTMLElement>('[data-entry-rise]')],
    }));
    parts.forEach(({ rail, rise }) => {
      gsap.set(rail, { scaleY: 0, transformOrigin: '50% 0%' });
      gsap.set(rise, { opacity: 0, y: 24 });
    });

    const observers = parts.map(({ entry, rail, rise }) =>
      onceInView(entry, 0.2, () => {
        const tl = gsap.timeline();
        tl.to(rail, { scaleY: 1, duration: 0.5, ease: MENU }, 0);
        rise.forEach((el, i) => {
          const at = 0.5 + i * 0.12;
          tl.to(el, { y: 0, duration: 0.6, ease: MENU }, at);
          tl.to(el, { opacity: 1, duration: 0.6, ease: 'sine.inOut' }, at);
        });
      }),
    );

    return () => {
      observers.forEach((io) => io.disconnect());
      parts.forEach(({ rail, rise }) => gsap.set([rail, ...rise], { clearProps: 'opacity,transform' }));
    };
  });
}
