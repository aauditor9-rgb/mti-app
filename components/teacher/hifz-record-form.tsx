"use client";

import { useRef, useState, useTransition } from "react";
import { recordHifz } from "@/app/teacher/hifz-diary/actions";
import { todayLondon } from "@/lib/derive/age";

type PupilOption = { id: string; name: string };
type ActionResult = { ok: boolean; message?: string };

export function HifzRecordForm({
  pupils,
  action = recordHifz,
}: {
  pupils: PupilOption[];
  action?: (formData: FormData) => Promise<ActionResult>;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await action(formData);
      if (result.ok) formRef.current?.reset();
      else setError(result.message ?? "Could not save this record.");
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="flex flex-col gap-3 rounded-xl border border-border bg-[var(--surface)] p-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <label className="flex flex-col gap-1 text-small sm:col-span-2">
          <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Student</span>
          <select name="pupilId" required className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body">
            <option value="">Choose…</option>
            {pupils.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-small">
          <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Date</span>
          <input type="date" name="date" defaultValue={todayLondon()} required className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body" />
        </label>
        <label className="flex flex-col gap-1 text-small">
          <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Type</span>
          <select name="type" required className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body">
            <option value="Sabaq">Sabaq</option>
            <option value="Sabqi">Sabqi</option>
            <option value="Manzil">Manzil</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-small">
          <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Juz</span>
          <input type="number" name="juz" min={1} max={30} required className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body" />
        </label>
        <label className="flex flex-col gap-1 text-small">
          <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Page from</span>
          <input type="number" name="pageFrom" min={1} className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body" />
        </label>
        <label className="flex flex-col gap-1 text-small">
          <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Page to</span>
          <input type="number" name="pageTo" min={1} className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body" />
        </label>
        <label className="flex flex-col gap-1 text-small">
          <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Quality</span>
          <select name="quality" required className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body">
            <option value="Excellent">Excellent</option>
            <option value="Strong">Strong</option>
            <option value="Satisfactory">Satisfactory</option>
            <option value="Weak">Weak</option>
          </select>
        </label>
      </div>
      <label className="flex flex-col gap-1 text-small">
        <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Mistakes / notes (optional)</span>
        <textarea name="mistakeNotes" rows={2} className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body" />
      </label>

      {error && <p className="text-small text-[var(--alert)]">{error}</p>}

      <button type="submit" disabled={pending} className="self-start rounded-lg bg-primary px-4 py-2 text-small font-medium text-primary-foreground disabled:opacity-50">
        Save record
      </button>
    </form>
  );
}
