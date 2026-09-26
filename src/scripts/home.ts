import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';

gsap.registerPlugin(ScrollTrigger, CustomEase);

// Crisp, like print: cubic-bezier(.16,1,.3,1), 600ms.
const PRINT = CustomEase.create('print', 'M0,0 C0.16,1 0.3,1 1,1');
const MOTION = '(min-width: 900px) and (prefers-reduced-motion: no-preference)';

// Measured from her mark (viewBox 1123 616 1845 1620).
const ORIGIN = { x: 0.5013, y: 0.6744 }; // arch circle centre, as a fraction of the rig box
const OPENING_R = 425.3 / 1845; // inner arch radius, as a fraction of rig width

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const span = (p: number, a: number, b: number) => clamp((p - a) / (b - a));

function readFrame(): number | null {
  const raw = new URLSearchParams(location.search).get('frame');
  if (raw === null) return null;
  const v = parseFloat(raw);
  return Number.isNaN(v) ? null : clamp(v);
}

export function initHome() {
  const frame = readFrame();

  const gate = document.querySelector<HTMLElement>('.gate')!;
  const stage = gate.querySelector<HTMLElement>('.gate__stage')!;
  const rig = gate.querySelector<HTMLElement>('[data-rig]')!;
  const mark = gate.querySelector<HTMLElement>('[data-mark]')!;
  const arch = gate.querySelector<SVGSVGElement>('#arch')!;
  const rays = gate.querySelector<SVGGElement>('#rays')!;
  const slot = gate.querySelector<HTMLElement>('[data-slot="arch-video"]')!;
  const copy = gate.querySelector<HTMLElement>('[data-hero-copy]')!;
  const daylight = gate.querySelector<HTMLElement>('[data-daylight]')!;

  const hall = document.querySelector<HTMLElement>('.hall')!;
  const track = hall.querySelector<HTMLElement>('[data-track]')!;

  const card = document.querySelector<HTMLElement>('[data-card]')!;

  const mm = gsap.matchMedia();

  mm.add(MOTION, () => {
    // Geometry, re-read on every refresh (resize, font load).
    let dx = 0;
    let dy = 0;
    let maxScale = 14;
    let travel = 0;

    const measure = () => {
      const w = rig.offsetWidth;
      const ox = rig.offsetLeft + w * ORIGIN.x;
      const oy = rig.offsetTop + rig.offsetHeight * ORIGIN.y;
      const vw = stage.clientWidth;
      const vh = stage.clientHeight;
      dx = vw / 2 - ox;
      dy = vh / 2 - oy;
      // Scale at which the opening clears the viewport corners, from the centred origin.
      const clears = Math.hypot(vw / 2, vh / 2) / (w * OPENING_R);
      // Wireframe baseline is 1 + p^2.2 × 13. Keep the curve; make sure we are through by p ≈ 0.8.
      maxScale = Math.max(14, 1 + (clears - 1) / Math.pow(0.8, 2.2));

      travel = Math.max(0, track.scrollWidth - window.innerWidth);
      if (frame === null) hall.style.height = `${travel + window.innerHeight}px`;
    };

    const renderGate = (p: number) => {
      const grow = Math.pow(p, 2.2);
      const centre = gsap.parseEase('power2.inOut')(span(p, 0, 0.72));
      gsap.set(rig, {
        x: dx * centre,
        y: dy * centre,
        scale: 1 + grow * (maxScale - 1),
        transformOrigin: `${ORIGIN.x * 100}% ${ORIGIN.y * 100}%`,
        force3D: false,
      });
      // Handoff in the first 10%: her mark (EL and torch with it) out, the drawn arch in.
      const hand = span(p, 0, 0.1);
      gsap.set(mark, { opacity: 1 - hand });
      gsap.set(arch, { opacity: hand });
      gsap.set(rays, { opacity: 1 - span(p, 0.14, 0.42) });
      gsap.set(slot, { opacity: 0.16 + 0.84 * span(p, 0.04, 0.4) });
      gsap.set(copy, { opacity: 1 - span(p, 0.02, 0.24), y: -72 * span(p, 0, 0.3) });
      gsap.set(daylight, { opacity: span(p, 0.8, 0.97) });
    };

    const renderHall = (q: number) => {
      gsap.set(track, { x: -q * travel, force3D: true });
    };

    measure();

    if (frame !== null) {
      renderGate(frame);
      renderHall(frame);
      return () => {
        gsap.set([rig, mark, arch, rays, slot, copy, daylight, track], { clearProps: 'all' });
      };
    }

    ScrollTrigger.addEventListener('refreshInit', measure);

    ScrollTrigger.create({
      trigger: gate,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => renderGate(self.progress),
      onRefresh: (self) => renderGate(self.progress),
    });

    ScrollTrigger.create({
      trigger: hall,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => renderHall(self.progress),
      onRefresh: (self) => renderHall(self.progress),
    });

    // The invitation settles into its rotation on entry. Not scroll-driven: it plays once.
    gsap.set(card, { opacity: 0, y: 40, rotation: -1 });
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        gsap.to(card, { opacity: 1, y: 0, rotation: 2, duration: 0.6, ease: PRINT });
      },
      { threshold: 0.3 },
    );
    io.observe(card);

    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => {
      io.disconnect();
      ScrollTrigger.removeEventListener('refreshInit', measure);
      hall.style.height = '';
      gsap.set([rig, mark, arch, rays, slot, copy, daylight, track, card], { clearProps: 'all' });
    };
  });
}
