# PHASE5.md: Everyday Legends, Direction Test

This file is the spec for Phase 5. Each direction prompt names ONE direction below. Build only that one.
CONTEXT.md does not exist yet and MUST NOT be created. It gets written after a direction is picked.

Governing concept: **"The site behaves like a name being called."**

## What gets built

One continuous test page at `src/pages/index.astro`, in this order:

1. **Nav.** Her mark only (no wordmark), links Home, About, In the Community, Legends Among Us, Contact (all `href="#"`), and a solid Donate button (`/support`).
2. **Hero: the dark wall.** Her real mark centered in a dark wall. Below it, copy deck section 1.1: Title, Lede, CTA "Donate" (`/support`), CTA 2 "About the foundation" (`/about`).
3. **The arch walk-through** (scroll-driven moment 1). Scrolling grows the arch until the visitor passes through it into the light hall.
4. **The hall** (scroll-driven moment 2). Pinned side scroll. Names hang from a rail.
5. **Home 1.4, Legends Among Us.** The invitation card laid on a full-bleed photo.

Nothing else. No Mission, no footer, no other sections.

## Assets

- `everyday-legends-copy.md` (repo root): the approved copy. Use sections 1.1 and 1.4 verbatim. Follow the rules at the top of that file. It is the ONLY source of words on this page.
- `brand_assets/everyday-legends-mark.svg`: her mark (arch, rays, EL, torch).
- Photo for section 5 (in `brand_assets/`): the file whose name contains `_178_websize`. Filenames are long and MUST NOT be renamed; find files by that number.
- Honoree names: the eight in `everyday-legends-copy.md`, section 4, Honorees, in that order. Put them in `src/data/honorees.ts` with the comment `// Consent to be named is pending. Not for deploy.`

If the copy file, the mark, or the photo is missing, STOP and report. Do not substitute.

## Wireframe reference

The approved wireframe is `../everyday-legends-wireframes/home.html`, outside this repo. Read its sections 1 (HERO · THROUGH THE ARCH), 2 (THE HALL · PINNED), and 5 (LEGENDS AMONG US · THE INVITATION), plus the script at the bottom.

The wireframe is a starting point, not a template. It proves the idea works. Your job is to make the idea better than the wireframe.

What is fixed (MUST keep):
- The section order.
- The walk through her arch into the hall.
- The hall as a pinned side scroll of names on a rail.
- The invitation card on a full-bleed photo as the only rotated element.
- The phone and reduced-motion fallbacks.

What is open (your call, push it):
- Composition, scale, placement, and spacing.
- Scroll distances and the growth curve. The wireframe's `1 + p^2.2 × 13` is a working baseline you are free to beat.
- How the names hang, how the hall opens and closes, and where the card sits.
- Small details drawn from the concept: rays, rails, engraved dates, the torch.

Run the anti-convergence check in the frontend-design skill before writing code. Each direction should commit to its extreme.

MUST NOT take from it:
- Any visual styling: grays, Public Sans, borders, or placeholder boxes.
- The section labels, the gray explanatory notes, the banner, the thumbnail button, or the progress bar.
- Any wording. "Wall of Honor", "The people we have named.", and the "ROLE" lines are wireframe placeholders, not approved copy.
- The role lines under names. Home shows names only.
- The "Everyday Legends" text beside the nav mark. The nav is the mark only.
- The Salvation Army. It is not a 2026 honoree.
- Mission, Legends in Action, Support, and Newsletter. They are not part of this test.

If this spec and the wireframe disagree, this spec wins. Where this spec gives a number (a size, a height, an angle), treat it as a starting value you may tune, unless it is marked MUST or listed under a direction's palette or type.

## The arch: hard rules

- The page MUST open on her real mark (`everyday-legends-mark.svg`), unaltered.
- Claude Code MUST draw a separate SVG for the arch and rays only: `<svg id="arch">` containing `<path id="arch-outline">` and `<g id="rays">` with one `<line class="ray">` per ray. Measure her mark and match its proportions, ray count, and ray angles.
- Claude Code MUST NOT redraw, trace, or recreate the EL or the torch.
- Handoff: during the first 10% of the scroll progress, her mark fades out while the code-drawn arch and rays fade in at the identical position and size. The EL and torch leave with her mark.
- The arch opening is a clip region. Inside it sits `<div data-slot="arch-video">` holding a still CSS gradient in this direction's light color. A generated video goes here later. MUST NOT add any video file now.
- Growth: the arch container scales up (transform only) until the opening is larger than the viewport, which reveals the hall. Hero copy fades and drifts up as the arch grows.
- Alignment check: at `?frame=0`, overlay the code-drawn arch on her mark and report the maximum offset in px. It MUST be 2px or less at 1440 wide.

## The hall

- Class heading: **Inaugural class, 2026** (pending client approval; build it anyway). It sits at the start of the track, where the wireframe has its large "2026" numeral. Keep the numeral, set as an engraved outline date.
- The rail is a double rule: two 1px lines, 6px apart, running the full scroll length.
- Each name hangs from the rail on a 1px drop line. Names only on Home: no portraits, no roles.
- The section pins while names translate horizontally with scroll.

## Section 5: Legends Among Us

- Full-bleed photo (`_178_websize`). `object-position` MUST keep all three people visible to the right, leaving the open left side for the card.
- Photo treatment: a gradient overlay plus a color treatment layer using `mix-blend-mode: multiply` (values in the direction below).
- The invitation card sits over the photo at a slight rotation (start at 2 degrees). It is the ONLY rotated element on the page. Placement is your call, but it MUST NOT cover the people in the photo.
- Card copy: section 1.4 verbatim (Title, Lede, Body, Marginalia, CTA "The luncheon" to `/legends-among-us`).
- Alt text: "Jaylen McClain presents the Athletic & Community Impact Award to Brick City Lions at the Legends Among Us luncheon, May 30, 2026."
- Below 900px: photo on top, card below it overlapping upward by 48px, rotation kept.

## Motion rules (both directions)

- MUST use GSAP with ScrollTrigger, installed from npm. No other animation library. No React, no 21st.dev components in Phase 5.
- MUST animate only `transform` and `opacity`. MUST NOT use `transition-all`.
- Exactly two scroll-driven moments on this page: the arch walk-through and the hall. MUST NOT add a third.
- `prefers-reduced-motion` and widths below 900px (the wireframe's breakpoint): no arch growth (her mark stays, static), the hall becomes a plain vertical list on the rail, the card does not animate.
- Add a `?frame=` query param (0 to 1) that disables ScrollTrigger scrubbing and renders the arch and hall at that fixed progress. All screenshots MUST use it. MUST NOT screenshot while anything is animating.

## Standing rules (both directions)

- MUST state the font choice out loud before writing code.
- Heroes MUST NOT be a solid color: layered radial gradients plus an SVG `feTurbulence` grain at 6% opacity or less. No image textures.
- Every clickable element MUST have hover, focus-visible, and active states. Buttons are solid fill. No ghost buttons.
- Shadows MUST be layered and color-tinted at low opacity. No `shadow-md`.
- Mobile-first. Test widths: 390, 768, 1024, 1440, 1920.

---

## Direction: Limestone

**Idea:** the hall is carved from pale stone. You walk out of shadow into daylight, the way the Highlawn's arched windows open onto light.

**Palette (exact):**

| Token | Hex | Use |
|---|---|---|
| shadow | #2B2620 | The dark wall |
| stone | #ECE6DA | Hall and section surfaces |
| stone-light | #F7F3EB | Card surface, button text |
| stone-deep | #CBC1AF | Rail, drop lines, card border, focus rings |
| ink | #26221C | Text, buttons |
| gold | #DDAF3C, #D8B450 | Rays and her mark ONLY |

**Accent budget:** gold appears in exactly 2 things on this page: the rays and her mark. Nothing else is gold.

**Buttons:** solid ink, stone-light text. Hover #3A342C. Focus-visible 2px stone-deep outline, 3px offset. Active scale 0.98.

**Type:**
- Display: **Cinzel**, weight 900, uppercase, letter-spacing 0.08em. Used for names, titles, and the card title.
- Body: **Newsreader**, weight 300 (lede at 200).
- Names in the hall: `clamp(3rem, 7vw, 7.5rem)`, set to read as incised (a light edge below, a dark edge above).

**Light in the arch slot:** a radial gradient from #FFF8EA at center to #ECE6DA.

**Photo treatment:** a linear gradient from stone-light at 75% opacity on the left to transparent at 55% width, plus a multiply layer of #ECE6DA at 20%.

**Card:** stone-light surface, double border in stone-deep, Cinzel title.

**Motion feel: heavy and slow, like stone.**
- Arch section height: 320vh (the wireframe uses 280vh). Keep the wireframe's `p^2.2` growth curve.
- Entrances: 900ms, `cubic-bezier(.22,1,.36,1)`.

---

## Direction: Brass and Ink

**Idea:** a printed program and an award plaque. Dark ink on warm paper with brass rules, like the black, gold-framed plaques handed out on May 30.

**Palette (exact):**

| Token | Hex | Use |
|---|---|---|
| ink | #15120E | The dark wall, text, buttons |
| paper | #F2EADB | Hall and section surfaces |
| paper-deep | #E4D7BF | Secondary surfaces, photo tint |
| brass | #A9844F | Rail, drop lines, card frame |
| brass-light | #C9A76A | Focus rings |
| gold | #DDAF3C, #D8B450 | Rays ONLY |

**Accent budget:** metal appears in exactly 3 things on this page: the rays (gold), the hall rail and drop lines (brass), and the invitation card frame (brass). Nothing else.

**Buttons:** solid ink, paper text. Hover #2A241C. Focus-visible 2px brass-light outline, 3px offset. Active scale 0.98.

**Type:**
- Display: **Fraunces** variable, opsz 144, weight 900, SOFT 0, WONK 0. Used for names, titles, and the card title.
- Body: **Bricolage Grotesque**, weight 300.
- Marginalia and labels: Bricolage Grotesque 600, uppercase, letter-spacing 0.14em, 0.75rem.
- Names in the hall: `clamp(3rem, 7vw, 7.5rem)`, ink on paper, separated by a small brass middot.

**Light in the arch slot:** a radial gradient from #F6D9A0 at center to #2A2016 (warm lamplight).

**Photo treatment:** a linear gradient from ink at 80% opacity on the left to transparent at 55% width, plus a multiply layer of paper-deep at 25%.

**Card:** paper surface with an inner double brass frame, like the plaques. Fraunces title.

**Motion feel: crisp, like print.**
- Arch section height: 240vh (the wireframe uses 280vh). Keep the wireframe's `p^2.2` growth curve.
- Entrances: 600ms, `cubic-bezier(.16,1,.3,1)`.
- The card settles into its rotation on entry.

---

## Proof (required before reporting done)

Use `screenshot.mjs` as CLAUDE.md describes. If it cannot yet set the viewport width or emulate `prefers-reduced-motion`, extend it so it can.

Run at least two screenshot-and-fix rounds. Rounds use widths 1440 and 390 only. Then report:

1. The base commit hash.
2. `git diff --stat <base>` output.
3. Final screenshots at all five widths for: `?frame=0`, `?frame=0.5`, `?frame=1`, and section 5. Plus one reduced-motion capture at 1440.
4. The arch alignment offset in px.
5. The font choice as stated.
6. Every MUST in this file that was not met, and why.

MUST NOT commit. MUST NOT push. A report is not evidence; the diff and the screenshots are.
