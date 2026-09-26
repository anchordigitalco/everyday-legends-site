# CONTEXT.md: Everyday Legends Foundation

Per-project source of truth. Decisions only. Written September 25, 2026, after Phase 5 chose Brass and Ink.

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
- Stack: Astro 7.3.4 (SSG), Tailwind 4.3.3 (tokens live in CSS, no tailwind.config), gsap 3.15.0. React islands through `@astrojs/react` plus `motion`, added in the Home slice. Vercel. No CMS; Jackson makes updates.
- Donations: Zeffy, link pending. No payments in our code. Until the link arrives, every Donate points to `/support`.
- References, never built and never copied visually: `reference/wireframes/` (structure only), `reference/21st/` (motion only).

## Governing concept

The site is a hall of honor. You enter through the arch in her mark, and inside, the foundation's names hang on a brass rail like plaques in a public building. Every recurring object is architectural: the niche, the rail, the plaque, the inscription, the cornerstone, the slab, the register. The invitation card is the one object laid down at an angle.

How it resolves on the web:
- A building is walked through; a page is scrolled. Home is the only page that moves you: the intro takes you through the arch once, and the hall walks you along the wall.
- Inner pages stand still. Each opens in a niche (her arch as a static frame) holding that page's photo. Support is the exception: the arch moves down the page and frames the donation form. Contact's niche holds only the torch.
- The dark wall exists only in the intro. After it, the paper page is the inside of the building.

## Home intro (code, no video)

Built inline from `brand_assets/everyday-legends-mark.svg`. A flat drawing the whole time. MUST NOT add 3D, perspective, extrusion, or any shape that is not in the SVG.

Sequence, about 3.2s:
1. 0s: the mark centered on the ink wall, rays at low opacity. This is the first painted frame. Never a blank screen.
2. 0 to 1.2s: rays light one by one, center outward, about 40ms apart (opacity).
3. 0.4 to 1.6s: a warm glow builds inside the arch (radial gradient layer, opacity).
4. Throughout: the flame flickers gently (opacity plus scale under 3%, flame only).
5. 1.6 to 2.8s: the mark scales up about the center of the arch opening. Letters and torch fade out by 2.2s. The glow fills the screen and resolves to exactly paper `#F2EADB`.
6. 2.8 to 3.2s: overlay removed. Hero title, lede, and CTAs fade up, 80ms stagger.

Behavior:
- gsap timeline. Transform and opacity only.
- Plays once per session (sessionStorage key `el-intro-seen`).
- Any wheel, touch, scroll, click, or key press skips straight to step 6.
- prefers-reduced-motion: the intro never renders.
- An inline head script decides before first paint whether the overlay shows, so returning visitors never see a flash.
- The H1 and all hero content are in the HTML from the start, under the overlay.
- Nav and Donate sit above the overlay, legible and clickable from the first frame. Any color change on them is an opacity crossfade, never an animated color.
- The Phase 5 scroll-driven arch walk-through is removed entirely.

## Palette (locked)

| Token | Hex | Allowed uses |
|---|---|---|
| ink | #15120E | Text, primary buttons, Support slab, intro wall, menu panel |
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
- Every color comes from a token. No raw hex outside the token block. `--ink-hover` and the `#3a3228` hover are retired; button hovers follow the 21st.dev button spec.
- Default Tailwind colors are banned.

## Typography

- Display: Fraunces. `font-weight: 900` for weight, plus `font-variation-settings: "opsz" 144, "SOFT" 0, "WONK" 0` on every display style. MUST NOT set wght inside font-variation-settings.
- Body: Bricolage Grotesque 300. Text under 16px (nav links, small UI labels) may use 400. Nothing else uses 400.
- Labels: Bricolage Grotesque `wght 600`, uppercase, tracked, as built in Phase 5.
- Display to body size ratio of 3x or more at every breakpoint.
- No orphans in any title, lede, or card title at any verification width. Use `text-wrap: balance` and confirm on the screenshot.
- The middot `·` is copy and is never replaced.

## Photos

- Black and white (Yamean Studios / McKee Place, files ending `-137`, `-119`, `-48`, `-53`, `-20`, `-9`): the day itself. Speeches, the room, the story.
- Color (`Everyday_Legends_2026_*`, `ELRahwayPAL.webp`, `ELSalvationArmy.webp`): the honorees and the community work.
- The Rahway PAL photo shows the foundation's bank numbers on the check. MUST be swapped for the masked version before launch or any push.
- The black and white files carry a baked-in watermark. Use them as they are until clean files arrive. MUST NOT crop, paint, or edit it out.
- Every content photo goes through `astro:assets` with real alt text. MUST NOT set content photos as CSS backgrounds. Alt text MUST NOT name anyone the copy deck does not name.
- Photo treatment as built in Phase 5 (paper-deep tint through `mix-blend-multiply`). One file per slot so each swaps cleanly.

| Slot | File |
|---|---|
| Home, Legends in Action card 1 | ELRahwayPAL.webp |
| Home, Legends in Action card 2 | ELSalvationArmy.webp |
| Home, Legends in Action card 3 | -137 |
| Home, Legends Among Us | 178 |
| Legends Among Us recap | -48, -53, -20, then -119 closing, centered |
| Legends Among Us honorees | 128, 123, 124, 190, 219 |
| In the Community, luncheon entry | 177 |
| About, beside the torch line | -53 (candidate) |
| Spare | -9 |

## Motion

- Animate transform and opacity only. Never `transition-all`.
- Scroll-driven moments: exactly 2. The Home hall and the About torch line. The cap is 3, and the third slot stays empty unless Jackson approves one. Everything else plays once when it enters view.
- The Legends Among Us honorees are a static hall. The wireframe's side scroll there is superseded.
- Easing: spring-style, or the menu curve `[0.22, 1, 0.36, 1]`.
- Every animation has a reduced-motion state that shows final content with no movement.
- No empty screens. At every scroll position, something with content is in view.

## 21st.dev islands

Source files sit in `reference/21st/`. Keep every motion value listed under "Keep" exactly. Change only what is listed under "Change". Below-the-fold islands load with `client:visible`; the nav loads with `client:load`.

1. `text-reveal.tsx`, Mission lede.
   Keep: per word, slide preset (opacity 0 to 1, y 20 to 0), 0.05s stagger, 0.3s per word.
   Change: plays once when 30% in view. Reduced motion shows static text. Blur presets never used.
2. `hover-reveal-cards.tsx`, Legends in Action rows.
   Keep: hovered image scales to 1.05; siblings scale to 0.97 at opacity 0.6; 500ms ease-in-out; focus-visible matches hover.
   Change: no blur, no `transition-all`, real images through `astro:assets`, applied to the three alternating rows (never a card grid), Brass and Ink styling. Touch devices get no hover effect.
3. `interactive-hover-button.tsx`, every solid button on the site.
   Keep: label slides out right and fades; a second label with an arrow slides in; 300ms.
   Change: default state is a solid fill, never an outline. The fill grows by transform scale from a dot, never by width, height, top, or left. Renders as `<a>`. Auto width. Pressed state scales to 0.97. Focus-visible matches hover.
   - Primary: ink fill, paper text. Hover: brass fill, ink text.
   - Secondary: paper-deep fill, ink text. Hover: ink fill, paper text.
   - On ink surfaces: paper fill, ink text. Hover: brass fill, ink text.
4. `liquid-morph-floating-menu.tsx`, phone nav under 900px.
   Keep: easing `[0.22, 1, 0.36, 1]`; ink circle rise 0.8s after a 0.1s delay; links fade in over 0.4s starting at 0.4s + 0.08s × index; hamburger to X, each bar rotating 45° over 0.4s.
   Change: trigger at top right, never floating at the bottom. The ink circle scales up (transform) from the trigger into a full-screen ink panel. No per-letter hover roll. Real links. A real button with `aria-expanded`. Escape closes. Focus stays inside while open. Body scroll locked while open. Tapping outside or tapping a link closes it. Fonts and colors from this file.

Mission pillars are custom gsap, not 21st.dev: each drop line grows from the rail (scaleY 0 to 1, 0.5s), then its plaque drops from y -24px to 0 with a slight overshoot. 0.12s stagger. Plays once.

## Nav and footer

- Nav uses the mark only. At 900px and up: mark left; About, In the Community, Legends Among Us, Contact, and Donate right. Under 900px: mark left; Donate and the menu trigger right.
- Donate is a solid primary button, visible at every width at all times, and repeated inside the open menu.
- Footer: full lockup; `© 2026 Everyday Legends Foundation, Inc. All rights reserved.`; info@everydaylegend.com; Instagram · @everydaylegendsfoundation; Privacy Policy; "Built by Anchor Digital" linking to anchordigitalco.com in a new tab. No address, no phone.

## Home section table

Space tokens: `--space-tight`, `--space-standard`, `--space-generous`, declared once in CSS, each at least 1.5x the one before. Exact values are tuned by screenshot. Grid is 12 columns.

| # | Section | Entrance | Column window | Image | Space before | Margin | Height |
|---|---|---|---|---|---|---|---|
| 1 | Hero, on paper | Intro, then fade up | Title cols 1 to 9; lede cols 1 to 7; CTAs under the lede | None | Page top | None | Short |
| 2 | Hall | Pinned side scroll (scroll-driven 1) | Rail full bleed | None | Tight | "INAUGURAL CLASS, 2026" label and the outline 2026 numeral | Pin covers 150vh of scroll at most |
| 3 | Our Mission | Text reveal on the lede; pillars drop | Title and lede cols 1 to 6; body cols 8 to 12; pillars hang across cols 2 to 11 | None | Generous | None | Tallest on Home |
| 4 | Legends in Action | Rows fade up once; spotlight hover | Alternating rows: photo cols 1 to 7 with text cols 8 to 12, then mirrored | Large, one per row | Standard | Title, deck, and "See all our work" in the head | Medium |
| 5 | Legends Among Us | Card settles to its angle once | Photo full bleed; card cols 2 to 6 | Full bleed, dark gradient on the left | Standard | Marginalia on the card | Medium |
| 6 | Support the Foundation | Fade up | Ink slab full bleed; title and lede cols 1 to 6; body cols 7 to 11; marginalia under the body | None | Standard | 501(c)(3) marginalia | Medium short |
| 7 | Newsletter | None | Cols 4 to 9, centered | None | Tight | None | Shortest |

Row rules:
- Hero: the hall's rail MUST be visible inside the first viewport at 1440×900 and 390×844.
- Hall: the eight honorees in program order, names only. No roles, no caption. The wireframe's "Wall of Honor", "The people we have named.", and "ROLE" are not copy and MUST NOT render. Under 900px and in reduced motion it becomes a plain vertical list.
- Legends in Action: cards in copy deck order (1 Rahway PAL, 2 Salvation Army, 3 Legends Among Us). No dates anywhere, and no invented marginalia in their place.
- Legends Among Us: the only rotated element on the site. "Us" and "Jersey" MUST NOT orphan.
- Newsletter: Name, Email, Sign up, styled in Brass and Ink. No backend exists yet, so the form MUST NOT show a success state. List it as open in the report.
- Height spread on Home, tallest to shortest: 4:1 or more.

## Inner pages

Each slice fills its own rows from its wireframe at the start of that slice. These parts are fixed now:
- About: niche header carrying Our Vision; Our Story with the page's one pull quote set as a full-width inscription; Founders' Story as the longest section, with the torch line (scroll-driven 2) beside the torch sentence; "We aim to" as three lines stepping down and right; What we do; Leadership as portraits in arch niches, founders large, board smaller, staggered, and complete with 2 people or 4; Accountability as the cornerstone.
- In the Community: niche header; entries on a rail, newest first, every entry built identically; closing Support slab.
- Legends Among Us: the invitation card full size on the room, in its post-event state ("Next luncheon · date to be announced", no Buy tickets); the recap cluster; the honorees hall (static) with a portrait niche above each name; Sponsorship.
- Support: slab header with no niche; the arch frames the Zeffy form with the rays behind it; the cornerstone, identical to About's; the sponsorship pointer.
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
3. No orphans in display type. The Phase 5 invitation card had two.
4. Every button is solid with 4.5:1 text. "About the foundation" read as a ghost button in Phase 5.
5. Nothing overlaps unintentionally at any scroll position or width. The Phase 5 title overlapped the arch.
6. No 3D and no video in the intro. The Runway take read as cheap CGI.
7. No section shares the same entrance, column window, and height as its neighbor. The McClain build produced identical sections.
8. This file stays under 300 lines. The McClain CONTEXT.md passed 4,000 and fell behind git.
9. Placeholder text for pending lines matches its register and word budget.

## Pending client approval (build as written, keep swappable)

"In the Community" as the page title; "Inaugural class, 2026" as the hall label; mark-only nav with the full lockup in the footer; Home card 3 wording; a tighter favicon crop of the EL and torch.

## Open client items that touch the build

- Zeffy link. Donate points to `/support` until then.
- Honoree consent to be named publicly. Names render in the build; launch waits on consent.
- Clean, unwatermarked photo files and the credit line.
- Founding year (cornerstone placeholder), board names (Leadership works with 2 or 4), Jaylen's Leadership line, sponsorship packages link, original headshots.
- Newsletter provider, for the form backend.
- Scholarship wording decision. Do not change the copy until she answers.
