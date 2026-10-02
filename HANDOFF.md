# Everyday Legends Foundation: Chat Handoff

Rebuild of everydaylegend.com by Anchor Digital. Written October 1, 2026, after the preview push and the contact form fix. Supersedes the earlier October 1 handoffs. Process follows `anchor-digital-design-process.md`; technical rules follow `CLAUDE.md`; project decisions live in `CONTEXT.md`.

**Next chat starts by confirming the contact form fix landed and works on the preview. Then the link goes to Dr. McClain, then the ADA audit (report first, then one fix pass). SEO waits until Jackson is ready.**

## Where we are

| Step | Status |
|---|---|
| Phases 0 to 8, content update | Done, on main |
| Zeffy embed | Done, on main (`4f7be04`, "Support: Zeffy form in a filled doorway") |
| Preview push | Done. GitHub, Vercel, preview live |
| Contact form fix | **Built on `contact-turnstile`. Localhost send, commit, and push not yet confirmed** |
| Send preview to Dr. McClain | Next after the form works on the preview |
| ADA audit | After she has the link. Report only, then one fix pass |
| SEO audit | Later, when Jackson decides. Report, then one fix pass |
| 9 Launch | Blocked on Dr. McClain's items below |

## First, in the next chat

1. Run `git --no-pager log --oneline -4 main` and `git branch --show-current`. If the top commit is "Contact: Turnstile visible, send waits for its pass", the fix is merged. If not, it is still on `contact-turnstile`, uncommitted.
2. If not merged: restart 4322 with `--force`, open `localhost:4322/contact`, confirm the Cloudflare box shows above Send and turns green, send one test ("Test from Anchor Digital, please ignore"), and confirm the thank-you line. Then `git add -A`, commit, `git checkout main`, `git merge --ff-only contact-turnstile`, `git push`.
3. On the preview (`everyday-legends-site.vercel.app/contact`), on a phone: one more test send, thank-you line expected. Test sends land in the foundation's inbox.
4. Once a real send succeeds, Cloudflare's "siteverify isn't being called" warning should clear on its own within a day.

## The contact form fix (what and why)

- Formspree's CAPTCHA is **on**, using Cloudflare Turnstile with the secret key set in Formspree. Formspree rejects any send without a valid token ("Please complete the Turnstile").
- The old script posted immediately, even with no token, and hid the widget. Every send failed.
- The fix: the widget is always visible above Send (light theme, normal size). Send waits for the token, posts the moment it arrives (including after a click challenge), fails after 30 seconds or on a Turnstile error, and never posts without a token. The widget resets after every failure.
- CONTEXT.md and the `contact.ts` comment are updated on that branch.
- Dr. McClain's personal site was fixed differently: her live domain `drsyreetamcclain.website` was missing from her Turnstile widget's hostname list. Her code already refused to send without a token.

## Accounts and services

- **GitHub:** private repo `anchordigitalco/everyday-legends-site`. Moved there from `jbleecker21` so the Anchor Digital Vercel team could import it. Create every future client repo on `anchordigitalco` from the start.
- **Push rule:** only ever `git push` or `git push origin main`, never `git push --all`. Old local branches hold the unmasked Rahway PAL photo.
- **Vercel:** project `everyday-legends-site` on the Anchor Digital team. Preview at `everyday-legends-site.vercel.app`. Every push to main redeploys. Imported as a single Astro project; the Sanity Studio stays on Sanity's hosting. No environment variables are needed: the Formspree ID and Turnstile site key are public and live in `src/data/contact.ts`.
- **Vercel login:** the team has one user. jackson@anchordigitalco.com is a second email on Adam's login, not a separate member. Imports work from `anchordigitalco` repos.
- **Cloudflare Turnstile:** widget "Everyday Legends contact form", **Managed** mode. Hostnames: `everydaylegend.com`, `localhost`, `everyday-legends-site.vercel.app`.
- **Zeffy:** form color `#000000`, dark mode, shapes off (confirm the shapes setting saved). The arch fill token `--color-give` matches the sampled card color; if Zeffy's color ever changes, re-sample and update the token.

## Decisions made in this chat

- **Zeffy doorway:** the arch on Support is filled black (`--color-give`), with About's hairline and paper gap. CONTEXT.md records it as the second dark surface after the invitation band.
- **Accepted:** "Monthly" truncates to "Month..." between 900 and 909px (Zeffy's text). The white loading box shows for about a second before the form appears.
- **Bank numbers:** the Rahway PAL photo was already public on her old site, so the preview went up without masking. The masked photo is still a **launch blocker**.
- **Preview link:** open to anyone who has it. Jackson chose this knowing honoree names and the camp photo show before consent.
- **Turnstile visible:** chosen over hidden, so visitors and Jackson can see the check working. Matches her personal site.

## Standing prompt routine

- Fresh Claude Code session on Opus per slice, inside the repo, auto mode. Commit branch work before starting a new session.
- Every prompt: read `./frontend-design/SKILL.md`, CONTEXT.md is the source of truth, copy only from the deck, MUST and MUST NOT, never commit. First step confirms the latest commit title and a clean tree; stop if not.
- Jackson reviews on localhost, then: `git add -A`, commit, `git checkout main`, `git merge --ff-only <branch>`, `git push`.
- Restart 4322 with `--force` after any build. Checks run on a 4323 `astro preview`.
- Use `git --no-pager` for log and branch.
- **Never run git from Cowork's shell on the Mac.** It cannot delete files, so git leaves a stuck `.git/index.lock` that blocks Jackson's commits. Fix if it happens: `rm ~/Downloads/EverydayLegendsSiteBuild/.git/index.lock`.

## ADA audit (next, after she has the link)

Target WCAG 2.1 AA plus cheap 2.2 AA items. **Report only first, no code changes.** Then one fix pass on its own branch, reviewed on localhost before anything merges. Covers: axe-core on all 8 pages at 375 and 1440 (dev dependency only); a skip link in `Base.astro` (likely missing); reflow at 320px; 200% zoom and text spacing; About's Leadership hover reveal reaching keyboard and screen readers; Home's `tabindex="0"` rows; focus hidden under the fixed nav; target sizes; the intro and pinned hall motion; the now-visible Turnstile widget's placement and focus; Turnstile and Zeffy noted as third parties; 10 minutes of VoiceOver by Jackson on Mac and iPhone. Decision for her: an accessibility statement (new copy).

## SEO audit (later)

Same pattern: report, then one fix pass on a branch. Includes Organization structured data with `foundingDate` 2025-10-08.

## Needs from Dr. McClain

**Send with the preview link:** a suggestion to take the Rahway PAL check photo off her current site, since it shows the foundation's bank numbers.
**Blocks launch:** honoree consent to be named (a parent's for anyone under 18, which may include Nathan); a parent's OK for the camp photo, or confirmation the camp's photo release covers the website; domain and DNS access; the masked Rahway PAL photo; whether the foundation is registered with the NJ Division of Consumer Affairs.
**Approvals:** the camp body line; the Privacy Policy and its two practice lines; the 404 copy; photo 251 beside Our Story; no email address on the site; the Contact form copy; the Sponsorship button pointing to Contact; Home's Newsletter removed; scholars left off the halls; the Support sponsorship pointer; Jaylen's placeholder bio; both Leadership portraits in grayscale; board names and titles if any; "Inaugural class, 2026"; Home card 3 wording; "In the Community" as the page title; In the News with its title and lede; the camp and Rahway PAL deck lines; mark-only nav with full lockup in the footer; favicon crop; whether the site can say three scholarships were awarded in 2026.
**Content:** sponsorship packages link; Instagram URL confirmation and whether she checks DMs; clean unwatermarked photo files (including full-size 222 and 210) and the credit line.
**Received:** the founding date; the Salvation Army article; the camp paragraph and photo; the Zeffy donation form.
**Suggestion:** claim a free Candid profile for a Seal of Transparency.

## At launch (ours)

- Add the Turnstile hostname for `www.everydaylegend.com` if www is used (the apex is already listed).
- Live test from the real domain on a phone on cellular.
- Confirm Vercel serves `/about` without redirecting to `/about/`, so canonicals and the sitemap match.
- Fill in the Privacy Policy's effective date.
- Switch on Vercel Web Analytics; www redirects to the apex; connect the domain in Vercel.
- Sanity webhook to a Vercel deploy hook, so a published news item rebuilds the site.
- Swap in the masked Rahway PAL photo (`community.ts`, one file fixes Home card 1 and In the Community entry 3).

## Other

- Dr. McClain's personal site: the domain verification for `drsyreetamcclain.website` was due by October 15 (email to the Vercel account's inbox). Confirm it was done.
