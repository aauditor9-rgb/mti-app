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

alter table salah_log enable row level security;
drop policy if exists tenant_isolation on salah_log;
create policy tenant_isolation on salah_log
  using (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid)
  with check (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid);

alter table dua_catalog_item enable row level security;
drop policy if exists tenant_isolation on dua_catalog_item;
create policy tenant_isolation on dua_catalog_item
  using (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid)
  with check (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid);

alter table dua_pupil_status enable row level security;
drop policy if exists tenant_isolation on dua_pupil_status;
create policy tenant_isolation on dua_pupil_status
  using (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid)
  with check (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid);

alter table surah_catalog_item enable row level security;
drop policy if exists tenant_isolation on surah_catalog_item;
create policy tenant_isolation on surah_catalog_item
  using (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid)
  with check (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid);

alter table surah_pupil_status enable row level security;
drop policy if exists tenant_isolation on surah_pupil_status;
create policy tenant_isolation on surah_pupil_status
  using (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid)
  with check (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid);

alter table safar_qaaidah_level enable row level security;
drop policy if exists tenant_isolation on safar_qaaidah_level;
create policy tenant_isolation on safar_qaaidah_level
  using (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid)
  with check (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid);

alter table safar_qaaidah_item enable row level security;
drop policy if exists tenant_isolation on safar_qaaidah_item;
create policy tenant_isolation on safar_qaaidah_item
  using (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid)
  with check (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid);

alter table safar_qaaidah_pupil_status enable row level security;
drop policy if exists tenant_isolation on safar_qaaidah_pupil_status;
create policy tenant_isolation on safar_qaaidah_pupil_status
  using (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid)
  with check (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid);

alter table calendar_set enable row level security;
drop policy if exists tenant_isolation on calendar_set;
create policy tenant_isolation on calendar_set
  using (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid)
  with check (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid);

alter table term enable row level security;
drop policy if exists tenant_isolation on term;
create policy tenant_isolation on term
  using (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid)
  with check (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid);

alter table holiday enable row level security;
drop policy if exists tenant_isolation on holiday;
create policy tenant_isolation on holiday
  using (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid)
  with check (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid);

alter table task enable row level security;
drop policy if exists tenant_isolation on task;
create policy tenant_isolation on task
  using (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid)
  with check (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid);

alter table fee_invoice_line enable row level security;
drop policy if exists tenant_isolation on fee_invoice_line;
create policy tenant_isolation on fee_invoice_line
  using (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid)
  with check (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid);

alter table fee_payment enable row level security;
drop policy if exists tenant_isolation on fee_payment;
create policy tenant_isolation on fee_payment
  using (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid)
  with check (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid);

alter table inventory_item enable row level security;
drop policy if exists tenant_isolation on inventory_item;
create policy tenant_isolation on inventory_item
  using (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid)
  with check (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid);

alter table inventory_issue enable row level security;
drop policy if exists tenant_isolation on inventory_issue;
create policy tenant_isolation on inventory_issue
  using (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid)
  with check (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid);

alter table message enable row level security;
drop policy if exists tenant_isolation on message;
create policy tenant_isolation on message
  using (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid)
  with check (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid);

alter table event enable row level security;
drop policy if exists tenant_isolation on event;
create policy tenant_isolation on event
  using (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid)
  with check (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid);

alter table form_template enable row level security;
drop policy if exists tenant_isolation on form_template;
create policy tenant_isolation on form_template
  using (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid)
  with check (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid);

alter table form_response enable row level security;
drop policy if exists tenant_isolation on form_response;
create policy tenant_isolation on form_response
  using (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid)
  with check (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid);

alter table complaint enable row level security;
drop policy if exists tenant_isolation on complaint;
create policy tenant_isolation on complaint
  using (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid)
  with check (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid);

alter table first_aid_log_entry enable row level security;
drop policy if exists tenant_isolation on first_aid_log_entry;
create policy tenant_isolation on first_aid_log_entry
  using (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid)
  with check (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid);

alter table risk_register_entry enable row level security;
drop policy if exists tenant_isolation on risk_register_entry;
create policy tenant_isolation on risk_register_entry
  using (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid)
  with check (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid);

alter table policy enable row level security;
drop policy if exists tenant_isolation on policy;
create policy tenant_isolation on policy
  using (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid)
  with check (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid);

alter table policy_staff_ack enable row level security;
drop policy if exists tenant_isolation on policy_staff_ack;
create policy tenant_isolation on policy_staff_ack
  using (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid)
  with check (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid);

alter table staff_clock_event enable row level security;
drop policy if exists tenant_isolation on staff_clock_event;
create policy tenant_isolation on staff_clock_event
  using (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid)
  with check (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid);

alter table staff_payroll_record enable row level security;
drop policy if exists tenant_isolation on staff_payroll_record;
create policy tenant_isolation on staff_payroll_record
  using (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid)
  with check (madrasah_id = (auth.jwt() -> 'app_metadata' ->> 'madrasah_id')::uuid);
