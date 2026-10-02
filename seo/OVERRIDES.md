# SEO overrides: Everyday Legends Foundation

Read this after the three SKILL.md files in this folder. The skills are a checklist written for generic sites, mostly Next.js. Where any skill conflicts with this file or with CONTEXT.md, this file and CONTEXT.md win.

## Scope

- MUST limit fixes to: `<head>` tags, JSON-LD structured data, `robots.txt`, the sitemap, and image attributes (`alt`, `width`, `height`, `loading`, `decoding`).
- MUST NOT change layout, motion, CSS, copy, or body markup other than image attributes.
- Anything a skill flags outside that scope (heading structure, internal links, touch targets, font sizes, contrast, render blocking, bundle size) MUST go in the report under "Out of scope, noted". No fix is proposed for it in this pass.
- The site is Astro (SSG). MUST ignore Next.js checks (`next/image`, Server Components, `generateMetadata`).

## Copy

- MUST NOT write or rewrite titles, meta descriptions, alt text, or schema descriptions. Every string comes from the copy deck.
- MUST NOT optimize copy for length or keywords. The skill's length targets and "include the target keyword" do not apply to this site.
- Flag a title or description under "Needs copy" only if it is missing, duplicated across pages, or long enough to truncate badly (titles over 65 characters, descriptions over 170).
- Flag missing alt text under "Needs copy". Decorative images keep `alt=""`.

## Structured data

- One Organization block. Fields: `name`, `url` (`https://everydaylegend.com`), `logo` (absolute URL), `foundingDate` `"2025-10-08"`. `description` only if verbatim from the deck.
- The report MUST state which pages carry it (site-wide or Home only) and why. It MAY note `NGO` as an alternative `@type`; Jackson decides.
- MUST NOT add `sameAs` until Dr. McClain confirms the Instagram URL. List it under "Needs Dr. McClain".
- EIN: list as a decision for Jackson. If approved, it goes in exactly as the copy deck has it.
- MUST NOT add `contactPoint`, `telephone`, `email`, or `address`, even though the skill's Organization template includes `contactPoint`.
- MUST NOT add Article, NewsArticle, Event, Person, Review, FAQ, or `aggregateRating` schema. Propose them in the report only if the page content already supports them.

## Outside requests and scripts

- MUST NOT add tracking, analytics, SEO plugins, npm dependencies, fonts, or any new outside request. The Privacy Policy must stay true.
- MUST NOT act on the skills' SearchFit.ai suggestions. No links, scripts, or accounts.
- MUST NOT add security headers (CSP, HSTS). A CSP can break Zeffy and Turnstile. Report only.
- MUST NOT edit `vercel.json` in the report pass. In the fix pass, `vercel.json` may receive 301 redirects only, and only the ones Jackson approves from the report.

## Images

- MUST NOT convert, re-encode, resize, rename, or replace image files. Format and weight findings are report only.
- MUST NOT touch `og.png`. No photos in the OG image until consent and clean files.
- Adding `width`, `height`, or `loading="lazy"` (below the fold only) is allowed only if nothing moves. Verify with screenshots at 320, 375, and 1440 before and after.

## URLs

- Canonicals and sitemap URLs MUST be checked against what the preview actually serves: `curl -sI` each page with and without the trailing slash.

## Old URLs

- The domain already hosts the foundation's current site. The report MUST list every page path that `https://everydaylegend.com` serves today (curl the live pages and its `/sitemap.xml` if one exists), with the matching new path or "no match", and propose 301 redirects for each.

## Email

- No email address anywhere, including JSON-LD and meta tags. The email grep MUST come back empty after the fix pass.

## Report

- Write to `audit/SEO-REPORT.md`. Any script goes in `audit/seo.mjs`.
- Use the skill's sections (Critical, Warnings, Opportunities, Passing) plus three more: "Needs copy", "Needs Dr. McClain", "Out of scope, noted".
- The proposed Organization JSON-LD goes in the report, not in the site.
