"use server";

import { revalidatePath } from "next/cache";
import { and, count, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { complaint, complaintStatusEnum } from "@/lib/db/schema";
import { getMadrasah } from "@/lib/db/queries";

export async function createComplaint(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const pupilId = String(formData.get("pupilId") ?? "").trim() || null;
  const guardianName = String(formData.get("guardianName") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();
  const investigatorStaffId = String(formData.get("investigatorStaffId") ?? "").trim() || null;
  const submittedAt = String(formData.get("submittedAt") ?? "");

  if (!title || !guardianName || !category || !note || !submittedAt) {
    return { ok: false, message: "Enter a title, who raised it, a category, the note and the date." };
  }

  const madrasah = await getMadrasah();
  const [{ value: existingCount }] = await db
    .select({ value: count() })
    .from(complaint)
    .where(eq(complaint.madrasahId, madrasah.id));
  const reference = `CMP-${String(existingCount + 1).padStart(3, "0")}`;

  await db.insert(complaint).values({
    madrasahId: madrasah.id,
    reference,
    title,
    pupilId,
    raisedByName: guardianName,
    category,
    note,
    submittedAt,
    investigatorStaffId,
    status: "Open",
  });

  revalidatePath("/communications/complaints");
  return { ok: true };
}

export async function updateComplaintStatus(complaintId: string, status: string) {
  if (!complaintStatusEnum.enumValues.includes(status as (typeof complaintStatusEnum.enumValues)[number])) {
    throw new Error("Invalid status");
  }
  const madrasah = await getMadrasah();
  const patch: Partial<typeof complaint.$inferInsert> = { status: status as (typeof complaintStatusEnum.enumValues)[number] };
  if (status === "Acknowledged") patch.acknowledgedAt = new Date();
  if (status === "Resolved") patch.resolvedAt = new Date();

  await db.update(complaint).set(patch).where(and(eq(complaint.id, complaintId), eq(complaint.madrasahId, madrasah.id)));

  revalidatePath("/communications/complaints");
  return { ok: true };
}
