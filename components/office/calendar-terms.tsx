"use client";

import { useRef, useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { addTerm, deleteTerm } from "@/app/(office)/calendar/actions";

type Term = { id: string; name: string; startDate: string; endDate: string };

export function CalendarTerms({ calendarSetId, terms }: { calendarSetId: string; terms: Term[] }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleAdd(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await addTerm(formData);
      if (result.ok) {
        formRef.current?.reset();
        setOpen(false);
      } else {
        setError(result.message ?? "Could not add the term.");
      }
    });
  }

  function remove(id: string) {
    startTransition(async () => {
      await deleteTerm(id);
    });
  }

  return (
    <div>
      <p className="mb-2 text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Terms</p>
      {terms.length === 0 ? (
        <p className="text-small text-[var(--muted)]">No terms defined yet.</p>
      ) : (
        <div className="mb-2 flex flex-col gap-1.5">
          {terms.map((t) => (
            <div key={t.id} className="flex items-center justify-between rounded-lg bg-[var(--surface-2)] px-3 py-2 text-small">
              <span className="font-medium text-[var(--ink)]">{t.name}</span>
              <span className="text-[var(--muted)]">{t.startDate} – {t.endDate}</span>
              <button onClick={() => remove(t.id)} disabled={pending} className="text-[var(--muted)] hover:text-[var(--alert)]">
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {open ? (
        <form ref={formRef} action={handleAdd} className="flex flex-wrap items-end gap-2">
          <input type="hidden" name="calendarSetId" value={calendarSetId} />
          <input name="name" placeholder="Term name" required className="w-28 rounded-lg border border-border bg-background px-2 py-1.5 text-small" />
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
          + Add term
        </button>
      )}
    </div>
  );
}
