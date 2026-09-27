// Behaviour every page shares. Loaded once from layouts/Base.astro.

export function initSite() {
  initNav();
}

// The fixed nav's paper backing fades in once the page leaves the top (CSS: html.nav-backed).
function initNav() {
  const root = document.documentElement;
  const update = () => root.classList.toggle('nav-backed', scrollY > 8);
  update();
  addEventListener('scroll', update, { passive: true });
}
