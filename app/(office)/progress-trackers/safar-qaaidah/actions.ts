"use server";

import { revalidatePath } from "next/cache";
import { and, eq, max } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { safarQaaidahItem, safarQaaidahLevel, safarQaaidahPupilStatus, pupil } from "@/lib/db/schema";
import { getMadrasah } from "@/lib/db/queries";

export async function addSafarQaaidahItem(formData: FormData) {
  const levelNumberRaw = String(formData.get("levelNumber") ?? "");
  const levelNumber = Number(levelNumberRaw);
  const name = String(formData.get("name") ?? "").trim();

  if (!Number.isInteger(levelNumber) || levelNumber < 1 || !name) {
    return { ok: false, message: "Choose a level and enter a name." };
  }

  const madrasah = await getMadrasah();
  const [level] = await db
    .select()
    .from(safarQaaidahLevel)
    .where(and(eq(safarQaaidahLevel.madrasahId, madrasah.id), eq(safarQaaidahLevel.levelNumber, levelNumber)))
    .limit(1);
  if (!level) return { ok: false, message: "That level doesn't exist." };

  const [{ next }] = await db
    .select({ next: max(safarQaaidahItem.orderIndex) })
    .from(safarQaaidahItem)
    .where(eq(safarQaaidahItem.levelId, level.id));

  await db.insert(safarQaaidahItem).values({
    madrasahId: madrasah.id,
    levelId: level.id,
    name,
    orderIndex: (next ?? -1) + 1,
  });

  revalidatePath("/progress-trackers/safar-qaaidah");
  return { ok: true };
}

type StatusField = "recognitionMet" | "makharijMet" | "fluencyMet" | "accuracyMet" | "readAtHome";
const STATUS_FIELDS: StatusField[] = ["recognitionMet", "makharijMet", "fluencyMet", "accuracyMet", "readAtHome"];

export async function setSafarQaaidahStatus(pupilId: string, itemId: string, field: StatusField, value: boolean) {
  if (!STATUS_FIELDS.includes(field)) throw new Error("Invalid field");

  const madrasah = await getMadrasah();
  const [pupilRow] = await db.select().from(pupil).where(eq(pupil.id, pupilId)).limit(1);
  if (!pupilRow || pupilRow.madrasahId !== madrasah.id) throw new Error("Student not found");

  const [itemRow] = await db.select().from(safarQaaidahItem).where(eq(safarQaaidahItem.id, itemId)).limit(1);
  if (!itemRow || itemRow.madrasahId !== madrasah.id) throw new Error("Item not found");

  await db
    .insert(safarQaaidahPupilStatus)
    .values({
      madrasahId: madrasah.id,
      pupilId,
      itemId,
      [field]: value,
    })
    .onConflictDoUpdate({
      target: [safarQaaidahPupilStatus.pupilId, safarQaaidahPupilStatus.itemId],
      set: { [field]: value, updatedAt: new Date() },
    });

  revalidatePath("/progress-trackers/safar-qaaidah");
  return { ok: true };
}

const TESTER_ROLES = ["Qur'an Curriculum Lead", "Headteacher"] as const;

export async function confirmLevelTest(formData: FormData) {
  const levelNumber = Number(formData.get("levelNumber"));
  const testedByName = String(formData.get("testedByName") ?? "").trim();
  const testedByRole = String(formData.get("testedByRole") ?? "");

  if (!Number.isInteger(levelNumber) || !testedByName) {
    return { ok: false, message: "Enter a name to confirm the test." };
  }
  if (!TESTER_ROLES.includes(testedByRole as (typeof TESTER_ROLES)[number])) {
    return { ok: false, message: "Choose who tested this level." };
  }

  const madrasah = await getMadrasah();
  await db
    .update(safarQaaidahLevel)
    .set({ testedByName, testedByRole: testedByRole as (typeof TESTER_ROLES)[number], testedAt: new Date() })
    .where(and(eq(safarQaaidahLevel.madrasahId, madrasah.id), eq(safarQaaidahLevel.levelNumber, levelNumber)));

  revalidatePath("/progress-trackers/safar-qaaidah");
  return { ok: true };
}

export async function clearLevelTest(levelNumber: number) {
  const madrasah = await getMadrasah();
  await db
    .update(safarQaaidahLevel)
    .set({ testedByName: null, testedByRole: null, testedAt: null })
    .where(and(eq(safarQaaidahLevel.madrasahId, madrasah.id), eq(safarQaaidahLevel.levelNumber, levelNumber)));

  revalidatePath("/progress-trackers/safar-qaaidah");
  return { ok: true };
}
