"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { holidayRevisionCompletion, holidayRevisionDay, holidayRevisionWindow, klass } from "@/lib/db/schema";
import { getMadrasah } from "@/lib/db/queries";

// Replaces any existing window for this class with a fresh one — see the comment on
// getHolidayRevisionWindow in lib/db/queries.ts. A genuine date-range change is rare
// enough that losing that window's tick-and-sign completions is an acceptable trade for
// not having to reconcile a partial day-range diff.
export async function setHolidayRevisionWindow(classId: string, startDate: string, endDate: string) {
  const madrasah = await getMadrasah();
  const [classRow] = await db.select().from(klass).where(eq(klass.id, classId)).limit(1);
  if (!classRow || classRow.madrasahId !== madrasah.id) return { ok: false, message: "Class not found." };
  if (!startDate || !endDate || startDate > endDate) return { ok: false, message: "Enter a valid date range." };

  await db.delete(holidayRevisionWindow).where(and(eq(holidayRevisionWindow.madrasahId, madrasah.id), eq(holidayRevisionWindow.classId, classId)));

  const [window] = await db
    .insert(holidayRevisionWindow)
    .values({ madrasahId: madrasah.id, classId, startDate, endDate })
    .returning();

  const days: string[] = [];
  const cursor = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  while (cursor <= end) {
    days.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  if (days.length > 0) {
    await db.insert(holidayRevisionDay).values(days.map((date) => ({ madrasahId: madrasah.id, windowId: window.id, date })));
  }

  revalidatePath("/teacher/holiday-revision");
  revalidatePath("/parent", "layout");
  return { ok: true };
}

export async function saveHolidayRevisionDay(formData: FormData) {
  const dayId = String(formData.get("dayId") ?? "");
  const madrasah = await getMadrasah();
  const [row] = await db.select().from(holidayRevisionDay).where(eq(holidayRevisionDay.id, dayId)).limit(1);
  if (!row || row.madrasahId !== madrasah.id) return { ok: false, message: "Day not found." };

  await db
    .update(holidayRevisionDay)
    .set({
      quranQaaidah: String(formData.get("quranQaaidah") ?? "").trim() || null,
      surahMemorisation: String(formData.get("surahMemorisation") ?? "").trim() || null,
      islamicStudies: String(formData.get("islamicStudies") ?? "").trim() || null,
      duas: String(formData.get("duas") ?? "").trim() || null,
      notes: String(formData.get("notes") ?? "").trim() || null,
    })
    .where(eq(holidayRevisionDay.id, dayId));

  revalidatePath("/teacher/holiday-revision");
  revalidatePath("/parent", "layout");
  return { ok: true };
}

export async function toggleHolidayRevisionCompletion(dayId: string, pupilId: string, completed: boolean, guardianId?: string) {
  const madrasah = await getMadrasah();
  const [day] = await db.select().from(holidayRevisionDay).where(eq(holidayRevisionDay.id, dayId)).limit(1);
  if (!day || day.madrasahId !== madrasah.id) throw new Error("Day not found");

  await db
    .insert(holidayRevisionCompletion)
    .values({
      madrasahId: madrasah.id,
      dayId,
      pupilId,
      completedAt: completed ? new Date() : null,
      signedByGuardianId: guardianId ?? null,
    })
    .onConflictDoUpdate({
      target: [holidayRevisionCompletion.dayId, holidayRevisionCompletion.pupilId],
      set: { completedAt: completed ? new Date() : null, signedByGuardianId: guardianId ?? null },
    });

  revalidatePath("/teacher/holiday-revision");
  revalidatePath("/parent", "layout");
  return { ok: true };
}
