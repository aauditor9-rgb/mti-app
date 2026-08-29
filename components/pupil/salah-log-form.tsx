"use client";

import { useTransition } from "react";
import { logSalahDay } from "@/app/(office)/salah/actions";
import { SALAH_PRAYERS } from "@/lib/derive/salah";

type ExistingLog = { prayer: string; prayed: boolean; jamaah: boolean };

export function SalahLogForm({ pupilId, date, existing }: { pupilId: string; date: string; existing: ExistingLog[] }) {
  const [pending, startTransition] = useTransition();
  const byPrayer = new Map(existing.map((e) => [e.prayer, e]));

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await logSalahDay(formData);
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-3 rounded-xl border border-border bg-[var(--surface)] p-5">
      <input type="hidden" name="pupilId" value={pupilId} />
      <input type="hidden" name="date" value={date} />
      <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">
        Ṣalāh today — {byPrayer.size > 0 ? [...byPrayer.values()].filter((v) => v.prayed).length : 0} of 5 prayed
      </p>
      <div className="flex flex-col divide-y divide-border">
        {SALAH_PRAYERS.map((prayer) => {
          const row = byPrayer.get(prayer);
          return (
            <div key={prayer} className="flex items-center justify-between py-2">
              <span className="text-small text-[var(--ink)]">{prayer}</span>
              <div className="flex gap-4">
                <label className="flex items-center gap-1.5 text-small text-[var(--ink-2)]">
                  <input type="checkbox" name={`prayed_${prayer}`} defaultChecked={row?.prayed} />
                  Prayed
                </label>
                <label className="flex items-center gap-1.5 text-small text-[var(--ink-2)]">
                  <input type="checkbox" name={`jamaah_${prayer}`} defaultChecked={row?.jamaah} />
                  In jamā&apos;ah
                </label>
              </div>
            </div>
          );
        })}
      </div>
      <button type="submit" disabled={pending} className="self-start rounded-lg bg-primary px-4 py-2 text-small font-medium text-primary-foreground disabled:opacity-50">
        Save
      </button>
    </form>
  );
}
