import { gsap } from 'gsap';
import { MENU, ANY_MOTION, onceInView, settleNiche, fadeUps } from './motion';

// The page's entrances. The niche photo settles on load; each entry plays once as it enters; each news
// card draws its hairline and fades in; the slab fades up. Nothing is scroll-driven. Reduced motion
// shows every final state.
export function initCommunity() {
  settleNiche();
  initEntries();
  initNews();
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

// In the News, each card once 30% in view: its ink hairline draws left to right (scaleX 0 to 1, 0.5s,
// menu curve), then the card fades in (0.5s, sine). Cards that enter together go 0.08s apart. Plays
// once per card. Absent when Sanity returns no items, so this finds nothing and returns.
function initNews() {
  const items = [...document.querySelectorAll<HTMLElement>('[data-news]')];
  if (!items.length) return;

  gsap.matchMedia().add(ANY_MOTION, () => {
    const parts = new Map(
      items.map((item) => [
        item,
        {
          rule: item.querySelector<HTMLElement>('[data-news-rule]'),
          card: item.querySelector<HTMLElement>('[data-news-card]'),
        },
      ]),
    );
    parts.forEach(({ rule, card }) => {
      gsap.set(rule, { scaleX: 0, transformOrigin: '0% 50%' });
      gsap.set(card, { opacity: 0 });
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries
          .filter((e) => e.isIntersecting)
          .forEach((e, i) => {
            io.unobserve(e.target);
            const { rule, card } = parts.get(e.target as HTMLElement)!;
            gsap
              .timeline({ delay: i * 0.08 })
              .to(rule, { scaleX: 1, duration: 0.5, ease: MENU })
              .to(card, { opacity: 1, duration: 0.5, ease: 'sine.inOut' });
          });
      },
      { threshold: 0.3 },
    );
    items.forEach((item) => io.observe(item));

    return () => {
      io.disconnect();
      parts.forEach(({ rule, card }) => gsap.set([rule, card], { clearProps: 'opacity,transform' }));
    };
  });
}
