// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';

import sitemap from '@astrojs/sitemap';

// The canonical domain, the apex (CONTEXT.md, Launch basics). Base.astro builds each page's canonical
// URL from it; the sitemap lists the same addresses (no trailing slash, as the pages are linked and
// served), and leaves out the 404 page.
const SITE = 'https://everydaylegend.com';

export default defineConfig({
  site: SITE,

  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [
    react(),
    sitemap({
      filter: (page) => !/\/404\/?$/.test(new URL(page).pathname),
      serialize: (item) => ({ ...item, url: item.url.replace(/(?<=\.com\/.+)\/$/, '') }),
    }),
  ]
});
