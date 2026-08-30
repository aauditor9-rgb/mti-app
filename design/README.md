# Handoff: MTI Maktab — Madrassah Management System

## Overview
A complete evening-maktab management system for Madrasah Talimuddin Islam (MTI): a
multi-role web portal (Office / Teacher / Parent / Pupil) plus a companion mobile app,
covering admissions through to enrolment, class allocation, attendance registers,
Iḥsān (reward) points, pastoral concerns with safeguarding escalation, lesson plans,
memorisation trackers, a Hifz programme, exams, reports, fees, communications,
safeguarding and school settings.

Scope of this handoff: **the maktab** (Reception–Year 8 evening madrassah, plus the
Pre-Hifdh and Hifz classes). The ʿĀlimiyyah (7-year seminary) programme is present in
the same prototype but is out of scope — it is gated off and documented separately in
`Alimiyyah Portal.dc.html`.

## About the design files
The files in this bundle are **design references created in HTML** — working prototypes
that show intended look, structure, data shape and behaviour. They are **not production
code to copy**. The task is to **recreate these designs in the target codebase's
environment** (React/Next, Vue, Rails+Hotwire, SwiftUI — whatever the app already uses)
using its established patterns, routing, component library and data layer. If no codebase
exists yet, pick the most appropriate stack and implement the designs there.

All state in the prototype is in-memory React state seeded from constant arrays. In
production every one of those seed constants becomes a **database table** — the seeds are
your schema hints and your fixture data, nothing more.

## Fidelity
**High fidelity.** Final colours, typography, spacing, copy tone and interaction
behaviour. Recreate the UI closely, substituting the codebase's own primitives where they
exist. Copy is deliberate and should be preserved verbatim — Islamic terminology is
transliterated with diacritics (Iḥsān, Ḥuḍūr, ʿIbādah, ʿIlm, Adab, Khidmah, Ṣalāh,
Duʿāʾ, Qaa'idah, Sabaq/Sabqi/Manzil, Muḥāsabah) and must not be normalised or
anglicised.

---

## Design tokens

### Colour (warm terracotta on parchment)
| Token | Value | Use |
|---|---|---|
| `--ink` | #1F1B18 | primary text |
| `--ink-2` | #5f584d | secondary text |
| `--muted` | #8a8073 | labels, meta |
| `--muted-2` | #b3a894 | disabled, hints |
| `--bg` | #F4F1EA | app background |
| `--surface` | #FBF9F4 | cards |
| `--surface-2` | #EDE6D9 | sunken/neutral chips |
| `--border` | #E4DDCE | hairlines |
| `--border-2` | #DCD2C0 | stronger borders, scrollbar |
| `--primary` | #C2603C | brand / actions |
| `--primary-600` | #a8512f | hover |
| `--primary-700` | #9d4a2c | active, links hover |
| `--brand-accent` | #C2603C | tenant-overridable accent (Branding settings) |
| `--success` / `--success-bg` | #647B4C / #EAEBD9 | present, resolved |
| `--alert` / `--alert-bg` | #B23D26 / #F3E0D8 | absent, high severity, expired DBS |
| `--warn-bg` | #F3E7CE | late, medium severity, expiring soon |

House colours (Iḥsān houses): Badr #2b6cb0 / soft #e7eef7 · Uḥud #38795b / #e4f0ea ·
Khaybar #a15c1e / #f6ece0 · Ḥunayn #7a3b86 / #f1e6f3.

Iḥsān category colours: Ḥuḍūr #2F6A45 / #E6EFE8 · ʿIbādah #2C5C8A / #E4EDF5 ·
ʿIlm #8A6A1E / #F5EBD4 · Adab #A2452A / #F5E3DC · Khidmah #5C4A7A / #EBE5F2.

### Typography
- Body/UI: **DM Sans** (fallback 'Helvetica Neue', Arial, sans-serif), weight 400.
- Display/numerals in charts and rings: **Beatrice** (Light 300 / Regular 400 / Medium 500),
  `@font-face` from `fonts/Beatrice-*.woff2` — included in this bundle.
- Scale: display 48 · h1 40 · h2 32 · h3 26 · h4 22 · h5 20 · lead 17 · body-lg 15 ·
  body 14 · small 13 · micro 12 · tiny 11 · caption 10 (all px).
- `-webkit-font-smoothing: antialiased`; `text-wrap: pretty` on prose.

### Spacing (4px base)
xs 4 · sm 8 · md 12 · lg 16 · xl 24 · 2xl 32 · 3xl 48.

### Radius
sm 8 · md 12 · lg 16 · xl 22 · pill 999.

### Elevation
- sm `0 1px 2px rgba(16,24,40,.05)`
- md `0 8px 24px -8px rgba(23,26,43,.18)`
- lg `0 18px 40px -10px rgba(43,52,108,.35)`
- xl `0 30px 70px -20px rgba(15,19,42,.55)`

### Iconography
16px line icons, `stroke-width 1.7`, `stroke-linecap/linejoin: round`, 24×24 viewBox,
`currentColor`, opacity .9. Every nav key has a path set (`NAV_ICONS` in the prototype) —
substitute an equivalent line-icon set (Lucide/Feather) in production.

---

## Roles & navigation

Five roles. Office is the superset; Teacher, Parent and Pupil are scoped views.
Sidebar entries are **hubs**; a hub's screens appear as sub-tabs across the top of the
content area. Same pattern on every role.

### Office (sidebar groups → items)
- **Overview** — Dashboard, Calendar, Tasks
- **People** — Students, Classes & Allocation, Admissions, Staff
- **Attendance & Behaviour** — Attendance, Iḥsān & Concerns
- **Teaching & Learning** — Teaching Overview, Lesson Plans, Homework, Salah & Tarbiyah, Progress Trackers, Hifz Programme
- **Reports & Assessment** — Reports, Examinations
- **Operations** — Finance, Communications, Safeguarding, Settings

Office hub sub-tabs:
| Hub | Sub-tabs |
|---|---|
| Students | Student Records · Contact Sheet |
| Staff | Teacher Database · Clock In/Out |
| Attendance | Today · Register · Absences · Late Arrivals · Leave Requests |
| Iḥsān & Concerns | Ihsan Points · Concerns |
| Lesson Plans | Lesson Plans · Holiday Revision |
| Progress Trackers | Du'as · Surahs · Safar Qaaidah · Knowledge Passport |
| Hifz Programme | Hifz Roster · Qur'an Heat Map · Monthly Tracker · Pre-Hifz & Consolidation |
| Reports | Student Reports · Weekly Review · Attendance · Lateness · Staff · Behaviour |
| Examinations | Examinations · Mark Entry · Exam Bank |
| Finance | Fees · Books & Inventory |
| Communications | Messages · Events & Jalsas · Parents' Evening · Forms & Consent · Complaints |
| Safeguarding | Cases · Medical Register · Risk Register · Policy Acknowledgements |
| Settings | School · Calendars · Branding · Billing & Plan · Permissions · Data Import · Process Flows · Year-End Rollover · Audit Log |

### Teacher (groups: Today / Teaching / Pastoral)
Today's Lesson · Check-in & Clock · My Register · My Students · Lesson Plans ·
Holiday Revision · Set Work · Homework Review · Hifz Diary (hifz staff only) ·
Concerns · Ihsan Points · Messages.
Each item carries a `permKey` mapping to the Office permission matrix.

### Parent (7 hubs; child's first name is the first label)
| Hub | Sub-tabs |
|---|---|
| \<Child name\> | Record · Timetable · Reports & Exams |
| Learning | Homework · ʿIlm Quiz · Holiday Revision |
| Memorisation | Journey · Hifz Dashboard* · Tonight's Prep* |
| Requests | Absence & Leave · Parents' Evening |
| Fees & documents | Fees · Documents to Sign |
| Messages & calendar | Messages · Calendar & Events |

\* hifz pupils only.

### Pupil
Reached **only** by a 4-digit passcode gate from inside the parent portal — never its own
login. Screens: Tonight's Work · My Hifz · Muḥāsabah · ʿIlm Quiz · My Ihsan Points.
No fees, reports, requests or messages. Prototype passcode `1102`; in production this is a
per-child PIN stored on the pupil record.

---

## Core domain model (maktab)

### Classes — 22 seeded
Two 55-minute sessions per evening: **5:00–5:55pm** and **5:55–6:50pm**, Mon–Thu
(Friday is an assessment lesson — 5 sessions a week for attendance purposes).
Each class row has: name, gender (Boys/Girls), head/year label, hifdhType
(None/Pre-Hifz/Full Hifz), lead teacher, timing string, and derived `lessons[]`.

Boys: Reception Boys, Year 1–8 Boys (9 classes).
Girls: Reception Girls, Year 1a, Year 1b, Year 2a, Year 2b, Year 3–8 Girls (11 classes).
Plus: **Pre-Hifdh Boys** (Mon–Fri 5:00–7:30pm) and **Hifz Class Boys**
(Mon–Sat 5:00–7:30pm + Sat 7:00–9:00am).

Session subjects and the lesson strands they unlock:
| Timetable subject | Lesson strands |
|---|---|
| Qaa'idah | Qaaidah |
| Qaa'idah / Juz Amma | Qaaidah, Qur'an |
| Juz Amma / Qur'an | Qur'an, Surah Memorisation |
| Qur'an | Qur'an |
| Islamic Studies, Du'as & Surahs | Islamic Studies, Du'as Memorisation, Surah Memorisation |
| (Hifz classes) | Sabaq, Sabqi, Manzil, Hifz |

**Timetable filtering rule (important):** the timetable and its CSV export must show only
classes that actually run on the selected day, and only their real session periods.
Monday must not show the Saturday 7:00–9:00am Hifz slot; Saturday shows Hifz only. The
subtitle states the honest count — "N of 22 classes run on Mon" — and an empty day shows
an explicit empty state.

### Year bands
| Band | Ages | Years |
|---|---|---|
| Foundation | 4–7 | Reception, Year 1, Year 2 |
| Juniors | 7–11 | Year 3–6 |
| Seniors | 11–13 | Year 7, Year 8 |

### Attendance
Codes (one per pupil per session): **P** Present · **L** Late · **I** Illness ·
**F** Family reason · **T** Travel · **A** Authorised other · **U** Unexplained.
I/F/T/A are authorised absences; U is unauthorised. Mark key is
`date::session::studentId`; register key is `date::session::class`.
Registers close at **5:05pm** (single constant — never hardcode it on a screen).
Register submit times per class are held in one map; Attendance → Today derives
"in already" (with times) and "still to come in" (with per-class *Mark it now* and a
nudge action) from it.

Escalation ladders exist for both absence and lateness (staged: monitoring → letter →
meeting → statutory referral), each stage with an owner and an SLA.

### Iḥsān (reward) points
Five categories, each with named awards carrying fixed point values. Staff pick an award
by name; **points come with the award** — never free-typed.

| Category | English | Awards (points) |
|---|---|---|
| Ḥuḍūr | Attendance & punctuality | Full Week (1)*, On Time Every Day (1)* |
| ʿIbādah | Ṣalāh & worship | Ṣalāh Without Asking (2), Wuḍūʾ Kept (1), Duʿāʾ Learnt (2) |
| ʿIlm | Learning & memorisation | Clean Sabaq (3), Ahead of the Plan (3), Excellent Recitation (3), Homework Complete (2) |
| Adab | Character & manners | Truthfulness (3), Best Adab (2), Respect to Elders (2) |
| Khidmah | Service to others | Helped a Younger Pupil (3), Helped a Classmate (2), Khidmah of the Class (1) |

\* **Automatic.** Ḥuḍūr awards are computed from the attendance mark log — the same source
the register writes to — and settle **weekly, not per session**, so a pupil with a perfect
week gets one summarised row rather than five identical ones. Full Week = no absence in the
week; On Time Every Day = no absence *and* no lateness. A pupil who was absent or late
earns neither, and the screen **says why**.

Every ledger row must carry an `award` key. A row without one is a data error — warn, do
not invent an "Other" category. A pupil's total is computed once from the ledger and read
everywhere (hero, record card, points screen, feed, notifications). Never hardcode a total.

Houses (Badr, Uḥud, Khaybar, Ḥunayn) are an **optional feature** — there is a
`housesEnabled` toggle; when off, points are personal/class-level only.

The hub also has a **fairness panel** (are awards spread across staff, classes and
categories, or concentrated?) and **term filtering** (current term by default, resettable).

### Concerns (pastoral)
A concern row: date, pupil, class, category, note, raised-by, severity
(Low/Medium/High), owner, status, `parentInformedAt`, `resolvedAt`,
`safeguardingNotified`.
Categories: Talking · Disruption · Incomplete work · Poor effort · Disrespect ·
Uniform issue · Repeated lateness · Unsafe conduct · Bullying · Other.
Statuses: Open → Action taken → Parent informed → Resolved.
**Safeguarding escalation:** a High-severity concern (or any concern a member of staff
escalates) creates a linked safeguarding case and stamps `safeguardingNotified`; the
audit trail records who was informed and when. Safeguarding categories:
Welfare concern · Disclosure · Physical / Emotional abuse concern (and others);
risk levels Low / Medium / High / Immediate.

### Admissions
Pipeline stages: **Enquiry → Application → Assessment → Offer → Enrolled**, plus the
parallel states **Waiting list** and **Declined**.
SLA days per stage: Enquiry 7 · Application 10 · Assessment 14 · Offer 14.

Priority is **scored from criteria, never typed**:
| Criterion | Points |
|---|---|
| Sibling already at MTI | 40 |
| Family attends the masjid | 25 |
| Waiting over 30 days | 20 |
| Already started Qur'an | 10 |
Band: ≥60 High · ≥30 Medium · else Standard.

Applicant record: name, DOB, requested year (Reception–Year 8), guardian, phone, sibling
flag, masjid flag, Qur'an level free text, stage, submitted date, optional note.
Row click opens a **detail drawer** with the full stage log and class allocation.
Bulk actions: select applicants (individually or by priority band), allocate to a class
with capacity checking, advance stage, decline with a reason, move to waiting list,
accept offer (which matches or creates a household).

**Enrolment wizard** — 5 steps (0–4): pupil & guardian details → policies (per-policy
agree, plus agree-all) → fee method and enrolment fee payment → class allocation →
head's notes and admin approval. Only a fully approved enrolment creates the pupil record.

**Public registration form** — multi-pupil, multi-contact: one guardian block, N pupil
blocks (first, last, DOB, gender, year Reception–Year 8, existing Qur'an level, day
school, medical, notes), N contacts (name, relation, mobile, email, primary flag,
emergency flag), terms checkbox. Submits into the Enquiry stage.

### Fees
£45 termly tuition, £50 enrolment fee, 10% sibling discount applied as a negative line
item. Direct debits, outstanding balances by family, and a fee ledger per pupil.

### Progress trackers
- **Du'as** — Reception–Year 8 curriculum, per-duʿāʾ Arabic + English meaning, per-pupil status.
- **Surahs** — Year 1–8, verse-by-verse, grouped by surah with per-surah counts.
- **Safar Qaaidah** — Levels 1–10, each with named completion criteria.
- **Knowledge Passport** — cross-strand milestones.

### Hifz programme
Roster · Qur'an heat map (per-juz status: unmemorised / untested / weak / urgent / solid)
· monthly tracker · Pre-Hifz & consolidation. Sabaq / Sabqi / Manzil recorded per pupil
per day with a quality rating (excellent / strong / satisfactory / weak) and mistake
categories. Pre-Hifz entry gates: reading assessment, tajwīd assessment, behaviour
assessment, pupil interview, parent interview.

### Calendars
Multiple named calendar sets (e.g. "Maktab evenings" Mon–Fri, "Hifz programme"
Mon–Thu + Sat). Each set: teaching-day chips, assigned classes, terms (name/start/end),
and holiday ranges with on/off toggles. Day types render with distinct tones: weekend,
inset, holiday, social, Islamic exam, end-of-year exam, parents' evening, Eid, fees due.

---

## Interactions & behaviour
- **Sidebar hub + top sub-tabs** everywhere; a back-stack (`pushHistory`/`goBack`) tracks
  navigation per role so Back is meaningful across hubs.
- **⌘K / Ctrl-K** opens global search.
- Every state-changing action commits real state: mark register, authorise/unauthorise an
  absence, approve leave, pay a fee, review homework, award Iḥsān points, log a concern,
  record sabaq, raise a stock order, create pupil/application/event/task, toggle a holiday.
- **Real inputs, not chips, for dates and times** — `date`, date range and `time` inputs on:
  set work (due date), holiday revision (covering range + return by), concern log
  (date + time), hifz diary (date heard), leave (dates away), events (date + start time),
  tasks (due date), applications (DOB + preferred start). Chips are only for genuine
  enumerations (reason, level, quality, stage).
- **Row detail sheets**, not row echoes: homework, homework review, hifz diary, concerns,
  absences, plans, consent, fees, medical, admissions, leave and points each open a field
  table plus the written note.
- **CSV export** on students, contacts, classes, admissions, staff, timetable and Hifz
  progress; **CSV import** for students/staff/classes with a downloadable template
  (`students`: name, dob, class, gender, guardian, guardian_email).
- **Motion** (all respect `prefers-reduced-motion`): number count-ups on stat change, bar
  and ring fill-in on screen entry, staggered cell reveal on tables, and a subtle
  pointer-tracked tilt on hero cards. Screen-change keyed so animations replay per screen,
  not per render.
- Empty states are explicit and honest — they name the reason and offer the next action.

## State
The prototype holds everything in one component's state. In production split into:
- **Server data** — pupils, guardians/households, classes, staff, attendance marks,
  Iḥsān ledger, concerns, safeguarding cases, admissions, fees, homework, plans, exams,
  trackers, calendars, policies, audit log.
- **Session/UI state** — active role and portal, nav key + sub-tab, back-stack, open
  drawer/modal ids, filters (term, class, day, severity, status), form drafts,
  register marks in progress, per-tenant branding accent and plan.
- **Derived, computed once and read everywhere** — attendance rates, Iḥsān totals,
  admission priority scores, class capacity, outstanding fee balances, DBS expiry
  states. Any figure derived twice is a defect.

## Multi-tenancy
The prototype is tenanted: a 4-digit madrasah code at sign-in, a Branding settings tab
(logo, accent colour with live preview, name), and a Billing & Plan tab (plan tier, seat
count, trial). Accent colour propagates through `--brand-accent` and a `shade()` helper
that derives its hover/active variants — implement the same so one colour drives all.

## Permissions
A section-level permission matrix (`SECTION_PERMS_DEFAULT`) keyed by screen; every
Teacher/Parent nav item declares its `permKey`. Roles: Office, Deputy Head, Teacher,
Parent, Pupil. Editable in Settings → Permissions.

## Assets
- `fonts/Beatrice-{Light,Regular,Medium}.woff2` — included.
- DM Sans — Google Fonts.
- All icons are inline SVG paths (no icon font, no image assets).
- No photography or illustration in the maktab screens; image slots are placeholders.

## Files in this bundle
| File | What it is |
|---|---|
| `Madrassa Portal.dc.html` | **The canonical design.** All Office / Teacher / Parent / Pupil web screens. Data seeds start around line 10,300; the component class around line 13,127. |
| `MadadPhone.dc.html` | Companion mobile app shell + its data tables. |
| `Madad Mobile App.dc.html` | Mobile app showcase/marketing frames. |
| `Alimiyyah Portal.dc.html` | ʿĀlimiyyah (seminary) programme — out of scope, reference only. |
| `Modules and Pricing.dc.html` | Product module and pricing structure. |
| `MTI Home v2.dc.html` | Public marketing site / sign-in entry. |
| `PARITY.md` | Portal ↔ app parity audit. **Read this** — it lists the shared data contract and every defect already found and fixed, including the traps to avoid re-introducing. |
| `START_HERE.md` | Reading order and a first prompt for Claude Code. |
| `DESIGN_SYSTEM.md` | **The UI/UX spec.** Tokens, component recipes, layout, motion, voice, a11y, and the do-not list. Read before building any screen. |
| `STEP_BY_STEP.md` | Non-technical, stage-by-stage guide for a non-engineer building this with Claude Code. |
| `TECH_STACK.md` | Recommended stack, accounts to sign up for, multi-tenancy, safeguarding, build order. |
| `support.js` | Prototype runtime only. **Do not port.** |
| `fonts/` | Beatrice web fonts. |

Open any `.dc.html` directly in a browser to run it.

## Invariants worth enforcing in code
Drawn from the parity audit — each of these was a real defect:
1. One source per figure. Attendance rates, points totals, register counts, class lists
   and submit times each have exactly one derivation.
2. Never label a weekly figure "term to date".
3. Class pickers read the **full class list** (22), not the pupil roster (which only
   covers classes with enrolled pupils).
4. A register shown as submitted must open pre-marked, with its submit time.
5. Terms and holidays must sit in the same academic year, or no holiday falls in a term.
6. Local ISO dates only — `toISOString()` shifts the day under BST.
7. Timetable views filter by the day actually selected, including in CSV export.
8. Lists must not be silently sliced below the count their heading promises.
