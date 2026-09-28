// In the News (everyday-legends-copy.md, section 3): newsItem documents from Sanity, newest first,
// fetched once at build time. A failed fetch fails the build; an empty dataset returns [] and the
// section does not render at all.
import { createClient } from '@sanity/client';
import { sanityConfig } from './sanity';

export type NewsItem = {
  _id: string;
  headline: string;
  outlet: string;
  date: string; // YYYY-MM-DD
  url: string;
  summary: string;
};

const client = createClient({ ...sanityConfig, perspective: 'published' });

const QUERY = `*[_type == "newsItem" && defined(headline) && defined(outlet) && defined(date) && defined(url) && defined(summary)]
  | order(date desc, _createdAt desc) { _id, headline, outlet, date, url, summary }`;

export async function getNews(): Promise<NewsItem[]> {
  try {
    return await client.fetch<NewsItem[]>(QUERY);
  } catch (err) {
    const why = err instanceof Error ? err.message : String(err);
    throw new Error(
      `In the News: could not fetch newsItem documents from Sanity (project ${sanityConfig.projectId}, ` +
        `dataset ${sanityConfig.dataset}). The build stops here rather than ship the page without them. ${why}`,
    );
  }
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// "2026-09-12" to "Sep 12, 2026". Read from the string, never through Date, so no time zone can
// move it a day.
export function formatNewsDate(date: string) {
  const [y, m, d] = date.split('-').map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}
