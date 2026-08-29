"use server";

import { revalidatePath } from "next/cache";
import { and, eq, max } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { duaCatalogItem, duaPupilStatus, pupil } from "@/lib/db/schema";
import { getMadrasah } from "@/lib/db/queries";
import { ADMISSION_YEARS, type AdmissionYear } from "@/lib/derive/admissions";

export async function addDuaCatalogItem(formData: FormData) {
  const year = String(formData.get("year") ?? "") as AdmissionYear;
  const name = String(formData.get("name") ?? "").trim();

  if (!ADMISSION_YEARS.includes(year) || !name) {
    return { ok: false, message: "Choose a year and enter a name." };
  }

  const madrasah = await getMadrasah();
  const [{ next }] = await db
    .select({ next: max(duaCatalogItem.orderIndex) })
    .from(duaCatalogItem)
    .where(and(eq(duaCatalogItem.madrasahId, madrasah.id), eq(duaCatalogItem.year, year)));

  await db.insert(duaCatalogItem).values({
    madrasahId: madrasah.id,
    year,
    name,
    orderIndex: (next ?? -1) + 1,
  });

  revalidatePath("/progress-trackers/duas");
  return { ok: true };
}

type StatusField = "arabicMemorised" | "translationMemorised" | "readAtHome";
const STATUS_FIELDS: StatusField[] = ["arabicMemorised", "translationMemorised", "readAtHome"];

export async function setDuaStatus(pupilId: string, duaCatalogItemId: string, field: StatusField, value: boolean) {
  if (!STATUS_FIELDS.includes(field)) throw new Error("Invalid field");

  const madrasah = await getMadrasah();
  const [pupilRow] = await db.select().from(pupil).where(eq(pupil.id, pupilId)).limit(1);
  if (!pupilRow || pupilRow.madrasahId !== madrasah.id) throw new Error("Student not found");

  const [itemRow] = await db.select().from(duaCatalogItem).where(eq(duaCatalogItem.id, duaCatalogItemId)).limit(1);
  if (!itemRow || itemRow.madrasahId !== madrasah.id) throw new Error("Du'a not found");

  await db
    .insert(duaPupilStatus)
    .values({
      madrasahId: madrasah.id,
      pupilId,
      duaCatalogItemId,
      [field]: value,
    })
    .onConflictDoUpdate({
      target: [duaPupilStatus.pupilId, duaPupilStatus.duaCatalogItemId],
      set: { [field]: value, updatedAt: new Date() },
    });

  revalidatePath("/progress-trackers/duas");
  return { ok: true };
}
