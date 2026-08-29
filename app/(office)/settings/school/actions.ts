"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { madrasah } from "@/lib/db/schema";
import { getMadrasah } from "@/lib/db/queries";

function orNull(v: FormDataEntryValue | null) {
  const s = String(v ?? "").trim();
  return s || null;
}

export async function updateSchoolSettings(formData: FormData) {
  const madrasahRow = await getMadrasah();

  const termlyTuitionFee = String(formData.get("termlyTuitionFee") ?? "");
  const enrolmentFee = String(formData.get("enrolmentFee") ?? "");
  const siblingDiscountPct = Number(formData.get("siblingDiscountPct") ?? 0);
  const attendanceReviewThresholdRaw = String(formData.get("attendanceReviewThresholdPct") ?? "").trim();

  if (!Number.isFinite(Number(termlyTuitionFee)) || !Number.isFinite(Number(enrolmentFee))) {
    return { ok: false, message: "Fee amounts must be numbers." };
  }

  await db
    .update(madrasah)
    .set({
      shortName: orNull(formData.get("shortName")),
      address: orNull(formData.get("address")),
      phone: orNull(formData.get("phone")),
      email: orNull(formData.get("email")),
      officePhone: orNull(formData.get("officePhone")),
      officeEmail: orNull(formData.get("officeEmail")),
      arrivalExpectedBy: orNull(formData.get("arrivalExpectedBy")),
      markedLateAfter: orNull(formData.get("markedLateAfter")),
      classesBeginAt: orNull(formData.get("classesBeginAt")),
      absenceReportingDeadline: orNull(formData.get("absenceReportingDeadline")),
      attendanceReviewThresholdPct: attendanceReviewThresholdRaw ? Number(attendanceReviewThresholdRaw) : null,
      termlyTuitionFee,
      enrolmentFee,
      siblingDiscountPct: Number.isFinite(siblingDiscountPct) ? siblingDiscountPct : 10,
    })
    .where(eq(madrasah.id, madrasahRow.id));

  revalidatePath("/settings/school");
  return { ok: true };
}
