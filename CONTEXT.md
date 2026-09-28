# CONTEXT.md: Everyday Legends Foundation

Per-project source of truth. Decisions only. Written September 25, 2026, after Phase 5 chose Brass and Ink. Updated September 26 for About, September 27 for Support and Legends Among Us, September 28 for In the Community.

## How this file works

- Loaded into every session through `@CONTEXT.md` in CLAUDE.md.
- MUST stay under 300 lines. Build history goes in commit messages, never here.
- Editing this file never triggers a stop.
- If this file and a slice prompt disagree, the prompt wins for that slice. Report the conflict at the end of the session. Do not stop for it.
- Stops are for real blockers only: a missing file, or a build you cannot fix.
- `everyday-legends-copy.md` is the only source of copy. Its MUST rules apply to every page.

## Project

- Client: Dr. Syreeta McClain, Co-Founder & Executive Director. Jaylen McClain, Co-Founder.
- Pages: Home, About, In the Community, Legends Among Us, Support, Contact, Privacy Policy.
- Stack: Astro 7.3.4 (SSG), Tailwind 4.3.3 (tokens live in CSS, no tailwind.config), gsap 3.15.0. React islands through `@astrojs/react` plus `motion`, added in the Home slice. Vercel. Sanity for In the News only: project `dfzf4x6m`, dataset `production` (public), Studio in `studio/` (never bundled into the site), deployed at everyday-legends.sanity.studio. Jackson makes all updates. At launch, a Sanity webhook triggers a Vercel deploy hook so published news rebuilds the site.
- EIN 39-4769708 is verified. Use it exactly as the copy deck has it.
- Donations: Zeffy, link pending. No payments in our code. Every Donate points to `/support`, where the Zeffy form is embedded. Until the link arrives, the form area holds an honest placeholder.
- References, never built and never copied visually: `reference/wireframes/` (structure only), `reference/21st/` (motion only).

## Governing concept

The site is a hall of honor. You enter through the arch in her mark, and inside, the foundation's names hang on a brass rail like plaques in a public building. Every recurring object is architectural: the niche, the rail, the plaque, the inscription, the cornerstone, the slab, the register. The invitation card is the one object laid down at an angle.

How it resolves on the web:
- A building is walked through; a page is scrolled. Home is the only page that moves you: the intro takes you through the arch once, and the hall walks you along the wall.
- Inner pages stand still. Each opens in a niche (her arch as a static frame) holding that page's photo, with two exceptions. Legends Among Us opens on the invitation card laid on the room photo. Support's header is a plain slab, and the arch sits lower on the page as the frame around the donation form. The arch does not move. Contact's niche holds only the torch.
- The dark wall exists only in the intro. After it, the paper page is the inside of the building. The one exception is the invitation band on Home and Legends Among Us, which sits on ink beside the room photo.

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
- Labels: Bricolage Grotesque `wght 600`, uppercase, tracked, as built in Phase 5.
- Display to body size ratio of 3x or more from 440px up; 2.5x or more below 440px, so the hero title fits without orphans.
- No orphans anywhere: any text block that wraps ends with at least two words on its last line, at every width. Titles and ledes use `text-wrap: balance`, body uses `text-wrap: pretty`, and `orphans.mjs` confirms it. One word alone on a first or middle line is fine.
- The middot `·` is copy and is never replaced. A middot that falls at a line break is hidden visually and stays in the text.

## Photos

- Black and white (Yamean Studios / McKee Place, files ending `-137`, `-119`, `-117`, `-48`, `-53`, `-20`, `-9`): the day itself. Speeches, the room, the story.
- Studio (`KNOW_shoot_5.jpg`): Dr. McClain's portrait, color. Leadership only.
- Color (`Everyday_Legends_2026_*`, `RahwayPALAward.jpg`, `ELRahwayPAL.webp`, `ELSalvationArmy.webp`): the honorees and the community work.
- The Rahway PAL photo shows the foundation's bank numbers on the check. MUST be swapped for the masked version before launch or any push. Home card 1 and In the Community entry 2 both read it from `community.ts`, so one swap fixes both.
- The black and white files carry a baked-in watermark. Use them as they are until clean files arrive. MUST NOT crop, paint, or edit it out.
- Black and white files go in an arch only when tall, so the watermark stays in frame; wide ones run full frame. Color files may crop into an arch, with a focal point set per file.
- Leadership portraits render in grayscale plus the paper-deep tint so both founders match. CSS only, files untouched.
- Every content photo goes through `astro:assets` with real alt text. MUST NOT set content photos as CSS backgrounds. Alt text MUST NOT name anyone the copy deck does not name.
- Photo treatment as built in Phase 5 (paper-deep tint through `mix-blend-multiply`). One file per slot so each swaps cleanly.

| Slot | File |
|---|---|
| Home, Legends in Action card 1 | ELRahwayPAL.webp |
| Home, Legends in Action card 2 | ELSalvationArmy.webp |
| Home, Legends in Action card 3 | -137 |
| Home, Legends Among Us | 178 |
| Legends Among Us, invitation | 178 (same file as Home) |
| Legends Among Us recap | -20 and -53 as a pair, then -119 closing. Three photos. |
| Legends Among Us honorees | 222 Natasha, 210 Nathan, 190 Seton Hall Prep, RahwayPALAward.jpg Rahway PAL (focal on the plaque), 177 Brick City Lions |
| In the Community, niche header | 219 (focal on Natasha, 56%) |
| In the Community entries | 148 luncheon, ELRahwayPAL.webp, ELSalvationArmy.webp (same files as Home) |
| About, niche header | -9 (Jaylen and his brother; alt text names only Jaylen) |
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
- `Niche.astro` is every arch (About header, portraits, Support form frame, Legends honorees). `Cornerstone.astro` is the one stone for About and Support (aria-hidden, no brass).
- Nav links live in `src/data/nav.ts`; pages take paths from there. Its `supportHref` is every Donate's target.
- `src/data/community.ts` holds the three community entries (title, deck, body, photo, focal point, alt). Home's Legends in Action cards read their titles and bodies from it.
- `SupportSlab.astro` is the one Support slab (Home, In the Community). Its `brief` prop drops Body and Marginalia.
- `SettleHead.astro` plus `motion.ts` and `global.css` hold the niche settle and the fade-up shared by Home, About, and In the Community.
- `src/data/sanity.ts` holds the Sanity config (no token, ever). `src/data/news.ts` fetches In the News at build time.
- `Invitation.astro` is the one invitation card (Home, Legends Among Us), copy passed as props. `src/data/luncheon.ts` holds its pre/post state (now `post`), the 178 alt text, and `sponsorshipUrl`.
- `src/data/honorees.ts` holds the five honorees for both halls: name, award, body, tier, photo, focal point, alt.
- Section titles use `.section-title` in global.css, sized to About's Founders title. Niche photo styles live in global.css too.
- Anchors clear the fixed nav through `scroll-padding-top` on html; no per-section scroll-margin.

## Nav and footer

- Nav uses the mark only. At 900px and up: mark left; About, In the Community, Legends Among Us, Contact, and Donate right. Under 900px: mark left; Donate and the menu trigger right.
- Donate is a solid primary button, visible at every width at all times, and repeated inside the open menu.
- The nav is fixed to the top of the screen, so Donate is always visible.
- Footer, on ink: full lockup; `© 2026 Everyday Legends Foundation, Inc. All rights reserved.`; info@everydaylegend.com; Instagram · @everydaylegendsfoundation; Privacy Policy; the Anchor Digital logo with "Built by Anchor Digital", linking to anchordigitalco.com in a new tab. No address, no phone.

## Home as built

Space tokens `--space-tight`, `--space-standard`, `--space-generous`, each at least 1.5x the one before. 12-column grid.
1. Hero on paper: intro, then fade up. The hall's rail is visible in the first viewport at 1440×900 and 390×844.
2. Hall: pinned side scroll (scroll-driven 1), 150vh max. Five honorees in program order, names only, from `src/data/honorees.ts`. A vertical list under 900px and in reduced motion.
3. Our Mission: text reveal on the lede; text-only plaques drop from the brass rail. At most 1.2 viewports tall.
4. Legends in Action: three alternating photo rows in copy deck order, spotlight hover, no dates. Tallest on Home.
5. Legends Among Us: the card settles to its angle, the only rotated element on the site. The location line breaks only at the middot.
6. Support: ink slab, fade up. 7. Newsletter: shortest; no backend yet, so no success state.
- Home height spread, tallest to shortest: 4:1 or more.

## Inner pages

Each slice fills its own rows from its wireframe at the start of that slice. These parts are fixed now:
- About: niche header carrying Our Vision; Our Story with the page's one pull quote set as a full-width inscription; Founders' Story as the longest section, with the torch line (scroll-driven 2) beside the torch sentence; "We aim to" as three lines stepping down and right; What we do; Leadership as portraits in arch niches, founders large, board smaller, staggered, and complete with 2 people or 4; Accountability as the cornerstone.
  - About niche: her arch from mark path 1 (semicircle head, straight sides, flat base), 0.72 width to height, one hairline ink frame, photo on an inset inner arch, anchored center bottom. No rays, no brass.
  - Torch marker: viewBox crop `2026 1324 216 449` of mark paths 0 and 7, brass, paper outline. It rides the fill head and locks at the torch sentence.
  - Founders grid: from 1410px up, side cols 1–4 (sticky), line col 5, copy cols 6–12. From 900 to 1409px, title full width above; line col 1, photo cols 2–12, paragraphs at 64ch.
  - Our Story: cols 2–8. Pull quote: full-bleed paper-deep band, ink hairlines, Fraunces display clamp(2.25rem, 5.9vw, 7rem), SplitText line rise (0.8s, 0.12s stagger), read once by screen readers.
  - We aim to: title in label style on purpose. Lines Bricolage 300 at 1.2–1.5x Home's lede, cols 1–8 / 3–10 / 5–12 under ink hairlines; step clamp(1rem, 6vw, 3rem) under 900px. Rule draws 0.5s, then line slides from -24px 0.5s, 0.18s apart.
  - What we do: Home's rail and plate drop. Plates hold deck plus sentence: deck width at 900px up, 18em below.
  - Leadership: founders cols 1–5 / 8–12 (3.5-col arches), board cols 2–5 / 8–11 (2.5-col arches), each second bust lower by arch height ÷ 3. Stacked under 900px, arch max 22rem. Hover reveal is pointer only, no focus state, since busts are not links.
  - Founders is the longest section by copy. Leadership may run taller where portraits stack. Accepted.
  - About brass: 2 of 3 (torch line, What we do rail).
- In the Community: niche header, entries rail, In the News, closing slab.
  - Header: About's niche treatment and composition, 219. The h1 keeps "the Community" together with a non-breaking space.
  - Entries: three, identical, in `community.ts` order. No dates. A brass double rail runs along the entries' left edge at every width; from 900px each entry sits in cols 2–8, photo at 2:1, text block aligned to its left edge. Titles are h2. No links, buttons, or kickers. Each rail segment grows, then its content rises 24px, 0.12s apart.
  - In the News: Sanity `newsItem` (headline, outlet, date, url, summary of 25 words max; all required; no image field). Build-time fetch, newest first, useCdn false. A fetch error fails the build; zero items renders nothing, heading included. Text-only cards on ink hairlines, cols 4–11 from 900px, each card one link to a new tab. Hairline draws, then the card fades in, 0.08s apart.
  - Closing slab: `<SupportSlab brief />` with Home's fade up.
  - Community brass: 1 of 3 (rail).
- Legends Among Us: invitation, recap, honorees hall, Sponsorship. Section spread at least 7:1 at every width.
  - Invitation: `Invitation.astro` in its post state ("Next luncheon · date to be announced", no Buy tickets) on 178, full bleed, starting under the nav. The card title is the page's h1. It settles to its 2° angle once on load; the photo stays still.
  - Recap: the Body opens it, centered on the middle axis (cols 3–10, 46ch, 1.25x body). Then -20 and -53 side by side at one height (cols 2–11, flex-grow set to each aspect ratio), then -119 closing, cols 3–10. No photo overlaps another, none is cropped. Photos rise 24px once in view, 0.12s stagger. Under 900px: Body, -53, -20 (max 28rem, centered), -119.
  - Hall: two tiers in program order, no logos. People: Natasha cols 2–6, Nathan cols 9–12 set lower; niches 1.4x `--hall-niche`; About's niche settle, 0.15s apart. Programs hang from Home's double rail on brass drop lines: niches at `--hall-niche` (2.5 cols), cols 1–4 / 5–9 / 10–12 at drops of 1, 3 and 2 units; plate drop, 0.12s apart. Each name takes its own line above the award; program names are 0.8x people's (`--program-name`). Under 900px: one column, no rail, niches max 22rem / 16rem.
  - Sponsorship (`#sponsorship`): full-bleed paper-deep band, static. Title h2 at `--program-name` in cols 1–6; body and primary button in cols 7–12, bottom-aligned. Button href is `sponsorshipUrl`, a mailto until the packages link arrives.
  - Legends brass: 3 of 3 (card frame, hall rail, hall drop lines).
- Support: ink slab (no niche), then the gift, then the sponsorship pointer.
  - Slab: static, not full-screen; title is the h1 in label style, lede at display scale. Under 900px, bottom padding `--space-generous`.
  - Gift (`#give`): from 900px, cols 1–5 hold body, cornerstone, tax paragraph, sticky beside the arch in cols 7–12; under 900px, body, arch, cornerstone, tax paragraph. The arch is `Niche.astro`'s frame variant, height set by content.
  - Rays: the mark's ray paths in brass behind the frame, placed as in the mark and scaled down only to clear the viewport; never behind text. The page's only motion: one opacity fade at 20% in view, center outward.
  - The form and frame never animate. Zeffy: v2 script embed, sized by the real form; until then a paper-deep placeholder, height `--give-embed-h`.
  - Pointer: static, centered, ink hairline above, secondary button to `/legends-among-us#sponsorship`.
  - On `/support`, Donate points to `#give`. Brass: 1 of 3 (rays).
- Contact: niche holding only the torch; the register form on ruled lines with no boxes, with empty, per-field error, sending, and sent states, routing to info@everydaylegend.com; newsletter.
- Privacy Policy: plain text page, linked from every footer.

## Breakpoints

- One structural breakpoint: 900px, matching the wireframes.
- Under 900px: single column, collapsed nav, hall as a vertical list, every grid window collapses to full width. The invitation card MUST NOT overflow at 375px.
- Verification widths for every slice: 375, 390, 430, 768, 899, 900, 901, 1024, 1280, 1440, 1920.
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

## Pending client approval (build as written, keep swappable)

"In the Community" as the page title; "Inaugural class, 2026" as the hall label; mark-only nav with the full lockup in the footer; Home card 3 wording; a tighter favicon crop of the EL and torch; the About Leadership portraits and their grayscale treatment; the Support sponsorship pointer's body and button; scholarship recipients left off both honorees halls; In the News with its title and lede; the Rahway PAL and Salvation Army deck lines on In the Community.

## Open client items that touch the build

- Zeffy link, for the form embedded on `/support`.
- Honoree consent to be named publicly. Names render in the build; launch waits on consent.
- Clean, unwatermarked photo files and the credit line.
- Founding year (cornerstone placeholder), board names (Leadership works with 2 or 4), Jaylen's Leadership line (researched placeholder in the copy deck, pending her approval), sponsorship packages link (goes in `luncheon.ts` `sponsorshipUrl`).
- Newsletter provider, for the form backend.
- Instagram URL, currently assumed to be instagram.com/everydaylegendsfoundation.
- Scholarship wording decision. Do not change the copy until she answers.
