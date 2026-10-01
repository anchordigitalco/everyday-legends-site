# Everyday Legends Foundation: Chat Handoff

Rebuild of everydaylegend.com by Anchor Digital. Written October 1, 2026, at the end of the Phase 8 QA fix passes. Supersedes the September 29 Privacy Policy handoff. Process follows `anchor-digital-design-process.md`; technical rules follow `CLAUDE.md`; project decisions live in `CONTEXT.md`.

**Phase 8 fixes are done. Next: a content update (camp, Salvation Army, food collective, founding date), then an ADA (WCAG 2.1 AA) audit, then the SEO audit.**

## Where we are

| Phase | Status |
|---|---|
| 0 to 7 | Done. Direction is Brass and Ink. All 7 pages plus a 404 built |
| 8 QA | Audit done. Fix pass 1 and pass 2 done, every check clean |
| Content update | **Next.** Founding date, camp entry, two Sanity articles, below |
| ADA audit | After the content update. Report only, then one fix pass |
| SEO audit | After the ADA fixes |
| 9 Launch | Not started. Blocked on Dr. McClain's items below |

## People

- **Dr. Syreeta McClain**, Co-Founder & Executive Director. The client.
- **Jaylen McClain**, Co-Founder. Ohio State safety and 2026 team captain. Spelled Jaylen, never Jalen.
- Jackson builds and makes all post-launch updates, including news items in Sanity.

## Repo

- **Path:** `~/Downloads/EverydayLegendsSiteBuild`. No remote. Nothing pushed. Feature branches kept.
- **main:** should end at "Phase 8 fixes, pass 2" (merged from `phase8-fixes`). Before it: "Phase 8 fixes, pass 1" and "CONTEXT: Phase 8 fixes" (`d3a83e1`). If `git log -1` on main doesn't show pass 2, review it on localhost and merge it first (see "First, in the next chat").
- **Stack:** Astro 7.3.4, Tailwind 4.3.3 (tokens in CSS), gsap 3.15.0, `@astrojs/react` + `motion` for islands, `@sanity/client` 8.7.0 for In the News, `@vercel/analytics` 2.0.1, `@astrojs/sitemap` 3.7.4, fonts self-hosted through Fontsource. Fraunces stays on the **full** file (see decisions).
- **New in Phase 8:** `public/` (og.png, favicon.ico, apple-touch-icon.png, robots.txt), `scripts/launch-images.mjs` (run by hand, never in the build), `src/data/grid.ts`, `niches.ts`, `text.ts` (`holdCompounds`), `src/pages/404.astro`.
- **Check scripts:** `orphans.mjs` and `overflow.mjs` default to all 8 pages on 4323, 13 widths, both motion modes. `orphans.mjs` has no exceptions and also flags split hyphenated words and a split "Among Us".
- **Sanity:** project `dfzf4x6m`, dataset `production`, Studio in `studio/`, live at everyday-legends.sanity.studio. The two test items ("Test 2", "Testing") are still live. Delete them when the first real articles go in (this update).
- **Contact form:** Formspree `mdekyelo` on info@everydaylegend.com, owned by the foundation. Cloudflare Turnstile (Invisible). CAPTCHA stays **off** in Formspree until launch.
- **Photos** in `brand_assets/`. Color files end `_NNN_websize.jpg`; black and white end `-NNN_websize.jpg`.
- **Dev server:** port **4322** (`npm run dev -- --port 4322 --host --force`). 4321 is the archived Limestone project. Checks after a build run on a 4323 `astro preview`; restart 4322 with `--force` after any build.
- **Don't mix up the two CONTEXT files.** Dr. McClain's personal site has its own. This one starts "CONTEXT.md: Everyday Legends Foundation".

## Decisions made in this chat (Phase 8)

- **No orphan exceptions.** Two-word names (Natasha Davis-Gomez, Nathan Bailey) never wrap. Longer names wrap balanced. Hyphenated compounds and "Among Us" never split.
- **Section titles:** one continuous size that never shrinks as the window widens. On About and In the Community the h1 always stays larger (aiming for 1.15x). At least 1.3x entry, pillar, bust, and headline titles. Display to body 2.5x under 440px, 3x from 440. Between 440 and about 733px the body floor wins, so the h1 is about 1.1x there. Accepted.
- **Fraunces stays on the full file.** The lighter opsz-only file has no WONK axis and draws a different ampersand and h, m, n. The 54 KB saving is off the table.
- **Page grain stays fixed to the viewport.** The seam at viewport height shows only in full-page screenshots; visitors never see it.
- **Legends programs:** bodies stay staggered with their drops. The three awards share one measure so they wrap alike.
- **Niche photos** are sized from arch height × the photo's aspect ratio. Photos 222 and 210 are slightly short only at 1920 on 2x screens (clean-file request).
- **Launch basics built:** apex canonical (`https://everydaylegend.com`), Open Graph and Twitter tags, OG image = footer lockup on ink (no honoree photos until consent), favicon set, sitemap, robots.txt. The 404 has `noindex` and no canonical.
- **The 404 copy** (deck section 8) is ours and goes on her approval list.

## First, in the next chat

1. Confirm main's latest commit is "Phase 8 fixes, pass 2". If not, review pass 2 on localhost (hall names at 375/390, hall scroll at 1440, About and In the Community titles at 390/768, Legends programs at 900/1024, the 404), then commit and fast-forward main.
2. Write the pass 2 lines into CONTEXT.md and commit them as "CONTEXT: Phase 8 pass 2":
   - Hall and Legends names: two-word names one line, longer names balanced; `--program-name` stays 0.8x `--person-name`.
   - The full `.section-title` rule above, including the 440 to 733px band.
   - The 1.3x rule exempts page h1s, including the Legends invitation card title.
   - Launch basics: the 404 is the one page with `noindex`, no canonical, no og:url.
   - Photos: the grain seam note; 222 and 210 as clean-file requests.
   - Typography: Fraunces stays on the full file, with the reason.
3. Then the content update below.

## Content update: four changes

Jackson has the call on all four; none waits on Dr. McClain. New copy still goes into `everyday-legends-copy.md` first, since the build only takes copy from the deck.

### 1. Founding date: October 8, 2025

Decided: **"Founded October 8, 2025"**, the full date. It fills the "Founded (to be filled)" placeholder everywhere it appears:
- About, Founders' Story marginalia (deck 2.3).
- The cornerstone (`Cornerstone.astro`), shared by About's Accountability and Support. One edit covers both. The stone sets it in its uppercase label style.
- Deck: "Still to come" item 3 comes off; CONTEXT's open items drop "Founding year".
- Later, the SEO audit adds it as `foundingDate` in Organization structured data.

### 2. Camp: new In the Community entry, replacing Salvation Army

Decided: the camp takes Salvation Army's slot in `community.ts`. **Home's Legends in Action cards read from the same file**, so the camp also becomes Home card 2. That's intended unless Jackson places it elsewhere.

Jackson brings to the next chat:
- Which camp (likely the Jaylen McClain Youth Football Camp, named in Jaylen's Leadership line).
- What it is and what the foundation did, so the chat can write the title, deck line (Partner · Place), and a body of about 30 words to match the other entries.
- A photo: color, landscape (it crops to 2:1), plus who's in it for the alt text. Alt text names only people the deck names. If it shows children, have a parent's OK before launch, same rule as the honorees.
- Roughly when it happened, only to set the order (entries run newest first and show no dates).

### 3. Salvation Army: done

The Angel Tree article is in Sanity. Its community entry and Home card 2 go away in the camp prompt (item 2). `ELSalvationArmy.webp` goes unused; keep the file in `brand_assets/`. Its two deck lines (1.3 card 2, section 3 entry 3) are replaced by the camp's.

### 4. Food collective: article in Sanity

Jackson enters it in Studio: the outlet, headline as published, date, URL, and one sentence of 25 words max in our own words (never copied from the article). No code change.

After both real articles are in: delete "Test 2" and "Testing" in Studio, then restart 4322 with `--force` (In the News is fetched at build time).

**One prompt** covers items 1 and 2, once the deck has the founding line and the camp's lines. Items 3 and 4 are Studio work only.

## ADA audit (after the content update)

Target **WCAG 2.1 AA**, the standard the DOJ and courts point to for "ADA compliant" websites, plus WCAG 2.2 AA items where they're cheap. An audit shows conformance; it can't certify legal compliance. Report only first, then one fix pass, same as Phase 8.

Phase 8 already passed headings, rendered contrast (603 runs), keyboard reach and focus, the phone menu's focus trap, screen-reader names ("Donate Donate" ruled out), alt text, form errors and states, and reduced motion. The audit covers what's left:
- **Automated:** axe-core (`@axe-core/puppeteer`, dev dependency only, never shipped) on all 8 pages at 375 and 1440, both motion modes.
- **Skip link (2.4.1):** `Base.astro` has none. Likely a fail; a "Skip to content" link to `<main>` is the standard fix.
- **Reflow at 320px (1.4.10):** our verification widths start at 375. Add 320.
- **Zoom 200% and text spacing (1.4.4, 1.4.12):** nothing clips or overlaps.
- **Hover-only content (1.4.13, 2.1.1):** About's Leadership hover reveal is pointer only. Anything it shows must also reach keyboard and screen-reader users.
- **Focusable rows:** Home's Legends in Action rows have `tabindex="0"` but do nothing. Check they don't add confusing tab stops.
- **Focus under the fixed nav (2.4.11, 2.2):** a focused element must never hide behind it.
- **Target size (2.5.8, 2.2):** buttons, nav, footer links, the menu trigger.
- **Motion:** the intro (about 3s, skippable, off with reduced motion) and the pinned hall.
- **Third parties:** Turnstile and, later, the Zeffy embed. Their accessibility is theirs; note any issue and keep the Contact form's error path usable.
- **Manual pass by Jackson:** 10 minutes of VoiceOver in Safari on Mac and on an iPhone, through Home, Contact (submit with errors), and Support.
- **Decision for her:** an accessibility statement (a short page or Privacy-style section with "contact us through the form if anything is hard to use"). New copy, so it needs approval.

## Standing prompt routine

- Fresh Claude Code session on Opus per slice, started inside the repo. Start a fresh one when a session gets long; commit the branch work first (on the feature branch, never main) so the new session has a clean base.
- Every prompt: read `./frontend-design/SKILL.md`, CONTEXT.md is the source of truth, copy only from the copy deck, MUST and MUST NOT, never commit. First step: confirm the latest commit title (written out) and report its hash; stop if it differs or the tree isn't clean.
- **Before any prompt, commit.** Swapping a file into the folder doesn't commit it. Check that a downloaded file actually landed in `~/Downloads` (`head -1` on it) before moving it; browsers sometimes save elsewhere or rename to "CONTEXT 2.md".
- **Run Terminal checks before Terminal changes.** If a check line fails, stop and paste the output; a later line can still run after an earlier one fails.
- **Terminal commands go in Terminal, not Claude Code.**
- Declare relationships and priorities, never pixel values you haven't measured. Diagnose before fixing.
- Proof every pass: base commit, `git diff --stat` plus untracked files, full-page screenshots of all 8 pages at the 13 widths, motion-on proof for any changed entrance, `orphans.mjs` and `overflow.mjs` clean, the email/mailto grep empty, the privacy check, conflicts with CONTEXT.md.
- Small fixes go into the same session before the commit.
- Jackson reviews on localhost, then commits in Terminal: `git add -A`, commit, `git checkout main`, `git merge --ff-only <branch>`.
- CONTEXT.md stays lean (260 lines). The chat writes lines only after a pass passes review.

## Needs from Dr. McClain

**Time-sensitive, her old site, before the KNOW Women gala on Tuesday, October 6, 2026:** pull the May 30 ticket cards, fix the "Amoung" typo and the browser title.
**Blocks launch:** the Zeffy embed code; honoree consent to be named (a parent's for anyone under 18, which may include Nathan); domain and DNS access; the masked Rahway PAL photo (bank numbers on the check); whether the foundation is registered with the NJ Division of Consumer Affairs.
**Approvals:** the Privacy Policy, including its two practice lines; the 404 copy; photo 251 beside Our Story; no email address on the site; the Contact form copy; the Sponsorship button pointing to Contact; Home's Newsletter removed; scholars left off the halls; the Support sponsorship pointer; Jaylen's placeholder bio; both Leadership portraits in grayscale; board names and titles if any; "Inaugural class, 2026"; Home card 3 wording; "In the Community" as the page title; In the News with its title and lede; the Rahway PAL deck line; mark-only nav with full lockup in the footer; favicon crop; whether the site can say three scholarships were awarded in 2026.
**Content:** sponsorship packages link; Instagram URL confirmation and whether she checks DMs; clean unwatermarked photo files (including full-size 222 and 210) and the credit line.
**Received:** the founding date, October 8, 2025; the Salvation Army article (in Sanity).
**Suggestion:** claim a free Candid profile for a Seal of Transparency.

## At launch (ours)

- Hosting: the Anchor Digital team on the shared Vercel account (adam@anchordigitalco.com primary, jackson@anchordigitalco.com attached). The repo needs a GitHub remote first.
- Confirm Vercel serves `/about` without redirecting to `/about/`, so canonicals and the sitemap match.
- Fill in the Privacy Policy's effective date.
- Turn CAPTCHA on in Formspree, add everydaylegend.com to the Turnstile site key's allowed hostnames, then send a live test from the real domain on a phone (cellular) and check that the `cf-turnstile-response` line no longer shows in the email.
- Switch on Vercel Web Analytics; www redirects to the apex.
- Sanity webhook to a Vercel deploy hook, so a published news item rebuilds the site.
- If a new article doesn't show on localhost, restart the dev server.

## Next steps

1. Start the next chat with this file, CONTEXT.md, and the copy deck.
2. Confirm pass 2 is on main; write and commit the pass 2 CONTEXT lines.
3. Send Dr. McClain the gala fixes for her old site this week.
4. Bring the camp details and photo; the chat writes the deck lines, then one prompt for the founding date and the camp entry. Jackson enters the food collective article and deletes the test items.
5. ADA audit (report only), one fix pass, then the SEO audit, then launch prep once her blockers arrive.
