// The main nav, in order. Base.astro renders it (desktop links and the phone menu); pages that link to
// another page take its path from here, so each path lives in one place.
export const navLinks = [
  { label: 'About', href: '/about' },
  { label: 'In the Community', href: '/in-the-community' },
  { label: 'Legends Among Us', href: '/legends-among-us' },
  { label: 'Contact', href: '/contact' },
];

// Every Donate on the site goes here (the Support page, where the Zeffy form is embedded).
export const supportHref = '/support';

export const hrefOf = (label: string) => {
  const link = navLinks.find((l) => l.label === label);
  if (!link) throw new Error(`nav.ts: no nav link labelled "${label}"`);
  return link.href;
};
