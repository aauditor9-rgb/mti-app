"use client";

import { useRef, useState, useTransition } from "react";
import { createEvent } from "@/app/(office)/communications/events/actions";

export function AddEventForm() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createEvent(formData);
      if (result.ok) {
        formRef.current?.reset();
        setOpen(false);
      } else {
        setError(result.message ?? "Could not add the event.");
      }
    });
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="self-start rounded-lg bg-primary px-4 py-2 text-small font-medium text-primary-foreground">
        + New event
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
          <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Date</span>
          <input type="date" name="startDate" required className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body" />
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className="flex flex-col gap-1 text-small">
            <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Start</span>
            <input type="time" name="startTime" required className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body" />
          </label>
          <label className="flex flex-col gap-1 text-small">
            <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">End (optional)</span>
            <input type="time" name="endTime" className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body" />
          </label>
        </div>
        <label className="flex flex-col gap-1 text-small">
          <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Location</span>
          <input name="location" className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body" />
        </label>
        <label className="flex flex-col gap-1 text-small">
          <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Audience</span>
          <input name="audience" placeholder="e.g. All years + families" className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body" />
        </label>
        <label className="flex flex-col gap-1 text-small sm:col-span-2">
          <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Description</span>
          <textarea name="description" rows={2} className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body" />
        </label>
        <label className="flex flex-col gap-1 text-small">
          <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Payment (£, optional)</span>
          <input type="number" name="paymentAmount" min="0" step="0.01" className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body" />
        </label>
        <div className="flex items-center gap-4 self-end pb-1.5">
          <label className="flex items-center gap-1.5 text-small">
            <input type="checkbox" name="requiresConsent" className="size-4" /> Consent required
          </label>
          <label className="flex items-center gap-1.5 text-small">
            <input type="checkbox" name="requiresRsvp" className="size-4" /> RSVP
          </label>
        </div>
      </div>

      {error && <p className="text-small text-[var(--alert)]">{error}</p>}

      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="rounded-lg bg-primary px-4 py-2 text-small font-medium text-primary-foreground disabled:opacity-50">
          Add event
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-lg px-4 py-2 text-small font-medium text-[var(--ink-2)] hover:bg-[var(--surface-2)]">
          Cancel
        </button>
      </div>
    </form>
  );
}
