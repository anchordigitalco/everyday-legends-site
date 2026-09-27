// Behaviour every page shares. Loaded once from layouts/Base.astro.

export function initSite() {
  initNav();
  initMidBreaks();
}

// The fixed nav's paper backing fades in once the page leaves the top (CSS: html.nav-backed).
function initNav() {
  const root = document.documentElement;
  const update = () => root.classList.toggle('nav-backed', scrollY > 8);
  update();
  addEventListener('scroll', update, { passive: true });
}

// A line that may break only at its middot ([data-mid-line]: [data-mid-a], [data-mid], [data-mid-b]).
// Where the second half lands below the first, the line is marked .mid-broken: the middot is hidden
// visually (still read by screen readers) and the second half starts its own line (global.css).
// Each check first shows the whole line with its middot, then decides, all before the next paint.
// offsetTop ignores transforms, so the test holds on the rotated invitation card too.
function initMidBreaks() {
  const lines = [...document.querySelectorAll<HTMLElement>('[data-mid-line]')];
  if (!lines.length) return;
  const check = (line: HTMLElement) => {
    const a = line.querySelector<HTMLElement>('[data-mid-a]');
    const b = line.querySelector<HTMLElement>('[data-mid-b]');
    if (!a || !b) return;
    line.classList.remove('mid-broken');
    line.classList.toggle('mid-broken', b.offsetTop >= a.offsetTop + a.offsetHeight * 0.75);
  };
  const run = () => lines.forEach(check);
  let frame = 0;
  run();
  document.fonts.ready.then(run);
  addEventListener('resize', () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(run);
  });
}
