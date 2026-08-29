"use client";

import { useState, useTransition } from "react";
import { setHolidayRevisionWindow } from "@/app/teacher/holiday-revision/actions";

export function HolidayWindowForm({ classId, startDate, endDate }: { classId: string; startDate?: string; endDate?: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await setHolidayRevisionWindow(
        classId,
        String(formData.get("startDate") ?? ""),
        String(formData.get("endDate") ?? ""),
      );
      if (!result.ok) setError(result.message ?? "Could not set the window.");
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-wrap items-end gap-2 rounded-xl border border-border bg-[var(--surface)] p-4">
      <label className="flex flex-col gap-1 text-small">
        <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">From</span>
        <input type="date" name="startDate" defaultValue={startDate} required className="rounded-lg border border-border bg-background px-2.5 py-1.5" />
      </label>
      <label className="flex flex-col gap-1 text-small">
        <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">To</span>
        <input type="date" name="endDate" defaultValue={endDate} required className="rounded-lg border border-border bg-background px-2.5 py-1.5" />
      </label>
      <button type="submit" disabled={pending} className="rounded-lg bg-primary px-4 py-2 text-small font-medium text-primary-foreground disabled:opacity-50">
        {startDate ? "Update window" : "Set holiday window"}
      </button>
      {error && <p className="w-full text-tiny text-[var(--alert)]">{error}</p>}
      {startDate && <p className="w-full text-tiny text-[var(--muted)]">Changing the dates replaces the current day grid.</p>}
    </form>
  );
}
