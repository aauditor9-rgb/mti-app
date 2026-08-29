"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { concern, pupil } from "@/lib/db/schema";
import { getMadrasah } from "@/lib/db/queries";
import {
  autoNotifiesSafeguarding,
  CONCERN_CATEGORIES,
  CONCERN_SEVERITIES,
  type ConcernCategory,
  type ConcernSeverity,
  type ConcernStatus,
} from "@/lib/derive/concern";

async function assertConcernInMadrasah(concernId: string) {
  const madrasah = await getMadrasah();
  const [row] = await db.select().from(concern).where(eq(concern.id, concernId)).limit(1);
  if (!row || row.madrasahId !== madrasah.id) throw new Error("Concern not found");
  return { madrasah, row };
}

export async function logConcern(formData: FormData) {
  const pupilId = String(formData.get("pupilId") ?? "");
  const category = String(formData.get("category") ?? "") as ConcernCategory;
  const note = String(formData.get("note") ?? "").trim();
  const severity = String(formData.get("severity") ?? "Low") as ConcernSeverity;
  const raisedByStaffId = String(formData.get("raisedByStaffId") ?? "") || null;
  const ownerStaffId = String(formData.get("ownerStaffId") ?? "") || null;

  if (!pupilId || !note || !CONCERN_CATEGORIES.includes(category) || !CONCERN_SEVERITIES.includes(severity)) {
    return { ok: false, message: "Fill in a student, category and note." };
  }

  const madrasah = await getMadrasah();
  const [pupilRow] = await db.select().from(pupil).where(eq(pupil.id, pupilId)).limit(1);
  if (!pupilRow || pupilRow.madrasahId !== madrasah.id) {
    return { ok: false, message: "Student not found." };
  }

  const notify = autoNotifiesSafeguarding(severity);
  await db.insert(concern).values({
    madrasahId: madrasah.id,
    pupilId,
    classId: pupilRow.classId,
    category,
    note,
    severity,
    raisedByStaffId,
    ownerStaffId,
    safeguardingNotified: notify,
    safeguardingNotifiedAt: notify ? new Date() : null,
  });

  revalidatePath("/concerns");
  return { ok: true };
}

export async function updateConcernStatus(concernId: string, status: ConcernStatus) {
  const { row } = await assertConcernInMadrasah(concernId);

  await db
    .update(concern)
    .set({
      status,
      parentInformedAt: status === "Parent informed" ? (row.parentInformedAt ?? new Date()) : row.parentInformedAt,
      resolvedAt: status === "Resolved" ? (row.resolvedAt ?? new Date()) : row.resolvedAt,
    })
    .where(eq(concern.id, concernId));

  revalidatePath("/concerns");
  return { ok: true };
}

export async function updateConcernSeverity(concernId: string, severity: ConcernSeverity) {
  const { row } = await assertConcernInMadrasah(concernId);
  const notify = autoNotifiesSafeguarding(severity) && !row.safeguardingNotified;

  await db
    .update(concern)
    .set({
      severity,
      safeguardingNotified: row.safeguardingNotified || notify,
      safeguardingNotifiedAt: notify ? new Date() : row.safeguardingNotifiedAt,
    })
    .where(eq(concern.id, concernId));

  revalidatePath("/concerns");
  return { ok: true };
}

export async function updateConcernOwner(concernId: string, ownerStaffId: string) {
  await assertConcernInMadrasah(concernId);
  await db.update(concern).set({ ownerStaffId: ownerStaffId || null }).where(eq(concern.id, concernId));
  revalidatePath("/concerns");
  return { ok: true };
}

export async function notifySafeguarding(concernId: string) {
  const { row } = await assertConcernInMadrasah(concernId);
  if (row.safeguardingNotified) return { ok: true };

  await db
    .update(concern)
    .set({ safeguardingNotified: true, safeguardingNotifiedAt: new Date() })
    .where(eq(concern.id, concernId));

  revalidatePath("/concerns");
  return { ok: true };
}
