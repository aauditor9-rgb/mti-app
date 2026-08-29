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

alter table attendance_mark enable row level security;
drop policy if exists tenant_isolation on attendance_mark;
create policy tenant_isolation on attendance_mark
  using (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid)
  with check (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid);

alter table register_submission enable row level security;
drop policy if exists tenant_isolation on register_submission;
create policy tenant_isolation on register_submission
  using (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid)
  with check (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid);

-- ihsan_award is a shared catalog, not tenant-owned — every madrasah reads the same
-- fixed award list, so it's world-readable rather than madrasah_id-scoped.
alter table ihsan_award enable row level security;
drop policy if exists readable on ihsan_award;
create policy readable on ihsan_award using (true);

alter table ihsan_ledger enable row level security;
drop policy if exists tenant_isolation on ihsan_ledger;
create policy tenant_isolation on ihsan_ledger
  using (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid)
  with check (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid);

-- Ordinary pastoral concerns — tenant-scoped like every other table. This is NOT the
-- separate DSL-only safeguarding case system design/TECH_STACK.md calls for; see the
-- comment on the `concern` table in lib/db/schema.ts for why that's deferred.
alter table concern enable row level security;
drop policy if exists tenant_isolation on concern;
create policy tenant_isolation on concern
  using (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid)
  with check (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid);

alter table applicant enable row level security;
drop policy if exists tenant_isolation on applicant;
create policy tenant_isolation on applicant
  using (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid)
  with check (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid);

alter table applicant_stage_log enable row level security;
drop policy if exists tenant_isolation on applicant_stage_log;
create policy tenant_isolation on applicant_stage_log
  using (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid)
  with check (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid);

alter table homework enable row level security;
drop policy if exists tenant_isolation on homework;
create policy tenant_isolation on homework
  using (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid)
  with check (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid);

alter table homework_submission enable row level security;
drop policy if exists tenant_isolation on homework_submission;
create policy tenant_isolation on homework_submission
  using (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid)
  with check (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid);

alter table lesson_plan enable row level security;
drop policy if exists tenant_isolation on lesson_plan;
create policy tenant_isolation on lesson_plan
  using (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid)
  with check (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid);

alter table lesson_plan_entry enable row level security;
drop policy if exists tenant_isolation on lesson_plan_entry;
create policy tenant_isolation on lesson_plan_entry
  using (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid)
  with check (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid);
