import { gsap } from 'gsap';
import { ANY_MOTION, onceInView } from './motion';
import { donationFormTitle } from '../data/a11y';

export function initSupport() {
  initRays();
  initFormTitle();
}

// Zeffy's script inserts its form as an iframe with no title, so screen readers would announce an
// unnamed frame. The embed stays exactly as Zeffy supplies it: this names the iframe Zeffy inserts
// (copy deck 9), at once if it is already there, otherwise the moment it appears, then stops watching.
// Zeffy's own fallback iframe (data-zeffy-embed-src) carries its own title and is left alone.
function initFormTitle() {
  const host = document.querySelector<HTMLElement>('.give__fill');
  if (!host) return;
  const IFRAME = 'iframe:not([data-zeffy-embed-src])';
  const name = () => {
    const frame = host.querySelector<HTMLIFrameElement>(IFRAME);
    if (frame) frame.title = donationFormTitle;
    return Boolean(frame);
  };
  if (name()) return;
  const watch = new MutationObserver(() => {
    if (name()) watch.disconnect();
  });
  watch.observe(host, { childList: true, subtree: true });
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
