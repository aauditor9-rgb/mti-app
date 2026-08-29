// Weekly lesson plan helpers — year bands (reusing the admissions year list), the fixed
// subject strand catalog, and ISO-week ↔ Monday-date conversion for the native
// `<input type="week">` picker. Local calendar dates throughout, never toISOString
// (invariant 6).
import { ADMISSION_YEARS } from "./admissions";

export const LESSON_PLAN_YEARS = ADMISSION_YEARS;

export const LESSON_PLAN_SUBJECTS = [
  "Qaaidah",
  "Juz Amma",
  "Qur'an",
  "Hifz",
  "Sabaq",
  "Sabqi",
  "Manzil",
  "Islamic Studies",
  "Du'as Memorisation",
  "Surah Memorisation",
  "Tajwīd",
  "Seerah",
  "Akhlaaq",
  "Fiqh",
  "Arabic Writing",
  "Revision / Test",
] as const;
export type LessonPlanSubject = (typeof LESSON_PLAN_SUBJECTS)[number];

// The Monday (UTC-anchored, per invariant 6) of the ISO week containing this date.
export function mondayOfDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const dayNum = (date.getUTCDay() + 6) % 7; // Mon=0 .. Sun=6
  date.setUTCDate(date.getUTCDate() - dayNum);
  return date.toISOString().slice(0, 10);
}

// `<input type="week">` value, e.g. "2026-W36", for the week containing this date.
export function isoWeekInputValue(dateStr: string): string {
  const monday = mondayOfDate(dateStr);
  const [y, m, d] = monday.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const thursday = new Date(date);
  thursday.setUTCDate(date.getUTCDate() + 3);
  const firstThursday = new Date(Date.UTC(thursday.getUTCFullYear(), 0, 4));
  const dayNum = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - dayNum);
  const weekNum = 1 + Math.round((thursday.getTime() - firstThursday.getTime()) / (7 * 86400000));
  return `${thursday.getUTCFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

// Converts an `<input type="week">` value back to that week's Monday date.
export function mondayFromIsoWeekValue(weekValue: string): string {
  const [yearStr, weekStr] = weekValue.split("-W");
  const year = Number(yearStr);
  const week = Number(weekStr);
  const firstThursday = new Date(Date.UTC(year, 0, 4));
  const dayNum = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - dayNum);
  const target = new Date(firstThursday);
  target.setUTCDate(firstThursday.getUTCDate() + (week - 1) * 7);
  return target.toISOString().slice(0, 10);
}

export function formatWeekLabel(mondayDate: string): string {
  const d = new Date(`${mondayDate}T00:00:00Z`);
  return `Week of ${new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", day: "numeric", month: "short", year: "numeric" }).format(d)}`;
}
