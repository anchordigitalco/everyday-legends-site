import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';

gsap.registerPlugin(CustomEase);

// Motion shared across pages. Page scripts import from here; nothing here runs on its own.

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

// Must match the CSS failsafe delay on .niche__plate (global.css, Niche header). If this script arrives
// later than that, the CSS is already settling the photo and the script leaves it alone.
const SETTLE_FAILSAFE_MS = 2500;

// The niche header's photo settles once on load (About, In the Community): scale 1.06 to 1 on the menu
// curve, opacity 0 to 1 on sine, 0.9s. Only the photo moves; the frame and the text stay still.
// html.el-settle is set by the head script (SettleHead.astro) only when motion is allowed, and it holds
// the photo hidden until the settle begins.
export function settleNiche() {
  const root = document.documentElement;
  const plate = document.querySelector<HTMLElement>('[data-niche-plate]');
  const img = document.querySelector<HTMLImageElement>('[data-niche-img]');
  if (!plate || !img || !root.classList.contains('el-settle')) return;
  if (performance.now() > SETTLE_FAILSAFE_MS - 200) return;
  root.classList.add('el-settle-js'); // hands control from the CSS failsafe to this tween

  // Movement on the menu curve; the fade on sine (CONTEXT.md, Motion). Same 0.9s.
  const settle = () => {
    gsap.fromTo(plate, { scale: 1.06 }, { scale: 1, duration: 0.9, ease: MENU });
    gsap.fromTo(
      plate,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.9,
        ease: 'sine.inOut',
        onComplete: () => {
          root.classList.remove('el-settle', 'el-settle-js');
          gsap.set(plate, { clearProps: 'opacity,transform' });
        },
      },
    );
  };
  // Wait for the pixels, so the settle never plays on an empty niche.
  img.decode().then(settle, settle);
}

// Content that fades up once as it enters (the Support slab on Home and In the Community): y 32px to 0
// with opacity, 0.6s on the menu curve, each [data-fade-up] once 20% in view.
export function fadeUps() {
  const items = document.querySelectorAll<HTMLElement>('[data-fade-up]');
  if (!items.length) return;

  gsap.matchMedia().add(ANY_MOTION, () => {
    gsap.set(items, { opacity: 0, y: 32 });
    const observers = [...items].map((el) =>
      onceInView(el, 0.2, () => gsap.to(el, { opacity: 1, y: 0, duration: 0.6, ease: MENU })),
    );

    return () => {
      observers.forEach((io) => io.disconnect());
      gsap.set(items, { clearProps: 'all' });
    };
  });
}

// Plates hung from a brass rail: Home's Our Mission, About's What we do, and the Legends Among Us
// honorees hall. Custom gsap, not 21st.dev (CONTEXT.md): each drop line grows from the rail (scaleY 0 to
// 1, 0.5s), then its plaque drops from y -24px to 0 with a slight overshoot. 0.12s stagger between
// pillars. Plays once, when `threshold` of the hang is in view (Home and About: 0.3).
export function initPillars(hang: HTMLElement | null, threshold = 0.3) {
  if (!hang) return;
  const drops = [...hang.querySelectorAll<HTMLElement>('[data-pillar-drop]')];
  const plaques = [...hang.querySelectorAll<HTMLElement>('[data-pillar-plaque]')];

  gsap.matchMedia().add(ANY_MOTION, () => {
    gsap.set(drops, { scaleY: 0, transformOrigin: '50% 0%' });
    gsap.set(plaques, { opacity: 0, y: -24 });
    const io = onceInView(hang, threshold, () => {
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

// The niche settle, as About's header plays it on load: scale 1.06 to 1 on the menu curve and opacity 0
// to 1 on sine, 0.9s. Here it plays once, when `threshold` of `group` is in view, each plate `stagger`
// after the one before, and only once its photo has decoded, so it never settles an empty niche.
export function settleInView(group: HTMLElement | null, threshold: number, stagger: number) {
  if (!group) return;
  const plates = [...group.querySelectorAll<HTMLElement>('[data-niche-plate]')];
  if (!plates.length) return;

  gsap.matchMedia().add(ANY_MOTION, () => {
    gsap.set(plates, { opacity: 0, scale: 1.06 });
    const io = onceInView(group, threshold, () => {
      const imgs = plates.map((p) => p.querySelector('img')).filter((i): i is HTMLImageElement => !!i);
      imgs.forEach((i) => (i.loading = 'eager'));
      Promise.all(imgs.map((i) => i.decode().catch(() => null))).then(() => {
        plates.forEach((plate, i) => {
          gsap.to(plate, { scale: 1, duration: 0.9, ease: MENU, delay: i * stagger });
          gsap.to(plate, { opacity: 1, duration: 0.9, ease: 'sine.inOut', delay: i * stagger });
        });
      });
    });

    return () => {
      io.disconnect();
      gsap.set(plates, { clearProps: 'opacity,scale,transform' });
    };
  });
}

// The invitation card settles into its angle: opacity 0, y 40, rotation -1 to opacity 1, y 0, rotation 2,
// 0.6s on the menu curve. It plays once, under `media`: on load (`onLoad`), or when 30% in view.
// Home plays it on entry from 900px; Legends Among Us opens on it, so there it plays on load.
export function settleCard(card: HTMLElement | null, media: string, onLoad = false) {
  if (!card) return;
  gsap.matchMedia().add(media, () => {
    gsap.set(card, { opacity: 0, y: 40, rotation: -1 });
    const play = () => gsap.to(card, { opacity: 1, y: 0, rotation: 2, duration: 0.6, ease: MENU });
    const io = onLoad ? null : onceInView(card, 0.3, play);
    if (onLoad) play();

    return () => {
      io?.disconnect();
      gsap.set(card, { clearProps: 'all' });
    };
  });
}

// Photos that rise into place: y 24px to 0 on the menu curve with opacity on sine, 0.6s, each once when
// `threshold` of it is in view. Photos that come into view together go `stagger` apart.
export function riseInView(els: HTMLElement[], threshold: number, stagger: number) {
  if (!els.length) return;
  gsap.matchMedia().add(ANY_MOTION, () => {
    gsap.set(els, { opacity: 0, y: 24 });
    const io = new IntersectionObserver(
      (entries) => {
        const entering = entries.filter((e) => e.isIntersecting).map((e) => e.target as HTMLElement);
        entering.forEach((el, i) => {
          io.unobserve(el);
          gsap.to(el, { y: 0, duration: 0.6, ease: MENU, delay: i * stagger });
          gsap.to(el, { opacity: 1, duration: 0.6, ease: 'sine.inOut', delay: i * stagger });
        });
      },
      { threshold },
    );
    els.forEach((el) => io.observe(el));

    return () => {
      io.disconnect();
      gsap.set(els, { clearProps: 'opacity,transform' });
    };
  });
}
