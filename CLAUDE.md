# CLAUDE.md: Anchor Digital Website Rules

@CONTEXT.md

## Always do first

- Read CONTEXT.md (imported above) when the repo has one. It holds this project's locked decisions and wins over anything generic in this file.
- Decide the stack before writing any code (see Stack).
- Load the `frontend-design` skill before writing frontend code, every session, no exceptions.
- Check `brand_assets/` for logos, colors, and photos before designing. Use real assets over placeholders.

## Keep instruction files short

- This file stays under 120 lines. CONTEXT.md stays under 300 lines. Decisions only; history goes in commit messages.
- Editing CONTEXT.md never triggers a stop.
- If CONTEXT.md and a prompt disagree, the prompt wins for that session. Report the conflict at the end instead of stopping.
- Stop only for real blockers: a missing file, or a build you cannot fix.

## Stack

- **Astro (SSG)** for informational sites: no user accounts, no payments, no real-time data. Add Sanity CMS only when the client manages their own content.
- **Next.js + Supabase + Stripe** when a user logs in and sees their own data, or when money moves. For those projects, copy `APP-STACK.md` into the repo and add `@APP-STACK.md` under the CONTEXT import. Its security rules are non-negotiable.
- **Vercel** hosts both. Mobile-first. Placeholders from `https://placehold.co/WIDTHxHEIGHT` only where no real asset exists.

## React islands and 21st.dev

- Islands through `@astrojs/react`. The page stays Astro. Below-the-fold islands load with `client:visible`.
- 21st.dev source lives in `reference/21st/`, exactly as copied. MUST keep the source's motion values (durations, easing, stagger, distances) unless the prompt or CONTEXT.md lists the change. MUST restyle its look to the project's tokens.
- Every island works with keyboard and with reduced motion.

## Reference material

- `reference/` is never imported, built, or shipped.
- Wireframes and reference images are for content and structure only. MUST NOT copy their visual design or their placeholder text.

## Local server

- Always serve on localhost. Never screenshot a `file:///` URL.
- Astro: `npm run dev` (port 4321). Next.js: `npm run dev` (port 3000).
- If a server is already running, do not start a second one.

## Screenshot workflow

- Create `screenshot.mjs` if it does not exist. Run `node screenshot.mjs http://localhost:4321`. Screenshots save to `./temporary screenshots/screenshot-N.png`.
- Read each PNG and judge it directly. Be specific: "heading is 32px but should be about 24px," never "looks off."
- Check spacing, size and weight, exact hex colors, alignment, radius, shadows.
- Animated sections: screenshot with reduced motion emulated, or at the animation's end state. Never mid-animation (it causes correction loops).
- At least 2 rounds of screenshot, fix, re-screenshot. Stop when it looks right or Jackson says so.
- If the screenshot and the numbers disagree, the screenshot is right.

## Git

- One feature branch per pass. `main` stays at the last state Jackson reviewed.
- MUST NOT commit, merge, or push unless the prompt says to.
- Every pass ends with proof: the base commit, `git diff --stat` against it, and screenshots. A written report is not evidence.

## Hard rules

- No `transition-all`. Animate only transform and opacity.
- No default Tailwind palette (blue-600, indigo-500, and so on) and no purple or indigo gradients.
- No ghost or outline buttons. Solid fill, 4.5:1 text contrast, and hover, focus-visible, and active states on every clickable element.
- No Inter, Roboto, Open Sans, Lato, Arial, Space Grotesk, or system fonts.
- No flat solid-color hero backgrounds. Heroes carry grain, texture, or depth.
- Do not copy a reference design visually.
- Do not stop after one screenshot pass.
- Every client site ships a privacy policy page linked from the footer.
- Footer credit on every client site: "Built by Anchor Digital," linking to anchordigitalco.com in a new tab.
