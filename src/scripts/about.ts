import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { MENU, ANY_MOTION, onceInView, initPillars } from './motion';

gsap.registerPlugin(ScrollTrigger, SplitText);

const MOTION = '(min-width: 900px) and (prefers-reduced-motion: no-preference)';

// Must match the CSS failsafe delay on .niche__plate (about.css). If this script arrives later than
// that, the CSS is already settling the photo and the script leaves it alone.
const FAILSAFE_MS = 2500;

export function initAbout() {
  initNiche();
  initInscription();
  initTorchLine();
  initStair();
  initPillars(document.querySelector<HTMLElement>('[data-pillars]'));
}

// The niche photo settles once on load: scale 1.06 to 1 on the menu curve, opacity 0 to 1 on sine, 0.9s.
// Only the photo moves; the frame and the text stay still. html.el-settle is set by the head script
// only when motion is allowed, and it holds the photo hidden until the settle begins.
function initNiche() {
  const root = document.documentElement;
  const plate = document.querySelector<HTMLElement>('[data-niche-plate]');
  const img = document.querySelector<HTMLImageElement>('[data-niche-img]');
  if (!plate || !img || !root.classList.contains('el-settle')) return;
  if (performance.now() > FAILSAFE_MS - 200) return;
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

// Founders' Story: the torch line, scroll-driven moment 2. No pin, no added scroll length.
// progress = (viewport middle - track top) / track height, clamped 0 to 1, so the head of the fill
// is always level with the middle of the screen. The torch rides the head until it reaches its rest
// beside the torch sentence (placed there by CSS), then stays; the fill carries on without it.
// Under 900px and with reduced motion none of this runs: the CSS final state shows.
function initTorchLine() {
  const line = document.querySelector<HTMLElement>('[data-torch-line]');
  const fill = document.querySelector<HTMLElement>('[data-torch-fill]');
  const marker = document.querySelector<HTMLElement>('[data-torch-marker]');
  if (!line || !fill || !marker) return;

  gsap.matchMedia().add(MOTION, () => {
    // The torch's resting centre, measured from the top of the track. Re-read on every refresh
    // (resize, font load, image load); nothing is hardcoded.
    let rest = 0;
    const measure = () => {
      gsap.set(marker, { y: 0 });
      const l = line.getBoundingClientRect();
      const m = marker.getBoundingClientRect();
      rest = m.top + m.height / 2 - l.top;
    };
    const setY = gsap.quickSetter(marker, 'y', 'px') as (y: number) => void;
    const place = (progress: number) => setY(Math.min(0, progress * line.offsetHeight - rest));

    ScrollTrigger.addEventListener('refreshInit', measure);
    measure();

    gsap.fromTo(
      fill,
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: line,
          start: 'top center',
          end: 'bottom center',
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => place(self.progress),
          onRefresh: (self) => place(self.progress),
        },
      },
    );

    const refresh = () => ScrollTrigger.refresh();
    const images = [...document.querySelectorAll<HTMLImageElement>('main img')];
    images.forEach((img) => img.complete || img.addEventListener('load', refresh, { once: true }));
    document.fonts?.ready.then(refresh);

    return () => {
      ScrollTrigger.removeEventListener('refreshInit', measure);
      images.forEach((img) => img.removeEventListener('load', refresh));
      gsap.set([fill, marker], { clearProps: 'transform' });
    };
  });
}

// Our Story's inscription rises line by line out of a mask: each line from y 100% to 0, 0.8s, on the
// menu curve, 0.12s apart. Plays once when 30% in view. autoSplit re-splits the lines on resize;
// returning the tween from onSplit lets SplitText carry its progress over to the new lines, so a
// finished reveal stays finished and one not yet played stays waiting. The split text is hidden from
// screen readers; a visually hidden copy reads the quote once, whole (about.astro).
// Reduced motion: never split, static.
function initInscription() {
  const text = document.querySelector<HTMLElement>('[data-inscription]');
  if (!text) return;

  gsap.matchMedia().add(ANY_MOTION, () => {
    let played = false;
    let reveal: gsap.core.Tween | undefined; // the tween for the current split
    let split: SplitText | undefined;
    let io: IntersectionObserver | undefined;
    let cancelled = false;

    // Split once the fonts are in, so the lines are measured in Fraunces.
    document.fonts.ready.then(() => {
      if (cancelled) return;
      split = SplitText.create(text, {
        type: 'lines',
        mask: 'lines',
        linesClass: 'inscription__line',
        autoSplit: true,
        aria: 'none',
        onSplit: (self) => {
          reveal = gsap.fromTo(
            self.lines,
            { yPercent: 100 },
            { yPercent: 0, duration: 0.8, ease: MENU, stagger: 0.12, paused: !played },
          );
          return reveal;
        },
      });
      io = onceInView(text, 0.3, () => {
        played = true;
        reveal?.play();
      });
    });

    return () => {
      cancelled = true;
      io?.disconnect();
      split?.revert();
    };
  });
}

// We aim to: the stair. The steps arrive in order, top to bottom, 0.18s apart. Each rule draws from
// the left (scaleX 0 to 1, 0.5s, menu curve), then its line slides in from x -24px to 0 as it fades
// in (0.5s: movement on the menu curve, the fade on sine). The last step's base rule draws as its
// line arrives. Plays once when 30% in view. Reduced motion: static.
function initStair() {
  const stair = document.querySelector<HTMLElement>('[data-stair]');
  if (!stair) return;
  const steps = [...stair.querySelectorAll<HTMLElement>('[data-step]')];
  const rules = steps.map((s) => s.querySelector<HTMLElement>('[data-step-rule]')!);
  const lines = steps.map((s) => s.querySelector<HTMLElement>('[data-step-line]')!);
  const base = stair.querySelector<HTMLElement>('[data-step-base]');
  const drawn = base ? [...rules, base] : rules;

  gsap.matchMedia().add(ANY_MOTION, () => {
    gsap.set(drawn, { scaleX: 0, transformOrigin: '0% 50%' });
    gsap.set(lines, { opacity: 0, x: -24 });
    const io = onceInView(stair, 0.3, () => {
      const tl = gsap.timeline();
      steps.forEach((_, i) => {
        const at = i * 0.18;
        tl.to(rules[i], { scaleX: 1, duration: 0.5, ease: MENU }, at);
        tl.to(lines[i], { x: 0, duration: 0.5, ease: MENU }, at + 0.5);
        tl.to(lines[i], { opacity: 1, duration: 0.5, ease: 'sine.out' }, at + 0.5);
      });
      if (base) tl.to(base, { scaleX: 1, duration: 0.5, ease: MENU }, (steps.length - 1) * 0.18 + 0.5);
    });

    return () => {
      io.disconnect();
      gsap.set([...drawn, ...lines], { clearProps: 'all' });
    };
  });
}
