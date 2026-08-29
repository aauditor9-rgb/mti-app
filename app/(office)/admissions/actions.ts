"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { applicant, applicantStageLog, guardian, household, pupil, pupilGuardian } from "@/lib/db/schema";
import { getMadrasah } from "@/lib/db/queries";
import { ADMISSION_STAGES, ADMISSION_YEARS, type AdmissionStage, type AdmissionYear } from "@/lib/derive/admissions";
import { todayLondon } from "@/lib/derive/age";

async function assertApplicantInMadrasah(applicantId: string) {
  const madrasah = await getMadrasah();
  const [row] = await db.select().from(applicant).where(eq(applicant.id, applicantId)).limit(1);
  if (!row || row.madrasahId !== madrasah.id) throw new Error("Applicant not found");
  return { madrasah, row };
}

export async function createApplicant(formData: FormData) {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const dob = String(formData.get("dob") ?? "");
  const gender = String(formData.get("gender") ?? "");
  const requestedYear = String(formData.get("requestedYear") ?? "") as AdmissionYear;
  const guardianName = String(formData.get("guardianName") ?? "").trim();
  const guardianPhone = String(formData.get("guardianPhone") ?? "").trim();
  const guardianEmail = String(formData.get("guardianEmail") ?? "").trim() || null;
  const siblingAtMti = formData.get("siblingAtMti") === "on";
  const familyAttendsMasjid = formData.get("familyAttendsMasjid") === "on";
  const quranLevel = String(formData.get("quranLevel") ?? "").trim() || null;
  const note = String(formData.get("note") ?? "").trim() || null;

  if (
    !firstName ||
    !lastName ||
    !dob ||
    (gender !== "M" && gender !== "F") ||
    !ADMISSION_YEARS.includes(requestedYear) ||
    !guardianName ||
    !guardianPhone
  ) {
    return { ok: false, message: "Fill in the child's name, DOB, gender, year and guardian details." };
  }

  const madrasah = await getMadrasah();
  const [row] = await db
    .insert(applicant)
    .values({
      madrasahId: madrasah.id,
      firstName,
      lastName,
      dob,
      gender,
      requestedYear,
      guardianName,
      guardianPhone,
      guardianEmail,
      siblingAtMti,
      familyAttendsMasjid,
      quranLevel,
      note,
      submittedAt: todayLondon(),
    })
    .returning();

  await db.insert(applicantStageLog).values({ madrasahId: madrasah.id, applicantId: row.id, stage: "Enquiry" });

  revalidatePath("/admissions");
  return { ok: true };
}

export async function advanceStage(applicantId: string, stage: AdmissionStage) {
  if (!ADMISSION_STAGES.includes(stage)) return { ok: false, message: "Invalid stage." };
  const { madrasah, row } = await assertApplicantInMadrasah(applicantId);
  if (row.stage === "Enrolled") {
    return { ok: false, message: "This applicant is already enrolled." };
  }

  await db.update(applicant).set({ stage, declineReason: stage === "Declined" ? row.declineReason : null }).where(eq(applicant.id, applicantId));
  await db.insert(applicantStageLog).values({ madrasahId: madrasah.id, applicantId, stage });

  revalidatePath("/admissions");
  revalidatePath(`/admissions/${applicantId}`);
  return { ok: true };
}

export async function declineApplicant(applicantId: string, reason: string) {
  const { madrasah } = await assertApplicantInMadrasah(applicantId);

  await db.update(applicant).set({ stage: "Declined", declineReason: reason || null }).where(eq(applicant.id, applicantId));
  await db.insert(applicantStageLog).values({ madrasahId: madrasah.id, applicantId, stage: "Declined" });

  revalidatePath("/admissions");
  revalidatePath(`/admissions/${applicantId}`);
  return { ok: true };
}

export async function setApplicantClass(applicantId: string, classId: string) {
  await assertApplicantInMadrasah(applicantId);
  await db.update(applicant).set({ classId: classId || null }).where(eq(applicant.id, applicantId));

  revalidatePath("/admissions");
  revalidatePath(`/admissions/${applicantId}`);
  return { ok: true };
}

// Only a fully approved enrolment (stage === "Offer") creates the pupil record —
// design/README.md "Enrolment wizard". This is a simplified single-step version of
// that 5-step wizard: it skips policy sign-off, fee collection and head's-notes
// approval, which need forms/payments/roles this project doesn't have yet. It does
// the part that matters structurally: match-or-create the household and create the
// pupil record from the applicant's own data.
export async function enrolApplicant(applicantId: string) {
  const { madrasah, row } = await assertApplicantInMadrasah(applicantId);
  if (row.stage !== "Offer") {
    return { ok: false, message: "Only an applicant with an accepted offer can be enrolled." };
  }

  const [hh] = await db.insert(household).values({ madrasahId: madrasah.id }).returning();
  const [guardianRow] = await db
    .insert(guardian)
    .values({
      madrasahId: madrasah.id,
      householdId: hh.id,
      name: row.guardianName,
      relation: "Guardian",
      phone: row.guardianPhone,
      email: row.guardianEmail,
    })
    .returning();

  const [pupilRow] = await db
    .insert(pupil)
    .values({
      madrasahId: madrasah.id,
      householdId: hh.id,
      classId: row.classId,
      name: `${row.firstName} ${row.lastName}`,
      dob: row.dob,
      gender: row.gender,
      allergies: "None on file",
      medicalNotes: "None on file",
      learningNotes: "None on file",
      verified: false,
    })
    .returning();

  await db.insert(pupilGuardian).values({
    madrasahId: madrasah.id,
    pupilId: pupilRow.id,
    guardianId: guardianRow.id,
    isPrimary: true,
  });

  await db
    .update(applicant)
    .set({ stage: "Enrolled", enrolledPupilId: pupilRow.id })
    .where(eq(applicant.id, applicantId));
  await db.insert(applicantStageLog).values({ madrasahId: madrasah.id, applicantId, stage: "Enrolled" });

  revalidatePath("/admissions");
  revalidatePath(`/admissions/${applicantId}`);
  revalidatePath("/students");
  return { ok: true, pupilId: pupilRow.id };
}
