# Recommended tech stack — MTI Maktab

A pragmatic stack for a UK multi-tenant madrasah management SaaS with safeguarding data.
Chosen for: one language end-to-end, UK/EU data residency, row-level tenant isolation,
cheap to start, and something Claude Code is very fluent in.

---

## The short answer

| Layer | Pick | Why |
|---|---|---|
| Framework | **Next.js 15 (App Router) + TypeScript** | One repo for marketing site, portal and API. Server Components suit a data-heavy admin UI. |
| Styling | **Tailwind CSS v4** + CSS variables | The design tokens in the README map 1:1 to CSS variables; tenant accent colour swaps at runtime. |
| Components | **shadcn/ui** (Radix primitives) | Copy-in, not a dependency. Dialogs, drawers, popovers, tables, date pickers — everything the prototype uses. |
| Data layer | **Drizzle ORM** | Typed SQL, real migrations, plays well with Postgres RLS. (Prisma is fine too; Drizzle is closer to the SQL you'll need.) |
| Database | **Postgres on Supabase (London, `eu-west-2`)** | Auth + Postgres + storage + RLS in one. Row-Level Security is the multi-tenancy mechanism. |
| Auth | **Supabase Auth** (email/password + magic link) | Parent/pupil logins at scale. Madrasah code at sign-in resolves the tenant. |
| File storage | **Supabase Storage** | Consent forms, medical notes, DBS certificates, tenant logos. Private buckets, signed URLs. |
| Email | **Resend** + **React Email** | Absence notices, report cards, invoices, password resets. |
| SMS / push | **Twilio** (SMS) · **Expo Push** (app) | Absence alerts to guardians. |
| Payments | **Stripe** — Billing for SaaS plans, Checkout + Direct Debit (Bacs) for madrasah fees | Bacs DD is what UK parents expect for termly fees. |
| Background jobs | **Inngest** (or Supabase cron) | Nightly attendance rollups, DBS expiry checks, fee reminders, report generation. |
| PDF | **React-PDF** or Puppeteer on a worker | Reports, invoices, register printouts. |
| Charts | **Recharts** | Attendance and Iḥsān trend charts. |
| Hosting | **Vercel** (Pro) | Zero-config Next.js. Set the function region to `lhr1` (London). |
| Errors / analytics | **Sentry** + **PostHog EU** | PostHog's EU cloud keeps pupil analytics in the EU. |
| Testing | **Vitest** (units, esp. the derivation rules) + **Playwright** (register → submit → parent sees it) | The invariants in the README are exactly what unit tests are for. |
| Mobile app | **Expo (React Native) + expo-router** | Shares TypeScript types and API layer with the web. Ship later — the web app is a PWA on day one. |

---

## Accounts to sign up for

Start here — free tiers cover build and pilot.

1. **GitHub** — repo. Free.
2. **Vercel** — hosting. Free to build; Pro ~$20/user/mo when you go live.
3. **Supabase** — database, auth, storage. Free tier, then $25/mo Pro. **Choose the London (`eu-west-2`) region when creating the project — you cannot change it later.**
4. **Resend** — email. Free to 3k/mo, then $20/mo. You'll need to verify a sending domain.
5. **Stripe** — payments. Pay-per-transaction; enable **Bacs Direct Debit** in the UK account.
6. **Sentry** — errors. Free tier is plenty at first.
7. **PostHog (EU Cloud)** — product analytics. Free tier.
8. **Twilio** — SMS. Pay as you go, only if you want text alerts at launch.
9. **Anthropic** — Claude Code. Pro or Max plan.

Also register: a domain, and (because you'll hold pupil and safeguarding data) an
**ICO registration** as a UK data controller — currently £52/yr for small organisations.
Budget for a DPIA and a written retention policy before the first live pupil record.

Rough monthly cost for a live pilot: **£60–90**, plus Stripe fees.

---

## Multi-tenancy

Every tenant-owned table carries `madrasah_id uuid not null references madrasah(id)`.
Enable RLS on all of them and write one policy per table against the JWT claim:

```sql
alter table pupil enable row level security;
create policy tenant_isolation on pupil
  using (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid);
```

Set `madrasah_id` (and `role`) into `app_metadata` on the user at invite time — never
into user-writable metadata. The 4-digit madrasah code from the sign-in screen is a
lookup on `madrasah.code`, not a security boundary.

**Never query with the service-role key from a request handler.** Use it only in
migrations and background jobs. One leaked service-role query is a cross-madrasah data
breach involving children's records.

## Permissions

The prototype's `SECTION_PERMS_DEFAULT` becomes a `role_permission` table
(`madrasah_id`, `role`, `section_key`, `can_view`, `can_edit`), editable in Settings.
Check it in a server-side `requireSection(key)` guard used by every route segment and
every server action — not only in the nav. RLS handles rows; this handles screens.

## Safeguarding data

Concerns and safeguarding cases are the most sensitive tables in the system.

- Separate table, separate RLS policy, visible only to DSL/Deputy DSL roles — not to
  general Office staff.
- **Append-only.** Log entries are never edited or deleted; corrections are new entries.
- Full audit trail: who read it, who wrote it, when. Write an `audit_log` row on read as
  well as write for these tables.
- Retention: safeguarding records are typically kept 25 years from date of birth. Build
  retention as a policy field, not a hard-coded number.
- Encrypt attachments at rest; signed URLs with short expiry, never public buckets.

## Dates

The whole system runs on UK local dates and BST bites. Store `date` for calendar days
(never `timestamptz`), store `timestamptz` for events in time, and format with
`Europe/London` everywhere. Invariant 6 in the README exists because `toISOString()`
already broke this once.

## Build order

1. Schema + RLS + auth + tenant bootstrap.
2. Pupils, guardians/households, classes, staff — the spine everything hangs off.
3. Attendance register (mark → submit → immutable with submit time) and the derived
   rate. Get the derivations right once, in `lib/derive/*`, unit-tested.
4. Iḥsān ledger + auto-awards from attendance rules.
5. Concerns + safeguarding escalation.
6. Admissions → enrolment wizard.
7. Homework, plans, trackers, Hifz.
8. Fees + Stripe. Exams + reports. Communications.
9. Settings: branding, permissions, terms/holidays, billing.
10. Expo app against the same API.

## Repo shape

```
app/
  (marketing)/            public site + sign-in
  (portal)/[role]/…       office / teacher / parent / pupil
  api/
lib/
  db/schema.ts            drizzle tables
  db/policies.sql         RLS
  derive/                 attendance rate, ihsan totals, priority score, capacity …
  auth/                   session, requireSection()
components/ui/            shadcn
design/                   the HTML prototypes from this bundle
```

Keep `derive/` pure and exhaustively tested — every invariant in the README is a test
case there.
