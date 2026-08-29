"use client";

import { useRef, useState, useTransition } from "react";
import { logConcern } from "@/app/(office)/concerns/actions";
import { CONCERN_CATEGORIES, CONCERN_SEVERITIES } from "@/lib/derive/concern";

type PupilOption = { id: string; name: string; className: string | null };
type StaffOption = { id: string; name: string };

export function LogConcernForm({ pupils, staff }: { pupils: PupilOption[]; staff: StaffOption[] }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await logConcern(formData);
      if (result.ok) {
        formRef.current?.reset();
        setOpen(false);
      } else {
        setError(result.message ?? "Could not log the concern.");
      }
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="self-start rounded-lg bg-primary px-4 py-2 text-small font-medium text-primary-foreground"
      >
        + Log a concern
      </button>
    );
  }

  return (
    <form ref={formRef} action={handleSubmit} className="flex flex-col gap-3 rounded-xl border border-border bg-[var(--surface)] p-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-small">
          <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Student</span>
          <select name="pupilId" required className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body">
            <option value="">Choose a student…</option>
            {pupils.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} {p.className ? `· ${p.className}` : ""}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-small">
          <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Category</span>
          <select name="category" required className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body">
            <option value="">Choose a category…</option>
            {CONCERN_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-small">
          <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Severity</span>
          <select name="severity" defaultValue="Low" className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body">
            {CONCERN_SEVERITIES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-small">
          <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Owner</span>
          <select name="ownerStaffId" className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body">
            <option value="">Unassigned</option>
            {staff.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-small sm:col-span-2">
          <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Raised by</span>
          <select name="raisedByStaffId" required className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body">
            <option value="">Choose who&apos;s logging this…</option>
            {staff.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-small sm:col-span-2">
          <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Note</span>
          <textarea
            name="note"
            required
            rows={3}
            className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body"
            placeholder="What happened?"
          />
        </label>
      </div>

      {error && <p className="text-small text-[var(--alert)]">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-primary px-4 py-2 text-small font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          Log concern
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
