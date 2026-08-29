"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { riskRegisterEntry, riskSeverityEnum, riskStatusEnum } from "@/lib/db/schema";
import { getMadrasah } from "@/lib/db/queries";

export async function createRiskEntry(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const ownerStaffId = String(formData.get("ownerStaffId") ?? "").trim() || null;
  const reviewByDate = String(formData.get("reviewByDate") ?? "");
  const severity = String(formData.get("severity") ?? "");
  const note = String(formData.get("note") ?? "").trim();

  if (!title || !reviewByDate || !severity) {
    return { ok: false, message: "Enter a title, review date and severity." };
  }
  if (!riskSeverityEnum.enumValues.includes(severity as (typeof riskSeverityEnum.enumValues)[number])) {
    return { ok: false, message: "Invalid severity." };
  }

  const madrasah = await getMadrasah();
  await db.insert(riskRegisterEntry).values({
    madrasahId: madrasah.id,
    title,
    ownerStaffId,
    reviewByDate,
    severity: severity as (typeof riskSeverityEnum.enumValues)[number],
    note: note || null,
  });

  revalidatePath("/safeguarding/risk-register");
  return { ok: true };
}

export async function updateRiskStatus(entryId: string, status: string) {
  if (!riskStatusEnum.enumValues.includes(status as (typeof riskStatusEnum.enumValues)[number])) {
    throw new Error("Invalid status");
  }
  const madrasah = await getMadrasah();
  await db
    .update(riskRegisterEntry)
    .set({ status: status as (typeof riskStatusEnum.enumValues)[number] })
    .where(and(eq(riskRegisterEntry.id, entryId), eq(riskRegisterEntry.madrasahId, madrasah.id)));

  revalidatePath("/safeguarding/risk-register");
  return { ok: true };
}
