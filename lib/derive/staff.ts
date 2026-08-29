// Staff compliance and clock-hours derivation (design/README.md People > Staff).
// A staff member "needs attention" if any of DBS/first-aid/safeguarding is missing or
// expires within 60 days — a single threshold, read here and nowhere else (invariant 1).
import { todayLondon } from "./age";

export const EXPIRY_WARNING_DAYS = 60;

export type ExpiryStatus = "missing" | "expired" | "expiring" | "valid";

export function expiryStatus(expiry: string | null, today: string = todayLondon()): ExpiryStatus {
  if (!expiry) return "missing";
  const daysUntil = Math.floor((new Date(expiry).getTime() - new Date(today).getTime()) / 86400000);
  if (daysUntil < 0) return "expired";
  if (daysUntil <= EXPIRY_WARNING_DAYS) return "expiring";
  return "valid";
}

export function needsAttention(staff: { dbsExpiry: string | null; firstAidExpiry: string | null; safeguardingExpiry: string | null }, today: string = todayLondon()): boolean {
  return [staff.dbsExpiry, staff.firstAidExpiry, staff.safeguardingExpiry].some(
    (e) => expiryStatus(e, today) !== "valid",
  );
}

export type ClockEvent = { clockedInAt: Date; clockedOutAt: Date | null };

function hoursBetween(from: Date, to: Date): number {
  return Math.max(0, (to.getTime() - from.getTime()) / 3600000);
}

export function computeClockStatus(events: ClockEvent[], now: Date = new Date()) {
  const open = events.find((e) => !e.clockedOutAt);
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7)); // Monday

  const hoursSince = (boundary: Date) =>
    events.reduce((sum, e) => {
      const end = e.clockedOutAt ?? now;
      if (end <= boundary) return sum;
      const start = e.clockedInAt < boundary ? boundary : e.clockedInAt;
      return sum + hoursBetween(start, end);
    }, 0);

  return {
    clockedIn: !!open,
    clockedInAt: open?.clockedInAt ?? null,
    todayHours: hoursSince(todayStart),
    weekHours: hoursSince(weekStart),
  };
}

export function formatHours(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m}m`;
}
