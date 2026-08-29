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

// The 52 consecutive Monday week-starts of an academic year, from its first Monday
// (design/README.md Teacher > Lesson Plans "Annual overview" — a full year at a glance).
export function academicYearWeekStarts(startDate: string, count = 52): string[] {
  const [y, m, d] = startDate.split("-").map(Number);
  const start = new Date(Date.UTC(y, m - 1, d));
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + i * 7);
    return date.toISOString().slice(0, 10);
  });
}

// Year 1's non-teaching weeks (design/README.md Teacher > Lesson Plans "Annual
// overview") — holidays and breaks, verbatim from the prototype's own week labels.
// Kept out of lesson_plan_entry (a break isn't a subject taught) and shown here instead,
// so "N of 52 teaching weeks covered" only counts weeks with real content.
export const YEAR1_BREAK_LABELS: Record<string, string> = {
  "2025-10-27": "Half Term",
  "2025-12-22": "End of Term",
  "2025-12-29": "End of Term",
  "2026-02-16": "Ramadan Break",
  "2026-02-23": "Ramadan Break",
  "2026-03-02": "Ramadan Break",
  "2026-03-09": "Ramadan Break",
  "2026-03-16": "Ramadan Break",
  "2026-04-06": "Term Break",
  "2026-05-25": "Eid-ul-Adha Break",
  "2026-07-20": "End of Year Break",
  "2026-07-27": "End of Year Break",
  "2026-08-03": "End of Year Break",
  "2026-08-10": "End of Year Break",
  "2026-08-17": "End of Year Break",
  "2026-08-24": "End of Year Break",
};

export function formatWeekLabel(mondayDate: string): string {
  const d = new Date(`${mondayDate}T00:00:00Z`);
  return `Week of ${new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", day: "numeric", month: "short", year: "numeric" }).format(d)}`;
}
