"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { ihsanAward, ihsanLedger, pupil } from "@/lib/db/schema";
import { getMadrasah } from "@/lib/db/queries";

export async function awardPoints(pupilId: string, awardId: string) {
  const madrasah = await getMadrasah();

  const [pupilRow] = await db.select().from(pupil).where(eq(pupil.id, pupilId)).limit(1);
  if (!pupilRow || pupilRow.madrasahId !== madrasah.id) {
    return { ok: false, message: "Student not found." };
  }

  const [award] = await db.select().from(ihsanAward).where(eq(ihsanAward.id, awardId)).limit(1);
  if (!award) return { ok: false, message: "Award not found." };
  if (award.automatic) {
    return { ok: false, message: `${award.name} is awarded automatically and can't be given manually.` };
  }

  await db.insert(ihsanLedger).values({
    madrasahId: madrasah.id,
    pupilId,
    awardId,
    classId: pupilRow.classId,
  });

  revalidatePath("/ihsan");
  revalidatePath("/teacher", "layout");
  revalidatePath("/parent", "layout");
  return { ok: true };
}
