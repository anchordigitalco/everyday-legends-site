// Consent to be named is pending. Not for deploy.
// Inaugural class, 2026, in program order (everyday-legends-copy.md, section 4, Honorees). Name, award,
// and body are verbatim from the copy deck. Scholarship recipients are not listed on the site.
// Home's hall reads the names; the Legends Among Us hall renders every field.
// Photos per the CONTEXT.md slot table. `focal` is the photo's object-position inside its arch.
// TODO before launch or any push: swap ELRahwayPAL.webp for the masked file (bank numbers on the check).
import natashaPhoto from '../../brand_assets/Everyday_Legends_2026_222_websize.jpg';
import nathanPhoto from '../../brand_assets/Everyday_Legends_2026_210_websize.jpg';
import setonHallPhoto from '../../brand_assets/Everyday_Legends_2026_190_websize.jpg';
import rahwayPhoto from '../../brand_assets/ELRahwayPAL.webp';
import brickCityPhoto from '../../brand_assets/Everyday_Legends_2026_177_websize.jpg';

// Also the alt text of Home's Legends in Action card 1 (index.astro), which shows the same photo.
export const rahwayAlt =
  "Jaylen McClain, Dr. Syreeta McClain, and the Police Athletic League's Dan Marchica and Darius Singletary with the foundation's donation check to Rahway PAL, under the league's banner.";

export type Honoree = {
  name: string;
  award: string;
  body: string;
  tier: 'person' | 'program';
  photo: ImageMetadata;
  focal: string;
  alt: string;
};

export const honorees: Honoree[] = [
  {
    name: 'Natasha Davis-Gomez',
    award: 'Community Trailblazer Award',
    body: 'Natasha Davis-Gomez is a real estate developer, licensed general contractor, and nationally certified construction trainer with years of experience in community development and residential construction.',
    tier: 'person',
    photo: natashaPhoto,
    focal: '63% 0',
    alt: 'Natasha Davis-Gomez at the lectern with her award at the Legends Among Us luncheon.',
  },
  {
    name: 'Nathan Bailey',
    award: 'Young Legend Award',
    body: 'Nathan Bailey is an exceptional student-athlete at St. Joseph Regional High School, where he has distinguished himself as a leader, scholar, and elite football player.',
    tier: 'person',
    photo: nathanPhoto,
    focal: '38% 0',
    alt: 'Nathan Bailey speaks at the lectern at the Legends Among Us luncheon.',
  },
  {
    name: 'Seton Hall Prep Football Program',
    award: 'Athletic Programs Honoree',
    body: 'Seton Hall Prep Football has long stood as a model of excellence, not only in athletic achievement but in the holistic development of young men.',
    tier: 'program',
    photo: setonHallPhoto,
    focal: '40% 0',
    alt: "Representatives of the Seton Hall Prep Football Program hold the program's award plaque at the Legends Among Us luncheon.",
  },
  {
    name: 'Rahway Police Athletic League',
    award: 'Athletic Programs Honoree',
    body: 'The Rahway Police Athletic League is a nonprofit youth development organization founded in 1995 and dedicated to strengthening the connection between young people and the law enforcement professionals who serve the City of Rahway.',
    tier: 'program',
    photo: rahwayPhoto,
    focal: '46% 0',
    alt: rahwayAlt,
  },
  {
    name: 'Brick City Lions',
    award: 'Athletic Programs Honoree',
    body: 'Founded in 2012, the Brick City Lions is more than a youth football and cheer organization, it is a transformative community movement dedicated to developing champions both on and off the field.',
    tier: 'program',
    photo: brickCityPhoto,
    focal: '60% 0',
    alt: "Members of the Brick City Lions hold the organization's award plaque at the Legends Among Us luncheon.",
  },
];
