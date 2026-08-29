// Hifz programme derivation (design/README.md "Hifz programme"). Sabaq/Sabqi/Manzil are
// recorded per pupil per day; everything shown is computed live from hifz_record, never
// stored — same invariant as every other ledger in this app.
export type HifzRecordRow = {
  date: string;
  type: "Sabaq" | "Sabqi" | "Manzil";
  juz: number;
  pageFrom: number | null;
  pageTo: number | null;
  quality: "Excellent" | "Strong" | "Satisfactory" | "Weak";
};

export function computeHifzSummary(records: HifzRecordRow[]) {
  if (records.length === 0) {
    return { currentJuz: null as number | null, pagesMemorised: 0, streakDays: 0, lastRecordDate: null as string | null };
  }

  const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date));
  const sabaq = sorted.filter((r) => r.type === "Sabaq");
  // New sabaq is assumed to move forward — the furthest page reached is what's been
  // memorised so far (never a stored running total, per invariant 1).
  const pagesMemorised = sabaq.reduce((max, r) => Math.max(max, r.pageTo ?? 0), 0);
  const currentJuz = sorted.reduce((max, r) => Math.max(max, r.juz), 0) || null;
  const lastRecordDate = sorted[sorted.length - 1].date;

  const distinctDates = [...new Set(sorted.map((r) => r.date))].sort().reverse();
  let streakDays = 0;
  let cursor: Date | null = null;
  for (const dateStr of distinctDates) {
    const date = new Date(`${dateStr}T00:00:00Z`);
    if (cursor === null) {
      streakDays = 1;
      cursor = date;
      continue;
    }
    const diffDays = Math.round((cursor.getTime() - date.getTime()) / 86400000);
    if (diffDays <= 2) {
      // Allow a 1-day gap so a Friday-off pattern doesn't zero the streak.
      streakDays += 1;
      cursor = date;
    } else {
      break;
    }
  }

  return { currentJuz, pagesMemorised, streakDays, lastRecordDate };
}

export const HIFZ_QUALITY_TONE: Record<HifzRecordRow["quality"], "success" | "warn" | "alert"> = {
  Excellent: "success",
  Strong: "success",
  Satisfactory: "warn",
  Weak: "alert",
};

export type JuzStatus = "unmemorised" | "untested" | "weak" | "urgent" | "solid";

// Per-juz status (design/README.md "Qur'an heat map (per-juz status: unmemorised /
// untested / weak / urgent / solid)"). Derived live from the most recent record touching
// each juz — never stored. "Urgent" = once solid but not revised (no Manzil) in 30+
// days, since a juz that's gone quiet the longest needs dawr first.
export function computeJuzStatuses(records: HifzRecordRow[], now: Date = new Date()): Record<number, JuzStatus> {
  const byJuz = new Map<number, HifzRecordRow[]>();
  for (const r of records) {
    if (!byJuz.has(r.juz)) byJuz.set(r.juz, []);
    byJuz.get(r.juz)!.push(r);
  }

  const statuses: Record<number, JuzStatus> = {};
  for (let juz = 1; juz <= 30; juz++) {
    const juzRecords = byJuz.get(juz);
    if (!juzRecords || juzRecords.length === 0) {
      statuses[juz] = "unmemorised";
      continue;
    }
    const manzilRecords = juzRecords.filter((r) => r.type === "Manzil").sort((a, b) => b.date.localeCompare(a.date));
    if (manzilRecords.length === 0) {
      statuses[juz] = "untested";
      continue;
    }
    const latest = manzilRecords[0];
    const daysSince = Math.floor((now.getTime() - new Date(`${latest.date}T00:00:00Z`).getTime()) / 86400000);
    if (latest.quality === "Weak") statuses[juz] = "weak";
    else if (daysSince > 30) statuses[juz] = "urgent";
    else statuses[juz] = "solid";
  }
  return statuses;
}
