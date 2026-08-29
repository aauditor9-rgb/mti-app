"use client";

import { useRef, useState, useTransition } from "react";
import { createCalendarSet } from "@/app/(office)/calendar/actions";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function AddCalendarSetForm() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createCalendarSet(formData);
      if (result.ok) {
        formRef.current?.reset();
        setOpen(false);
      } else {
        setError(result.message ?? "Could not add the calendar.");
      }
    });
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="self-start rounded-lg bg-primary px-4 py-2 text-small font-medium text-primary-foreground">
        + New calendar
      </button>
    );
  }

  return (
    <form ref={formRef} action={handleSubmit} className="flex flex-col gap-3 rounded-xl border border-border bg-[var(--surface)] p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-small">
          <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Calendar name</span>
          <input name="name" required className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body" />
        </label>
        <label className="flex flex-col gap-1 text-small">
          <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Description</span>
          <input name="description" className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body" />
        </label>
        <label className="flex flex-col gap-1 text-small">
          <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Academic year start</span>
          <input type="date" name="academicYearStart" required className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body" />
        </label>
        <label className="flex flex-col gap-1 text-small">
          <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Academic year end</span>
          <input type="date" name="academicYearEnd" required className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body" />
        </label>
        <div className="flex flex-col gap-1 text-small sm:col-span-2">
          <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Teaching days</span>
          <div className="flex flex-wrap gap-3">
            {DAYS.map((d) => (
              <label key={d} className="flex items-center gap-1.5">
                <input type="checkbox" name="teachingDays" value={d} className="size-4" />
                {d}
              </label>
            ))}
          </div>
        </div>
      </div>

      {error && <p className="text-small text-[var(--alert)]">{error}</p>}

      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="rounded-lg bg-primary px-4 py-2 text-small font-medium text-primary-foreground disabled:opacity-50">
          Create calendar
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-lg px-4 py-2 text-small font-medium text-[var(--ink-2)] hover:bg-[var(--surface-2)]">
          Cancel
        </button>
      </div>
    </form>
  );
}
