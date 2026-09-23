# CLAUDE.md — Frontend Website Rules

## Always Do First
- **Decide the stack first** — read the Architecture Decisions section before writing a single line of code. Static or app? Wrong choice early = rework later.
- **Load the `frontend-design` skill** before writing any frontend code, every session, no exceptions. It contains all typography, color, animation, and anti-generic design rules.
- **Check `brand_assets/`** for logos, color guides, and style guides before designing anything.

## Architecture Decisions

### Choose the right stack before writing any code

**Use Astro (SSG) when:**
- The site is mostly informational — people read it, not interact with it deeply
- No user accounts, no payments, no real-time data
- Examples: portfolios, blogs, local business sites, landing pages, equipment showcases
- Add Sanity CMS if the client needs to self-manage content (e.g. a product catalog)

**Use Next.js + Supabase when:**
- Users log in and see their own data
- Money is being processed (food orders, e-commerce, bookings)
- Anything needs to update in real-time (restaurant dashboard, live inventory)
- Data is being written, not just read
- Examples: food ordering, e-commerce, SaaS dashboards

**The simple rule:** if a user logs in and sees THEIR data, or money moves — you need a proper app, not a static site.

### Standard stack for food ordering / e-commerce
- **Next.js** — frontend + API routes. Handles the logic and rendering.
- **Supabase** — Postgres database, auth, and real-time subscriptions. Handles the memory.
- **Stripe** — payments. 2.9% + 30¢ per transaction, no monthly fee.
- **Vercel** — hosting for both Astro and Next.js apps.
- **Resend or Twilio** — transactional emails or SMS order confirmations.

### How a live restaurant dashboard works
1. Customer orders → Stripe charges card → Next.js writes order to Supabase with status `pending`
2. Restaurant dashboard listens via Supabase real-time — new order appears instantly, no refresh
3. Staff click Accept → Preparing → Ready → Complete, each updating status in Supabase
4. Optional: status changes trigger a Twilio SMS to the customer

### Content management for static sites
- Use **Sanity CMS** when a client needs to self-manage content (products, menu items, blog posts)
- Sanity gives the client a clean admin UI — no code, no terminal
- When they save a change, Vercel auto-rebuilds the site
- Free tier is generous enough for most small business clients

## Security (Next.js + Supabase apps)

### Supabase RLS — non-negotiable
- **Enable RLS on every table.** No exceptions. Run this to audit: `SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = false;`
- **Write policies with `(select auth.uid())`** — not `auth.uid()`. The parentheses let Postgres cache the result per query instead of re-evaluating per row. Up to 100× faster on large tables.
- **Always add an index** on the column referenced in the policy (e.g. `user_id`, `restaurant_id`).
- **Never use `FOR ALL`** — write separate policies for SELECT, INSERT, UPDATE, DELETE.
- **Always add `WITH CHECK`** on UPDATE policies or users can change `user_id` to steal rows.
- **Test policies through the client SDK** with a real user JWT, not the SQL editor — the SQL editor runs as superuser and bypasses RLS.

Example correct policy:
```sql
CREATE POLICY "orders_owner_select" ON orders
FOR SELECT TO authenticated
USING ((select auth.uid()) = user_id);

CREATE INDEX orders_user_id_idx ON orders (user_id);
```

### Supabase key rules
- `SUPABASE_SERVICE_ROLE_KEY` bypasses all RLS — **never put it in any `NEXT_PUBLIC_` env var**, never in client code, never in browser bundles. Server-side only.
- The anon key is safe in the browser — it only works because RLS protects the data.
- If `service_role` ever touched a frontend file or git history, rotate it immediately.

### Stripe webhook rules
- **Use `req.text()` not `req.json()`** before calling `stripe.webhooks.constructEvent()`. Parsing JSON first breaks signature verification.
- **Persist `event.id` in a DB table** before processing — Stripe redelivers on non-2xx, dedupe by event ID or you'll process orders twice.
- **Never trust client-passed amounts** — always compute price server-side.
- All Stripe operations happen server-side only. The browser only touches the publishable key and Stripe Elements.

### Next.js auth rules
- **Never rely on middleware as the only auth check** — always re-verify inside the Server Action or route handler too.
- **`NEXT_PUBLIC_` vars are in the browser bundle** — never put secrets there.
- **Use `supabase.auth.getUser()`** on the server, not `getSession()`.
- Server Actions are CSRF-safe. Route handlers are not — verify origin or use a token.

### Inventory race conditions
- Never check stock in two separate queries — always do it atomically at the DB:
```sql
UPDATE products SET stock = stock - 1
WHERE id = $1 AND stock >= 1
RETURNING stock;
-- 0 rows returned = out of stock
```

## Stack
- **Framework:** Astro (SSG) for informational sites. Next.js + Supabase for apps.
- **Deployment:** Vercel for both.
- **Images:** Use `https://placehold.co/WIDTHxHEIGHT` for placeholders where real images aren't available.
- **Mobile-first responsive.**

## Reference Images
- Use for **content and structure only** — what sections exist, what copy to use. Do NOT copy the visual design.
- Apply full design craft from the frontend-design skill regardless of what the reference looks like.
- Screenshot, review, fix, re-screenshot. At least 2 rounds. Stop only when it looks great or user says so.

## Local Server
- **Always serve on localhost** — never screenshot a `file:///` URL.
- For Astro: `npm run dev` (default port 4321). For Next.js: `npm run dev` (default port 3000).
- If the server is already running, do not start a second instance.

## Screenshot Workflow
- Use `node screenshot.mjs http://localhost:4321` to take screenshots
- Screenshots save to `./temporary screenshots/screenshot-N.png`
- After screenshotting, read the PNG and analyze it directly
- Be specific: "heading is 32px but should be ~24px", not "looks off"
- Check: spacing, font size/weight, colors (exact hex), alignment, border-radius, shadows
- **Do NOT screenshot animated or dynamic elements** — causes infinite loops

## GitHub & Deployment
- **Never push to GitHub unless explicitly told to.** Test on localhost first.
- When user confirms and says to push, commit and push. Vercel will auto-deploy.
- Do not auto-commit after every change — only on explicit instruction.

## Brand Assets
- Always check `brand_assets/` before designing.
- If a logo is present, use it. If colors are defined, use those exact values.
- Never use placeholders where real assets are available.

## Hard Rules
- Do not copy a reference design visually — content and structure only
- Do not stop after one screenshot pass
- Do not use `transition-all`
- Do not use default Tailwind blue/indigo as primary
- Do not use ghost buttons
- Do not push to GitHub without explicit instruction
- Do not screenshot animated elements
- Do not use Inter, Roboto, Arial, or system fonts
- Do not use solid color backgrounds in hero sections
- Do not put SUPABASE_SERVICE_ROLE_KEY in any NEXT_PUBLIC_ variable
- Do not use req.json() before constructEvent in Stripe webhooks
- Do not rely on middleware as the only auth check
