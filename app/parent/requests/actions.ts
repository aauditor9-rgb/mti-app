"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import { leaveHolidayReasonEnum, leaveReportReasonEnum, leaveRequest, parentsEveningBooking } from "@/lib/db/schema";
import { getCurrentGuardian, getMadrasah } from "@/lib/db/queries";
import { todayLondon } from "@/lib/derive/age";

export async function reportAbsence(formData: FormData) {
  const madrasah = await getMadrasah();
  const guardianRow = await getCurrentGuardian(madrasah.id);
  if (!guardianRow) return { ok: false, message: "Not signed in." };

  const pupilId = String(formData.get("pupilId") ?? "");
  const reportReason = String(formData.get("reportReason") ?? "");
  if (!guardianRow.children.some((c) => c.id === pupilId)) return { ok: false, message: "Choose your child." };
  if (!leaveReportReasonEnum.enumValues.includes(reportReason as (typeof leaveReportReasonEnum.enumValues)[number])) {
    return { ok: false, message: "Choose a reason." };
  }

  await db.insert(leaveRequest).values({
    madrasahId: madrasah.id,
    pupilId,
    guardianId: guardianRow.id,
    kind: "Absence today",
    reportReason: reportReason as (typeof leaveReportReasonEnum.enumValues)[number],
    startDate: todayLondon(),
  });

  revalidatePath("/parent/requests");
  return { ok: true };
}

export async function requestHolidayLeave(formData: FormData) {
  const madrasah = await getMadrasah();
  const guardianRow = await getCurrentGuardian(madrasah.id);
  if (!guardianRow) return { ok: false, message: "Not signed in." };

  const pupilId = String(formData.get("pupilId") ?? "");
  const startDate = String(formData.get("startDate") ?? "");
  const endDate = String(formData.get("endDate") ?? "");
  const holidayReason = String(formData.get("holidayReason") ?? "");
  const explanation = String(formData.get("explanation") ?? "").trim();
  const acknowledgedPolicy = formData.get("acknowledgedPolicy") === "on";

  if (!guardianRow.children.some((c) => c.id === pupilId)) return { ok: false, message: "Choose your child." };
  if (!startDate || !endDate) return { ok: false, message: "Choose the dates away." };
  if (!leaveHolidayReasonEnum.enumValues.includes(holidayReason as (typeof leaveHolidayReasonEnum.enumValues)[number])) {
    return { ok: false, message: "Choose a reason." };
  }
  if (!acknowledgedPolicy) return { ok: false, message: "Please confirm you've spoken to the office, or will do so." };

  await db.insert(leaveRequest).values({
    madrasahId: madrasah.id,
    pupilId,
    guardianId: guardianRow.id,
    kind: "Holiday / leave",
    holidayReason: holidayReason as (typeof leaveHolidayReasonEnum.enumValues)[number],
    startDate,
    endDate,
    explanation: explanation || null,
    acknowledgedPolicy,
  });

  revalidatePath("/parent/requests");
  return { ok: true };
}

export async function bookParentsEveningSlot(slotId: string, pupilId: string) {
  const madrasah = await getMadrasah();
  const guardianRow = await getCurrentGuardian(madrasah.id);
  if (!guardianRow) return { ok: false, message: "Not signed in." };
  if (!guardianRow.children.some((c) => c.id === pupilId)) return { ok: false, message: "Choose your child." };

  await db
    .insert(parentsEveningBooking)
    .values({ madrasahId: madrasah.id, slotId, pupilId, guardianId: guardianRow.id })
    .onConflictDoNothing({ target: [parentsEveningBooking.slotId, parentsEveningBooking.pupilId] });

  revalidatePath("/parent/requests");
  revalidatePath("/communications/parents-evening");
  return { ok: true };
}
