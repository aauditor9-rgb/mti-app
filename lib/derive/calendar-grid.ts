// Month-grid classification for the Calendar screen (design/README.md "Calendars":
// "Day types render with distinct tones"). Only day types genuinely derivable from
// real data are classified — class day, holiday, non-teaching day, outside the
// academic year, and event day — no fabricated exam/INSET/Eid schedule.
const WEEKDAY_CODES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export type DayType = "class" | "holiday" | "nonteaching" | "outside";

export type MonthCell = { date: string | null; dayType: DayType | null; hasEvent: boolean };

export function getMonthGrid(
  year: number,
  month: number, // 1-12
  input: {
    academicYearStart: string;
    academicYearEnd: string;
    teachingDays: string[];
    holidays: { startDate: string; endDate: string; enabled: boolean }[];
    eventDates: Set<string>;
  },
): MonthCell[] {
  const firstOfMonth = new Date(Date.UTC(year, month - 1, 1));
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const firstWeekdayIndex = (firstOfMonth.getUTCDay() + 6) % 7; // Monday = 0

  const cells: MonthCell[] = [];
  for (let i = 0; i < firstWeekdayIndex; i++) cells.push({ date: null, dayType: null, hasEvent: false });

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const weekdayCode = WEEKDAY_CODES[(new Date(Date.UTC(year, month - 1, day)).getUTCDay() + 6) % 7];

    let dayType: DayType;
    if (dateStr < input.academicYearStart || dateStr > input.academicYearEnd) {
      dayType = "outside";
    } else if (input.holidays.some((h) => h.enabled && dateStr >= h.startDate && dateStr <= h.endDate)) {
      dayType = "holiday";
    } else if (input.teachingDays.includes(weekdayCode)) {
      dayType = "class";
    } else {
      dayType = "nonteaching";
    }

    cells.push({ date: dateStr, dayType, hasEvent: input.eventDates.has(dateStr) });
  }

  return cells;
}

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// The academic-year month sequence starting from the year's start month, e.g. for a
// Sept-Aug year this yields Sep, Oct, ... Aug across the two calendar years.
export function academicYearMonths(startDate: string, endDate: string): { year: number; month: number }[] {
  const [startY, startM] = startDate.split("-").map(Number);
  const [endY, endM] = endDate.split("-").map(Number);
  const months: { year: number; month: number }[] = [];
  let y = startY;
  let m = startM;
  while (y < endY || (y === endY && m <= endM)) {
    months.push({ year: y, month: m });
    m++;
    if (m > 12) {
      m = 1;
      y++;
    }
  }
  return months;
}
