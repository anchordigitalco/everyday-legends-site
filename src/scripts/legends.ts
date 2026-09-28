import { ANY_MOTION, initPillars, settleInView, settleCard, riseInView } from './motion';

// The page's entrances. The card settles once on load; everything else plays once at 20% in view.
// Reduced motion shows every final state. No pin, no scroll-driven motion, no hover.
export function initLegends() {
  // The invitation: settles to its angle on load, as on Home. The photo behind it stays still.
  settleCard(document.querySelector<HTMLElement>('[data-card]'), ANY_MOTION, true);
  // The recap: each photo rises from 24px with opacity, 0.12s apart.
  riseInView([...document.querySelectorAll<HTMLElement>('[data-rise]')], 0.2, 0.12);
  // The hall's programs: the shared plate drop, drop line then niche, 0.12s apart.
  initPillars(document.querySelector<HTMLElement>('[data-pillars]'), 0.2);
  // The hall's people: About's niche settle, the second 0.15s after the first.
  settleInView(document.querySelector<HTMLElement>('[data-people]'), 0.2, 0.15);
  // The script has taken over from the head script's waiting states, so the CSS failsafes stand down.
  document.documentElement.classList.add('el-card-js', 'el-hall-js');
}
