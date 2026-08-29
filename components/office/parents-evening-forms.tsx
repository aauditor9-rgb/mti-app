"use client";

import { useRef, useState, useTransition } from "react";
import { addParentsEveningSlot, createParentsEveningSession } from "@/app/(office)/communications/parents-evening/actions";

export function CreateSessionForm() {
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await createParentsEveningSession(formData);
      formRef.current?.reset();
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="flex flex-wrap items-end gap-2 rounded-xl border border-border bg-[var(--surface)] p-4">
      <label className="flex flex-col gap-1 text-small">
        <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Date</span>
        <input type="date" name="date" required className="rounded-lg border border-border bg-background px-2.5 py-1.5" />
      </label>
      <button type="submit" disabled={pending} className="rounded-lg bg-primary px-4 py-2 text-small font-medium text-primary-foreground disabled:opacity-50">
        + New session
      </button>
    </form>
  );
}

export function AddSlotForm({ sessionId, staff }: { sessionId: string; staff: { id: string; name: string }[] }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await addParentsEveningSlot(formData);
      formRef.current?.reset();
    });
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-small font-medium text-[var(--primary)] hover:underline">
        + Add slot
      </button>
    );
  }

  return (
    <form ref={formRef} action={handleSubmit} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="sessionId" value={sessionId} />
      <select name="staffId" required className="rounded-lg border border-border bg-background px-2 py-1 text-tiny">
        <option value="">Teacher…</option>
        {staff.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
      <input type="time" name="time" required className="rounded-lg border border-border bg-background px-2 py-1 text-tiny" />
      <button type="submit" disabled={pending} className="rounded-lg bg-[var(--surface-2)] px-2.5 py-1 text-tiny font-medium text-[var(--ink-2)] disabled:opacity-50">
        Add
      </button>
    </form>
  );
}
