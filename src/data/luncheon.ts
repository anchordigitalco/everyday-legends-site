// The luncheon's state (everyday-legends-copy.md, section 4). `post` until the next date is set: the page
// shows the May 30 recap and the "Buy tickets" CTA MUST NOT render. Switch to `pre`, with the tickets
// link, when tickets go on sale; no rebuild of the page's structure is needed.
export type LuncheonState = 'pre' | 'post';

export const luncheon: { state: LuncheonState; ticketsHref: string | null; sponsorshipUrl: string } = {
  state: 'post',
  ticketsHref: null, // link to be filled when tickets go on sale
  // The Sponsorship CTA, "Sponsorship packages". The packages link is still to be filled; until it
  // arrives the button goes to the Contact form, the site's only channel. Never a mailto.
  sponsorshipUrl: '/contact',
};

// Photo 178, the room behind the invitation on Home and on Legends Among Us: one alt text for both.
export const luncheonPhotoAlt =
  'Jaylen McClain presents the Athletic & Community Impact Award to Brick City Lions at the Legends Among Us luncheon, May 30, 2026.';
