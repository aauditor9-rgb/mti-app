"use client";

import { useRef, useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { addHoliday, deleteHoliday, toggleHoliday } from "@/app/(office)/calendar/actions";
import { cn } from "@/lib/utils";

type Holiday = { id: string; name: string; startDate: string; endDate: string; enabled: boolean };

export function CalendarHolidays({ calendarSetId, holidays }: { calendarSetId: string; holidays: Holiday[] }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleAdd(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await addHoliday(formData);
      if (result.ok) {
        formRef.current?.reset();
        setOpen(false);
      } else {
        setError(result.message ?? "Could not add the holiday.");
      }
    });
  }

  function toggle(id: string, enabled: boolean) {
    startTransition(async () => {
      await toggleHoliday(id, enabled);
    });
  }

  function remove(id: string) {
    startTransition(async () => {
      await deleteHoliday(id);
    });
  }

  const enabledCount = holidays.filter((h) => h.enabled).length;

  return (
    <div>
      <p className="mb-2 text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">
        Holidays &amp; breaks · {enabledCount} of {holidays.length} on
      </p>
      {holidays.length === 0 ? (
        <p className="text-small text-[var(--muted)]">No holidays added yet.</p>
      ) : (
        <div className="mb-2 flex flex-col gap-1.5">
          {holidays.map((h) => (
            <div key={h.id} className="flex items-center justify-between rounded-lg bg-[var(--surface-2)] px-3 py-2 text-small">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={h.enabled}
                  disabled={pending}
                  onChange={(e) => toggle(h.id, e.target.checked)}
                  className="size-4"
                />
                <span className={cn("font-medium text-[var(--ink)]", !h.enabled && "text-[var(--muted)] line-through")}>{h.name}</span>
              </label>
              <span className="text-[var(--muted)]">{h.startDate} – {h.endDate}</span>
              <button
                onClick={() => remove(h.id)}
                disabled={pending}
                aria-label={`Delete ${h.name}`}
                className="text-[var(--muted)] hover:text-[var(--alert)]"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {open ? (
        <form ref={formRef} action={handleAdd} className="flex flex-wrap items-end gap-2">
          <input type="hidden" name="calendarSetId" value={calendarSetId} />
          <input name="name" placeholder="Holiday name" required className="w-32 rounded-lg border border-border bg-background px-2 py-1.5 text-small" />
          <input type="date" name="startDate" required className="rounded-lg border border-border bg-background px-2 py-1.5 text-small" />
          <input type="date" name="endDate" required className="rounded-lg border border-border bg-background px-2 py-1.5 text-small" />
          <button type="submit" disabled={pending} className="rounded-lg bg-primary px-3 py-1.5 text-small font-medium text-primary-foreground">
            Add
          </button>
          <button type="button" onClick={() => setOpen(false)} className="rounded-lg px-3 py-1.5 text-small text-[var(--ink-2)]">
            Cancel
          </button>
          {error && <p className="w-full text-tiny text-[var(--alert)]">{error}</p>}
        </form>
      ) : (
        <button onClick={() => setOpen(true)} className="text-small font-medium text-[var(--primary)] hover:underline">
          + Add a custom holiday
        </button>
      )}
    </div>
  );
}
