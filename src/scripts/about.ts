import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';

gsap.registerPlugin(ScrollTrigger, CustomEase);

// The menu curve, cubic-bezier(.22,1,.36,1). CONTEXT.md, Motion.
const MENU = CustomEase.create('menu', 'M0,0 C0.22,1 0.36,1 1,1');
const MOTION = '(min-width: 900px) and (prefers-reduced-motion: no-preference)';

// Must match the CSS failsafe delay on .niche__plate (about.css). If this script arrives later than
// that, the CSS is already settling the photo and the script leaves it alone.
const FAILSAFE_MS = 2500;

export function initAbout() {
  initNiche();
  initTorchLine();
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
