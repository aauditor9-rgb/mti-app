"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { pupil, salahLog } from "@/lib/db/schema";
import { getMadrasah } from "@/lib/db/queries";
import { SALAH_PRAYERS } from "@/lib/derive/salah";

export async function logSalahDay(formData: FormData) {
  const pupilId = String(formData.get("pupilId") ?? "");
  const date = String(formData.get("date") ?? "");

  if (!pupilId || !date) {
    return { ok: false, message: "Choose a student and a date." };
  }

  const madrasah = await getMadrasah();
  const [pupilRow] = await db.select().from(pupil).where(eq(pupil.id, pupilId)).limit(1);
  if (!pupilRow || pupilRow.madrasahId !== madrasah.id) {
    return { ok: false, message: "Student not found." };
  }

  for (const prayer of SALAH_PRAYERS) {
    const prayed = formData.get(`prayed_${prayer}`) === "on";
    const jamaah = prayed && formData.get(`jamaah_${prayer}`) === "on";

    await db
      .insert(salahLog)
      .values({ madrasahId: madrasah.id, pupilId, date, prayer, prayed, jamaah })
      .onConflictDoUpdate({
        target: [salahLog.pupilId, salahLog.date, salahLog.prayer],
        set: { prayed, jamaah },
      });
  }

  revalidatePath("/salah");
  return { ok: true };
}

export async function getExistingLog(pupilId: string, date: string) {
  const madrasah = await getMadrasah();
  const rows = await db
    .select()
    .from(salahLog)
    .where(and(eq(salahLog.pupilId, pupilId), eq(salahLog.date, date), eq(salahLog.madrasahId, madrasah.id)));
  return rows;
}
