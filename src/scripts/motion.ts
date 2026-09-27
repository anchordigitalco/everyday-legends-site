import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';

gsap.registerPlugin(CustomEase);

// Motion shared by Home and About. Page scripts import from here; nothing here runs on its own.

// The menu curve, cubic-bezier(.22,1,.36,1). CONTEXT.md, Motion.
export const MENU = CustomEase.create('menu', 'M0,0 C0.22,1 0.36,1 1,1');
export const ANY_MOTION = '(prefers-reduced-motion: no-preference)';

// Runs `play` once, the first time `el` is at least `threshold` in view.
export function onceInView(el: Element, threshold: number, play: () => void) {
  const io = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      play();
    },
    { threshold },
  );
  io.observe(el);
  return io;
}

// Plates hung from a brass rail: Home's Our Mission and About's What we do. Custom gsap, not 21st.dev
// (CONTEXT.md): each drop line grows from the rail (scaleY 0 to 1, 0.5s), then its plaque drops from
// y -24px to 0 with a slight overshoot. 0.12s stagger between pillars. Plays once.
export function initPillars(hang: HTMLElement | null) {
  if (!hang) return;
  const drops = [...hang.querySelectorAll<HTMLElement>('[data-pillar-drop]')];
  const plaques = [...hang.querySelectorAll<HTMLElement>('[data-pillar-plaque]')];

  gsap.matchMedia().add(ANY_MOTION, () => {
    gsap.set(drops, { scaleY: 0, transformOrigin: '50% 0%' });
    gsap.set(plaques, { opacity: 0, y: -24 });
    const io = onceInView(hang, 0.3, () => {
      const tl = gsap.timeline();
      drops.forEach((drop, i) => {
        const at = i * 0.12;
        tl.to(drop, { scaleY: 1, duration: 0.5, ease: MENU }, at);
        tl.to(plaques[i], { y: 0, duration: 0.5, ease: 'back.out(1.6)' }, at + 0.5);
        tl.to(plaques[i], { opacity: 1, duration: 0.2, ease: 'sine.out' }, at + 0.5);
      });
    });

    return () => {
      io.disconnect();
      gsap.set([...drops, ...plaques], { clearProps: 'all' });
    };
  });
}
