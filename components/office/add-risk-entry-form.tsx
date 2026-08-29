"use client";

import { useRef, useState, useTransition } from "react";
import { createRiskEntry } from "@/app/(office)/safeguarding/risk-register/actions";
import { riskSeverityEnum } from "@/lib/db/schema";

export function AddRiskEntryForm({ staffOptions }: { staffOptions: { id: string; name: string }[] }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createRiskEntry(formData);
      if (result.ok) {
        formRef.current?.reset();
        setOpen(false);
      } else {
        setError(result.message ?? "Could not add the risk.");
      }
    });
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="self-start rounded-lg bg-primary px-4 py-2 text-small font-medium text-primary-foreground">
        + Add risk
      </button>
    );
  }

  return (
    <form ref={formRef} action={handleSubmit} className="flex flex-col gap-3 rounded-xl border border-border bg-[var(--surface)] p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-small sm:col-span-2">
          <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Title</span>
          <input name="title" required className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body" />
        </label>
        <label className="flex flex-col gap-1 text-small">
          <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Owner</span>
          <select name="ownerStaffId" className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body">
            <option value="">—</option>
            {staffOptions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-small">
          <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Review by</span>
          <input type="date" name="reviewByDate" required className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body" />
        </label>
        <label className="flex flex-col gap-1 text-small">
          <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Severity</span>
          <select name="severity" required className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body">
            {riskSeverityEnum.enumValues.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-small sm:col-span-2">
          <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Note (optional)</span>
          <textarea name="note" rows={2} className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body" />
        </label>
      </div>

      {error && <p className="text-small text-[var(--alert)]">{error}</p>}

      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="rounded-lg bg-primary px-4 py-2 text-small font-medium text-primary-foreground disabled:opacity-50">
          Add risk
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-lg px-4 py-2 text-small font-medium text-[var(--ink-2)] hover:bg-[var(--surface-2)]">
          Cancel
        </button>
      </div>
    </form>
  );
}
