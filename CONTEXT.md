# CONTEXT.md: Everyday Legends Foundation

Per-project source of truth. Decisions only. Written September 25, 2026, after Phase 5 chose Brass and Ink. Updated September 26 for About, September 27 for Support and Legends Among Us, September 28 for In the Community and Contact, September 29 for layout edits on Home, About, and In the Community, for the Privacy Policy, and for the Phase 8 QA fixes and launch basics, and October 1 for Phase 8 pass 2, the content update (founding date, camp), and the Zeffy embed.

## How this file works

- Loaded into every session through `@CONTEXT.md` in CLAUDE.md.
- MUST stay under 300 lines. Build history goes in commit messages, never here.
- Editing this file never triggers a stop.
- If this file and a slice prompt disagree, the prompt wins for that slice. Report the conflict at the end of the session. Do not stop for it.
- Stops are for real blockers only: a missing file, or a build you cannot fix.
- `everyday-legends-copy.md` is the only source of copy. Its MUST rules apply to every page.

## Project

- Client: Dr. Syreeta McClain, Co-Founder & Executive Director. Jaylen McClain, Co-Founder.
- Pages: Home, About, In the Community, Legends Among Us, Support, Contact, Privacy Policy, plus a 404 page (not in the nav).
- Stack: Astro 7.3.4 (SSG), Tailwind 4.3.3 (tokens live in CSS, no tailwind.config), gsap 3.15.0. React islands through `@astrojs/react` plus `motion`, added in the Home slice. Vercel. Sanity for In the News only: project `dfzf4x6m`, dataset `production` (public), Studio in `studio/` (never bundled into the site), deployed at everyday-legends.sanity.studio. Jackson makes all updates. At launch, a Sanity webhook triggers a Vercel deploy hook so published news rebuilds the site. Vercel Web Analytics through `@vercel/analytics` (Astro component, last in `<head>` of `Base.astro`): cookieless, switched on in the Vercel project at launch; locally its script 404s, which is expected.
- Contact form: Formspree form `mdekyelo` on the foundation's own account. Cloudflare Turnstile public site key in `src/data/contact.ts`. Formspree's CAPTCHA is on: the Turnstile secret key is set in Formspree and lives only there, never in the repo.
- EIN 39-4769708 is verified. Use it exactly as the copy deck has it.
- Donations: Zeffy, link pending. No payments in our code. Every Donate points to `/support`, where the Zeffy form is embedded. Until the link arrives, the form area holds an honest placeholder.
- No email address on the site, anywhere. MUST NOT render the foundation's address as text, in a mailto, in an attribute, in a script, or in structured data, on any page. The Contact form is the only channel. Proof on every slice from Contact on: `grep -rn "@everydaylegend.com\|mailto:" dist/` returns nothing.
- References, never built and never copied visually: `reference/wireframes/` (structure only), `reference/21st/` (motion only).

## Governing concept

The site is a hall of honor. You enter through the arch in her mark, and inside, the foundation's names hang on a brass rail like plaques in a public building. Every recurring object is architectural: the niche, the rail, the plaque, the inscription, the cornerstone, the slab, the register. The invitation card is the one object laid down at an angle.

How it resolves on the web:
- A building is walked through; a page is scrolled. Home is the only page that moves you: the intro takes you through the arch once, and the hall walks you along the wall.
- Inner pages stand still. Each opens in a niche (her arch as a static frame) holding that page's photo, with two exceptions. Legends Among Us opens on the invitation card laid on the room photo. Support's header is a plain slab, and the arch sits lower on the page as the frame around the donation form. The arch does not move. Contact's niche holds only the torch.
- The dark wall exists only in the intro. After it, the paper page is the inside of the building. There are two exceptions. The invitation band on Home and Legends Among Us: from 900px it sits on ink beside the room photo; under 900px the card sits on paper below the photo. And Support's doorway: the arch around the donation form, filled in `--color-give`.

## Home intro (built)

- Built in code from `brand_assets/everyday-legends-mark.svg`, a flat drawing throughout. MUST NOT add 3D, perspective, extrusion, or any shape not in the SVG.
- About 3.2s: rays light center outward, a glow builds in the arch, the flame flickers, the mark scales up and resolves to paper `#F2EADB`, then the hero fades up.
- Once per session (`el-intro-seen`). Any input skips to the end. Never renders with reduced motion. A head script decides before first paint, so there is no flash. Hero content and nav are in the HTML from the start and usable from the first frame.

## Palette (locked)

| Token | Hex | Allowed uses |
|---|---|---|
| ink | #15120E | Text, primary buttons, Support slab, footer, intro wall, menu panel |
| paper | #F2EADB | Page surface, text on ink |
| paper-deep | #E4D7BF | Secondary surfaces, secondary buttons, photo tint |
| brass | #A9844F | Rails, drop lines, card frame, button hover fill |
| brass-light | #C9A76A | Focus rings only |
| gold | #DDAF3C, #D8B450 | Rays inside the mark only |
| lamp, lamp-edge | #F6D9A0, #2A2016 | The intro's arch glow only |
| color-give | #000000 | Support's arch fill only: the Zeffy card's own color, sampled from the loaded form |

- Brass MUST NOT be used as text on paper (2.9:1). Paper text MUST NOT sit on brass. Ink on brass passes (5.4:1).
- Every text pairing MUST meet 4.5:1, or 3:1 for text 24px and larger.
- Accent budget, counted per page. Focus rings and button hover fills are system states and are not counted.
  - Gold: 0 uses outside the mark.
  - Brass on Home: exactly 4 placements. Hall double rail, hall drop lines, Mission rail with its drop lines, invitation card double frame.
  - Brass on each inner page: 3 placements or fewer. List them in that slice's report.
- Materials come from palette, type, and CSS grain only. MUST NOT use AI texture art or image textures.
- Every color comes from a token. No raw hex outside the token block. Button hovers follow the 21st.dev button spec.
- Default Tailwind colors are banned.

## Typography

- Display: Fraunces. `font-weight: 900` for weight, plus `font-variation-settings: "opsz" 144, "SOFT" 0, "WONK" 0` on every display style. MUST NOT set wght inside font-variation-settings.
- Body: Bricolage Grotesque 300. Text under 16px (nav links, small UI labels) may use 400. Nothing else uses 400.
- Fonts are self-hosted through Fontsource, main files preloaded. No outside font requests.
- Labels: Bricolage Grotesque `wght 600`, uppercase, tracked, as built in Phase 5.
- Fraunces loads from its full variable file. MUST NOT swap to the lighter opsz-only file: it has no WONK axis and draws a different ampersand and h, m, n.
- Display to body size ratio of 3x or more from 440px up; 2.5x or more below 440px, so the hero title fits without orphans.
- No orphans anywhere, with no exceptions: any text block that wraps ends with at least two words on its last line, at every width. A two-word name (an honoree or a program) never wraps; longer names wrap balanced. A hyphenated compound never splits across lines, including in Sanity news text (`in-the-community.astro` wraps them in `.nowrap`; the text itself never changes). "Among Us" never splits wherever "Legends Among Us" renders. Titles and ledes use `text-wrap: balance`, body uses `text-wrap: pretty`, and `orphans.mjs` confirms it. One word alone on a first or middle line is fine.
- Every display size grows continuously with the viewport and never gets smaller as the window widens.
- The middot `·` is copy and is never replaced. A middot that falls at a line break is hidden visually and stays in the text.

## Photos

- Black and white (Yamean Studios / McKee Place, files ending `-137`, `-119`, `-117`, `-48`, `-53`, `-20`, `-9`): the day itself. Speeches, the room, the story.
- Studio (`KNOW_shoot_5.jpg`): Dr. McClain's portrait, color. Leadership only.
- Color (`Everyday_Legends_2026_*`, `RahwayPALAward.jpg`, `ELRahwayPAL.webp`, `adj_McClainCamp--175.jpg`): the honorees and the community work. `ELSalvationArmy.webp` stays in `brand_assets/`, unused. One exception by Jackson's call: 251 beside About's Our Story.
- The Rahway PAL photo shows the foundation's bank numbers on the check. MUST be swapped for the masked version before launch or any push. Home card 1 and In the Community entry 3 both read it from `community.ts`, so one swap fixes both.
- The black and white files carry a baked-in watermark. Use them as they are until clean files arrive. MUST NOT crop, paint, or edit it out.
- Black and white files go in an arch only when tall, so the watermark stays in frame; wide ones run full frame. Color files may crop into an arch, with a focal point set per file.
- Leadership portraits render in grayscale plus the paper-deep tint so both founders match. CSS only, files untouched.
- Every content photo goes through `astro:assets` with real alt text. MUST NOT set content photos as CSS backgrounds. Alt text MUST NOT name anyone, or any award or title, that the copy deck does not name.
- Niche photos are delivered at no fewer pixels than they display, at 1x and 2x density. `Niche.astro` works out `widths` and `sizes` from the arch height and the photo's aspect ratio, since a landscape file cropped into a tall arch displays far wider than the arch. If a source file is itself too small, report it as a clean-file request. 222 and 210 run slightly short only at 1920 on 2x screens; full-size files are requested.
- Page grain stays fixed to the viewport. Its seam at viewport height shows only in full-page screenshots, never to visitors. Not a defect.
- Photo treatment as built in Phase 5 (paper-deep tint through `mix-blend-multiply`). One file per slot so each swaps cleanly.

| Slot | File |
|---|---|
| Home, Legends in Action card 1 | ELRahwayPAL.webp |
| Home, Legends in Action card 2 | adj_McClainCamp--175.jpg (focal 50% 100%, so the 2:1 crop cuts only sky) |
| Home, Legends in Action card 3 | -137 |
| Home, Legends Among Us | 178 |
| Legends Among Us, invitation | 178 (same file as Home) |
| Legends Among Us recap | -20 and -53 as a pair, then -119 closing. Three photos. |
| Legends Among Us honorees | 222 Natasha, 210 Nathan, 190 Seton Hall Prep, RahwayPALAward.jpg Rahway PAL (focal on the plaque), 177 Brick City Lions |
| In the Community, niche header | 219 (focal on Natasha, 56%) |
| In the Community entries | adj_McClainCamp--175.jpg camp, 148 luncheon, ELRahwayPAL.webp (same files as Home) |
| About, niche header | -9 (Jaylen and his brother; alt text names only Jaylen) |
| About, beside Our Story | 251, full frame (alt text names only Nathan Bailey) |
| About, beside the torch line | -48, full frame |
| About, Leadership | KNOW_shoot_5 (Dr. McClain), -117 (Jaylen) |

## Motion

- Animate transform and opacity only. Never `transition-all`.
- Scroll-driven moments: exactly 2. The Home hall and the About torch line. The cap is 3, and the third slot stays empty unless Jackson approves one. Support does not use it. Everything else plays once when it enters view.
- The Legends Among Us honorees are a static hall. The wireframe's side scroll there is superseded.
- Easing: movement uses spring-style easing or the menu curve `[0.22, 1, 0.36, 1]`. Pure opacity fades (glow, overlays, flicker) use sine, unless a 21st.dev Keep list names a curve.
- Every animation has a reduced-motion state that shows final content with no movement.
- No empty screens. At every scroll position, something with content is in view.

## 21st.dev islands

Source files sit in `reference/21st/`. Keep every motion value listed under "Keep" exactly. Change only what is listed under "Change". Below-the-fold islands load with `client:visible`; the nav loads with `client:load`.

1. `text-reveal.tsx`, Mission lede.
   Keep: per word, slide preset (opacity 0 to 1, y 20 to 0), 0.05s stagger, 0.3s per word.
   Change: plays once when 30% in view. Reduced motion shows static text. Blur presets never used.
2. `hover-reveal-cards.tsx`, Legends in Action rows and About Leadership.
   Keep: hovered image scales to 1.05; siblings scale to 0.97 at opacity 0.6; 500ms ease-in-out; focus-visible matches hover.
   Change: no blur, no `transition-all`, real images through `astro:assets`, applied to the three alternating rows (never a card grid), Brass and Ink styling. Touch devices get no hover effect.
3. `interactive-hover-button.tsx`, every solid button on the site.
   Keep: label slides out right and fades; a second label with an arrow slides in; 300ms.
   Change: default state is a solid fill, never an outline. The fill grows by transform scale from a dot, never by width, height, top, or left. Renders as `<a>`, except a form submit, which is a `<button>`. The fill's starting dot stays hidden at rest so it never counts as brass. Auto width. Pressed state scales to 0.97. Focus-visible matches hover.
   - Primary: ink fill, paper text. Hover: brass fill, ink text.
   - Secondary: paper-deep fill, ink text. Hover: ink fill, paper text.
   - On ink surfaces: paper fill, ink text. Hover: brass fill, ink text.
4. `liquid-morph-floating-menu.tsx`, phone nav under 900px.
   Keep: easing `[0.22, 1, 0.36, 1]`; ink circle rise 0.8s after a 0.1s delay; links fade in over 0.4s starting at 0.4s + 0.08s × index; hamburger to X, each bar rotating 45° over 0.4s.
   Change: trigger at top right, never floating at the bottom. The ink circle scales up (transform) from the trigger into a full-screen ink panel. No per-letter hover roll. Real links. A real button with `aria-expanded`. Escape closes. Focus stays inside while open. Body scroll locked while open. Tapping outside or tapping a link closes it. The bars stay paper on the ink trigger. Fonts and colors from this file.

Mission pillars are custom gsap, not 21st.dev: each drop line grows from the rail (scaleY 0 to 1, 0.5s), then its plaque drops from y -24px to 0 with a slight overshoot. 0.12s stagger. Plays once. About's What we do reuses it with fuller plates.

About adds no new 21st.dev components. Its other motion is custom gsap: the niche photo settles on load (0.9s: scale 1.06 to 1 on the menu curve, opacity 0 to 1 on sine), the torch line, the inscription rising line by line out of a mask, and the We aim to stair entrance.

## Shared shell

- `src/layouts/Base.astro` holds the head, grain, nav, and footer. Its `current` prop sets aria-current on the nav and phone menu links.
- Shared behavior lives in `src/scripts/site.ts`. Page scripts hold only that page's motion.
- Shared motion (menu curve, in-view trigger, plate drop) lives in `src/scripts/motion.ts`. Rail markup: `.hang`, `.hang__rail`, `.hang__pillars`. Rail plates from 900px: side padding clamp(1.25rem, 4vw - 1rem, 2rem), gap at least 1rem.
- `Niche.astro` is every arch (About, In the Community and Contact headers, portraits, Support form frame, Legends honorees). `tint={false}` drops the photo tint (Contact's torch).
- `src/data/torch.ts` holds the torch crop for About's marker and Contact's niche. `Cornerstone.astro` is the one stone for About and Support (aria-hidden, no brass). Its founding line uses the same uppercase ink label as the 501(c)(3) line.
- Nav links live in `src/data/nav.ts`; pages take paths from there. Its `supportHref` is every Donate's target.
- `src/data/community.ts` holds the three community entries (title, deck, body, photo, focal point, alt). Home's Legends in Action cards read their titles, bodies, and focal points from it. In the Community runs camp, luncheon, Rahway PAL; Home runs Rahway PAL, camp, luncheon.
- `SupportSlab.astro` is the one Support slab (Home, In the Community). Its `brief` prop drops Body and Marginalia.
- `SettleHead.astro` plus `motion.ts` and `global.css` hold the niche settle and the fade-up shared by Home, About, and In the Community.
- `src/data/sanity.ts` holds the Sanity config (no token, ever). `src/data/news.ts` fetches In the News at build time.
- `Invitation.astro` is the one invitation card (Home, Legends Among Us), copy passed as props. `src/data/luncheon.ts` holds its pre/post state (now `post`), the 178 alt text, and `sponsorshipUrl`.
- `src/data/honorees.ts` holds the five honorees for both halls: name, award, body, tier, photo, focal point, alt.
- Section titles use `.section-title` in global.css: one continuous size across all widths, never smaller at a wider width, and at least 1.3x every entry, pillar, bust, and headline title on the same page (honoree names in the halls are exempt). The 1.3x rule exempts page h1s, including the Legends invitation card title. On About and In the Community the h1 always stays larger than `.section-title`, aiming for 1.15x; between 440 and about 733px the body floor wins and the h1 runs about 1.1x. Accepted. Only About's Founders title keeps its 4-column formula, and it also never shrinks as the window widens. Niche photo styles live in global.css too.
- `Base.astro` also holds the canonical link, Open Graph and Twitter tags, and the favicon set (see Launch basics).
- Anchors clear the fixed nav through `scroll-padding-top` on html; no per-section scroll-margin.

## Nav and footer

- Nav uses the mark only. At 900px and up: mark left; About, In the Community, Legends Among Us, Contact, and Donate right. Under 900px: mark left; Donate and the menu trigger right.
- Donate is a solid primary button, visible at every width at all times, and repeated inside the open menu.
- The nav is fixed to the top of the screen, so Donate is always visible.
- Footer, on ink: full lockup; `© 2026 Everyday Legends Foundation, Inc. All rights reserved.`; Instagram · @everydaylegendsfoundation (URL from `instagramUrl` in `contact.ts`); Privacy Policy; the Anchor Digital logo with "Built by Anchor Digital", linking to anchordigitalco.com in a new tab. No address, no phone.

## Home as built

Space tokens `--space-tight`, `--space-standard`, `--space-generous`, each at least 1.5x the one before. 12-column grid.
1. Hero on paper: intro, then fade up. The hall's rail is visible in the first viewport at 1440×900 and 390×844.
2. Hall: pinned side scroll (scroll-driven 1), 150vh max. Five honorees in program order, names only, from `src/data/honorees.ts`. A vertical list under 900px and in reduced motion.
3. Our Mission: text reveal on the lede; text-only plaques drop from the brass rail. At most 1.2 viewports tall. From 900px, title and lede on the left; body and the "About the foundation" button as one block in cols 8–12, the body's first line level with the title's top, the button under it at `--space-tight`. The rail follows the taller column. Nothing sits below the plaques. Under 900px: title, lede, body, button, rail.
4. Legends in Action: three alternating photo rows in copy deck order, spotlight hover, no dates. Tallest on Home. From 900px, row 3 (photo and text as one unit) is centered: whitespace left of the photo equals whitespace right of the row's visible text (its longest line), not its text box.
5. Legends Among Us: the card settles to its angle, the only rotated element on the site. The location line breaks only at the middot.
6. Support: ink slab, full version (not `brief`), fade up. No newsletter until a provider exists; it returns only with a working backend.
- Home height spread, tallest to shortest: 3:1 or more from 900px. Lowered from 4:1 when the Newsletter left; Jackson approved 3.48:1 at 1440 by eye.

## Inner pages

Each slice fills its own rows from its wireframe at the start of that slice. These parts are fixed now:
- About: niche header carrying Our Vision; Our Story with the page's one pull quote set as a full-width inscription; Founders' Story as the longest section, with the torch line (scroll-driven 2) beside the torch sentence; "We aim to" as three lines stepping down and right; What we do; Leadership as portraits in arch niches, founders large, board smaller, staggered, and complete with 2 people or 4; Accountability as the cornerstone.
  - About niche: her arch from mark path 1 (semicircle head, straight sides, flat base), 0.72 width to height, one hairline ink frame, photo on an inset inner arch, anchored center bottom. No rays, no brass.
  - Torch marker: viewBox crop `2026 1324 216 449` of mark paths 0 and 7, brass, paper outline. It rides the fill head and locks at the torch sentence.
  - Founders grid: from 1410px up, side cols 1–4 (sticky), line col 5, copy cols 6–12. From 900 to 1409px, title full width above; line col 1, photo centered on the page (equal whitespace both sides), paragraphs at 64ch. From 1410px the photo fills copy cols 6–12, since centering would cover the sticky column.
  - Our Story: cols 2–8, with 251 in cols 9–12, top level with the body's first line, no crop, no arch, rising 24px once in view (`riseInView`). Under 900px, 251 runs full width after the body. It never touches the pull quote band.
  - Pull quote: full-bleed paper-deep band, ink hairlines, Fraunces display clamp(2.25rem, 5.9vw, 7rem), SplitText line rise (0.8s, 0.12s stagger), read once by screen readers.
  - We aim to: title in label style on purpose. Lines Bricolage 300 at 1.2–1.5x Home's lede, cols 1–8 / 3–10 / 5–12 under ink hairlines; step clamp(1rem, 6vw, 3rem) under 900px. Rule draws 0.5s, then line slides from -24px 0.5s, 0.18s apart.
  - What we do: Home's rail and plate drop. Plates hold deck plus sentence: deck width at 900px up, 18em below.
  - Leadership: founders cols 1–5 / 8–12 (3.5-col arches), board cols 2–5 / 8–11 (2.5-col arches), each second bust lower by arch height ÷ 3. Stacked under 900px, arch max 22rem. Hover reveal is pointer only, no focus state, since busts are not links.
  - Founders is the longest section by copy. Leadership may run taller where portraits stack. Accepted.
  - About brass: 2 of 3 (torch line, What we do rail).
- In the Community: niche header, entries rail, In the News, closing slab.
  - Header: About's niche treatment and composition, 219. The h1 keeps "the Community" together with a non-breaking space.
  - Entries: three, identical, in `community.ts` order. No dates. A brass double rail runs along the entries' left edge at every width; from 900px each entry sits in cols 2–8, photo at 2:1, text block aligned to its left edge. Titles are h2. No links, buttons, or kickers. Each rail segment grows, then its content rises 24px, 0.12s apart.
  - In the News: Sanity `newsItem` (headline, outlet, date, url, summary of 25 words max; all required; no image field). Build-time fetch, newest first, useCdn false. A fetch error fails the build; zero items renders nothing, heading included. Text-only cards on ink hairlines, cols 3–10 from 900px (centered; text left-aligned), each card one link to a new tab. Hairline draws, then the card fades in, 0.08s apart.
  - Closing slab: `<SupportSlab brief />` with Home's fade up.
  - Community brass: 1 of 3 (rail).
- Legends Among Us: invitation, recap, honorees hall, Sponsorship. Section spread at least 7:1 at every width.
  - Invitation: `Invitation.astro` in its post state ("Next luncheon · date to be announced", no Buy tickets) on 178, full bleed, starting under the nav. The card title is the page's h1. It settles to its 2° angle once on load; the photo stays still.
  - Recap: the Body opens it, centered on the middle axis (cols 3–10, 46ch, 1.25x body). Then -20 and -53 side by side at one height (cols 2–11, flex-grow set to each aspect ratio), then -119 closing, cols 3–10. No photo overlaps another, none is cropped. Photos rise 24px once in view, 0.12s stagger. Under 900px: Body, -53, -20 (max 28rem, centered), -119.
  - Hall: two tiers in program order, no logos. People: Natasha cols 2–6, Nathan cols 9–12 set lower; niches 1.4x `--hall-niche`; About's niche settle, 0.15s apart. Programs hang from Home's double rail on brass drop lines: niches at `--hall-niche` (2.5 cols), cols 1–4 / 5–9 / 10–12 at drops of 1, 3 and 2 units; plate drop, 0.12s apart. Each name takes its own line above the award; `--program-name` stays 0.8x `--person-name`. Program bodies stay staggered with their drops; the three awards share one measure so they wrap alike. Under 900px: one column, no rail, niches max 22rem / 16rem.
  - Sponsorship (`#sponsorship`): full-bleed paper-deep band, static. Title h2 at `--program-name` in cols 1–6; body and primary button in cols 7–12, bottom-aligned. Button href is `sponsorshipUrl`, `/contact` until the packages link arrives. Never a mailto.
  - Legends brass: 3 of 3 (card frame, hall rail, hall drop lines).
- Support: ink slab (no niche), then the gift, then the sponsorship pointer.
  - Slab: static, not full-screen; title is the h1 in label style, lede at display scale. Under 900px, bottom padding `--space-generous`.
  - Gift (`#give`): from 900px, cols 1–5 hold body, cornerstone, tax paragraph, sticky beside the arch in cols 7–12; under 900px, body, arch, cornerstone, tax paragraph. The arch is `Niche.astro`'s frame variant, height set by content: About's hairline and paper gap, then an inset inner arch filled edge to edge, dome included, in `--color-give`, so the card's edges vanish. The form starts at the inner springline and sits flush on the jambs and base.
  - Rays: the mark's ray paths in brass behind the frame, placed as in the mark and scaled down only to clear the viewport; never behind text. The page's only motion: one opacity fade at 20% in view, center outward.
  - The form and frame never animate. Zeffy: v2 script embed exactly as supplied, sized by the form (no fixed height, no inner scroll); dashboard color #000000, dark mode. Nothing inside the iframe is styled; Zeffy's own wrapper is backed in `--color-give` so its white never shows at the corners. If Zeffy's color changes, re-sample and update the token.
  - Pointer: static, centered, ink hairline above, secondary button to `/legends-among-us#sponsorship`.
  - On `/support`, Donate points to `#give`. Brass: 1 of 3 (rays).
- Contact: niche header, the register, Instagram marginalia. No newsletter. The page has no motion.
  - Header: About's niche composition holding only the torch (`torch.ts`), brass, 44% of the arch height tall and centered in the arch, no tint; h1 and lede. Static from first paint: no SettleHead, no settle.
  - Register: from 900px, form cols 1–7, marginalia cols 9–12 behind an ink hairline; under 900px, form then marginalia. Name, email, message in Bricolage 300 on ink hairline rules, no boxes. Field names `name`, `email`, `message` (reply-to comes from `email`); hidden `_gotcha` honeypot and `_subject`.
  - States: per-field errors under the rule, which thickens 1px to 2px, with aria-invalid and aria-describedby; focus goes to the first invalid field; errors clear once valid. Sending uses aria-disabled, one request per send. Sent: the coda replaces the form and takes focus. Send failed: the deck line in a live region, values kept.
  - Formspree through fetch; without JS the form posts through `action`. Turnstile renders explicitly on /contact only, Managed mode, always visible above the button at its normal size, light theme. A send waits for its token (posting the moment one arrives), never posts without one, fails after 30s or a Turnstile error, and resets the widget after any failed send.
  - The Instagram middot follows the site-wide rule.
  - Contact brass: 1 of 3 (torch).
- Privacy Policy: plain text page at `/privacy`, linked from every footer. The quietest page: no niche, photo, motion, or button; brass 0 of 3. From 900px one column inside cols 3–10, centered, at most 63.4ch (the longest body line fills it, so its whitespace matches both sides), text left-aligned; full width below. h1 at `.section-title`, effective line in label style, lede at Home's lede scale, Decks as Fraunces h2 with `word-spacing: 0.12em`, Coda after an ink hairline. The only link in the text is "contact form" in the Coda. The policy's claims MUST stay true: the site sets no cookies, and the only outside requests are Cloudflare on `/contact` and Zeffy on `/support`. Any new service goes into the policy first.

## Breakpoints

- One structural breakpoint: 900px, matching the wireframes.
- Under 900px: single column, collapsed nav, hall as a vertical list, every grid window collapses to full width. The invitation card MUST NOT overflow at 375px.
- Verification widths for every slice: 375, 390, 430, 768, 899, 900, 901, 1024, 1280, 1409, 1410, 1440, 1920. 1409 and 1410 cover About's Founders switch.
- Reduced motion at any width: intro skipped, hall as a vertical list, every reveal static.
- Screenshot animated sections with reduced motion emulated or at their end state.

## Standing rules (each from a real failure)

1. The hall pin never exceeds 150vh. The Phase 5 hall ran long.
2. No dead scroll. Phase 5 left two empty screens between the arch and the hall.
3. No orphans anywhere. The Phase 5 card had two and slice 2 left a third.
4. Every button is solid with 4.5:1 text. "About the foundation" read as a ghost button in Phase 5.
5. Nothing overlaps unintentionally at any scroll position or width. The Phase 5 title overlapped the arch.
6. No 3D and no video in the intro. The Runway take read as cheap CGI.
7. No section shares the same entrance, column window, and height as its neighbor. The McClain build produced identical sections.
8. This file stays under 300 lines. The McClain CONTEXT.md passed 4,000 and fell behind git.
9. Placeholder text for pending lines matches its register and word budget.
10. Never use the 4322 dev server after a build in this repo. Serve dist/ on 4323 with `astro preview`, and tell Jackson to restart 4322 with `--force`. A build during Contact wiped Vite's cache and stopped Home's scripts.
11. Any change to a page's entrance gets motion-on proof, not only reduced motion. Contact's torch sat hidden for 2.5s and reduced-motion screenshots missed it.
12. Display sizes never shrink as the window widens. Phase 8 QA found section titles dropping from 72px to 51px at 900 and 1410.
13. Check scripts carry no exception this file does not record. `orphans.mjs` hid an unrecorded exception that let two-word names stack.

## Launch basics

- Canonical domain: `https://everydaylegend.com`, the apex, set as `site` in `astro.config.mjs`. At launch, www redirects to the apex in Vercel.
- Every page's canonical URL matches the URL the page is actually served at. Routing and `trailingSlash` stay as built.
- `Base.astro` sets the canonical link, `og:title`, `og:description` (the page's existing meta description, verbatim), `og:url`, `og:image` with its alt, `og:type` website, `og:site_name` Everyday Legends Foundation, and `twitter:card` summary_large_image.
- One shared OG image, `public/og.png`, 1200×630: the footer's full lockup on ink, as the footer renders it. No photos until honoree consent and clean files arrive.
- Favicon set: the SVG, a 32px `favicon.ico`, and a 180px `apple-touch-icon.png`, all from the current crop. When the tighter crop is approved, all three swap together.
- `@astrojs/sitemap` and `public/robots.txt` (allow all, plus the sitemap line). The 404 page is not in the sitemap.
- 404: `src/pages/404.astro` on `Base`, copy from deck section 8. The one page with `noindex`, and no canonical or `og:url`. Privacy's composition: one centered column in cols 3–10, h1 at `.section-title`, lede at Home's lede scale, one primary button to `/`. No niche, photo, or motion. Brass 0 of 3.
- None of these add an outside request, so the Privacy Policy stays true as written.

## Pending client approval (build as written, keep swappable)

"In the Community" as the page title; "Inaugural class, 2026" as the hall label; mark-only nav with the full lockup in the footer; Home card 3 wording; a tighter favicon crop of the EL and torch; the About Leadership portraits and their grayscale treatment; the Support sponsorship pointer's body and button; scholarship recipients left off both honorees halls; In the News with its title and lede; the camp and Rahway PAL deck lines on In the Community; Home card 2's camp body (our cut of her paragraph); no email address on the site; the Contact form copy; the Sponsorship button pointing to Contact; Home's Newsletter removed; photo 251 beside Our Story; the Privacy Policy text; the 404 copy.

## Open client items that touch the build

- Zeffy link, for the form embedded on `/support`.
- Honoree consent to be named publicly. Names render in the build; launch waits on consent.
- The camp photo shows children. It needs a parent's OK, or confirmation the camp's photo release covers the website, before launch.
- Clean, unwatermarked photo files (including full-size 222 and 210) and the credit line.
- Board names (Leadership works with 2 or 4), Jaylen's Leadership line (researched placeholder in the copy deck, pending her approval), sponsorship packages link (goes in `luncheon.ts` `sponsorshipUrl`).
- Newsletter provider. Until one exists, no newsletter anywhere on the site.
- Instagram URL, currently assumed to be instagram.com/everydaylegendsfoundation.
- Scholarship wording decision. Do not change the copy until she answers.
