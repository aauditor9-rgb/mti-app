"use client";

import { useRef, useState, useTransition } from "react";
import { createApplicant } from "@/app/(office)/admissions/actions";
import { ADMISSION_YEARS } from "@/lib/derive/admissions";

export function LogApplicantForm() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createApplicant(formData);
      if (result.ok) {
        formRef.current?.reset();
        setOpen(false);
      } else {
        setError(result.message ?? "Could not add the applicant.");
      }
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="self-start rounded-lg bg-primary px-4 py-2 text-small font-medium text-primary-foreground"
      >
        + Add applicant
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
          <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">First name</span>
          <input name="firstName" required className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body" />
        </label>
        <label className="flex flex-col gap-1 text-small">
          <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Last name</span>
          <input name="lastName" required className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body" />
        </label>

        <label className="flex flex-col gap-1 text-small">
          <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Date of birth</span>
          <input type="date" name="dob" required className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body" />
        </label>
        <label className="flex flex-col gap-1 text-small">
          <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Gender</span>
          <select name="gender" required className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body">
            <option value="">Choose…</option>
            <option value="M">Boy</option>
            <option value="F">Girl</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-small">
          <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Requested year</span>
          <select name="requestedYear" required className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body">
            <option value="">Choose…</option>
            {ADMISSION_YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-small">
          <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Qur&apos;an level (optional)</span>
          <input name="quranLevel" className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body" placeholder="e.g. Juz Amma" />
        </label>

        <label className="flex flex-col gap-1 text-small">
          <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Guardian name</span>
          <input name="guardianName" required className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body" />
        </label>
        <label className="flex flex-col gap-1 text-small">
          <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Guardian phone</span>
          <input name="guardianPhone" required className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body" />
        </label>

        <label className="flex flex-col gap-1 text-small sm:col-span-2">
          <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Guardian email (optional)</span>
          <input type="email" name="guardianEmail" className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body" />
        </label>

        <label className="flex items-center gap-2 text-small">
          <input type="checkbox" name="siblingAtMti" className="size-4" />
          Sibling already at MTI
        </label>
        <label className="flex items-center gap-2 text-small">
          <input type="checkbox" name="familyAttendsMasjid" className="size-4" />
          Family attends the masjid
        </label>

        <label className="flex flex-col gap-1 text-small sm:col-span-2">
          <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Note (optional)</span>
          <textarea name="note" rows={2} className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body" />
        </label>
      </div>

      {error && <p className="text-small text-[var(--alert)]">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-primary px-4 py-2 text-small font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          Add applicant
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
