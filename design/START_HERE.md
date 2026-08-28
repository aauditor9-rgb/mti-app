# Start here

You are implementing **MTI Maktab**, a multi-tenant madrasah management system, from a
set of HTML design prototypes.

## Read in this order

1. **`README.md`** — the design spec. Tokens, every screen, interactions, data model,
   state, permissions, and eight invariants that were real defects. Self-sufficient.
2. **`TECH_STACK.md`** — recommended stack, accounts to sign up for, multi-tenancy and
   safeguarding rules, build order, repo shape.
3. **`PARITY.md`** — portal ↔ mobile app data contract and the defect log. Read before
   touching anything that shows a number twice.

## Then run the prototypes

Open `Madrassa Portal.dc.html` in a browser. It is the canonical design — every Office,
Teacher, Parent and Pupil screen is in there and clickable. Click through the flow you
are about to build before you build it. `MadadPhone.dc.html` is the companion app.

## What these files are

Design references, not production code. `support.js` is prototype runtime — do not port
it. The in-memory seed arrays in the prototypes are your **schema hints and fixture
data**: each becomes a database table.

## Suggested first prompt to Claude Code

> Read README.md, TECH_STACK.md and PARITY.md in full. Then scaffold the Next.js +
> TypeScript + Tailwind + Drizzle + Supabase project described in TECH_STACK.md, set up
> the tenant schema with RLS for madrasah, pupil, guardian, class and staff, and build
> the design tokens from README.md as CSS variables. Do not build any screens yet —
> show me the schema and the token layer first.

Then work through the build order in `TECH_STACK.md`, one step per session.

## Non-negotiables

- Islamic terminology stays transliterated with diacritics exactly as written in the
  designs — do not anglicise or strip diacritics.
- Safeguarding tables are append-only, role-gated and fully audited.
- Every figure has exactly one derivation, in `lib/derive/`, unit-tested.
- UK local dates. Never `toISOString()` for a calendar day.
