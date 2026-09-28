# Everyday Legends Foundation: Chat Handoff

Rebuild of everydaylegend.com by Anchor Digital. Written September 28, 2026, at the end of the In the Community build. Supersedes the September 27 Legends handoff. Process follows `anchor-digital-design-process.md`; technical rules follow `CLAUDE.md`; project decisions live in `CONTEXT.md`.

**Next up: Contact.** Four questions below need answers before its first prompt.

## Where we are

| Phase | Status |
|---|---|
| 0 to 6 | Done. Direction is Brass and Ink. CONTEXT.md updated after every page |
| 7 Build: Home, About, Support, Legends Among Us | Done |
| 7 Build, In the Community | **Done.** Two slices plus Sanity, CONTEXT updated |
| 7 Build, Contact | **Next** |
| 7 Build, Privacy Policy | After Contact. Its wording depends on Contact's form service |
| 8 QA, 9 Launch | Not started |

## People

- **Dr. Syreeta McClain**, Co-Founder & Executive Director. The client.
- **Jaylen McClain**, Co-Founder. Ohio State safety and 2026 team captain.
- Jackson builds and makes all post-launch updates, including news items in Sanity.

## Repo

- **Path:** `~/Downloads/EverydayLegendsSiteBuild`. No remote. Nothing pushed.
- **main:** In the Community slice 1 `d9e7adc`, then slice 2 (Sanity and In the News), the copy deck text-only fix, and "CONTEXT and HANDOFF: In the Community" (latest). Feature branches kept.
- **Stack:** Astro 7.3.4, Tailwind 4.3.3 (tokens in CSS), gsap 3.15.0, `@astrojs/react` + `motion` for islands, `@sanity/client` 8.7.0 for In the News.
- **Sanity:** project `dfzf4x6m`, dataset `production`, Studio in `studio/` (sanity 6.16.0), live at everyday-legends.sanity.studio. No token anywhere in the repo. `studio/scripts/test-news.ts` creates and deletes test items.
- **Shared code:** `Base.astro`, `SupportSlab.astro`, `SettleHead.astro`, `Niche.astro`, `Cornerstone.astro`, `Invitation.astro`, `src/data/` (`nav.ts`, `honorees.ts`, `luncheon.ts`, `community.ts`, `news.ts`, `sanity.ts`), `src/scripts/site.ts`, `src/scripts/motion.ts`.
- **Root files:** `CLAUDE.md`, `CONTEXT.md` (about 230 lines), `everyday-legends-copy.md` (the only source of copy), `anchor-digital-standards.md`, `screenshot.mjs`, `orphans.mjs`, `overflow.mjs`, `frontend-design/SKILL.md`.
- **Photos** live in `brand_assets/`. Color files end `_NNN_websize.jpg`; black and white files end `-NNN_websize.jpg`.
- **Dev server:** port **4322** with `--host` (`npm run dev -- --port 4322 --host`). 4321 belongs to the archived Limestone project. Studio locally: `cd studio && npm run dev` (localhost:3333).
- **Don't mix up the two CONTEXT files.** Dr. McClain's personal site has its own (over 4,500 lines). This one starts "CONTEXT.md: Everyday Legends Foundation".

## In the Community as built

Niche header on 219; three identical entries on a brass rail (148 luncheon, Rahway PAL, Salvation Army), no dates; In the News from Sanity, text-only cards, hidden when empty; closing Support slab. Brass 1 of 3. Details are in CONTEXT.

## Decisions made in the Community chat

- **Rahway PAL on Legends** now uses `RahwayPALAward.jpg`. The check photo stays on Home card 1 and Community entry 2, so the masked file still blocks any push.
- **No dates on community entries.** Only the luncheon had one; its title carries it ("Legends Among Us, May 30").
- **Sanity for In the News only.** Link, headline and outlet as published, one sentence in Jackson's own words, no photo. Article photos are never copied or hotlinked (copyright), and the foundation's library is too small to require one.

## Contact: open questions before the first prompt

Structure comes from `reference/wireframes/contact.html`, words from copy deck section 6: niche holding only the torch; the register form (name, email, message on ruled lines, no boxes) with empty, per-field error, sending and sent states, routing to info@everydaylegend.com; the reach-us marginalia; Home's newsletter.

1. **Form service.** Formspree is standard. Decide whose account holds it; info@everydaylegend.com must verify the address from its inbox. Add spam protection (Formspree's own, or Cloudflare Turnstile).
2. **Form copy.** Section 6 has no field labels, button, error messages, sending text or sent message. Write them into the deck and get them approved before the build.
3. **Newsletter.** Provider is still pending. Reuse Home's newsletter as built (no backend, no success state) or leave it off Contact until a provider exists.
4. **Privacy Policy inputs.** List what the site collects and where it goes: the form service, the newsletter provider, Zeffy, and whether there are analytics. Sanity holds no visitor data.

## Standing prompt routine

- Fresh Claude Code session on Opus per slice, started inside the repo.
- Every prompt: read `./frontend-design/SKILL.md`, CONTEXT.md is the source of truth, copy only from the copy deck, MUST and MUST NOT, never commit. First step: confirm main's latest commit title (written out, never a placeholder) and report its hash; stop if it differs.
- Photos and the current copy deck go into the repo and get committed **before** the prompt runs. Check the deck in the repo matches the chat's latest version.
- Proof every pass: base commit, `git diff --stat main` plus untracked files, screenshots at the 11 widths with reduced motion, `orphans.mjs` and `overflow.mjs` clean, Home proof whenever shared files change, conflicts with CONTEXT.md reported.
- Small fixes after a slice go into the same session before the commit.
- Jackson reviews on localhost, then commits in Terminal: `git add -A`, commit, `git checkout main`, `git merge --ff-only <branch>`.
- CONTEXT.md stays lean. The chat writes lines only after a page passes review.
- Tell Jackson in plain words what to look for after every prompt.

## Needs from Dr. McClain

**Blocks launch:** the Zeffy embed code; honoree consent to be named (a parent's for anyone under 18, which may include Nathan); domain and DNS access; the masked Rahway PAL photo (bank numbers on the check); whether the foundation is registered with the NJ Division of Consumer Affairs.
**Approvals:** scholars left off the halls; the Support sponsorship pointer's body and button; Jaylen's placeholder bio; both Leadership portraits in grayscale; the founding year; board names and titles if any; "Inaugural class, 2026"; Home card 3 wording (now also the luncheon entry on In the Community); "In the Community" as the page title; In the News with its title and lede; the Rahway PAL and Salvation Army deck lines; mark-only nav with full lockup in the footer; favicon crop; whether the site can say three scholarships were awarded in 2026; whether she wants "Who We Are," "Purpose of the Luncheon," or "Long-Term Vision" from the program.
**Content:** sponsorship packages link; newsletter provider; Instagram URL confirmation; clean unwatermarked photo files and the credit line.
**Suggestion:** claim a free Candid profile for a Seal of Transparency.
**Her old site, before the KNOW Women gala on Tuesday, October 6, 2026:** pull the May 30 ticket cards, fix the "Amoung" typo and the browser title.

## At launch (ours)

- Sanity webhook to a Vercel deploy hook, so a published news item rebuilds the live site.
- If a new article doesn't show on localhost, restart the dev server.

## Next steps

1. Start the Contact chat with this file, CONTEXT.md, the copy deck, and the contact wireframe. Settle the four questions, write the form copy into the deck, then write slice prompts.
2. Privacy Policy once Contact's services are settled.
3. QA checklist (Phase 8), then launch.
