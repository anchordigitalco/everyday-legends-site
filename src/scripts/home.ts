import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MENU, ANY_MOTION, onceInView, initPillars, settleCard, fadeUps } from './motion';

gsap.registerPlugin(ScrollTrigger);

const MOTION = '(min-width: 900px) and (prefers-reduced-motion: no-preference)';

// Measured from her mark (viewBox 1123 616 1845 1620): the arch circle centre as a fraction of the
// rig box, and the opening's inner radius as a fraction of its width.
const ARCH = { x: (2047.9 - 1123) / 1845, y: (1708.5 - 616) / 1620, r: 425.3 / 1845 };
const FLAME_BASE = '2131 1619'; // centre of the flame where it meets the cup, in mark units

// Must match the CSS failsafe delay on .intro. If this script arrives later than that, the CSS has
// already cleared the overlay and the intro is skipped.
const FAILSAFE_MS = 4500;

export function initHome() {
  initIntro();
  initHall();
  initPillars(document.querySelector<HTMLElement>('[data-pillars]'));
  initActionRows();
  initCard();
  fadeUps();
}

function initIntro() {
  const root = document.documentElement;
  const intro = document.querySelector<HTMLElement>('[data-intro]');
  if (!intro || !root.classList.contains('el-intro')) {
    intro?.remove();
    return;
  }

  const rig = intro.querySelector<HTMLElement>('[data-intro-rig]')!;
  const glow = intro.querySelector<HTMLElement>('[data-intro-glow]')!;
  const paper = intro.querySelector<HTMLElement>('[data-intro-paper]')!;
  const rays = intro.querySelectorAll<SVGGElement>('[data-intro-ray]');
  const letters = intro.querySelector<SVGGElement>('[data-intro-letters]')!;
  const torch = intro.querySelector<SVGGElement>('[data-intro-torch]')!;
  const flame = intro.querySelector<SVGGElement>('[data-intro-flame]')!;
  const heroItems = document.querySelectorAll<HTMLElement>('[data-hero-item]');

  const events = ['wheel', 'touchstart', 'scroll', 'pointerdown', 'keydown'] as const;
  let flicker: gsap.core.Tween | null = null;

  const finish = () => {
    events.forEach((t) => window.removeEventListener(t, skip));
    flicker?.kill();
    intro.remove();
    root.classList.remove('el-intro', 'el-intro-dark', 'el-intro-js');
    gsap.set(heroItems, { clearProps: 'opacity,transform' });
    ScrollTrigger.refresh();
  };

  if (performance.now() > FAILSAFE_MS - 300) {
    finish();
    return;
  }
  root.classList.add('el-intro-js'); // hands control from the CSS failsafe to this timeline

  // Scale at which the opening clears the farthest viewport corner, about the arch centre.
  const box = rig.getBoundingClientRect();
  const ox = box.left + box.width * ARCH.x;
  const oy = box.top + box.height * ARCH.y;
  const far = Math.max(
    Math.hypot(ox, oy),
    Math.hypot(innerWidth - ox, oy),
    Math.hypot(ox, innerHeight - oy),
    Math.hypot(innerWidth - ox, innerHeight - oy),
  );
  // Overshoot so the last of the walk sits in the warm centre of the glow, not its dark rim.
  const maxScale = (far / (box.width * ARCH.r)) * 1.6;
  // Scale runs on a log scale so the walk reads at an even pace; the menu curve shapes that pace.
  const walk = { k: 0 };

  // 4. The flame flickers gently: opacity, plus scale under 3%, flame only.
  flicker = gsap.to(flame, {
    opacity: () => gsap.utils.random(0.8, 1),
    scale: () => gsap.utils.random(0.978, 1.022),
    svgOrigin: FLAME_BASE,
    duration: () => gsap.utils.random(0.08, 0.2),
    ease: 'sine.inOut',
    repeat: -1,
    repeatRefresh: true,
  });

  const tl = gsap.timeline({ onComplete: finish });
  // 2. 0 to 1.2s: rays light one by one, center outward, 40ms apart.
  tl.to(rays, { opacity: 1, duration: 0.56, ease: 'sine.out', stagger: 0.04 }, 0);
  // 3. 0.4 to 1.6s: the warm glow builds inside the arch.
  tl.to(glow, { opacity: 1, duration: 1.2, ease: 'sine.inOut' }, 0.4);
  // 5. 1.6 to 2.8s: the mark scales up about the centre of the arch opening. Letters and torch
  //    are gone by 2.2s. The opening fills the screen and resolves to exactly paper.
  tl.to(
    walk,
    {
      k: 1,
      duration: 1.2,
      ease: MENU,
      onUpdate: () => gsap.set(rig, { scale: Math.pow(maxScale, walk.k) }),
    },
    1.6,
  );
  tl.to([letters, torch], { opacity: 0, duration: 0.6, ease: 'sine.out' }, 1.6);
  tl.to(paper, { opacity: 1, duration: 0.8, ease: 'sine.inOut' }, 2.0);
  // Nav and Donate cross to their on-paper faces (CSS opacity crossfade, 400ms).
  tl.call(() => root.classList.remove('el-intro-dark'), undefined, 2.3);
  // 6. 2.8 to 3.2s: overlay removed; hero title, lede, and CTAs fade up, 80ms stagger.
  tl.addLabel('reveal', 2.8);
  tl.to(intro, { opacity: 0, duration: 0.3, ease: 'sine.out' }, 'reveal');
  tl.fromTo(
    heroItems,
    { opacity: 0, y: 16 },
    { opacity: 1, y: 0, duration: 0.24, ease: MENU, stagger: 0.08 },
    'reveal',
  );

  // Any wheel, touch, scroll, click, or key press skips straight to step 6.
  function skip() {
    if (tl.time() < 2.8) tl.seek('reveal', false);
  }
  events.forEach((t) => window.addEventListener(t, skip, { passive: true }));

  if (import.meta.env.DEV) (window as any).__elIntro = { tl, flicker };
}

function initHall() {
  const hall = document.querySelector<HTMLElement>('[data-hall]');
  if (!hall) return;
  const stage = hall.querySelector<HTMLElement>('[data-hall-stage]')!;
  const track = hall.querySelector<HTMLElement>('[data-track]')!;

  gsap.matchMedia().add(MOTION, () => {
    // Geometry, re-read on every refresh (resize, font load).
    let travel = 0;
    let top = 0;

    // Balanced two-line names keep the full max-width box; shrink each to its widest line so
    // every plaque hangs centred on its drop and the gaps along the rail are even.
    const names = [...track.querySelectorAll<HTMLElement>('.hall__text')];
    const fitNames = () => {
      names.forEach((el) => (el.style.width = ''));
      const range = document.createRange();
      const widths = names.map((el) => {
        range.selectNodeContents(el);
        return Math.max(...[...range.getClientRects()].map((r) => r.width));
      });
      names.forEach((el, i) => (el.style.width = `${Math.ceil(widths[i]) + 2}px`));
    };

    const measure = () => {
      fitNames();
      travel = Math.max(0, track.scrollWidth - stage.clientWidth);
      // The stage pins centred in the viewport. The pin covers 150vh of scroll at most.
      const pin = Math.min(1.5 * innerHeight, travel);
      top = Math.max(0, Math.round((innerHeight - stage.offsetHeight) / 2));
      stage.style.top = `${top}px`;
      hall.style.height = `${stage.offsetHeight + pin}px`;
      hall.dataset.pinVh = ((pin / innerHeight) * 100).toFixed(1);
    };

    ScrollTrigger.addEventListener('refreshInit', measure);
    measure();

    gsap.to(track, {
      x: () => -travel,
      ease: 'none',
      scrollTrigger: {
        trigger: hall,
        start: () => `top ${top}px`,
        end: () => `bottom ${top + stage.offsetHeight}px`,
        scrub: 0.5,
        invalidateOnRefresh: true,
      },
    });

    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => {
      ScrollTrigger.removeEventListener('refreshInit', measure);
      hall.style.height = '';
      stage.style.top = '';
      delete hall.dataset.pinVh;
      names.forEach((el) => (el.style.width = ''));
      gsap.set(track, { clearProps: 'all' });
    };
  });
}

// The invitation settles into its rotation on entry, from 900px. Not scroll-driven: it plays once.
function initCard() {
  settleCard(document.querySelector<HTMLElement>('[data-card]'), MOTION);
}

// Legends in Action. Each row fades up once as it enters. The spotlight hover is CSS.
function initActionRows() {
  const rows = document.querySelectorAll<HTMLElement>('[data-action-row]');
  if (!rows.length) return;

  gsap.matchMedia().add(ANY_MOTION, () => {
    gsap.set(rows, { opacity: 0, y: 32 });
    const observers = [...rows].map((row) =>
      onceInView(row, 0.2, () => gsap.to(row, { opacity: 1, y: 0, duration: 0.6, ease: MENU })),
    );

    return () => {
      observers.forEach((io) => io.disconnect());
      gsap.set(rows, { clearProps: 'all' });
    };
  });
}

