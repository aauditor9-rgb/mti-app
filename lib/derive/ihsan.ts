// Iḥsān category display info and the automatic Ḥuḍūr award derivation — the one place
// that turns attendance marks into points. See design/README.md "Iḥsān (reward) points".
import type { AttendanceCode } from "./attendance";

export const IHSAN_CATEGORIES = ["Hudur", "Ibadah", "Ilm", "Adab", "Khidmah"] as const;
export type IhsanCategory = (typeof IHSAN_CATEGORIES)[number];

export const IHSAN_CATEGORY_LABELS: Record<IhsanCategory, string> = {
  Hudur: "Ḥuḍūr",
  Ibadah: "ʿIbādah",
  Ilm: "ʿIlm",
  Adab: "Adab",
  Khidmah: "Khidmah",
};

// Matches the --ihsan-* CSS custom properties in app/globals.css.
export const IHSAN_CATEGORY_COLOR_VAR: Record<IhsanCategory, string> = {
  Hudur: "--ihsan-hudur",
  Ibadah: "--ihsan-ibadah",
  Ilm: "--ihsan-ilm",
  Adab: "--ihsan-adab",
  Khidmah: "--ihsan-khidmah",
};

// ISO week key (year-Www) for grouping attendance marks — Monday start, per design's UK
// local-date convention (invariant 6).
export function isoWeekKey(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const dayNum = (date.getUTCDay() + 6) % 7; // Mon=0 .. Sun=6
  date.setUTCDate(date.getUTCDate() - dayNum + 3); // nearest Thursday
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  const weekNum =
    1 + Math.round(((date.getTime() - firstThursday.getTime()) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7);
  return `${date.getUTCFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

export type AutomaticHudurAward = {
  weekKey: string;
  weekEndDate: string;
  awardName: "Full Week" | "On Time Every Day";
  points: number;
};

// Full Week: no absence that week. On Time Every Day: no absence AND no lateness that
// week. Settles weekly (one row per week), not per session — a pupil who was absent or
// late earns neither. This groups by whichever days were actually marked, since the
// class-by-class weekly timetable isn't modelled yet (see lib/db/schema.ts).
export function computeAutomaticHudurAwards(
  marks: { date: string; code: AttendanceCode }[],
  hudurPoints: { fullWeek: number; onTimeEveryDay: number },
): AutomaticHudurAward[] {
  const byWeek = new Map<string, { date: string; code: AttendanceCode }[]>();
  for (const mark of marks) {
    const key = isoWeekKey(mark.date);
    if (!byWeek.has(key)) byWeek.set(key, []);
    byWeek.get(key)!.push(mark);
  }

  const awards: AutomaticHudurAward[] = [];
  for (const [weekKey, weekMarks] of byWeek) {
    const weekEndDate = weekMarks.reduce((max, m) => (m.date > max ? m.date : max), weekMarks[0].date);
    const hasAbsence = weekMarks.some((m) => m.code !== "P" && m.code !== "L");
    const hasLate = weekMarks.some((m) => m.code === "L");
    if (!hasAbsence) {
      awards.push({ weekKey, weekEndDate, awardName: "Full Week", points: hudurPoints.fullWeek });
      if (!hasLate) {
        awards.push({ weekKey, weekEndDate, awardName: "On Time Every Day", points: hudurPoints.onTimeEveryDay });
      }
    }
  }
  return awards;
}
