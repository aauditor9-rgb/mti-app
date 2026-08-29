// Drizzle table definitions — the spine (Stage 5 of design/STEP_BY_STEP.md).
// Every tenant-owned table carries `madrasahId` referencing `madrasah.id`, isolated by
// the RLS policies in `policies.sql` — see design/TECH_STACK.md "Multi-tenancy".
import { relations } from "drizzle-orm";
import {
  boolean,
  date,
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

export const staffRelations = relations(staff, ({ many }) => ({
  classesLed: many(klass),
}));

export const klassRelations = relations(klass, ({ one, many }) => ({
  madrasah: one(madrasah, { fields: [klass.madrasahId], references: [madrasah.id] }),
  leadTeacher: one(staff, { fields: [klass.leadTeacherId], references: [staff.id] }),
  pupils: many(pupil),
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
}));

export const pupilGuardianRelations = relations(pupilGuardian, ({ one }) => ({
  pupil: one(pupil, { fields: [pupilGuardian.pupilId], references: [pupil.id] }),
  guardian: one(guardian, { fields: [pupilGuardian.guardianId], references: [guardian.id] }),
}));
