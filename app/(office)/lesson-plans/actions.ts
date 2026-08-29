"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { lessonPlan, lessonPlanEntry } from "@/lib/db/schema";
import { getMadrasah } from "@/lib/db/queries";
import { LESSON_PLAN_SUBJECTS, type LessonPlanSubject } from "@/lib/derive/lesson-plans";
import { ADMISSION_YEARS, type AdmissionYear } from "@/lib/derive/admissions";

async function findOrCreatePlan(
  madrasahId: string,
  year: AdmissionYear,
  weekStartDate: string,
  setByStaffId: string | null,
) {
  const existing = await db.query.lessonPlan.findFirst({
    where: and(
      eq(lessonPlan.madrasahId, madrasahId),
      eq(lessonPlan.year, year),
      eq(lessonPlan.weekStartDate, weekStartDate),
    ),
  });
  if (existing) return existing;

  const [row] = await db
    .insert(lessonPlan)
    .values({ madrasahId, year, weekStartDate, setByStaffId })
    .onConflictDoNothing({ target: [lessonPlan.madrasahId, lessonPlan.year, lessonPlan.weekStartDate] })
    .returning();
  if (row) return row;

  // Lost a race with a concurrent insert — read back the row that won.
  const winner = await db.query.lessonPlan.findFirst({
    where: and(
      eq(lessonPlan.madrasahId, madrasahId),
      eq(lessonPlan.year, year),
      eq(lessonPlan.weekStartDate, weekStartDate),
    ),
  });
  if (!winner) throw new Error("Could not create the lesson plan.");
  return winner;
}

export async function setLessonPlanEntry(formData: FormData) {
  const year = String(formData.get("year") ?? "") as AdmissionYear;
  const weekStartDate = String(formData.get("weekStartDate") ?? "");
  const subject = String(formData.get("subject") ?? "") as LessonPlanSubject;
  const content = String(formData.get("content") ?? "").trim();
  const setByStaffId = String(formData.get("setByStaffId") ?? "") || null;

  if (!ADMISSION_YEARS.includes(year) || !weekStartDate || !LESSON_PLAN_SUBJECTS.includes(subject) || !content) {
    return { ok: false, message: "Choose a subject and enter what's being taught." };
  }

  const madrasah = await getMadrasah();
  const plan = await findOrCreatePlan(madrasah.id, year, weekStartDate, setByStaffId);

  await db
    .insert(lessonPlanEntry)
    .values({ madrasahId: madrasah.id, lessonPlanId: plan.id, subject, content })
    .onConflictDoUpdate({
      target: [lessonPlanEntry.lessonPlanId, lessonPlanEntry.subject],
      set: { content },
    });

  revalidatePath("/lesson-plans");
  return { ok: true };
}

export async function removeLessonPlanEntry(entryId: string) {
  const madrasah = await getMadrasah();
  const [row] = await db.select().from(lessonPlanEntry).where(eq(lessonPlanEntry.id, entryId)).limit(1);
  if (!row || row.madrasahId !== madrasah.id) throw new Error("Entry not found");

  await db.delete(lessonPlanEntry).where(eq(lessonPlanEntry.id, entryId));

  revalidatePath("/lesson-plans");
  return { ok: true };
}
