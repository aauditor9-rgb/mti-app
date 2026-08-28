# Portal → App parity inventory

Portal is canon. Where the two diverge, the app is expanded to match — the portal
is never narrowed. Source files: `Madrassa Portal.dc.html` (portal),
`MadadPhone.dc.html` (app shell + data), `Madad Mobile App.dc.html` (app showcase).

Last verified: 14 Aug 2026.

## Step 1 — Navigation structure (Office / maktab)

| Portal group | Portal items | App items | Verdict |
|---|---|---|---|
| Overview | Dashboard, Calendar, Tasks | Home tab, Calendar, Tasks | ✅ Dashboard = Home tab |
| People | Students, Classes & Allocation, Admissions, Staff | same 4 | ✅ |
| Attendance & Behaviour | Attendance, Behaviour & Pastoral | same 2 | ✅ |
| Teaching & Learning | Teaching Overview, Lesson Plans, Homework, Salah & Tarbiyah, Progress Trackers, Hifz Programme | same 6 | ✅ |
| Reports & Assessment | Reports, Examinations | same 2 | ✅ |
| Operations | Finance, Communications, Safeguarding, Settings | same 4 | ✅ |

Other roles: Teacher (4 groups), Parent (4), Student, Murabbi — all present in
`DIR` in the app, matching the portal's per-role sidebar. ʿĀlimiyyah exists in
the portal (`NAV_STRUCTURE_ALIM`) and in the app's `DIR.office.alim` /
`DIR.teacher.alim`, gated off for maktab-only use.

## Step 1 — Hub sub-tabs

| Hub | Portal | App | Verdict |
|---|---|---|---|
| Students | Records, Emergency Contacts | 2 | ✅ |
| Staff | Teacher Database, Clock In/Out | 2 | ✅ |
| Attendance | Today, Register, Absences, Late Arrivals, Leave | 5 | ✅ (portal Today added; app Today gained the pending-registers list and nudge) |
| Behaviour | Behaviour & Pastoral, Ihsan Points | 2 | ✅ |
| Lesson Plans | Lesson Plans, Holiday Revision | 2 | ✅ |
| Progress Trackers | Du'as, Surahs, Safar Qaaidah, Passport | 4 | ✅ |
| Hifz | Roster, Heat Map, Monthly, Pre-Hifz | 4 | ✅ |
| Reports | Student, Weekly, Attendance, Lateness, Staff, Behaviour | 6 | ✅ |
| Examinations | Exams, Mark Entry, Exam Bank | 3 | ✅ |
| Finance | Fees, Books & Inventory | 2 | ✅ |
| Communications | Messages, Events, Parents' Evening, Forms & Consent, Complaints | 5 | ✅ |
| Safeguarding | Cases, Medical, Risk, Policies | 4 | ✅ |
| Settings | School, Calendars, Branding, Billing, Permissions, Data Import, Process Flows, Year-End Rollover, Audit Log | 9 | ✅ (portal Calendars promoted to its own tab) |

## Amendments made

1. **App** — Settings → Calendars editor added (`MadadPhone.dc.html`): calendar
   switcher, teaching-day chips, class assignment, per-calendar terms and
   holidays with working toggles.
2. **Portal** — Attendance hub gained a **Today** tab: registers-in count,
   present/late/absent off the real roster, classes still to mark with a jump to
   the register and a nudge action, plus an "In already" list with submit times.
3. **Portal** — **Calendars** promoted out of Settings → School into its own
   Settings tab, so both platforms show 9 settings sections in the same order.

## Shared data contract

Both files must agree on these. Any figure derived twice is a defect.

- 13 pupils on roll, 16 classes, 5 staff
- £135 outstanding across 3 families; £45 termly tuition
- Attendance has exactly two derivations, both from the portal's `ATT_REPORT`
  (3 weeks × 5 sessions = 15 per pupil), held in `ATT_TERM` / `ATT_WEEK` in the app:
  - **Term to date** — overall 92.8% (181/195), Year 1a 91.1%, Hifz 96.7%, Ayyub 93.3%
  - **This week (29 Jun – 3 Jul)** — overall 87.7% (57/65), Year 1a 84.4%, Hifz 95.0%
  - Below 90% term to date: Zayd Islam 80.0%, Minaal Alaya 86.7%, Aisha Noor 86.7%
  Never label a weekly figure "term to date" or hardcode a rate on a screen.
- 5 sessions a week per class, Mon–Fri (Mon–Thu lessons + Friday assessment lesson)
- Today = Thursday 2 July 2026 (2 July 2026 really is a Thursday; sessions run Mon–Thu)
- Register submit times come from one map in each file — portal `TODAY_COMPLETED_EARLY`,
  app `REG_IN` (transcribed from it): Year 2a 4:41pm, Year 1a 4:42pm, Year 3 Boys 4:58pm,
  Year 2b 5:01pm, Year 1b 5:03pm. 5 in, 11 pending of 16.
- The 16 class names live in `CLASS_NAMES` in the app. Anything offering a class list
  (register picker, calendar assignment, create sheets) must read it — never `ROSTER`,
  which holds pupil names for the two enrolled classes only.
- Two calendars: Maktab evenings (Mon–Fri), Hifz programme (Mon–Thu + Sat)

## Step 2 — Field audit findings

Batch 1 (People, Attendance & Behaviour):

| Defect | Where | Fix |
|---|---|---|
| Portal dated "Friday 5 July 2026"; app dated "Thursday 2 July". 5 July 2026 is a Sunday and Friday is not a teaching day. | portal shell + Attendance Today | Portal corrected to Thursday 2 July 2026 |
| Four stale legacy screen definitions (14 pupils, 18 staff, 186 pupils, 7 placed) shadowed by the reconciled office data | app `SCREENS` | Dead duplicates removed |
| Classes screen claimed 12 teachers against 5 staff records | app Classes & allocation | Now 5 Staff, matching the portal's derived stat |

Verified clean in batch 1: student records (13, with S-numbers and guardians),
emergency contacts, admissions pipeline, staff list and DBS dates, clock in/out,
absences, late arrivals, Ihsan Points totals.

Batch 2 (Teaching & Learning, Reports & Assessment):

| Defect | Where | Fix |
|---|---|---|
| Portal computes attendance over **5 sessions Mon–Fri** (there is a Friday assessment lesson, and a Fri 3 Jul absence case), while both files described the week as Mon–Thu | portal `SESSIONS`/`ATT_REPORT` vs app calendar + labels | Mon–Fri adopted as canon: maktab calendar teaching days now include Friday in both files, labels updated |
| App attendance report showed 94% week / 94% term against the portal's computed 87.7% | app Attendance report | Rebuilt from the portal's figures: 87.7%, Year 1a 38/45 (84.4%), Hifz 19/20 (95.0%), 4 authorised / 3 unauthorised / 1 pending |
| App weekly review claimed "49 of 52 sessions" | app Weekly review | Now 57 of 65 across 13 pupils, 3 unauthorised |
| App Absences listed 3 cases with wrong dates and reasons | app Absences | Now the portal's six cases with real dates and authorisation states |
| Staff report counted 4 sessions a week | app Staff report | 5 of 5 |
| `DAYS` gained Friday but `WEEK` had no Friday key — Fri timetable tab rendered empty, and Check-in fell back to Monday's lessons under a Friday heading | app timetable data | `WEEK.Friday` added |
| The weekly Qaa'idah assessment was on Thursday in the timetable but described as "Friday lesson 1" on the Exams screen | app | Assessment moved to Friday lesson 1, Thursday now teaches madd letters |
| Day names concatenated onto a hardcoded "2 July", producing "Monday 2 July", "Friday 2 July" | app Check-in and Register subtitles | New `DATES` array aligned to `DAYS` (29 Jun – 3 Jul 2026) |

Verified clean in batch 2: teaching overview, lesson plans, homework hub, salah &
tarbiyah, all four progress trackers, all four hifz screens, student reports,
lateness report, behaviour report, exams, mark entry, exam bank.

Batch 3 (Operations, Settings):

| Defect | Where | Fix |
|---|---|---|
| Attendance Today said registers close at 5:20pm; the portal's own `REGISTER_DEADLINE_LABEL` is 5:05pm | portal Attendance Today | Now reads the constant, so it can never drift |
| Billing plan capped at "250 pupils" and marked Active; the portal's plan is Growth, up to 400 pupils, on a 21-day free trial | app Billing & plan | Matched to the portal's plan record |
| Portal plan seats claimed 214 students against 13 on roll | portal `plan.seats` | Now 13 |
| School details still said Mon–Thu | app Settings → School | Mon–Fri |

Verified clean in batch 3: books & inventory, events & jalsas, parents' evening,
complaints, medical register, risk register, policy acknowledgements, branding,
permissions/users, data import, process flows, year-end rollover, audit log.

## Step 4 — Interaction parity

Every state-changing action exists on both sides and commits real state: mark
register, authorise/unauthorise absence, approve leave, pay a fee, review
homework, award Ihsan Points, log behaviour, record sabaq, raise a stock order,
create a pupil / application / event / task, toggle a holiday.

Date and time fields are real `date` / `daterange` / `time` inputs everywhere they
should be — set work (due date), holiday revision (covering range + return by),
behaviour log (date + time), hifz diary (date heard), leave (dates away), events
(date + start time), tasks (due date), applications (DOB + preferred start).
Chips remain only for genuine enumerations (reason, level, quality, stage).

| Defect | Where | Fix |
|---|---|---|
| Add-pupil and new-application offered only 3 classes; the portal offers all 16 | app create sheets | All 16 classes offered |
| App Today tab had no outstanding-registers list, no submitted-with-times list and no nudge action, so three portal functions had no app form | app Attendance → Today | Built all three: "Still to come in" (11 classes, each with "Mark it now"), "In already" showing the 5 submitted registers with their times, and a nudge that confirms in place |
| `REG_DONE` was hand-authored with 6 classes; the portal's `TODAY_COMPLETED_EARLY` has 5 | app | Map transcribed verbatim as `REG_IN` (class → submit time), so count, list and times all derive from one source: 5 in, 11 pending |
| Friday 3 July appeared as a completed session with a 92% rate, though the app's today is Thursday 2 July | app attendance history | Future row removed; weekly stat relabelled to its date window |
| Pending-registers list was sliced to 5 rows while the heading promised 11, hiding all five girls' classes and Hifz | app Attendance → Today | Slice removed — all 11 pending classes render |
| Register picker read `Object.keys(ROSTER)` (2 classes), so 14 classes had no register and "Mark it now" always landed on Year 1a | app Register | Picker driven off `CLASS_NAMES` (16); `onMark` passes its class; classes with no roll get an explicit empty state pointing at Classes & allocation |
| A class reported as submitted at 4:42pm opened reading "0 of 9 marked" | app Register | `SEED_MARKS` pre-marks registers already in (Year 1a: Ayyub absent, rest present) and the summary shows the submit time |
| `SEED_MARKS` was wiped by the role-change reset and by the Reset button, both of which used `{}` | app | The register's clean slate is `SEED_MARKS` in all three places (initial state, role change, Reset) |
| Office register opened dated Monday 29 June when launched from today's pending list | app Register subtitle | Office register is dated today (Thursday 2 July); the day picker still drives the teacher's own register |
| Empty-state register still showed "0 of 0 marked" and an enabled "All present" | app Register | Summary card and All present gated behind `regHasRoll` alongside the submit button |
| Calendars class chips read the 2-key `ROSTER`; the portal offers all 16 | app Settings → Calendars | Driven off the shared 16-class list |
| Terms were 2025/26 while holidays were 2026/27, so no holiday fell inside any term | seed shared by portal and app | Terms moved to 2026/27 (31 Aug 2026 – 16 Jul 2027) in both files |

## Step 5 — Role gating

Five roles present on both sides (Office, Teacher, Parent, Student, Murabbi) with
matching reachable screens. ʿĀlimiyyah is defined in the app's `DIR` but gated
off by an empty `PROG_ROLES`, so it stays unreachable — maktab-only, as intended.
Office can reach every maktab screen on both platforms, including marking any
class register via the class picker.

## App buildout (Aug 2026)

Screens promoted from generic list to purpose-built, in both platforms where relevant:

| Screen | What it does now |
|---|---|
| Lesson plans (teacher) / Weekly plan (pupil) | 15 summer-term weeks from the scheme of work; **tapping a week opens** a full detail with all five strands (Qaa'idah, Qur'an, Islamic Studies, Duʿās, Surah), material links, and "Set this week as homework" for teachers |
| Iḥsān Points | Five categories with bars, an automatic Ḥuḍūr card (weekly roll-up), then staff awards tagged by category |
| Memorisation | Duʿās with Arabic and English meaning; surahs verse by verse, grouped by surah with per-surah counts |
| Settings → Calendars | Calendar switcher, teaching days, class assignment, terms, holiday toggles |
| Attendance → Today | Pending registers with per-class "Mark it now", nudge, and "In already" with submit times |
| Row detail sheets | Homework, homework review, hifz diary, behaviour, absences, plans, consent, fees, medical, admissions, leave and points open a field table plus a written note, not an echo of the row |

Parent navigation mirrors the portal's seven hubs (Fees and Messages are bottom tabs);
the pupil app is reached by passcode from inside the parent app, never as its own role.

### Iḥsān Points — one derivation

Ayyub's total is **7**: the portal's `HOUSE_POINTS_SEED` rows for S-1102 (HP-1 Ahead of the
Plan 3, HP-6 Ṣalāh Without Asking 2, HP-14 Helped a Classmate 2), plus **0 automatic** —
he was absent Thu 2 Jul and late 30 Jun, so he earns neither Ḥuḍūr award this week and the
screen says why. The app holds the same three rows in `IHSAN_STAFF` and computes
`IHSAN_TOTAL` from them; the Home hero, the Record card, the Points screen, the feed and
the push notification all read that one figure. Never hardcode a points total on a screen.

Every ledger row carries an `award` key from `IHSAN_AWARDS`. A row without one is a data
error — the parent screen now warns to the console rather than inventing an "Other" category.

### Shadowed-copy defects (recurring)

Three separate times now, an edit landed on a dead copy of the data. The live tables are:

- **Sidebar directory** — `DIR.<role>.<programme>` in `MadadPhone.dc.html`. `MORE` is dead; do not edit it.
- **Hub sub-tabs** — `HUBS`/`HUB_OF` for Office, `PARENT_HUBS`/`PARENT_HUB_OF` for Parent.
  They must stay separate: `leave`, `fees` and `messages` mean different tab sets per role,
  and a single table silently overwrote the parent's.
- **Screen keys** — the parent's memorisation screen is keyed `journey`, not `duas`.

`hubOf()` returns the office table for Office, the parent table for Parent, null otherwise;
`hubTabsFor()` picks the matching table. Grep the live table before editing nav data.

## Verification status

All five steps complete. Re-run from step 1 after any structural change.

- [x] Field audit batch 1 — People, Attendance & Behaviour
- [x] Field audit batch 2 — Teaching & Learning, Reports & Assessment
- [x] Field audit batch 3 — Operations, Settings
- [x] Data reconciliation sweep (folded into batches 1–3)
- [x] Interaction parity
- [x] Role gating for all five roles
