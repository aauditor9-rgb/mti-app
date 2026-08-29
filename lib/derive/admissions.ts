// Admissions priority scoring and SLA tracking — design/README.md "Admissions".
// Priority is scored from criteria, never typed in directly; SLA days are a single
// constant per stage, read here and nowhere else (invariant 1).
import { todayLondon } from "./age";

export const ADMISSION_YEARS = [
  "Reception",
  "Year 1",
  "Year 2",
  "Year 3",
  "Year 4",
  "Year 5",
  "Year 6",
  "Year 7",
  "Year 8",
] as const;
export type AdmissionYear = (typeof ADMISSION_YEARS)[number];

export const ADMISSION_STAGES = [
  "Enquiry",
  "Application",
  "Assessment",
  "Offer",
  "Enrolled",
  "Waiting list",
  "Declined",
] as const;
export type AdmissionStage = (typeof ADMISSION_STAGES)[number];

// The pipeline stages an applicant moves through in order — Waiting list and Declined
// are parallel states reachable from any of these, not steps in the sequence.
export const PIPELINE_STAGES: AdmissionStage[] = ["Enquiry", "Application", "Assessment", "Offer", "Enrolled"];

export const STAGE_SLA_DAYS: Partial<Record<AdmissionStage, number>> = {
  Enquiry: 7,
  Application: 10,
  Assessment: 14,
  Offer: 14,
};

export type PriorityBand = "High" | "Medium" | "Standard";

export function daysBetween(fromDate: string, toDate: string = todayLondon()): number {
  // Accepts either a plain date (YYYY-MM-DD) or a full ISO timestamp — only the date
  // part matters here, per invariant 6 (local calendar dates, never instant math).
  const from = new Date(`${fromDate.slice(0, 10)}T00:00:00Z`).getTime();
  const to = new Date(`${toDate.slice(0, 10)}T00:00:00Z`).getTime();
  return Math.floor((to - from) / 86400000);
}

export function computePriorityScore(input: {
  siblingAtMti: boolean;
  familyAttendsMasjid: boolean;
  submittedAt: string;
  quranLevel: string | null;
}): { score: number; band: PriorityBand; reasons: string[] } {
  const reasons: string[] = [];
  let score = 0;

  if (input.siblingAtMti) {
    score += 40;
    reasons.push("Sibling already at MTI (+40)");
  }
  if (input.familyAttendsMasjid) {
    score += 25;
    reasons.push("Family attends the masjid (+25)");
  }
  if (daysBetween(input.submittedAt) > 30) {
    score += 20;
    reasons.push("Waiting over 30 days (+20)");
  }
  if (input.quranLevel && input.quranLevel.trim().length > 0) {
    score += 10;
    reasons.push("Already started Qur'an (+10)");
  }

  const band: PriorityBand = score >= 60 ? "High" : score >= 30 ? "Medium" : "Standard";
  return { score, band, reasons };
}

export function slaStatus(
  stage: AdmissionStage,
  stageEnteredAt: string,
): { daysInStage: number; slaDays: number | null; overdue: boolean } {
  const daysInStage = daysBetween(stageEnteredAt);
  const slaDays = STAGE_SLA_DAYS[stage] ?? null;
  return { daysInStage, slaDays, overdue: slaDays !== null && daysInStage > slaDays };
}
