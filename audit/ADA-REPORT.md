# ADA audit: Everyday Legends Foundation

Report only. No site code was changed. Fixes happen in a separate pass after Jackson reads this.

## 1. Run details

| | |
|---|---|
| Base commit | `1d2ba4f` Handoff: after preview push and contact fix |
| Branch | `ada-audit` (from main, uncommitted) |
| Date | October 2, 2026 |
| Standard | WCAG 2.1 AA plus the WCAG 2.2 AA additions (2.4.11, 2.5.7, 2.5.8, 3.2.6, 3.3.7, 3.3.8) |
| Build | `astro build` (Astro 7.3.4), served from dist/ with `astro preview` on 4323 |
| Engines | Chrome 154.0.8037.57 (Puppeteer 25.12.0); WebKit 26.6 (Playwright 1.63.0, installed outside the repo, used for 2.4.11 only) |
| Rules | axe-core 4.13.0 through `@axe-core/puppeteer` 4.13.0 (devDependency), tags wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa; best-practice run separately |
| Node | 24.15.0 |
| Safety | Every request to formspree.io was aborted at the network layer in every script. The contact form was never filled valid and never sent. Zeffy was only focused and tabbed through. |

Scripts (all in `audit/`):
- `axe.mjs` runs 8 pages × 2 widths × 2 motion modes, plus the menu-open and contact-errors states: 38 scans.
- `manual.mjs` covers the measured manual checks, one section per check.
- `flash.mjs` measures the flame flicker frame by frame.
- `webkit-focus.mjs` walks focus in WebKit.
- `menu-ax.mjs` reads the accessibility tree with the menu open.

Raw JSON is in `audit/raw/` (gitignored). Screenshots are in `audit/shots/`.

Pages: `/`, `/about`, `/in-the-community`, `/legends-among-us`, `/support`, `/contact`, `/privacy`, and `/no-such-page` for the 404.

## 2. Summary

axe found **zero WCAG violations in our own markup** across all 38 scans, with motion on and off. The one axe failure is the iframe that Zeffy's script injects on `/support`. Everything else below came from the manual checks.

| Severity | Count | IDs |
|---|---|---|
| Blocker (Level A failure on donate, contact, or nav) | 1 | B1 |
| Serious (any other A or AA failure) | 5 | S1–S5 |
| Minor (best practice) | 4 | M1–M4 |

Third-party items (Zeffy, Turnstile) are kept apart in section 7.

**Top five fixes by impact**
1. **S1: a second color in the focus ring.** It affects every keyboard user on every page. Today the ring measures 1.55–1.91:1 on paper and paper-deep, against a 3:1 minimum.
2. **B1: a title on the Zeffy iframe.** This is the donation form, and screen readers announce it as an unnamed frame.
3. **S2–S4: let held-together text wrap when it has to.** One family of fixes covers the footer Instagram line, the What we do plates, the hall names, the In the Community h1, and the Support slab and pointer. It clears reflow at 320px and text spacing at 375px.
4. **S5: announce "Sending" on Contact.** The status change is silent to screen readers today.
5. **M1 and M2: a skip link, and no focus stops on the Home rows.** Keyboard users currently tab through 6 nav stops to reach content, then 3 rows that do nothing.

## 3. Findings

| ID | WCAG (level) | Page(s) | Width(s) | What fails | Evidence | Ours / 3rd party | Proposed fix | Effort | Touches CONTEXT.md |
|---|---|---|---|---|---|---|---|---|---|
| **B1** | 4.1.2 Name, Role, Value (A) | /support | all | Zeffy's v2 script injects `<iframe>` with no `title`. Screen readers announce an unnamed frame where the donation form is. | axe `frame-title` in all 4 Support scans (`audit/raw/support-*.wcag.json`); `audit/raw/manual-zeffy.json`: `"title": null` at 375 and 1440 | 3rd-party element in our DOM; fixable on our side | After Zeffy inserts the iframe, set its `title` (MutationObserver in support.ts), and ask Zeffy to add one | S | Yes: "v2 script embed exactly as supplied" (the embed code stays untouched; a script is added beside it) |
| **S1** | 1.4.11 Non-text Contrast (AA) | all | all | The focus ring is one color, brass-light `#C9A76A`, 2px. On real pixels: 1.82–1.91:1 on paper and 1.55–1.59:1 on paper-deep, against 3:1. No second color or box-shadow rescues it (`boxShadow: none`, or the button's own drop shadow). It passes on ink at 7.2–8.2:1. | `audit/raw/manual-focusring.json`; shots `audit/shots/focus-*.png`. Nav link 1.91, hero buttons 1.89/1.90, nav mark 1.82, contact entry 1.87, News card 1.87, About marginalia 1.88, Support pointer 1.90, Sponsorship band 1.59, Home action row 1.59 (bottom edge, `#C9A76A` on `#E2D6BF`). Ink: slab 7.2, footer 7.61, menu 8.2. | Ours | Two-tone ring on light surfaces: a 2px ink outline (15.6:1 on paper) with brass-light kept outside it, or brass-light only on ink | S–M (13 focus rules plus `.btn`) | **Yes**: palette table, "brass-light: Focus rings only" |
| **S2** | 1.4.10 Reflow (AA) | all (footer) | 320 | The footer line "Instagram · @everydaylegendsfoundation" is `white-space: nowrap` (global.css:1644) inside a footer with `overflow: hidden`. The link is 326px wide in a 280px column, and the handle is cut to "@everydaylegendsfoundat". | `audit/shots/reflow-320-footer.png`; `audit/raw/manual-reflow.json`: footer scroll 346 vs box 320 on 7 of 8 pages | Ours | Let it break at the middot with the site's existing `data-mid-line` pattern (as Contact's marginalia already does) | S | No: uses the site-wide middot rule |
| **S3** | 1.4.10 Reflow (AA) | /about (What we do) | 320 | The plates measure 336px in a 320px viewport (body `width: 18em`, about.css:389, plus plate padding). The page scrolls sideways (scrollWidth 356) and "academic" is cut off. | `audit/shots/reflow-320-about-plates.png`; `audit/raw/manual-reflow.json` `reflow-320-about`: hScroll true, 356/320 | Ours | `width: min(18em, 100%)` on the sentence, so the plate never outgrows the column | S | **Yes**: "deck width at 900px up, 18em below" |
| **S4** | 1.4.12 Text Spacing (AA) | /, /about, /in-the-community, /legends-among-us, /support, footer everywhere | 375 (1440 passes) | With the 1.4.12 spacing injected, text held on one line by `nowrap` or non-breaking spaces overflows and clips: hall names "Natasha Davis-Gomez" and "Football Program" (Home hall to 452px, Legends honoree to 397px); the In the Community h1 "the Community" spills 91px; Support's slab lede clips "community" inside `.slab { overflow: hidden }` (support.css:14); the Support pointer title and body reach 387px; About's plates; the footer Instagram line | `audit/raw/manual-spacing.json`; shots `audit/shots/spacing-375-home-hall.png`, `spacing-support-375-slab.png`, `spacing-375-legends-honoree.png`, `spacing-375-about-plates.png`, `spacing-community-375-h1.png`, `spacing-375-footer.png`; full pages `spacing-*-375.png` | Ours | Let held runs wrap when they overflow (drop `nowrap` and NBSP holds under 900px, or fall back with `overflow-wrap` past a container query), and remove `overflow: hidden` on the slab | M | **Yes**: orphan rules ("a two-word name never wraps", "the Community" kept together, "Among Us" never splits, pairs held by NBSP) |
| **S5** | 4.1.3 Status Messages (AA) | /contact | all | While sending, only the button's text changes to "Sending" (`setSending`, contact.ts:164). No live region carries it, so screen readers get no announcement. "Sent" (focus moves to the coda) and "Send failed" (polite live region) are announced. | `audit/raw/manual-contact.json`: live regions are only `.register__fail` and `.register__done`, both polite; code path contact.ts:164–169. Not tested end to end, since a send is prohibited. | Ours | Also write "Sending" into a polite status region (existing copy) | S | No |
| **M1** | 2.4.1 Bypass Blocks (A): met; best practice | all | all | There is no skip link. The first Tab stop is the nav mark on all 8 pages. 2.4.1 is met by landmarks and headings (one `main`, labelled regions, one h1, no skipped levels: techniques ARIA11 and H69), but sighted keyboard users pass 6 nav stops at 1440 and 3 at 375 before content. | `audit/raw/manual-structure.json`: `skipLink: []` and `firstTab: "Everyday Legends Foundation, home"` on every page | Ours | Skip link first in Base.astro, visible on focus, to `<main id>`, styled as a solid button | S | No (needs copy; must follow the solid-button hard rule) |
| **M2** | 2.4.3 Focus Order (A): met; best practice | / | all | The three Legends in Action rows are `<li tabindex="0">` (index.astro:125). They take focus but do nothing, and they expose role `listitem` with no action. A screen reader announces e.g. "Support for Youth Basketball League, Rahway PAL, list item". | `audit/raw/manual-structure.json` `home-*.rows`: axRole listitem, axName = title, focusable true, no link or button inside; keyboard walk lists 3 `LI.action__row` stops | Ours | Remove `tabindex`; keep the spotlight on pointer hover | S | **Yes**: hover-reveal Keep list, "focus-visible matches hover" |
| **M3** | 2.4.3 / 1.3.2: best practice (modal pattern) | all | under 900 | With the phone menu open, `main` and the footer stay in the accessibility tree: no `inert`, no `role="dialog"` or `aria-modal`. The Tab trap holds, but VoiceOver swipes can move to content hidden behind the ink panel. | `audit/raw/manual-menu-ax.json`: mainInTree true, headings "Our Vision", "Our Story", "Leadership" and contentinfo exposed while open | Ours | Set `inert` on `main` and the footer while the menu is open | S | No (supports "focus stays inside while open") |
| **M4** | Best practice (G201) | all (footer), /contact | all | Three links open a new tab without saying so: footer Instagram, footer "Built by Anchor Digital", Contact's Instagram marginalia. The In the News cards already say "(opens in a new tab)". | `audit/raw/manual-structure.json` `newTab`: `warns: false` for those three, `true` for the News cards | Ours | Add the News cards' existing visually hidden "(opens in a new tab)" to the three links | S | No (reuses existing copy) |

Checked and **not** a finding:
- **Buttons with two labels:** the computed names are single, e.g. "DONATE", "SEND MESSAGE", "SPONSOR THE LUNCHEON". The nav Donate's on-ink `::after` face uses `attr(data-label) / ""`, so it adds nothing to the name.
- **About Leadership hover:** it reveals no content. The busts only scale (1.05) and dim (0.6 at 0.97); text length is identical before and after hover, and no element is hidden or shown. That passes 1.3.1, 2.1.1, and 1.4.13, so there is no CONTEXT.md conflict.
- **Split text:** both the Mission lede and the pull quote read once as one sentence (one StaticText hit each, zero word-by-word hits) with motion on and off.
- **Contact field labels:** the labels report as uppercase ("NAME"), because Chrome's tree reflects CSS `text-transform`. That isn't a WCAG issue; VoiceOver reads the words.

## 4. CONTEXT.md conflicts (Jackson decides)

| Finding | Locked decision it would change | Options |
|---|---|---|
| S1 focus ring | Palette: "brass-light #C9A76A, Focus rings only" (implies the ring is brass-light alone) | (a) Ink ring on paper and paper-deep, brass-light on ink. (b) Two-tone: ink inner ring, brass-light outer halo. Both keep brass-light's single use. |
| S3 plates | About, What we do: "deck width at 900px up, 18em below" | Keep 18em as the target but cap it at the column width. Only phones under about 340px change. |
| S4 text spacing | Typography: "A two-word name never wraps"; "the Community" held whole; "Among Us" never splits; NBSP pair holds | Under user text spacing these must wrap or content is lost. Options: allow a wrap only when the held run overflows (container query or JS check), or accept a one-word last line in that override case only. |
| M2 row focus | 21st.dev item 2 Keep: "focus-visible matches hover" | Remove the row focus stops (the spotlight stays on pointer hover), or make each row a real link to its In the Community entry. The second also changes "No links" there. |
| B1 iframe title | Support: "Zeffy: v2 script embed exactly as supplied" | The embed code stays byte for byte; a few lines in support.ts set `title` on the iframe after Zeffy inserts it. Or ask Zeffy to add it and wait. |

There were no conflicts from this prompt with CONTEXT.md.

## 5. Conformance record

| Criterion | Level | Result | Why |
|---|---|---|---|
| 1.1.1 Non-text Content | A | Pass | Every content photo has descriptive alt (structure JSON `imgs`); the mark and logo are `alt=""` inside named links; every decorative SVG is `aria-hidden` (0 exposed SVGs of ours) |
| 1.2.1–1.2.5 Time-based media | A/AA | N/A | No audio or video |
| 1.3.1 Info and Relationships | A | Pass | Real headings, lists, labels, landmarks; the hover reveal adds no content |
| 1.3.2 Meaningful Sequence | A | Pass | DOM order matches the visual order; split text reads once |
| 1.3.3 Sensory Characteristics | A | Pass | No shape- or position-only instructions |
| 1.3.4 Orientation | AA | Pass | No orientation lock |
| 1.3.5 Identify Input Purpose | AA | Pass | `autocomplete="name"` and `"email"` |
| 1.4.1 Use of Color | A | Pass | Errors have text plus a 2px rule; the current page has a 2px rule; in-text links are underlined at rest |
| 1.4.2 Audio Control | A | N/A | No audio |
| 1.4.3 Contrast (Minimum) | AA | Pass | Lowest text on real pixels 5.22:1 (card marginalia); axe found no failures; see `manual-contrast.json` |
| 1.4.4 Resize Text | AA | Pass | 200% at 1280: no clipping, overlap, or horizontal scroll on 8 pages (`zoom200-1280-*.png`) |
| 1.4.5 Images of Text | AA | Pass | Only the logo (exempt); all other text is live |
| 1.4.10 Reflow | AA | **Fail** | S2, S3 |
| 1.4.11 Non-text Contrast | AA | **Fail** | S1 (focus ring); input rules and the menu trigger pass |
| 1.4.12 Text Spacing | AA | **Fail** | S4 (375); 1440 passes |
| 1.4.13 Content on Hover or Focus | AA | Pass | No content appears on hover or focus |
| 2.1.1 Keyboard | A | Pass | Every control reachable at 375, 1440, and 200% in Chromium and WebKit |
| 2.1.2 No Keyboard Trap | A | Pass | The menu trap releases on Escape and on the close control, returning focus to the trigger; focus leaves Zeffy and Turnstile |
| 2.1.4 Character Key Shortcuts | A | N/A | None (any key skips the intro; that is not a shortcut) |
| 2.2.1 Timing Adjustable | A | Pass | No user time limit; the 30s Turnstile wait keeps all values |
| 2.2.2 Pause, Stop, Hide | A | Pass | The intro runs 3.15–3.19s (under 5s), skips on any input, and plays once per session; reveals play once; the hall is scroll-driven |
| 2.3.1 Three Flashes or Below | A | Pass | At most 2 qualifying flashes in any second; flame area 14,806 px² at 1440 (limit 21,824); no qualifying change while the flame grows (`manual-flash.json`) |
| 2.4.1 Bypass Blocks | A | Pass | Landmarks and headings; no skip link (M1) |
| 2.4.2 Page Titled | A | Pass | 8 unique titles |
| 2.4.3 Focus Order | A | Pass | No order inversions except Contact's form-then-margin column order, which is logical; see M2 and M3 |
| 2.4.4 Link Purpose (In Context) | A | Pass | All link names meaningful |
| 2.4.5 Multiple Ways | AA | Pass | The nav lists every page, the footer adds Privacy, and Home links to each section page |
| 2.4.6 Headings and Labels | AA | Pass | Descriptive headings and labels |
| 2.4.7 Focus Visible | AA | Pass | Every stop draws a ring (`noOutline: []` on our elements); contrast under S1 |
| 2.4.11 Focus Not Obscured (Minimum) | AA | Pass | No focused element of ours fully hidden under the fixed nav, forward or shift+tab, at 375, 1440, and 200% in Chromium, and at 375 and 1440 in WebKit. `scroll-padding-top` covers focus scrolling as well as anchors: focused rows land exactly at the nav's edge (top 84 / nav 84, top 104 / nav 104) |
| 2.5.1 Pointer Gestures | A | Pass | No multipoint or path gestures |
| 2.5.2 Pointer Cancellation | A | Pass | Native links and buttons |
| 2.5.3 Label in Name | A | Pass | Each name equals its visible label, once |
| 2.5.4 Motion Actuation | A | N/A | None |
| 2.5.7 Dragging Movements | AA | N/A | No dragging; the hall moves by scroll |
| 2.5.8 Target Size (Minimum) | AA | Pass | Smallest target 117×28.8 (About's Privacy policy link); nav links 35.8px high, menu trigger 42×42 |
| 3.1.1 Language of Page | A | Pass | `lang="en"` |
| 3.1.2 Language of Parts | AA | Pass | All English |
| 3.2.1 On Focus | A | Pass | No context change on focus |
| 3.2.2 On Input | A | Pass | No context change on input |
| 3.2.3 Consistent Navigation | AA | Pass | Same nav on 8 pages |
| 3.2.4 Consistent Identification | AA | Pass | Donate has the same label and function everywhere |
| 3.2.6 Consistent Help | A | Pass | Contact in the nav, and the footer order identical on all 8 pages (logo, Instagram, Privacy Policy, credit) |
| 3.3.1 Error Identification | A | Pass | Per-field text, `aria-invalid`, focus to the first invalid field |
| 3.3.2 Labels or Instructions | A | Pass | Visible labels tied by `for` |
| 3.3.3 Error Suggestion | AA | Pass | "Please check your email address." |
| 3.3.4 Error Prevention (Legal, Financial, Data) | AA | N/A (ours) | Contact is not a legal or financial form; the donation is Zeffy's |
| 3.3.7 Redundant Entry | A | N/A | Single-step form |
| 3.3.8 Accessible Authentication (Minimum) | AA | N/A | No login. Turnstile is not authentication |
| 4.1.1 Parsing | A | N/A | Removed in WCAG 2.2 |
| 4.1.2 Name, Role, Value | A | **Fail** | B1 (Zeffy iframe title); our own controls pass |
| 4.1.3 Status Messages | AA | **Fail** | S5 |

## 6. Needs copy

| Line | For | Register |
|---|---|---|
| Skip link label | M1 | UI label, 2–4 words, matching the nav's plain voice |
| Zeffy iframe title | B1 | UI label. Zeffy's own supplied fallback iframe already says "Donation form powered by Zeffy"; Jackson decides whether to reuse it or have a new line written |
| New-tab notice | M4 | Reuses the existing "(opens in a new tab)" from the In the News cards; confirm |
| "Sending" announcement | S5 | Existing copy ("Sending"); no new words |
| **Accessibility statement** (client decision) | none | A new page in the Privacy Policy's plain, warm register: the standard aimed for, known third-party limits (Zeffy, Turnstile), the contact form as the way to report a barrier, a date. It would add a page and a footer link, which changes CONTEXT.md's page list. Dr. McClain decides. |

## 7. Third parties (not counted as ours)

**Zeffy (/support)**
- The iframe has no `title` (B1, the one item fixable on our side).
- Inside the frame, axe reports two rules on every support scan: `link-name` (the Zeffy logo link `a.css-5wwutm` has no name) and `nested-interactive` (the step-1 submit button).
- Keyboard: 6 Tab stops inside, then focus moves on to "Sponsor the luncheon"; shift+Tab from there returns into the frame. No trap.
- Its focus ring is drawn by Zeffy inside the frame (`audit/shots/focus-support-zeffy-first-1440.png`).
- At 200% the form renders and fits (`audit/shots/zoom200-1280-support-zeffy-viewport.png`). Its "Did you know?" panel is light gray text on mid gray, which is Zeffy's contrast to judge.
- In headless WebKit, focus moving into the frame did not scroll it into view (frame at top 978 with the viewport ending at 812). Chromium did. Confirm in real Safari during the VoiceOver pass.

**Cloudflare Turnstile (/contact)**
- It renders in a closed shadow root, so axe cannot see inside. There were no violations on the host.
- Focus order: Message, then 4 stops inside the widget, then Send message. That matches the visual order, with the widget above the button.
- In headless WebKit at 1440, focusing the widget did not scroll it into view (top 942 in a 900px viewport). Confirm in Safari.
- In Managed mode, Cloudflare may show a click challenge. That is not a cognitive test under 3.3.8, but its accessibility is Cloudflare's.

## 8. VoiceOver script for Jackson (about 10 minutes)

Use the preview (`everyday-legends-site.vercel.app`) or localhost:4322 after restarting it with `--force`. **Never fill all three Contact fields, and never press Send with them filled.** Every step below triggers client-side errors only. Never enter an amount in Zeffy.

**Mac, Safari (6 minutes)**

Setup: Safari › Settings › Advanced › tick "Press Tab to highlight each item on a webpage". Turn VoiceOver on with Cmd+F5. VO means Control+Option.

1. **Home.** Press VO+U, then use left and right arrows to reach Landmarks. Expected: banner, Main navigation, main, regions (Everyday Legends Foundation, Inaugural class 2026, Our Mission, Legends in Action, Legends Among Us, Support the Foundation), content information. Press Escape.
2. **First Tab.** Press Tab. Expected: "Everyday Legends Foundation, home, link". There is no skip link yet (M1). Keep tabbing: About, In the Community, Legends Among Us, Contact, then "Donate, link", said once, not twice.
3. **Mission lede.** Press VO+Cmd+H until "Our Mission, heading level 2", then VO+Right Arrow. Expected: "Our work bridges scholarship, sports, and service." read once, not word by word.
4. **Legends in Action rows.** Tab to the rows. Expected: "Support for Youth Basketball League, Rahway PAL", with no "link" or "button". This confirms M2: the stop does nothing.
5. **About.** Open About. Press VO+Cmd+H to "Our Story", then VO+Right through to the pull quote. Expected: "At the intersection of these forces, legacy is built." once. Press VO+Cmd+H to "Leadership". Expected: image "Dr. Syreeta McClain", then heading "Dr. Syreeta McClain · Co-Founder & Executive Director", then the bio.
6. **Contact errors.** Open Contact and leave every field empty. Tab to "Send message, button" and press VO+Space. Expected: focus jumps to Name and you hear "Name, invalid data, Please add your name" (exact wording varies). Type one letter in Email and Tab away. Expected: "Please check your email address." Tab from Message: you should hear the Cloudflare widget, then "Send message, button". Stop there.
7. **Support.** Open Support and tab into the form. Expected: "frame" with no name. This confirms B1. Note whether Safari scrolls the form into view. Tab out to "Sponsor the luncheon". Enter nothing.
8. **Phone menu.** Make the window narrower than 900px. Tab to "Open menu, button, collapsed" and press VO+Space. Expected: "expanded". Tab cycles About, In the Community, Legends Among Us, Contact, Donate, Close menu, and stays inside. Press Escape. Expected: back on "Open menu, collapsed".

**iPhone, Safari (4 minutes)**

Setup: Settings › Accessibility › VoiceOver on, or set the side-button triple-click shortcut.

1. **Home.** Swipe right from the top. Expected: "Everyday Legends Foundation, home, link", "Donate, link", "Open menu, button".
2. **Menu.** Double-tap Open menu, then swipe right through the links. Expected: About … Donate, Close menu. **Keep swiping past Close menu**. If you hear page headings ("Everyday Legends Foundation", "Inaugural class, 2026") while the ink panel covers the screen, that confirms M3. Double-tap Close menu.
3. **Headings rotor.** Twist two fingers to select Headings, then swipe down through Home. Expected: one h1, then section h2s in order.
4. **Invitation card.** Swipe through the card. Expected: "Legends Among Us, heading", lede, body, "The Highlawn · West Orange, New Jersey" (the middot may be silent), "The luncheon, link".
5. **Contact.** Swipe to Send message with every field empty and double-tap. Expected: focus moves to Name with "Please add your name."

## Evidence index

- axe: `audit/raw/<page>-<width>-<mode>.wcag.json` and `.bp.json` (best-practice: zero findings in our markup), `audit/raw/summary.json`, `audit/raw/axe-console.txt`.
- axe could not decide contrast on 737 nodes (fixed grain SVG, gradients, pseudo-content), so contrast was measured on real pixels instead: `manual-contrast.json` and `audit/shots/contrast-*.png`.
- Manual: `audit/raw/manual-{structure,keyboard,menu,menu-ax,focusring,reflow,zoomkb,spacing,contrast,targets,motion,flash,contact,zeffy,webkit}.json`.
- Screenshots: `audit/shots/` (104 files): `focus-*`, `reflow-320-*`, `zoom200-1280-*`, `spacing-*`, `contrast-*`, `menu-open-*`, `contact-errors-*`, `contact-error-flow-*`.
