# SEO Audit Report

**Site**: Everyday Legends Foundation (Astro SSG), preview at https://everyday-legends-site.vercel.app, canonical domain https://everydaylegend.com
**Pages Analyzed**: 8. The 7 pages in CONTEXT.md (Home, About, In the Community, Legends Among Us, Support, Contact, Privacy Policy) plus the 404.
**Overall Score**: 86/100
**Base commit**: `4a9bfaa` SEO: add skill and overrides. Branch `seo-audit`. Report only: nothing outside `audit/` changed.
**Run**: October 2, 2026, against the live preview (main at `4a9bfaa`, deployed). Method: `node audit/seo.mjs` (served HTML with JavaScript off, every slash variant, sitemap, robots, OG files, email grep, old site), `curl -sI` by hand, and Lighthouse 13.5.0 mobile (simulated throttling, 412px). Raw output in `audit/raw/seo.json` and `audit/raw/lighthouse/` (gitignored).

The score is high because the head, canonicals, sitemap, robots, OG tags, and images are all correct today. The points come off for four things: the old site's three indexed pages have no redirects yet (this blocks launch), there's no structured data, the preview can be indexed, and the trailing-slash forms of each page return 200.

---

## Critical Issues (must fix)

- [ ] **The old site's indexed pages will 404 at launch.** `everydaylegend.com` currently serves a GoDaddy Website Builder site. Its sitemap lists `/about-the-foundation`, `/legends-among-us-lunch`, `/past-events`, and `/ols/products`. None of these exist on the new build, and there's no `vercel.json`. Once DNS moves to Vercel, every search result and saved link to them will hit the 404. Fix: the 301s under "Old URLs", added to a new `vercel.json` in the fix pass, after Jackson approves them. Proof: `curl` of the old site, and `audit/raw/seo.json` → `old`.

## Warnings (should fix)

- [ ] **No structured data on any page.** `jsonld=0` on all 8. The proposed Organization block is below, under "Proposed Organization JSON-LD". It goes in Home's existing `<Fragment slot="head">` (`src/pages/index.astro:35`).
- [ ] **The preview can be indexed.** `everyday-legends-site.vercel.app` sends no `X-Robots-Tag`, robots.txt allows everything, and every page carries a canonical. Vercel adds `noindex` only to per-deploy preview URLs, not to the project's `.vercel.app` production alias. That means honoree names and the camp photo could show up in search before consent arrives. The canonicals point to the apex, which reduces this risk but doesn't remove it. The fix options are both outside this pass's scope: Vercel Deployment Protection, or a host-matched `X-Robots-Tag: noindex` header (OVERRIDES limits `vercel.json` to 301s). **Jackson decides.**
- [ ] **Each page answers at three addresses.** `/about`, `/about/`, and `/about/index.html` all return 200. The same is true for every page (`audit/raw/seo.json` → `variants`). All three forms carry the same canonical (`https://everydaylegend.com/about`), so Google consolidates them and nothing is broken. The clean fix is `"trailingSlash": false` in `vercel.json`. That is a 308, not a 301, so it falls outside what OVERRIDES allows there. **Jackson decides.** If approved, check on a deploy that `/about` still returns 200 with no redirect.
- [ ] **Until launch, the head points to the old host.** `og:image` (`https://everydaylegend.com/og.png`) returns 404 today because GoDaddy serves that domain. A link to the preview therefore unfurls with no image. The `og:url`, the canonicals, and the robots.txt `Sitemap:` line also point to the apex. All of this is correct for launch and fixes itself when DNS moves. Nothing to change. Check one share after launch.

## Opportunities (nice to have)

- [ ] **Google Search Console at launch.** Verify the domain with a DNS TXT record. That changes nothing on the site and adds no outside request. Then submit `https://everydaylegend.com/sitemap-index.xml` and check the Pages report until the four old URLs show as redirected. Bing Webmaster Tools can import the same property. Needs DNS access (see "Needs Dr. McClain").
- [ ] **301 `/sitemap.xml` → `/sitemap-index.xml`.** Google knows the old site's `/sitemap.xml`. The new build serves its index at `/sitemap-index.xml`, and `/sitemap.xml` returns 404. This is included in the proposed redirects.
- [ ] **Optional Organization fields, each a decision for Jackson** (not in the block below):
  - `"@type": "NGO"` instead of `"Organization"`. NGO is a schema.org subtype of Organization, and Google accepts both.
  - `"taxID": "39-4769708"`, the EIN exactly as the copy deck has it (deck lines 123, 201, 292).
  - `"nonprofitStatus": "Nonprofit501c3"`. Supported by the deck's 501(c)(3) line.
  - `"legalName": "Everyday Legends Foundation, Inc."`. Verbatim from the deck and the footer.
- [ ] **`decoding="async"` on the footer logo.** It is the only below-the-fold `<img>` without it, so this is within scope. The gain is negligible, and it changes nothing visually.

## Passing

- **Titles**: present and unique on all 8 pages. They run 27 to 52 characters, all built as "Deck title · Everyday Legends Foundation" (Home is the name alone). None is over 65.
- **Descriptions**: present and unique, and each one is verbatim from the copy deck:

  | Page | Deck source |
  |---|---|
  | Home | Home lede |
  | About | Our Vision lede |
  | In the Community | lede |
  | Legends Among Us | lede |
  | Support | lede |
  | Contact | body |
  | Privacy | lede |
  | 404 | lede |

  They run 31 to 104 characters, all under 170. Per OVERRIDES, length is not judged. In the Community's 31 characters may lead Google to show page text in its place, which needs no action.
- **Canonicals**: every indexable page has a self-referencing canonical on the apex, with no trailing slash (`/` for Home). On the preview, each one's path returns 200 with no redirect, and each matches its sitemap `<loc>` exactly (7 of 7). The launch-checklist item "Vercel serves `/about` without redirecting to `/about/`" is confirmed on the preview.
- **404**: unknown paths return a real `404` status (`/does-not-exist`, with and without the slash, and `/404`). The page carries `noindex` and has no canonical or `og:url`, as CONTEXT.md sets. It isn't in the sitemap.
- **Sitemap**: `/sitemap-index.xml` → `/sitemap-0.xml` holds the 7 indexable URLs, all on the apex, all 200 on the preview, with no 404 and no redirects. It has no `lastmod`, which Google largely ignores.
- **robots.txt**: `Allow: /` plus `Sitemap: https://everydaylegend.com/sitemap-index.xml`. It blocks no CSS, JS, or images.
- **Open Graph**: every page has the full set: `og:title`, `og:description` (the meta description verbatim), `og:url` (except the 404), `og:type` website, `og:site_name`, `og:image` with width, height, and alt. `og.png` is 1200×630 PNG, served 200 on the preview.
- **Twitter**: `twitter:card` `summary_large_image` on every page. X falls back to `og:title`, `og:description`, and `og:image` when `twitter:title`, `twitter:description`, and `twitter:image` are absent, so separate tags would only duplicate them.
- **Favicons**: `favicon.ico` (32), the SVG mark, and `apple-touch-icon.png` (180×180) all return 200.
- **Head basics**: `lang="en"`, the viewport meta, and `charset` are on every page. Each page has exactly one `<h1>`.
- **Images** (served HTML, JavaScript off; 38 `<img>` across 8 pages):
  - Every `<img>` has an `alt`. The nav mark and footer lockup use `alt=""` inside links that carry an `aria-label`, which is correct.
  - Every `<img>` has `width` and `height`.
  - Every below-the-fold photo is `loading="lazy" decoding="async"`.
  - The header photos (About -9, In the Community 219, Legends Among Us 178) are eager.
  - Every content photo is WebP from `astro:assets` with a `srcset`.
- **Email grep**: the served HTML of all 8 pages contains no email address and no `mailto:`.
- **Lighthouse mobile**: SEO 100, Accessibility 100 on all three pages; CLS 0 and TBT 0 everywhere (full table below).
- **Transport**: HTTPS with HSTS (`max-age=63072000; includeSubDomains; preload`) from Vercel. TTFB is 20 to 40 ms.
- **URLs**: lowercase, hyphenated, one level deep, no query strings.

### Lighthouse (mobile, preview)

| Page | Perf | A11y | Best practices | SEO | FCP | LCP | TBT | CLS | Speed Index | LCP element |
|---|---|---|---|---|---|---|---|---|---|---|
| Home | 95 | 100 | 100 | 100 | 1.3 s | 2.5 s | 0 ms | 0 | 4.4 s | `p.hall__year` (text) |
| Support | 98 | 100 | 73 | 100 | 1.1 s | 2.3 s | 0 ms | 0 | 1.1 s | `p.give__body` (text) |
| Contact | 98 | 100 | 100 | 100 | 1.1 s | 2.3 s | 0 ms | 0 | 1.1 s | `p.niche-hdr__lede` (text) |

Reports: `audit/raw/lighthouse/{home,support,contact}.report.html`.

- Home's Speed Index of 4.4 s comes from the intro. Lighthouse loads in a fresh session, so the 3.2 s intro plays.
- Support's Best Practices score of 73 comes entirely from Zeffy's iframe, not our code (see "Out of scope, noted").

---

## Needs copy

- **Titles and descriptions: none flagged.** None is missing, none is duplicated, and none is over 65 or 170 characters.
- **Alt text: none missing.** Every `<img>` has an `alt`.
- For the record, two kinds of string aren't in the copy deck. Both are present and working, so they're listed for the deck owner, not for a rewrite. This pass changes neither.
  - `og:image:alt` ("The Everyday Legends Foundation logo on a dark ground.", `src/layouts/Base.astro:61`) was written in the Launch basics pass. The deck has no line for it. It needs approval or a deck line.
  - Photo alt text lives in `src/data/community.ts`, `src/data/honorees.ts`, and the page files, under CONTEXT.md's alt-text rules. The deck has no alt-text section. Spot check: every person named in alt text is also named in the deck.

## Needs Dr. McClain

- **Instagram URL.** Confirm `https://www.instagram.com/everydaylegendsfoundation/`. Until she does, the Organization block has no `sameAs`.
- **Other official profiles for `sameAs`.** Does the foundation have Facebook, LinkedIn, or a Candid profile (the handoff suggests claiming one)? Only profiles she confirms go in.
- **Domain and DNS access.** The redirects below take effect only once `everydaylegend.com` points to Vercel. Search Console verification also needs a DNS TXT record. (This is already a launch blocker in the handoff.)
- **Existing Search Console or GoDaddy SEO settings.** Did she or GoDaddy ever verify the domain in Google Search Console? If so, adding Anchor Digital as a user keeps the site's search history. If not, we verify fresh at launch.

## Old URLs

What `https://everydaylegend.com` serves today:
- **Sources checked**: its `/sitemap.xml` (an index of `/sitemap.website.xml` and `/sitemap.ols.xml`), every URL those list, and the paths linked from its nav.
- **Server**: GoDaddy Website Builder (`Server: DPS/2.0.0`).
- **Robots**: `robots.txt` disallows only `/404`.
- **Redirects already in place**: `http://` 308s to `https://`, and `www.` 301s to the apex.
- **Slash variants**: every page also answers 200 with a trailing slash.
- **Catch-all**: `/ols/products/<anything>` returns 200.
- **Guessed paths**: `/contact`, `/donate`, `/about`, `/blog`, `/shop`, `/events`, `/privacy-policy`, and `/ols` all return 404 today.

| Old path (200 today) | Old page title / headings | New path | Proposed |
|---|---|---|---|
| `/` | "everydaylegend.com" / Everyday Legends Foundation, Legends in Action | `/` | No redirect; same URL |
| `/about-the-foundation` (and `/`) | "About the Foundation" / Our Vision, What we do | `/about` | 301 |
| `/legends-among-us-lunch` (and `/`) | "Legends Among Us Lunch" / The Legends Amoung Us Fundraiser, Interested in Sponsoring? | `/legends-among-us` | 301 |
| `/past-events` (and `/`) | "Past Events" / Everyday Legends in the Community, Salvation Army Partnership | `/in-the-community` | 301 |
| `/ols/products` (and `/ols/products/*`) | GoDaddy's empty online store; it renders the home page | **no match** | 301 to `/`. Or leave it as a 404, since Google treats a home-page redirect for an unrelated page as a soft 404 either way. **Jackson decides.** |
| `/sitemap.xml` | the old sitemap index | `/sitemap-index.xml` | 301 |

The old child sitemaps (`/sitemap.website.xml`, `/sitemap.ols.xml`) and `/manifest.webmanifest` have no match and can 404.

Proposed `vercel.json` for the fix pass, **only once Jackson approves**. It's a new file, since the repo has none.
- `"statusCode": 301` is set on purpose: Vercel's `"permanent": true` sends a 308.
- The slash forms are listed explicitly so they don't depend on how Vercel's path matching treats a trailing slash. After deploy, verify each one with `curl -sI`.

```json
{
  "redirects": [
    { "source": "/about-the-foundation", "destination": "/about", "statusCode": 301 },
    { "source": "/about-the-foundation/", "destination": "/about", "statusCode": 301 },
    { "source": "/legends-among-us-lunch", "destination": "/legends-among-us", "statusCode": 301 },
    { "source": "/legends-among-us-lunch/", "destination": "/legends-among-us", "statusCode": 301 },
    { "source": "/past-events", "destination": "/in-the-community", "statusCode": 301 },
    { "source": "/past-events/", "destination": "/in-the-community", "statusCode": 301 },
    { "source": "/ols/products", "destination": "/", "statusCode": 301 },
    { "source": "/ols/products/:path*", "destination": "/", "statusCode": 301 },
    { "source": "/sitemap.xml", "destination": "/sitemap-index.xml", "statusCode": 301 }
  ]
}
```

At launch (already on the handoff list): `www` → apex in Vercel's domain settings. Vercel handles `http` → `https` itself.

## Proposed Organization JSON-LD

**Where it goes: Home only.** Add it inside Home's existing `<Fragment slot="head">` (`src/pages/index.astro:35`), with no change to `Base.astro`.
- Google reads Organization data from the home page, and the block describes the foundation, not any one page. Putting it on all 7 pages repeats the same entity with no gain.
- Home only keeps it off the `noindex` 404.
- About is the only other page the skill names. Home covers it.

Fields follow OVERRIDES exactly:
- `name`, `url` (the apex), `foundingDate` 2025-10-08.
- `logo` as an absolute URL.
- `description` verbatim from the copy deck: the Home lede, which is also Home's meta description.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Everyday Legends Foundation",
  "url": "https://everydaylegend.com",
  "logo": "https://everydaylegend.com/apple-touch-icon.png",
  "foundingDate": "2025-10-08",
  "description": "Supporting scholars, athletes, and community leaders who exemplify excellence and impact."
}
</script>
```

- **Logo.** `/apple-touch-icon.png` is a stable root URL, a 180×180 PNG of her mark, which meets Google's 112px minimum. The SVG mark is served from a hashed `/_astro/` path that changes when the file changes, so it can't be used here. When the tighter favicon crop is approved, the logo changes with it. The alternative is a dedicated `public/logo.png` made from the lockup. That's a new file in the fix pass, so **Jackson decides**.
- **Left out on purpose:**
  - `sameAs`, until the Instagram URL is confirmed.
  - `contactPoint`, `telephone`, `email`, and `address` (OVERRIDES, and the no-email rule).
  - Article, NewsArticle, Event, Person, Review, FAQ, and `aggregateRating`.
- **No other schema is proposed.**
  - In the News items link out to other outlets' articles, so NewsArticle would describe pages that aren't ours.
  - The luncheon is in its post state with no next date, so there's no Event to describe.
  - There's no FAQ content.
- **Optional additions** (`@type` NGO, `taxID`, `nonprofitStatus`, `legalName`): see Opportunities. Each is Jackson's call.
- After the fix pass: test with Google's Rich Results Test, and run the email grep again.

## Out of scope, noted

No fix is proposed for any of these in this pass.

- **Zeffy's iframe on `/support` loads a long list of third-party trackers.**
  - Lighthouse saw requests to Stripe, hCaptcha, Cloudflare Turnstile, Google Tag Manager, DoubleClick, Meta Pixel (`connect.facebook.net`), LinkedIn Insight, HubSpot, Microsoft Clarity, Amplitude, Bing, Cookiebot, Datadog, and Google Maps and Pay. That's about 60 hosts and 15.7 MB on the test run. Our own requests are 426 KB.
  - The third-party cookies (`__cf_bm` from Zeffy and HubSpot hosts, `CLID` from Clarity) and the Google Pay console errors behind the Best Practices score of 73 all come from inside Zeffy's frame.
  - The Privacy Policy says we set no cookies of our own and that the donation form "comes from Zeffy … and follows their policies". That still holds. But CONTEXT.md's phrase "the only outside requests are … Zeffy on /support" understates what Zeffy's frame does.
  - **Jackson decides** whether the policy should say more. Any wording change is new copy that needs Dr. McClain's approval.
- **Image weight.** Lighthouse estimates 362 KiB of savings on Home: 137 saves 209 KiB, camp 108 KiB, Rahway PAL 45 KiB. These are `srcset`/`sizes` choices against display size. The camp file's `src` fallback is the 2500px original (819 KB). This is report only: re-encoding and resizing are off limits.
- **Image file names.** The black-and-white files keep names like `Everyday Legends Foundation Luncheon- Yamean Studios Mckee Place Creative Nikon Ambassador-137`, with spaces and mixed case. Renaming is off limits. The names can be tidied when the clean, unwatermarked files arrive.
- **`fetchpriority="high"` is missing on Legends Among Us's 178 photo.** It's eager, but unlike the About and In the Community header photos it has no `fetchpriority`. That attribute isn't on OVERRIDES' list. Today's LCP on the pages tested is text, but 178 is the first image on Legends Among Us.
- **`og.png` is 645 KB.** Some messaging apps skip preview images over about 300 KB. Off limits per OVERRIDES.
- **Unused JavaScript**: 65 KiB on every page tested (React runtime and island client). This is a bundle question.
- **Render-blocking CSS**: `Base.*.css`, an estimated 120 to 160 ms on Contact. This is a CSS delivery question.
- **Home's Speed Index of 4.4 s** is the once-per-session intro, by design (CONTEXT.md, Home intro).
- **Security headers**: no CSP. Vercel supplies HSTS. Report only: a CSP can break Zeffy and Turnstile.
- **Headings, internal links, touch targets, font sizes, contrast**: these were covered by the ADA audit. Lighthouse Accessibility scores 100 on all three pages. Each page has exactly one `<h1>`.
