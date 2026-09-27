import { gsap } from 'gsap';
import { ANY_MOTION, onceInView } from './motion';

export function initSupport() {
  initRays();
}

// The page's only motion: the rays fade in once when the gift section is 20% in view, center ray first,
// then outward (their order in the markup). Opacity only, sine, 0.6s each, 0.06s apart. The slab, the
// frame, and the form area never move. Reduced motion: the rays are simply there.
function initRays() {
  const give = document.querySelector<HTMLElement>('[data-give]');
  const rays = [...document.querySelectorAll<SVGGElement>('[data-ray]')];
  if (!give || !rays.length) return;

  gsap.matchMedia().add(ANY_MOTION, () => {
    gsap.set(rays, { opacity: 0 });
    document.documentElement.classList.add('el-rays-js');
    const io = onceInView(give, 0.2, () => {
      gsap.to(rays, { opacity: 1, duration: 0.6, ease: 'sine.inOut', stagger: 0.06 });
    });

    return () => {
      io.disconnect();
      gsap.set(rays, { clearProps: 'opacity' });
    };
  });
}
