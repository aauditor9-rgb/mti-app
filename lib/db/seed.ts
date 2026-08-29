// Seeds the spine tables with the fake data from design/Madrassa Portal.dc.html
// (STUDENTS_SEED, MAKTAB_TIMETABLE, TEACHERS_SEED) — see design/STEP_BY_STEP.md Stage 5.
// Re-run safe: deletes any madrasah row with this code first (cascades to every table below).
import { config } from "dotenv";
config({ path: ".env.local" });

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";
import { eq } from "drizzle-orm";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set — see .env.example");
}

const client = postgres(process.env.DATABASE_URL, { prepare: false });
const db = drizzle(client, { schema });

const MADRASAH_CODE = "1000";

const MAKTAB_SESSIONS_LABEL = "Mon–Thu · 5:00–6:50pm";

type TimetableRow = { cls: string; head: string; s: { subject: string; teacher: string }[] };

const LESSON_MAP: Record<string, string[]> = {
  "Islamic Studies, Du'as & Surahs": ["Islamic Studies", "Du'as Memorisation", "Surah Memorisation"],
  "Qur'an": ["Qur'an"],
  "Juz Amma / Qur'an": ["Qur'an", "Surah Memorisation"],
  "Qaa'idah": ["Qaaidah"],
  "Qaa'idah / Juz Amma": ["Qaaidah", "Qur'an"],
};

function lessonsFor(sessions: { subject: string; teacher: string }[]) {
  const out: string[] = [];
  for (const s of sessions) {
    for (const l of LESSON_MAP[s.subject] ?? []) {
      if (!out.includes(l)) out.push(l);
    }
  }
  return out;
}

const MAKTAB_TIMETABLE: { boys: TimetableRow[]; girls: TimetableRow[] } = {
  boys: [
    { cls: "Reception Boys", head: "Reception", s: [{ subject: "Qaa'idah", teacher: "Ml Yunus" }, { subject: "Islamic Studies, Du'as & Surahs", teacher: "Ml Yunus" }] },
    { cls: "Year 1 Boys", head: "Year 1", s: [{ subject: "Qaa'idah", teacher: "Ml Bilal" }, { subject: "Islamic Studies, Du'as & Surahs", teacher: "Ml Yunus" }] },
    { cls: "Year 2 Boys", head: "Year 2", s: [{ subject: "Islamic Studies, Du'as & Surahs", teacher: "Ml Bilal" }, { subject: "Qaa'idah / Juz Amma", teacher: "Ml Afzal" }] },
    { cls: "Year 3 Boys", head: "Year 3", s: [{ subject: "Islamic Studies, Du'as & Surahs", teacher: "Hafiz Aqib" }, { subject: "Juz Amma / Qur'an", teacher: "Ml Idris" }] },
    { cls: "Year 4 Boys", head: "Year 4", s: [{ subject: "Qur'an", teacher: "Ml Idris" }, { subject: "Islamic Studies, Du'as & Surahs", teacher: "Ml Afzal" }] },
    { cls: "Year 5 Boys", head: "Year 5", s: [{ subject: "Qur'an", teacher: "Ml Zakir" }, { subject: "Islamic Studies, Du'as & Surahs", teacher: "Ml Emdadul" }] },
    { cls: "Year 6 Boys", head: "Year 6", s: [{ subject: "Islamic Studies, Du'as & Surahs", teacher: "Ml Emdadul" }, { subject: "Qur'an", teacher: "Ml Zakir" }] },
    { cls: "Year 7 Boys", head: "Year 7", s: [{ subject: "Islamic Studies, Du'as & Surahs", teacher: "Ml Ikram" }, { subject: "Qur'an", teacher: "Hafiz Siraj" }] },
    { cls: "Year 8 Boys", head: "Year 8", s: [{ subject: "Qur'an", teacher: "Hafiz Siraj" }, { subject: "Islamic Studies, Du'as & Surahs", teacher: "Ml Ikram" }] },
  ],
  girls: [
    { cls: "Reception Girls", head: "Reception", s: [{ subject: "Qaa'idah", teacher: "Apa Ruqayyah" }, { subject: "Islamic Studies, Du'as & Surahs", teacher: "Apa Ruqayyah" }] },
    { cls: "Year 1a", head: "Year 1a", s: [{ subject: "Qaa'idah", teacher: "Apa Samia" }, { subject: "Islamic Studies, Du'as & Surahs", teacher: "Apa Sumayyah" }] },
    { cls: "Year 1b", head: "Year 1b", s: [{ subject: "Islamic Studies, Du'as & Surahs", teacher: "Apa Aasimah" }, { subject: "Qaa'idah", teacher: "Apa Samia" }] },
    { cls: "Year 2a", head: "Year 2a", s: [{ subject: "Qaa'idah / Juz Amma", teacher: "Apa Latifa" }, { subject: "Islamic Studies, Du'as & Surahs", teacher: "Apa Zainab" }] },
    { cls: "Year 2b", head: "Year 2b", s: [{ subject: "Islamic Studies, Du'as & Surahs", teacher: "Apa Sumayyah" }, { subject: "Qaa'idah / Juz Amma", teacher: "Apa Latifa" }] },
    { cls: "Year 3 Girls", head: "Year 3g", s: [{ subject: "Qur'an", teacher: "Apa Atikah" }, { subject: "Islamic Studies, Du'as & Surahs", teacher: "Apa Hafsa" }] },
    { cls: "Year 4 Girls", head: "Year 4g", s: [{ subject: "Islamic Studies, Du'as & Surahs", teacher: "Apa Asma" }, { subject: "Qur'an", teacher: "Apa Aasimah" }] },
    { cls: "Year 5 Girls", head: "Year 5g", s: [{ subject: "Qur'an", teacher: "Apa Zainab" }, { subject: "Islamic Studies, Du'as & Surahs", teacher: "Apa Asma" }] },
    { cls: "Year 6 Girls", head: "Year 6g", s: [{ subject: "Qur'an", teacher: "Apa Hafsa" }, { subject: "Islamic Studies, Du'as & Surahs", teacher: "Apa Atikah" }] },
    { cls: "Year 7 Girls", head: "Year 7g", s: [{ subject: "Islamic Studies, Du'as & Surahs", teacher: "Apa Hajrah" }, { subject: "Qur'an", teacher: "Apa Yasmin" }] },
    { cls: "Year 8 Girls", head: "Year 8g", s: [{ subject: "Qur'an", teacher: "Apa Yasmin" }, { subject: "Islamic Studies, Du'as & Surahs", teacher: "Apa Hajrah" }] },
  ],
};

const TEACHERS_SEED = [
  {
    name: "Apa Samia",
    phone: "07123 456789",
    email: "apa.samia@mti.org.uk",
    payRate: "£15/hr",
    hours: "Mon–Thu 4–7pm",
    portalAccess: true,
    dbsExpiry: "2027-08-31",
    firstAidExpiry: "2027-03-12",
    safeguardingExpiry: "2027-09-01",
  },
];

const STUDENTS_SEED = [
  { id: "S-2001", name: "Bilal Rahman", dob: "2011-04-12", cls: "Hifz Class Boys", gender: "M" as const, guardian: "Nasir Rahman", guardianEmail: "n.rahman@gmail.com", father: { name: "Nasir Rahman", phone: "07700200101" }, mother: { name: "Sadia Rahman", phone: "07700200102" } },
  { id: "S-2002", name: "Yusuf Choudhury", dob: "2012-08-03", cls: "Hifz Class Boys", gender: "M" as const, guardian: "Anwar Choudhury", guardianEmail: "a.choudhury@gmail.com", father: { name: "Anwar Choudhury", phone: "07700200111" }, mother: { name: "Ruma Choudhury", phone: "07700200112" } },
  { id: "S-2003", name: "Zakariya Khan", dob: "2011-01-27", cls: "Hifz Class Boys", gender: "M" as const, guardian: "Tariq Khan", guardianEmail: "t.khan@gmail.com", father: { name: "Tariq Khan", phone: "07700200121" }, mother: { name: "Nadia Khan", phone: "07700200122" }, learningNotes: "Reduced sabak — revision-focused plan" },
  { id: "S-2004", name: "Ismāʿīl Vali", dob: "2010-06-15", cls: "Hifz Class Boys", gender: "M" as const, guardian: "Sulaiman Vali", guardianEmail: "s.vali@gmail.com", father: { name: "Sulaiman Vali", phone: "07700200131" }, mother: { name: "Amina Vali", phone: "07700200132" } },
  { id: "S-1102", name: "Ayyub Ahmad Hoque", dob: "2020-02-22", cls: "Year 1a", gender: "M" as const, guardian: "Ruhiya Azmeen", guardianEmail: "ruhia2004@yahoo.com", father: { name: "Md Fazlay Hoque", phone: "07894987825" }, mother: { name: "Ruhiya Azmeen", phone: "07925959007" } },
  { id: "S-1103", name: "Maryam Rassid", dob: "2019-11-08", cls: "Year 1a", gender: "F" as const, guardian: "Sumaya Rassid", guardianEmail: "s.rassid@gmail.com", father: { name: "Tariq Rassid", phone: "07700100201" }, mother: { name: "Sumaya Rassid", phone: "07700100202" } },
  { id: "S-1104", name: "Khalid Mubarak", dob: "2020-01-19", cls: "Year 1a", gender: "M" as const, guardian: "Nadia Mubarak", guardianEmail: "n.mubarak@gmail.com", father: { name: "Yusuf Mubarak", phone: "07700100211" }, mother: { name: "Nadia Mubarak", phone: "07700100212" }, learningNotes: "Benefits from front-row seating" },
  { id: "S-1105", name: "Afnan Ahmed", dob: "2019-09-30", cls: "Year 1a", gender: "M" as const, guardian: "Ruksana Ahmed", guardianEmail: "r.ahmed@gmail.com", father: { name: "Imran Ahmed", phone: "07700100221" }, mother: { name: "Ruksana Ahmed", phone: "07700100222" } },
  { id: "S-1106", name: "Minaal Alaya", dob: "2020-03-14", cls: "Year 1a", gender: "F" as const, guardian: "Hafsa Alaya", guardianEmail: "h.alaya@gmail.com", father: { name: "Bilal Alaya", phone: "07700100231" }, mother: { name: "Hafsa Alaya", phone: "07700100232" }, allergies: "Nuts", medicalNotes: "Carries an inhaler" },
  { id: "S-1107", name: "Safwan Qaiser", dob: "2019-12-02", cls: "Year 1a", gender: "M" as const, guardian: "Amina Qaiser", guardianEmail: "a.qaiser@gmail.com", father: { name: "Rashid Qaiser", phone: "07700100241" }, mother: { name: "Amina Qaiser", phone: "07700100242" } },
  { id: "S-1108", name: "Muhammed Yahya Aziz", dob: "2020-02-05", cls: "Year 1a", gender: "M" as const, guardian: "Sofia Aziz", guardianEmail: "s.aziz@gmail.com", father: { name: "Kamran Aziz", phone: "07700100251" }, mother: { name: "Sofia Aziz", phone: "07700100252" } },
  { id: "S-1109", name: "Zayd Islam", dob: "2019-10-21", cls: "Year 1a", gender: "M" as const, guardian: "Fatima Islam", guardianEmail: "f.islam@gmail.com", father: { name: "Nurul Islam", phone: "07700100261" }, mother: { name: "Fatima Islam", phone: "07700100262" } },
  { id: "S-1110", name: "Aisha Noor", dob: "2020-04-27", cls: "Year 1a", gender: "F" as const, guardian: "Layla Noor", guardianEmail: "l.noor@gmail.com", father: { name: "Adam Noor", phone: "07700100271" }, mother: { name: "Layla Noor", phone: "07700100272" } },
];

async function main() {
  await db.delete(schema.madrasah).where(eq(schema.madrasah.code, MADRASAH_CODE));

  const [mti] = await db
    .insert(schema.madrasah)
    .values({ name: "Madrasah Talimuddin Islam (MTI)", code: MADRASAH_CODE })
    .returning();

  const teacherNames = new Set<string>();
  for (const row of [...MAKTAB_TIMETABLE.boys, ...MAKTAB_TIMETABLE.girls]) {
    for (const s of row.s) teacherNames.add(s.teacher);
  }
  teacherNames.add("Hafiz Siraj"); // Pre-Hifdh Boys lead
  teacherNames.add("Hafiz Aqib"); // Hifz Class Boys lead

  const detailedByName = new Map(TEACHERS_SEED.map((t) => [t.name, t]));
  const staffRows = [...teacherNames].map((name) => {
    const detail = detailedByName.get(name);
    return {
      madrasahId: mti.id,
      name,
      role: "Teacher" as const,
      phone: detail?.phone,
      email: detail?.email,
      payRate: detail?.payRate,
      hours: detail?.hours,
      portalAccess: detail?.portalAccess ?? false,
      dbsExpiry: detail?.dbsExpiry,
      firstAidExpiry: detail?.firstAidExpiry,
      safeguardingExpiry: detail?.safeguardingExpiry,
    };
  });
  const insertedStaff = await db.insert(schema.staff).values(staffRows).returning();
  const staffIdByName = new Map(insertedStaff.map((s) => [s.name, s.id]));

  // Boys' headLabel ("Reception", "Year 1"...) already matches the admission_year enum
  // exactly; girls' sections ("Year 1a", "Year 3g") need the trailing a/b/g letter
  // stripped to group under the same year band — see lib/db/schema.ts on klass.yearBand.
  function yearBandFor(head: string): (typeof schema.admissionYearEnum.enumValues)[number] | null {
    if (head === "Reception") return "Reception";
    const m = head.match(/^Year (\d)/);
    return m ? (`Year ${m[1]}` as (typeof schema.admissionYearEnum.enumValues)[number]) : null;
  }

  const classRows: (typeof schema.klass.$inferInsert)[] = [
    ...MAKTAB_TIMETABLE.boys.map((row) => ({ row, gender: "Boys" as const })),
    ...MAKTAB_TIMETABLE.girls.map((row) => ({ row, gender: "Girls" as const })),
  ].map(({ row, gender }) => ({
    madrasahId: mti.id,
    name: row.cls,
    gender,
    headLabel: row.head,
    yearBand: yearBandFor(row.head),
    hifdhType: "None",
    leadTeacherId: staffIdByName.get(row.s[0].teacher) ?? null,
    timing: MAKTAB_SESSIONS_LABEL,
    lessons: lessonsFor(row.s),
  }));
  classRows.push({
    madrasahId: mti.id,
    name: "Pre-Hifdh Boys",
    gender: "Boys",
    headLabel: "Pre-Hifdh",
    yearBand: null,
    hifdhType: "Pre-Hifz",
    leadTeacherId: staffIdByName.get("Hafiz Siraj") ?? null,
    timing: "Mon–Fri · 5:00–7:30pm",
    lessons: ["Hifz", "Du'as Memorisation", "Surah Memorisation", "Islamic Studies"],
  });
  classRows.push({
    madrasahId: mti.id,
    name: "Hifz Class Boys",
    gender: "Boys",
    headLabel: "Hifz",
    yearBand: null,
    hifdhType: "Full Hifz",
    leadTeacherId: staffIdByName.get("Hafiz Aqib") ?? null,
    timing: "Mon–Sat · 5:00–7:30pm, Sat 7:00–9:00am",
    lessons: ["Sabaq", "Sabqi", "Manzil"],
  });

  const insertedClasses = await db.insert(schema.klass).values(classRows).returning();
  const classIdByName = new Map(insertedClasses.map((c) => [c.name, c.id]));

  for (const s of STUDENTS_SEED) {
    const [hh] = await db.insert(schema.household).values({ madrasahId: mti.id }).returning();

    const primaryIsFather = s.father.name === s.guardian;
    const [father, mother] = await db
      .insert(schema.guardian)
      .values([
        {
          madrasahId: mti.id,
          householdId: hh.id,
          name: s.father.name,
          relation: "Father" as const,
          phone: s.father.phone,
          email: primaryIsFather ? s.guardianEmail : undefined,
        },
        {
          madrasahId: mti.id,
          householdId: hh.id,
          name: s.mother.name,
          relation: "Mother" as const,
          phone: s.mother.phone,
          email: !primaryIsFather ? s.guardianEmail : undefined,
        },
      ])
      .returning();

    const [pupilRow] = await db
      .insert(schema.pupil)
      .values({
        madrasahId: mti.id,
        householdId: hh.id,
        classId: classIdByName.get(s.cls) ?? null,
        name: s.name,
        dob: s.dob,
        gender: s.gender,
        passcode: s.id.split("-")[1],
        allergies: s.allergies ?? "None on file",
        medicalNotes: s.medicalNotes ?? "None on file",
        learningNotes: s.learningNotes ?? "None on file",
        verified: true,
      })
      .returning();

    await db.insert(schema.pupilGuardian).values([
      {
        madrasahId: mti.id,
        pupilId: pupilRow.id,
        guardianId: primaryIsFather ? father.id : mother.id,
        isPrimary: true,
        isEmergency: false,
      },
      {
        madrasahId: mti.id,
        pupilId: pupilRow.id,
        guardianId: primaryIsFather ? mother.id : father.id,
        isPrimary: false,
        isEmergency: true,
      },
    ]);
  }

  console.log(`Seeded madrasah "${mti.name}" (code ${mti.code}): ${insertedStaff.length} staff, ${insertedClasses.length} classes, ${STUDENTS_SEED.length} pupils.`);
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
