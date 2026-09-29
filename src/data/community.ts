// In the Community: the three entries, newest first (everyday-legends-copy.md, section 3, Entries).
// Title, deck, and body are verbatim from the copy deck's table. Each title and body is identical to
// its Home card (1.3), so Home's Legends in Action reads them from here: cards 1 and 2 take title,
// body, photo, and alt; card 3 takes title and body (its photo is Home's own). No entry shows a date;
// the luncheon's lives in its title. `deck` is Partner · Place. `focal` is the photo's
// object-position in its 2:1 frame.
// TODO before launch or any push: swap ELRahwayPAL.webp for the masked file (bank numbers on the check).
import luncheonRoomPhoto from '../../brand_assets/Everyday_Legends_2026_148_websize.jpg';
import rahwayPhoto from '../../brand_assets/ELRahwayPAL.webp';
import salvationPhoto from '../../brand_assets/ELSalvationArmy.webp';

export type Entry = {
  title: string;
  deck: [partner: string, place: string];
  body: string;
  photo: ImageMetadata;
  focal: string;
  alt: string;
};

export const entries: Entry[] = [
  {
    title: 'Legends Among\u00a0Us, May 30',
    deck: ['The Highlawn', 'West Orange, New Jersey'],
    body: 'The foundation hosted its inaugural Legends Among\u00a0Us luncheon at The Highlawn in West Orange, New Jersey, honoring three scholars, a Young Legend, a Community Trailblazer, and three athletic programs.',
    photo: luncheonRoomPhoto,
    focal: '45% 30%',
    alt: 'Guests seated at round tables during the Legends Among Us luncheon at The Highlawn.',
  },
  {
    title: 'Support for Youth Basketball League, Rahway PAL',
    deck: ['Rahway PAL', 'Rahway, New Jersey'],
    body: "Jaylen McClain donated to his youth basketball league, Rahway PAL. He is pictured with the Police Athletic League's Dan Marchica and Darius Singletary. Also pictured, Dr. Syreeta McClain, Executive Director of Everyday Legends.",
    photo: rahwayPhoto,
    focal: '50% 50%',
    alt: "Jaylen McClain, Dr. Syreeta McClain, and the Police Athletic League's Dan Marchica and Darius Singletary with the foundation's donation check to Rahway PAL, under the league's banner.",
  },
  {
    title: 'Salvation Army Toy Donation',
    deck: ['Salvation Army', 'Columbus, Ohio'],
    body: 'Jaylen is pictured with Salvation Army leadership during his toy delivery for the Angel Tree Toy Drive, an initiative dedicated to brightening the holidays for children and families in need.',
    photo: salvationPhoto,
    focal: '50% 50%',
    alt: 'Jaylen McClain with Salvation Army leadership during his toy delivery for the Angel Tree Toy Drive.',
  },
];
