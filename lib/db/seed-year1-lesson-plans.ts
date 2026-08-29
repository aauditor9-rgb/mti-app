// Seeds the full 52-week Year 1 annual curriculum, verbatim from
// design/Madrassa Portal.dc.html's Teacher > Lesson Plans (Annual overview + Weekly
// plan) and Pupil > Tonight's Work ("The whole term") screens — the only place this
// content is fully observable in the prototype. Other year bands are not seeded here;
// office/teachers build them out week by week via the existing Lesson Plans screen,
// same precedent as the Du'as/Surahs catalog seeds.
import { config } from "dotenv";
config({ path: ".env.local" });

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { and, eq } from "drizzle-orm";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set — see .env.example");
}

const client = postgres(process.env.DATABASE_URL, { prepare: false });
const db = drizzle(client, { schema });

const NO_LESSON = null;

type WeekRow = {
  week: number;
  wb: string;
  qaaidah: string | null;
  islamicStudies: string | null;
  duas: string | null;
  surah: string | null;
};

const WEEKS: WeekRow[] = [
  { week: 1, wb: "2025-09-01", qaaidah: "Alphabet - ا ء ب ت ث", islamicStudies: "Fiqh - Introduction and Advice", duas: "Introduction and Advice", surah: "Introduction and Advice" },
  { week: 2, wb: "2025-09-08", qaaidah: "Alphabet - ج ح خ د ذ", islamicStudies: "Fiqh - 5 Pillars of Islam", duas: "First Kalimah", surah: "Surah Fatihah - Verse 1" },
  { week: 3, wb: "2025-09-15", qaaidah: "Alphabet - د ذ ر ز", islamicStudies: "Fiqh - Shahadah", duas: "Before starting anything", surah: "Surah Fatihah - Verse 2" },
  { week: 4, wb: "2025-09-22", qaaidah: "Alphabet - س ش ص ض ط ظ", islamicStudies: "Fiqh - Salah", duas: "After completing anything", surah: "Surah Fatihah - Verse 3" },
  { week: 5, wb: "2025-09-29", qaaidah: "Alphabet - ط ظ ع غ ف ق", islamicStudies: "Fiqh - Zakat/Sawm", duas: "When wanting to do something", surah: "Surah Fatihah - Verse 4" },
  { week: 6, wb: "2025-10-06", qaaidah: "Alphabet - ك ل م ن", islamicStudies: "Fiqh - Hajj", duas: "When given something", surah: "Surah Fatihah - Verse 5" },
  { week: 7, wb: "2025-10-13", qaaidah: "Alphabet - هـ و ي", islamicStudies: "Fiqh - Taharah and how to Wudu", duas: "See something nice", surah: "Surah Fatihah - Verse 6" },
  { week: 8, wb: "2025-10-20", qaaidah: "Pg 4–5 - Alphabet (similar letters)", islamicStudies: "Revision & Assessment", duas: "See something great", surah: "Surah Fatihah - Verse 7" },
  { week: 9, wb: "2025-10-27", qaaidah: NO_LESSON, islamicStudies: NO_LESSON, duas: NO_LESSON, surah: NO_LESSON },
  { week: 10, wb: "2025-11-03", qaaidah: "Pg 6–8 - Alphabet", islamicStudies: "Fiqh - Revision of 5 pillars", duas: "Climbing stairs", surah: "Revision of Surah Fatihah and Ikhlaas - Verse 1" },
  { week: 11, wb: "2025-11-10", qaaidah: "Pg 9 - Identifying similar letters", islamicStudies: "Aqaa'id - Belief in Allah", duas: "Downstairs", surah: "Revision of Surah Fatihah and Ikhlaas - Verse 2" },
  { week: 12, wb: "2025-11-17", qaaidah: "Pg 10–12 - Similar letters by dot position", islamicStudies: "Aqaa'id - Belief in Angels & Books", duas: "Mistake", surah: "Revision of Surah Fatihah and Ikhlaas - Verse 3" },
  { week: 13, wb: "2025-11-24", qaaidah: "Pg 13–14 - Spelling words", islamicStudies: "Aqaa'id - Belief in Messengers", duas: "Ta'awudh", surah: "Revision of Surah Fatihah and Ikhlaas" },
  { week: 14, wb: "2025-12-01", qaaidah: "Pg 15, 18–20 - Harakah: Fathah", islamicStudies: "Aqaa'id - Belief in Day of Judgement", duas: "Before eating", surah: "Revision of previous surahs, Kawthar - Verse 1" },
  { week: 15, wb: "2025-12-08", qaaidah: "Pg 16, 18–20 - Harakah: Kasrah", islamicStudies: "Aqaa'id - All good and bad is from Allah / Life after Death", duas: "Sleeping", surah: "Revision of previous surahs, Kawthar - Verse 2" },
  { week: 16, wb: "2025-12-15", qaaidah: "Pg 17, 18–20 - Harakah: Dhammah", islamicStudies: "Revision & Assessment", duas: "Greeting a Muslim", surah: "Revision of previous surahs, Kawthar - Verse 3" },
  { week: 17, wb: "2025-12-22", qaaidah: NO_LESSON, islamicStudies: NO_LESSON, duas: NO_LESSON, surah: NO_LESSON },
  { week: 18, wb: "2025-12-29", qaaidah: NO_LESSON, islamicStudies: NO_LESSON, duas: NO_LESSON, surah: NO_LESSON },
  { week: 19, wb: "2026-01-05", qaaidah: "Pg 18–20 - Mixed harakah", islamicStudies: "Revision of 5 pillars", duas: "Reply to salaam", surah: "Revision of Surah Fatihah, Ikhlaas and Kawthar" },
  { week: 20, wb: "2026-01-12", qaaidah: "Pg 21 - Tanween: Fathatayn", islamicStudies: "Revision of 6 articles of faith", duas: "Before drinking water", surah: "Revision of previous surahs, Falaq - Verse 1" },
  { week: 21, wb: "2026-01-19", qaaidah: "Pg 22 - Tanween: Kasratayn", islamicStudies: "Sirah - Childhood of our beloved messenger", duas: "After drinking water", surah: "Revision of previous surahs, Falaq - Verse 2" },
  { week: 22, wb: "2026-01-26", qaaidah: "Pg 23 - Tanween: Dhammatayn", islamicStudies: "Sirah - His youth", duas: "Names 1–5", surah: "Revision of previous surahs, Falaq - Verse 3" },
  { week: 23, wb: "2026-02-02", qaaidah: "Pg 24, 27 - Stretched harakah: long fathah", islamicStudies: "Sirah - Marriage and children of prophet", duas: "Shahada", surah: "Revision of previous surahs, Falaq - Verse 4" },
  { week: 24, wb: "2026-02-09", qaaidah: "Pg 30 - Fluency test: long fathah", islamicStudies: "Revision & Assessment", duas: "3rd Kalimah", surah: "Revision of previous surahs, Falaq - Verse 5" },
  { week: 25, wb: "2026-02-16", qaaidah: NO_LESSON, islamicStudies: NO_LESSON, duas: NO_LESSON, surah: NO_LESSON },
  { week: 26, wb: "2026-02-23", qaaidah: NO_LESSON, islamicStudies: NO_LESSON, duas: NO_LESSON, surah: NO_LESSON },
  { week: 27, wb: "2026-03-02", qaaidah: NO_LESSON, islamicStudies: NO_LESSON, duas: NO_LESSON, surah: NO_LESSON },
  { week: 28, wb: "2026-03-09", qaaidah: NO_LESSON, islamicStudies: NO_LESSON, duas: NO_LESSON, surah: NO_LESSON },
  { week: 29, wb: "2026-03-16", qaaidah: NO_LESSON, islamicStudies: NO_LESSON, duas: NO_LESSON, surah: NO_LESSON },
  { week: 30, wb: "2026-03-23", qaaidah: "Pg 25, 28 - Stretched harakah: long kasrah", islamicStudies: "Eid party, Ramadan recap, Revision of pillars & Articles of faith", duas: "On hearing the Prophet's ﷺ name", surah: "Revision of Surah Fatihah, Ikhlaas, Kawthar & Falaq" },
  { week: 31, wb: "2026-03-30", qaaidah: "Pg 26, 29 - Stretched harakah: long dammah", islamicStudies: "Revision (continued)", duas: "Lose something", surah: "Revision of Surah Fatihah, Ikhlaas, Kawthar & Falaq" },
  { week: 32, wb: "2026-04-06", qaaidah: NO_LESSON, islamicStudies: NO_LESSON, duas: NO_LESSON, surah: NO_LESSON },
  { week: 33, wb: "2026-04-13", qaaidah: "Pg 31, 33 - Līn: fathah + waw", islamicStudies: "Fiqh - Revision of 5 pillars", duas: "Scared", surah: "Revision of previous surahs, Naas - Verse 1" },
  { week: 34, wb: "2026-04-20", qaaidah: "Pg 32, 33 - Līn: fathah + ya", islamicStudies: "Aqaa'id - Revision of 6 articles of faith", duas: "Sneeze", surah: "Revision of previous surahs, Naas - Verse 2" },
  { week: 35, wb: "2026-04-27", qaaidah: "Pg 34 - Sukun & joining letters", islamicStudies: "Tarikh - Story of Adam AS", duas: "Other person sneezes", surah: "Revision of previous surahs, Naas - Verse 3" },
  { week: 36, wb: "2026-05-04", qaaidah: "Pg 35 - Joining exercise fluency", islamicStudies: "Tarikh - Story of Nuh AS", duas: "Reply of sneezer", surah: "Revision of previous surahs, Naas - Verse 4" },
  { week: 37, wb: "2026-05-11", qaaidah: "Pg 36 - Longer word breakdown", islamicStudies: "Revision & Assessment", duas: "Entering washroom", surah: "Revision of previous surahs, Naas - Verse 5" },
  { week: 38, wb: "2026-05-18", qaaidah: "Pg 37 - Shaddah", islamicStudies: "Dhul Hijjah practical", duas: "Leaving washroom", surah: "Revision of previous surahs, Naas - Verse 6" },
  { week: 39, wb: "2026-05-25", qaaidah: NO_LESSON, islamicStudies: NO_LESSON, duas: NO_LESSON, surah: NO_LESSON },
  { week: 40, wb: "2026-06-01", qaaidah: "Pg 38 - Shaddah practice", islamicStudies: "Fiqh & Aqaa'id - Revision of 5 pillars, 6 articles, Sirah, Tarikh", duas: "After eating", surah: "Revision of all surahs" },
  { week: 41, wb: "2026-06-08", qaaidah: "Pg 39–40 - Shaddah & madd concepts", islamicStudies: "Adab - Adab of eating & drinking", duas: "Forgetting dua before eating", surah: "Revision of all surahs" },
  { week: 42, wb: "2026-06-15", qaaidah: "Pg 41–42 - Madd lengths", islamicStudies: "Adab - Adab of sleeping/waking up", duas: "Drinking milk", surah: "Revision of all surahs" },
  { week: 43, wb: "2026-06-22", qaaidah: "Pg 43–46 - Stretches & fluency", islamicStudies: "Adab - Adab of entering a house", duas: "Waking up, Names 6–10", surah: "Revision of all surahs" },
  { week: 44, wb: "2026-06-29", qaaidah: "Revision", islamicStudies: "Revision", duas: "Revision", surah: "Revision" },
  { week: 45, wb: "2026-07-06", qaaidah: "Examination", islamicStudies: "Examination", duas: "Examination", surah: "Examination" },
  { week: 46, wb: "2026-07-13", qaaidah: "Jalsa Preparation", islamicStudies: "Jalsa Preparation", duas: "Jalsa Preparation", surah: "Jalsa Preparation" },
  { week: 47, wb: "2026-07-20", qaaidah: NO_LESSON, islamicStudies: NO_LESSON, duas: NO_LESSON, surah: NO_LESSON },
  { week: 48, wb: "2026-07-27", qaaidah: NO_LESSON, islamicStudies: NO_LESSON, duas: NO_LESSON, surah: NO_LESSON },
  { week: 49, wb: "2026-08-03", qaaidah: NO_LESSON, islamicStudies: NO_LESSON, duas: NO_LESSON, surah: NO_LESSON },
  { week: 50, wb: "2026-08-10", qaaidah: NO_LESSON, islamicStudies: NO_LESSON, duas: NO_LESSON, surah: NO_LESSON },
  { week: 51, wb: "2026-08-17", qaaidah: NO_LESSON, islamicStudies: NO_LESSON, duas: NO_LESSON, surah: NO_LESSON },
  { week: 52, wb: "2026-08-24", qaaidah: NO_LESSON, islamicStudies: NO_LESSON, duas: NO_LESSON, surah: NO_LESSON },
];

// Matches the prototype's own observed state: "6 of 36 teaching weeks covered · 17%".
const COVERED_WEEKS = new Set([1, 2, 3, 4, 5, 6]);

async function main() {
  const [madrasah] = await db.select().from(schema.madrasah).limit(1);
  if (!madrasah) throw new Error("No madrasah seeded — run `npm run db:seed` first.");

  const [staffRow] = await db
    .select()
    .from(schema.staff)
    .where(eq(schema.staff.name, "Apa Samia"))
    .limit(1);

  let created = 0;
  let entries = 0;
  for (const w of WEEKS) {
    const [plan] = await db
      .insert(schema.lessonPlan)
      .values({
        madrasahId: madrasah.id,
        year: "Year 1",
        weekStartDate: w.wb,
        setByStaffId: staffRow?.id ?? null,
        coveredAt: COVERED_WEEKS.has(w.week) ? new Date(`${w.wb}T18:00:00Z`) : null,
      })
      .onConflictDoUpdate({
        target: [schema.lessonPlan.madrasahId, schema.lessonPlan.year, schema.lessonPlan.weekStartDate],
        set: { coveredAt: COVERED_WEEKS.has(w.week) ? new Date(`${w.wb}T18:00:00Z`) : null },
      })
      .returning();
    created += 1;

    const subjectContent: [(typeof schema.lessonPlanSubjectEnum.enumValues)[number], string | null][] = [
      ["Qaaidah", w.qaaidah],
      ["Islamic Studies", w.islamicStudies],
      ["Du'as Memorisation", w.duas],
      ["Surah Memorisation", w.surah],
    ];
    for (const [subject, content] of subjectContent) {
      if (!content) {
        // Break weeks (see YEAR1_BREAK_LABELS) carry no entries — clear out any stray
        // row from an earlier run of this script before it stored break names as
        // content.
        await db
          .delete(schema.lessonPlanEntry)
          .where(and(eq(schema.lessonPlanEntry.lessonPlanId, plan.id), eq(schema.lessonPlanEntry.subject, subject)));
        continue;
      }
      await db
        .insert(schema.lessonPlanEntry)
        .values({ madrasahId: madrasah.id, lessonPlanId: plan.id, subject, content })
        .onConflictDoUpdate({
          target: [schema.lessonPlanEntry.lessonPlanId, schema.lessonPlanEntry.subject],
          set: { content },
        });
      entries += 1;
    }
  }

  console.log(`Seeded ${created} Year 1 lesson plan weeks, ${entries} entries.`);
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
