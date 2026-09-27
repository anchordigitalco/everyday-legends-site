import { initPillars, settleInView } from './motion';

// The hall's entrances, each once at 20% in view; reduced motion shows the final state. No pin, no
// scroll-driven motion, no hover.
export function initLegends() {
  // Programs: the shared plate drop, drop line then niche, 0.12s apart.
  initPillars(document.querySelector<HTMLElement>('[data-pillars]'), 0.2);
  // People: About's niche settle, the second 0.15s after the first.
  settleInView(document.querySelector<HTMLElement>('[data-people]'), 0.2, 0.15);
  // The script has taken over from the head script's hidden state, so the CSS failsafe stands down.
  document.documentElement.classList.add('el-hall-js');
}
