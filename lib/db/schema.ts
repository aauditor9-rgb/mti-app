// Drizzle table definitions — the spine (Stage 5 of design/STEP_BY_STEP.md).
// Every tenant-owned table carries `madrasahId` referencing `madrasah.id`, isolated by
// the RLS policies in `policies.sql` — see design/TECH_STACK.md "Multi-tenancy".
import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const genderEnum = pgEnum("gender", ["M", "F"]);
export const classGenderEnum = pgEnum("class_gender", ["Boys", "Girls"]);
export const hifdhTypeEnum = pgEnum("hifdh_type", ["None", "Pre-Hifz", "Full Hifz"]);
export const staffRoleEnum = pgEnum("staff_role", ["Teacher", "Office Staff"]);
export const guardianRelationEnum = pgEnum("guardian_relation", [
  "Father",
  "Mother",
  "Guardian",
  "Emergency contact",
  "Other",
]);
export const enrolmentStateEnum = pgEnum("enrolment_state", ["Enrolled", "Left", "Archived"]);
export const attendanceCodeEnum = pgEnum("attendance_code", ["P", "L", "I", "F", "T", "A", "U"]);
export const ihsanCategoryEnum = pgEnum("ihsan_category", ["Hudur", "Ibadah", "Ilm", "Adab", "Khidmah"]);
export const concernCategoryEnum = pgEnum("concern_category", [
  "Talking",
  "Disruption",
  "Incomplete work",
  "Poor effort",
  "Disrespect",
  "Uniform issue",
  "Repeated lateness",
  "Unsafe conduct",
  "Bullying",
  "Other",
]);
export const concernSeverityEnum = pgEnum("concern_severity", ["Low", "Medium", "High"]);
export const concernStatusEnum = pgEnum("concern_status", ["Open", "Action taken", "Parent informed", "Resolved"]);
export const admissionYearEnum = pgEnum("admission_year", [
  "Reception",
  "Year 1",
  "Year 2",
  "Year 3",
  "Year 4",
  "Year 5",
  "Year 6",
  "Year 7",
  "Year 8",
]);
export const admissionStageEnum = pgEnum("admission_stage", [
  "Enquiry",
  "Application",
  "Assessment",
  "Offer",
  "Enrolled",
  "Waiting list",
  "Declined",
]);
export const lessonPlanSubjectEnum = pgEnum("lesson_plan_subject", [
  "Qaaidah",
  "Juz Amma",
  "Qur'an",
  "Hifz",
  "Sabaq",
  "Sabqi",
  "Manzil",
  "Islamic Studies",
  "Du'as Memorisation",
  "Surah Memorisation",
  "Tajwīd",
  "Seerah",
  "Akhlaaq",
  "Fiqh",
  "Arabic Writing",
  "Revision / Test",
]);
export const salahPrayerEnum = pgEnum("salah_prayer", ["Fajr", "Zuhr", "Asr", "Maghrib", "Isha"]);
export const safarCriterionEnum = pgEnum("safar_criterion", ["Recognition", "Makharij", "Fluency", "Accuracy"]);
export const safarTesterRoleEnum = pgEnum("safar_tester_role", ["Qur'an Curriculum Lead", "Headteacher"]);

export const madrasah = pgTable("madrasah", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  brandAccent: text("brand_accent").notNull().default("#C2603C"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const staff = pgTable("staff", {
  id: uuid("id").primaryKey().defaultRandom(),
  madrasahId: uuid("madrasah_id")
    .notNull()
    .references(() => madrasah.id, { onDelete: "cascade" }),
  userId: uuid("user_id"),
  name: text("name").notNull(),
  title: text("title"),
  role: staffRoleEnum("role").notNull().default("Teacher"),
  phone: text("phone"),
  email: text("email"),
  payRate: text("pay_rate"),
  hours: text("hours"),
  portalAccess: boolean("portal_access").notNull().default(false),
  dbsExpiry: date("dbs_expiry"),
  firstAidExpiry: date("first_aid_expiry"),
  safeguardingExpiry: date("safeguarding_expiry"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const klass = pgTable(
  "class",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    madrasahId: uuid("madrasah_id")
      .notNull()
      .references(() => madrasah.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    gender: classGenderEnum("gender").notNull(),
    headLabel: text("head_label").notNull(),
    // Nullable: Pre-Hifdh/Hifz classes span mixed ages and don't map to one year band.
    // Needed because headLabel alone doesn't group girls' sections (e.g. "Year 1a")
    // under a shared year the way boys' classes ("Year 1") already do — see
    // lib/db/queries.ts listPupilsByYearBand, used by the Du'as tracker.
    yearBand: admissionYearEnum("year_band"),
    hifdhType: hifdhTypeEnum("hifdh_type").notNull().default("None"),
    leadTeacherId: uuid("lead_teacher_id").references(() => staff.id, { onDelete: "set null" }),
    timing: text("timing").notNull(),
    lessons: jsonb("lessons").$type<string[]>().notNull().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("class_madrasah_name_idx").on(t.madrasahId, t.name)],
);

export const household = pgTable("household", {
  id: uuid("id").primaryKey().defaultRandom(),
  madrasahId: uuid("madrasah_id")
    .notNull()
    .references(() => madrasah.id, { onDelete: "cascade" }),
  address: text("address"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const guardian = pgTable("guardian", {
  id: uuid("id").primaryKey().defaultRandom(),
  madrasahId: uuid("madrasah_id")
    .notNull()
    .references(() => madrasah.id, { onDelete: "cascade" }),
  householdId: uuid("household_id")
    .notNull()
    .references(() => household.id, { onDelete: "cascade" }),
  userId: uuid("user_id"),
  name: text("name").notNull(),
  relation: guardianRelationEnum("relation").notNull().default("Guardian"),
  phone: text("phone"),
  email: text("email"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const pupil = pgTable("pupil", {
  id: uuid("id").primaryKey().defaultRandom(),
  madrasahId: uuid("madrasah_id")
    .notNull()
    .references(() => madrasah.id, { onDelete: "cascade" }),
  householdId: uuid("household_id").references(() => household.id, { onDelete: "set null" }),
  classId: uuid("class_id").references(() => klass.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  dob: date("dob").notNull(),
  gender: genderEnum("gender").notNull(),
  enrolmentState: enrolmentStateEnum("enrolment_state").notNull().default("Enrolled"),
  passcode: text("passcode"),
  allergies: text("allergies"),
  medicalNotes: text("medical_notes"),
  learningNotes: text("learning_notes"),
  verified: boolean("verified").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const pupilGuardian = pgTable(
  "pupil_guardian",
  {
    madrasahId: uuid("madrasah_id")
      .notNull()
      .references(() => madrasah.id, { onDelete: "cascade" }),
    pupilId: uuid("pupil_id")
      .notNull()
      .references(() => pupil.id, { onDelete: "cascade" }),
    guardianId: uuid("guardian_id")
      .notNull()
      .references(() => guardian.id, { onDelete: "cascade" }),
    isPrimary: boolean("is_primary").notNull().default(false),
    isEmergency: boolean("is_emergency").notNull().default(false),
  },
  (t) => [primaryKey({ columns: [t.pupilId, t.guardianId] })],
);

// Attendance is recorded per class per day (design/README.md's date::session::studentId
// mark key is simplified to date::studentId here — the maktab's per-session timetable
// structure isn't modelled yet, see design/TECH_STACK.md build order item 7).
export const attendanceMark = pgTable(
  "attendance_mark",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    madrasahId: uuid("madrasah_id")
      .notNull()
      .references(() => madrasah.id, { onDelete: "cascade" }),
    pupilId: uuid("pupil_id")
      .notNull()
      .references(() => pupil.id, { onDelete: "cascade" }),
    classId: uuid("class_id")
      .notNull()
      .references(() => klass.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    code: attendanceCodeEnum("code").notNull(),
    markedAt: timestamp("marked_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("attendance_mark_pupil_date_idx").on(t.pupilId, t.date)],
);

// A row here means the register is submitted and locked — see lib/derive/attendance.ts.
export const registerSubmission = pgTable(
  "register_submission",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    madrasahId: uuid("madrasah_id")
      .notNull()
      .references(() => madrasah.id, { onDelete: "cascade" }),
    classId: uuid("class_id")
      .notNull()
      .references(() => klass.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("register_submission_class_date_idx").on(t.classId, t.date)],
);

// The fixed award catalog (design/README.md "Iḥsān (reward) points") — staff pick an
// award by name and its points come with it, never free-typed. Hudur awards are
// automatic (settled from attendance_mark, see lib/derive/ihsan.ts) and never appear
// in the manual "Award points" picker.
export const ihsanAward = pgTable(
  "ihsan_award",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    category: ihsanCategoryEnum("category").notNull(),
    name: text("name").notNull(),
    points: integer("points").notNull(),
    automatic: boolean("automatic").notNull().default(false),
  },
  (t) => [uniqueIndex("ihsan_award_category_name_idx").on(t.category, t.name)],
);

// A pupil's total is always summed from this ledger, never stored — invariant 1.
export const ihsanLedger = pgTable("ihsan_ledger", {
  id: uuid("id").primaryKey().defaultRandom(),
  madrasahId: uuid("madrasah_id")
    .notNull()
    .references(() => madrasah.id, { onDelete: "cascade" }),
  pupilId: uuid("pupil_id")
    .notNull()
    .references(() => pupil.id, { onDelete: "cascade" }),
  awardId: uuid("award_id")
    .notNull()
    .references(() => ihsanAward.id, { onDelete: "restrict" }),
  classId: uuid("class_id").references(() => klass.id, { onDelete: "set null" }),
  awardedByStaffId: uuid("awarded_by_staff_id").references(() => staff.id, { onDelete: "set null" }),
  awardedAt: timestamp("awarded_at", { withTimezone: true }).notNull().defaultNow(),
});

// Pastoral concerns (design/README.md "Concerns"). A High-severity concern (or an
// explicit escalation) stamps safeguardingNotified — but this is a plain data field,
// NOT the access-controlled safeguarding case system design/TECH_STACK.md describes
// ("separate table, DSL-only RLS, append-only, fully audited"). That needs real
// authentication and roles to build honestly, which don't exist yet — see
// lib/db/queries.ts. Building a fake DSL-gate now would be worse than not having one.
export const concern = pgTable("concern", {
  id: uuid("id").primaryKey().defaultRandom(),
  madrasahId: uuid("madrasah_id")
    .notNull()
    .references(() => madrasah.id, { onDelete: "cascade" }),
  pupilId: uuid("pupil_id")
    .notNull()
    .references(() => pupil.id, { onDelete: "cascade" }),
  classId: uuid("class_id").references(() => klass.id, { onDelete: "set null" }),
  category: concernCategoryEnum("category").notNull(),
  note: text("note").notNull(),
  severity: concernSeverityEnum("severity").notNull().default("Low"),
  status: concernStatusEnum("status").notNull().default("Open"),
  raisedByStaffId: uuid("raised_by_staff_id").references(() => staff.id, { onDelete: "set null" }),
  ownerStaffId: uuid("owner_staff_id").references(() => staff.id, { onDelete: "set null" }),
  safeguardingNotified: boolean("safeguarding_notified").notNull().default(false),
  safeguardingNotifiedAt: timestamp("safeguarding_notified_at", { withTimezone: true }),
  parentInformedAt: timestamp("parent_informed_at", { withTimezone: true }),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Admissions pipeline (design/README.md "Admissions"). Priority is scored from
// siblingAtMti/familyAttendsMasjid/quranLevel/submittedAt, never typed in — see
// lib/derive/admissions.ts. "Sibling", "masjid" etc are yes/no fields the office
// checks, not self-reported priority.
export const applicant = pgTable("applicant", {
  id: uuid("id").primaryKey().defaultRandom(),
  madrasahId: uuid("madrasah_id")
    .notNull()
    .references(() => madrasah.id, { onDelete: "cascade" }),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  dob: date("dob").notNull(),
  gender: genderEnum("gender").notNull(),
  requestedYear: admissionYearEnum("requested_year").notNull(),
  guardianName: text("guardian_name").notNull(),
  guardianPhone: text("guardian_phone").notNull(),
  guardianEmail: text("guardian_email"),
  siblingAtMti: boolean("sibling_at_mti").notNull().default(false),
  familyAttendsMasjid: boolean("family_attends_masjid").notNull().default(false),
  quranLevel: text("quran_level"),
  stage: admissionStageEnum("stage").notNull().default("Enquiry"),
  declineReason: text("decline_reason"),
  classId: uuid("class_id").references(() => klass.id, { onDelete: "set null" }),
  enrolledPupilId: uuid("enrolled_pupil_id").references(() => pupil.id, { onDelete: "set null" }),
  note: text("note"),
  submittedAt: date("submitted_at").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// The full stage log a detail view reads — one row per transition, append-only.
export const applicantStageLog = pgTable("applicant_stage_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  madrasahId: uuid("madrasah_id")
    .notNull()
    .references(() => madrasah.id, { onDelete: "cascade" }),
  applicantId: uuid("applicant_id")
    .notNull()
    .references(() => applicant.id, { onDelete: "cascade" }),
  stage: admissionStageEnum("stage").notNull(),
  changedAt: timestamp("changed_at", { withTimezone: true }).notNull().defaultNow(),
});

// Homework (design/README.md's set-work → publish → review flow). Set for a whole
// class — the prototype's per-student subset targeting is deferred, see
// lib/derive/homework.ts. One submission row per pupil is created when the homework
// is set, so "% acknowledged" is always a live count over real rows, never a stored
// percentage like the prototype's static submittedPct (invariant 1).
export const homework = pgTable("homework", {
  id: uuid("id").primaryKey().defaultRandom(),
  madrasahId: uuid("madrasah_id")
    .notNull()
    .references(() => madrasah.id, { onDelete: "cascade" }),
  classId: uuid("class_id")
    .notNull()
    .references(() => klass.id, { onDelete: "cascade" }),
  subject: text("subject").notNull(),
  task: text("task").notNull(),
  dueDate: date("due_date").notNull(),
  setByStaffId: uuid("set_by_staff_id").references(() => staff.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const homeworkSubmission = pgTable(
  "homework_submission",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    madrasahId: uuid("madrasah_id")
      .notNull()
      .references(() => madrasah.id, { onDelete: "cascade" }),
    homeworkId: uuid("homework_id")
      .notNull()
      .references(() => homework.id, { onDelete: "cascade" }),
    pupilId: uuid("pupil_id")
      .notNull()
      .references(() => pupil.id, { onDelete: "cascade" }),
    completed: boolean("completed").notNull().default(false),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (t) => [uniqueIndex("homework_submission_homework_pupil_idx").on(t.homeworkId, t.pupilId)],
);

// Weekly curriculum plan, one per year band per week (design/README.md "Weekly Lesson
// Plans" — Reception–Year 8, shared across a year's classes/sections rather than
// per-class). Content lives in flexible subject/content entries rather than fixed
// columns, since which strands apply (Qaaidah vs Sabaq/Sabqi/Manzil) varies by year.
export const lessonPlan = pgTable(
  "lesson_plan",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    madrasahId: uuid("madrasah_id")
      .notNull()
      .references(() => madrasah.id, { onDelete: "cascade" }),
    year: admissionYearEnum("year").notNull(),
    weekStartDate: date("week_start_date").notNull(),
    setByStaffId: uuid("set_by_staff_id").references(() => staff.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("lesson_plan_year_week_idx").on(t.madrasahId, t.year, t.weekStartDate)],
);

export const lessonPlanEntry = pgTable(
  "lesson_plan_entry",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    madrasahId: uuid("madrasah_id")
      .notNull()
      .references(() => madrasah.id, { onDelete: "cascade" }),
    lessonPlanId: uuid("lesson_plan_id")
      .notNull()
      .references(() => lessonPlan.id, { onDelete: "cascade" }),
    subject: lessonPlanSubjectEnum("subject").notNull(),
    content: text("content").notNull(),
  },
  (t) => [uniqueIndex("lesson_plan_entry_plan_subject_idx").on(t.lessonPlanId, t.subject)],
);

// Ṣalāh & Tarbiyah (design/README.md's "Muḥāsabah" pupil self-log, rolled up here into
// a madrasah-wide view). There's no pupil/parent portal yet to self-log, so office
// records it on a pupil's behalf — same pattern as Homework's office-marked
// completion. One row per pupil per date per prayer; jamaah only makes sense when
// prayed is true, enforced in the server action rather than the schema.
export const salahLog = pgTable(
  "salah_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    madrasahId: uuid("madrasah_id")
      .notNull()
      .references(() => madrasah.id, { onDelete: "cascade" }),
    pupilId: uuid("pupil_id")
      .notNull()
      .references(() => pupil.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    prayer: salahPrayerEnum("prayer").notNull(),
    prayed: boolean("prayed").notNull().default(true),
    jamaah: boolean("jamaah").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("salah_log_pupil_date_prayer_idx").on(t.pupilId, t.date, t.prayer)],
);

// Du'as Progress Tracker (design/README.md "Progress trackers" — "per-pupil status").
// The prototype's own office screen never actually shows a pupil selector despite
// that spec line — a prototype gap. This builds the real per-pupil tracking: a
// curriculum catalog per year band, and a status row per pupil per catalog item.
// Only Reception's 25-item list is seeded verbatim from the prototype (English
// names only — no Arabic/translation text is fabricated); other years start empty
// and are built out via "+ Add du'a" on the screen, same as a real madrasah would.
export const duaCatalogItem = pgTable(
  "dua_catalog_item",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    madrasahId: uuid("madrasah_id")
      .notNull()
      .references(() => madrasah.id, { onDelete: "cascade" }),
    year: admissionYearEnum("year").notNull(),
    name: text("name").notNull(),
    orderIndex: integer("order_index").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("dua_catalog_item_year_name_idx").on(t.madrasahId, t.year, t.name)],
);

export const duaPupilStatus = pgTable(
  "dua_pupil_status",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    madrasahId: uuid("madrasah_id")
      .notNull()
      .references(() => madrasah.id, { onDelete: "cascade" }),
    pupilId: uuid("pupil_id")
      .notNull()
      .references(() => pupil.id, { onDelete: "cascade" }),
    duaCatalogItemId: uuid("dua_catalog_item_id")
      .notNull()
      .references(() => duaCatalogItem.id, { onDelete: "cascade" }),
    arabicMemorised: boolean("arabic_memorised").notNull().default(false),
    translationMemorised: boolean("translation_memorised").notNull().default(false),
    readAtHome: boolean("read_at_home").notNull().default(false),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("dua_pupil_status_pupil_item_idx").on(t.pupilId, t.duaCatalogItemId)],
);

// Surahs Progress Tracker — same shape and same prototype gap as the du'a tracker
// above (design/README.md "Surahs — Year 1-8, verse-by-verse, grouped by surah with
// per-surah counts"; the office screen shows only class-wide toggles, no pupil
// selector). verseCount is nullable: some catalog entries are partial ranges
// ("1st 10 verses of Surah Kahf") with no single count shown in the prototype.
// "Fully memorised" = memorised AND tajweedSound, per the prototype's own header
// text ("fully memorised (memorisation + tajweed)") — read-at-home is tracked but
// not part of that definition, same as translation isn't for du'as.
export const surahCatalogItem = pgTable(
  "surah_catalog_item",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    madrasahId: uuid("madrasah_id")
      .notNull()
      .references(() => madrasah.id, { onDelete: "cascade" }),
    year: admissionYearEnum("year").notNull(),
    name: text("name").notNull(),
    verseCount: integer("verse_count"),
    orderIndex: integer("order_index").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("surah_catalog_item_year_name_idx").on(t.madrasahId, t.year, t.name)],
);

export const surahPupilStatus = pgTable(
  "surah_pupil_status",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    madrasahId: uuid("madrasah_id")
      .notNull()
      .references(() => madrasah.id, { onDelete: "cascade" }),
    pupilId: uuid("pupil_id")
      .notNull()
      .references(() => pupil.id, { onDelete: "cascade" }),
    surahCatalogItemId: uuid("surah_catalog_item_id")
      .notNull()
      .references(() => surahCatalogItem.id, { onDelete: "cascade" }),
    memorised: boolean("memorised").notNull().default(false),
    tajweedSound: boolean("tajweed_sound").notNull().default(false),
    readAtHome: boolean("read_at_home").notNull().default(false),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("surah_pupil_status_pupil_item_idx").on(t.pupilId, t.surahCatalogItemId)],
);

// Safar Qaaidah Tracker (design/README.md "Safar Qaaidah — Levels 1-10, each with named
// completion criteria" — the prototype itself actually has 13 levels, which is what's
// built here; the README's "1-10" is a simplification). Unlike Du'as/Surahs this isn't
// year-scoped — pupils progress through levels individually, and the schema has no
// per-pupil "current level" field. The pupil roster shown is every pupil in a class
// whose session subjects include Qaaidah (klass.yearBand Reception/Year 1/Year 2, the
// only bands that timetable it — see design/README.md "Session subjects and the lesson
// strands they unlock"), the only grounded roster available.
// Each level names its own completion criteria (only 3 distinct sets occur across all
// 13 levels: Recognition+Makharij, Recognition+Makharij+Fluency, Accuracy+Fluency) —
// stored as an array on the level; "fully mastered" checks only the criteria a level
// actually lists, same as the prototype's own per-level header text.
export const safarQaaidahLevel = pgTable(
  "safar_qaaidah_level",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    madrasahId: uuid("madrasah_id")
      .notNull()
      .references(() => madrasah.id, { onDelete: "cascade" }),
    levelNumber: integer("level_number").notNull(),
    criteria: safarCriterionEnum("criteria").array().notNull(),
    testedByName: text("tested_by_name"),
    testedByRole: safarTesterRoleEnum("tested_by_role"),
    testedAt: timestamp("tested_at", { withTimezone: true }),
  },
  (t) => [uniqueIndex("safar_qaaidah_level_madrasah_level_idx").on(t.madrasahId, t.levelNumber)],
);

export const safarQaaidahItem = pgTable(
  "safar_qaaidah_item",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    madrasahId: uuid("madrasah_id")
      .notNull()
      .references(() => madrasah.id, { onDelete: "cascade" }),
    levelId: uuid("level_id")
      .notNull()
      .references(() => safarQaaidahLevel.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    orderIndex: integer("order_index").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("safar_qaaidah_item_level_name_idx").on(t.levelId, t.name)],
);

export const safarQaaidahPupilStatus = pgTable(
  "safar_qaaidah_pupil_status",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    madrasahId: uuid("madrasah_id")
      .notNull()
      .references(() => madrasah.id, { onDelete: "cascade" }),
    pupilId: uuid("pupil_id")
      .notNull()
      .references(() => pupil.id, { onDelete: "cascade" }),
    itemId: uuid("item_id")
      .notNull()
      .references(() => safarQaaidahItem.id, { onDelete: "cascade" }),
    recognitionMet: boolean("recognition_met").notNull().default(false),
    makharijMet: boolean("makharij_met").notNull().default(false),
    fluencyMet: boolean("fluency_met").notNull().default(false),
    accuracyMet: boolean("accuracy_met").notNull().default(false),
    readAtHome: boolean("read_at_home").notNull().default(false),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("safar_qaaidah_pupil_status_pupil_item_idx").on(t.pupilId, t.itemId)],
);

export const staffRelations = relations(staff, ({ many }) => ({
  classesLed: many(klass),
}));

export const klassRelations = relations(klass, ({ one, many }) => ({
  madrasah: one(madrasah, { fields: [klass.madrasahId], references: [madrasah.id] }),
  leadTeacher: one(staff, { fields: [klass.leadTeacherId], references: [staff.id] }),
  pupils: many(pupil),
  attendanceMarks: many(attendanceMark),
  registerSubmissions: many(registerSubmission),
}));

export const householdRelations = relations(household, ({ many }) => ({
  guardians: many(guardian),
  pupils: many(pupil),
}));

export const guardianRelations = relations(guardian, ({ one, many }) => ({
  household: one(household, { fields: [guardian.householdId], references: [household.id] }),
  pupilLinks: many(pupilGuardian),
}));

export const pupilRelations = relations(pupil, ({ one, many }) => ({
  household: one(household, { fields: [pupil.householdId], references: [household.id] }),
  class: one(klass, { fields: [pupil.classId], references: [klass.id] }),
  guardianLinks: many(pupilGuardian),
  attendanceMarks: many(attendanceMark),
  ihsanLedgerRows: many(ihsanLedger),
  concerns: many(concern),
  homeworkSubmissions: many(homeworkSubmission),
  salahLogs: many(salahLog),
  duaStatuses: many(duaPupilStatus),
  surahStatuses: many(surahPupilStatus),
  safarQaaidahStatuses: many(safarQaaidahPupilStatus),
}));

export const pupilGuardianRelations = relations(pupilGuardian, ({ one }) => ({
  pupil: one(pupil, { fields: [pupilGuardian.pupilId], references: [pupil.id] }),
  guardian: one(guardian, { fields: [pupilGuardian.guardianId], references: [guardian.id] }),
}));

export const attendanceMarkRelations = relations(attendanceMark, ({ one }) => ({
  pupil: one(pupil, { fields: [attendanceMark.pupilId], references: [pupil.id] }),
  class: one(klass, { fields: [attendanceMark.classId], references: [klass.id] }),
}));

export const registerSubmissionRelations = relations(registerSubmission, ({ one }) => ({
  class: one(klass, { fields: [registerSubmission.classId], references: [klass.id] }),
}));

export const ihsanAwardRelations = relations(ihsanAward, ({ many }) => ({
  ledgerRows: many(ihsanLedger),
}));

export const ihsanLedgerRelations = relations(ihsanLedger, ({ one }) => ({
  pupil: one(pupil, { fields: [ihsanLedger.pupilId], references: [pupil.id] }),
  award: one(ihsanAward, { fields: [ihsanLedger.awardId], references: [ihsanAward.id] }),
  class: one(klass, { fields: [ihsanLedger.classId], references: [klass.id] }),
  awardedBy: one(staff, { fields: [ihsanLedger.awardedByStaffId], references: [staff.id] }),
}));

export const concernRelations = relations(concern, ({ one }) => ({
  pupil: one(pupil, { fields: [concern.pupilId], references: [pupil.id] }),
  class: one(klass, { fields: [concern.classId], references: [klass.id] }),
  raisedBy: one(staff, { fields: [concern.raisedByStaffId], references: [staff.id] }),
  owner: one(staff, { fields: [concern.ownerStaffId], references: [staff.id] }),
}));

export const applicantRelations = relations(applicant, ({ one, many }) => ({
  class: one(klass, { fields: [applicant.classId], references: [klass.id] }),
  enrolledPupil: one(pupil, { fields: [applicant.enrolledPupilId], references: [pupil.id] }),
  stageLog: many(applicantStageLog),
}));

export const homeworkRelations = relations(homework, ({ one, many }) => ({
  class: one(klass, { fields: [homework.classId], references: [klass.id] }),
  setBy: one(staff, { fields: [homework.setByStaffId], references: [staff.id] }),
  submissions: many(homeworkSubmission),
}));

export const homeworkSubmissionRelations = relations(homeworkSubmission, ({ one }) => ({
  homework: one(homework, { fields: [homeworkSubmission.homeworkId], references: [homework.id] }),
  pupil: one(pupil, { fields: [homeworkSubmission.pupilId], references: [pupil.id] }),
}));

export const applicantStageLogRelations = relations(applicantStageLog, ({ one }) => ({
  applicant: one(applicant, { fields: [applicantStageLog.applicantId], references: [applicant.id] }),
}));

export const lessonPlanRelations = relations(lessonPlan, ({ one, many }) => ({
  setBy: one(staff, { fields: [lessonPlan.setByStaffId], references: [staff.id] }),
  entries: many(lessonPlanEntry),
}));

export const lessonPlanEntryRelations = relations(lessonPlanEntry, ({ one }) => ({
  lessonPlan: one(lessonPlan, { fields: [lessonPlanEntry.lessonPlanId], references: [lessonPlan.id] }),
}));

export const salahLogRelations = relations(salahLog, ({ one }) => ({
  pupil: one(pupil, { fields: [salahLog.pupilId], references: [pupil.id] }),
}));

export const duaCatalogItemRelations = relations(duaCatalogItem, ({ many }) => ({
  statuses: many(duaPupilStatus),
}));

export const duaPupilStatusRelations = relations(duaPupilStatus, ({ one }) => ({
  pupil: one(pupil, { fields: [duaPupilStatus.pupilId], references: [pupil.id] }),
  item: one(duaCatalogItem, { fields: [duaPupilStatus.duaCatalogItemId], references: [duaCatalogItem.id] }),
}));

export const surahCatalogItemRelations = relations(surahCatalogItem, ({ many }) => ({
  statuses: many(surahPupilStatus),
}));

export const surahPupilStatusRelations = relations(surahPupilStatus, ({ one }) => ({
  pupil: one(pupil, { fields: [surahPupilStatus.pupilId], references: [pupil.id] }),
  item: one(surahCatalogItem, { fields: [surahPupilStatus.surahCatalogItemId], references: [surahCatalogItem.id] }),
}));

export const safarQaaidahLevelRelations = relations(safarQaaidahLevel, ({ many }) => ({
  items: many(safarQaaidahItem),
}));

export const safarQaaidahItemRelations = relations(safarQaaidahItem, ({ one, many }) => ({
  level: one(safarQaaidahLevel, { fields: [safarQaaidahItem.levelId], references: [safarQaaidahLevel.id] }),
  statuses: many(safarQaaidahPupilStatus),
}));

export const safarQaaidahPupilStatusRelations = relations(safarQaaidahPupilStatus, ({ one }) => ({
  pupil: one(pupil, { fields: [safarQaaidahPupilStatus.pupilId], references: [pupil.id] }),
  item: one(safarQaaidahItem, { fields: [safarQaaidahPupilStatus.itemId], references: [safarQaaidahItem.id] }),
}));
