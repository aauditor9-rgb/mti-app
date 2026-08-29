"use client";

import { useRef, useState, useTransition } from "react";
import { setHomework } from "@/app/(office)/homework/actions";

type ClassOption = { id: string; name: string };
type StaffOption = { id: string; name: string };

export function SetHomeworkForm({ classes, staff }: { classes: ClassOption[]; staff: StaffOption[] }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await setHomework(formData);
      if (result.ok) {
        formRef.current?.reset();
        setOpen(false);
      } else {
        setError(result.message ?? "Could not set the homework.");
      }
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="self-start rounded-lg bg-primary px-4 py-2 text-small font-medium text-primary-foreground"
      >
        + Set homework
      </button>
    );
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="flex flex-col gap-3 rounded-xl border border-border bg-[var(--surface)] p-5"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-small">
          <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Class</span>
          <select name="classId" required className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body">
            <option value="">Choose a class…</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-small">
          <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Subject</span>
          <input name="subject" required className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body" placeholder="e.g. Qaaidah" />
        </label>

        <label className="flex flex-col gap-1 text-small">
          <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Due date</span>
          <input type="date" name="dueDate" required className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body" />
        </label>

        <label className="flex flex-col gap-1 text-small">
          <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Set by</span>
          <select name="setByStaffId" className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body">
            <option value="">Unassigned</option>
            {staff.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-small sm:col-span-2">
          <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Task</span>
          <textarea name="task" required rows={2} className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body" placeholder="What should pupils do?" />
        </label>
      </div>

      {error && <p className="text-small text-[var(--alert)]">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-primary px-4 py-2 text-small font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          Set homework
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg px-4 py-2 text-small font-medium text-[var(--ink-2)] hover:bg-[var(--surface-2)]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
