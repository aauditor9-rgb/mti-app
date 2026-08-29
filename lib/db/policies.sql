-- Row-Level Security policies, one per tenant-owned table.
-- Pattern from design/TECH_STACK.md "Multi-tenancy": madrasah_id must match the JWT's
-- app_metadata.madrasah_id claim, set server-side at invite time — never user-writable.
-- Applied with `npm run db:policies` (see lib/db/apply-policies.ts) after `npm run db:push`.

alter table madrasah enable row level security;
drop policy if exists tenant_self on madrasah;
create policy tenant_self on madrasah
  using (id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid);

alter table staff enable row level security;
drop policy if exists tenant_isolation on staff;
create policy tenant_isolation on staff
  using (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid)
  with check (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid);

alter table class enable row level security;
drop policy if exists tenant_isolation on class;
create policy tenant_isolation on class
  using (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid)
  with check (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid);

alter table household enable row level security;
drop policy if exists tenant_isolation on household;
create policy tenant_isolation on household
  using (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid)
  with check (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid);

alter table guardian enable row level security;
drop policy if exists tenant_isolation on guardian;
create policy tenant_isolation on guardian
  using (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid)
  with check (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid);

alter table pupil enable row level security;
drop policy if exists tenant_isolation on pupil;
create policy tenant_isolation on pupil
  using (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid)
  with check (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid);

alter table pupil_guardian enable row level security;
drop policy if exists tenant_isolation on pupil_guardian;
create policy tenant_isolation on pupil_guardian
  using (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid)
  with check (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid);
