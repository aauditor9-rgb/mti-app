// Ṣalāh & Tarbiyah rollup — jamā'ah adherence and logging-rate derivations, all
// computed live from salah_log (invariant 1). Matches design/README.md's
// "madrasah-wide view... rolled up from students' Muḥāsabah logs".
import { todayLondon } from "./age";

export const SALAH_PRAYERS = ["Fajr", "Zuhr", "Asr", "Maghrib", "Isha"] as const;
export type SalahPrayer = (typeof SALAH_PRAYERS)[number];

// The last 7 local calendar days including today — the rolling window every stat
// on this screen is computed over.
export function last7Days(today: string = todayLondon()): string[] {
  const [y, m, d] = today.split("-").map(Number);
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(Date.UTC(y, m - 1, d));
    date.setUTCDate(date.getUTCDate() - i);
    days.push(date.toISOString().slice(0, 10));
  }
  return days;
}

export type SalahLogRow = { pupilId: string; prayed: boolean; jamaah: boolean };

export function computeAdherence(logs: SalahLogRow[], pupilCount: number) {
  const loggedPupils = new Set(logs.map((l) => l.pupilId)).size;
  const loggingRate = pupilCount === 0 ? 0 : Math.round((loggedPupils / pupilCount) * 100);

  const prayedLogs = logs.filter((l) => l.prayed);
  const jamaahRate = prayedLogs.length === 0 ? 0 : Math.round((prayedLogs.filter((l) => l.jamaah).length / prayedLogs.length) * 100);

  return { loggingRate, loggedPupils, jamaahRate };
}

export function toneForRate(pct: number): "success" | "warn" | "alert" {
  return pct >= 70 ? "success" : pct >= 50 ? "warn" : "alert";
}
