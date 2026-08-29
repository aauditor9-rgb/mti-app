"use server";

import { revalidatePath } from "next/cache";
import { and, eq, max } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { surahCatalogItem, surahPupilStatus, pupil } from "@/lib/db/schema";
import { getMadrasah } from "@/lib/db/queries";
import type { AdmissionYear } from "@/lib/derive/admissions";

const SURAH_YEARS: AdmissionYear[] = ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6", "Year 7", "Year 8"];

export async function addSurahCatalogItem(formData: FormData) {
  const year = String(formData.get("year") ?? "") as AdmissionYear;
  const name = String(formData.get("name") ?? "").trim();
  const verseCountRaw = String(formData.get("verseCount") ?? "").trim();
  const verseCount = verseCountRaw ? Number(verseCountRaw) : null;

  if (!SURAH_YEARS.includes(year) || !name) {
    return { ok: false, message: "Choose a year and enter a name." };
  }
  if (verseCount !== null && (!Number.isInteger(verseCount) || verseCount <= 0)) {
    return { ok: false, message: "Verse count must be a positive whole number." };
  }

  const madrasah = await getMadrasah();
  const [{ next }] = await db
    .select({ next: max(surahCatalogItem.orderIndex) })
    .from(surahCatalogItem)
    .where(and(eq(surahCatalogItem.madrasahId, madrasah.id), eq(surahCatalogItem.year, year)));

  await db.insert(surahCatalogItem).values({
    madrasahId: madrasah.id,
    year,
    name,
    verseCount,
    orderIndex: (next ?? -1) + 1,
  });

  revalidatePath("/progress-trackers/surahs");
  return { ok: true };
}

type StatusField = "memorised" | "tajweedSound" | "readAtHome";
const STATUS_FIELDS: StatusField[] = ["memorised", "tajweedSound", "readAtHome"];

export async function setSurahStatus(pupilId: string, surahCatalogItemId: string, field: StatusField, value: boolean) {
  if (!STATUS_FIELDS.includes(field)) throw new Error("Invalid field");

  const madrasah = await getMadrasah();
  const [pupilRow] = await db.select().from(pupil).where(eq(pupil.id, pupilId)).limit(1);
  if (!pupilRow || pupilRow.madrasahId !== madrasah.id) throw new Error("Student not found");

  const [itemRow] = await db.select().from(surahCatalogItem).where(eq(surahCatalogItem.id, surahCatalogItemId)).limit(1);
  if (!itemRow || itemRow.madrasahId !== madrasah.id) throw new Error("Surah not found");

  await db
    .insert(surahPupilStatus)
    .values({
      madrasahId: madrasah.id,
      pupilId,
      surahCatalogItemId,
      [field]: value,
    })
    .onConflictDoUpdate({
      target: [surahPupilStatus.pupilId, surahPupilStatus.surahCatalogItemId],
      set: { [field]: value, updatedAt: new Date() },
    });

  revalidatePath("/progress-trackers/surahs");
  return { ok: true };
}
