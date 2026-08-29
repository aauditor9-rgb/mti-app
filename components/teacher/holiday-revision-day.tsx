"use client";

import { useState, useTransition } from "react";
import { saveHolidayRevisionDay } from "@/app/teacher/holiday-revision/actions";

export function HolidayRevisionDayRow({
  dayId,
  dateLabel,
  quranQaaidah,
  surahMemorisation,
  islamicStudies,
  duas,
  notes,
  completedCount,
  totalPupils,
}: {
  dayId: string;
  dateLabel: string;
  quranQaaidah: string | null;
  surahMemorisation: string | null;
  islamicStudies: string | null;
  duas: string | null;
  notes: string | null;
  completedCount: number;
  totalPupils: number;
}) {
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleSubmit(formData: FormData) {
    setSaved(false);
    startTransition(async () => {
      await saveHolidayRevisionDay(formData);
      setSaved(true);
    });
  }

  return (
    <form action={handleSubmit} className="grid grid-cols-1 gap-2 border-t border-border p-3 first:border-t-0 sm:grid-cols-[80px_repeat(4,1fr)_1fr_auto]">
      <input type="hidden" name="dayId" value={dayId} />
      <p className="self-center text-tiny font-medium text-[var(--ink)]">{dateLabel}</p>
      <input name="quranQaaidah" defaultValue={quranQaaidah ?? ""} placeholder="Qur'an / Qā'idah" className="rounded-lg border border-border bg-background px-2 py-1 text-tiny" />
      <input name="surahMemorisation" defaultValue={surahMemorisation ?? ""} placeholder="Surah memorisation" className="rounded-lg border border-border bg-background px-2 py-1 text-tiny" />
      <input name="islamicStudies" defaultValue={islamicStudies ?? ""} placeholder="Islamic Studies" className="rounded-lg border border-border bg-background px-2 py-1 text-tiny" />
      <input name="duas" defaultValue={duas ?? ""} placeholder="Du'as" className="rounded-lg border border-border bg-background px-2 py-1 text-tiny" />
      <input name="notes" defaultValue={notes ?? ""} placeholder="Notes" className="rounded-lg border border-border bg-background px-2 py-1 text-tiny" />
      <div className="flex items-center gap-2">
        <button type="submit" disabled={pending} className="rounded-lg bg-[var(--surface-2)] px-2.5 py-1 text-tiny font-medium text-[var(--ink-2)] disabled:opacity-50">
          {saved && !pending ? "Saved" : "Save"}
        </button>
        {totalPupils > 0 && (
          <span className="text-tiny text-[var(--muted)]">
            {completedCount}/{totalPupils}
          </span>
        )}
      </div>
    </form>
  );
}
