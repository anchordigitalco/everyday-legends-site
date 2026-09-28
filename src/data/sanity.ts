// Sanity, read at build time only. The dataset is public, so the site reads it with no token: never
// add one here, in an env file, or in client code. The Studio lives in studio/ and is never built
// with the site.
export const sanityConfig = {
  projectId: 'dfzf4x6m',
  dataset: 'production',
  apiVersion: '2026-09-01', // pinned; change only on purpose
  useCdn: false,
} as const;
