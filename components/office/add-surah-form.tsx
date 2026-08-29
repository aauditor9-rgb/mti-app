"use client";

import { useRef, useState, useTransition } from "react";
import { addSurahCatalogItem } from "@/app/(office)/progress-trackers/surahs/actions";
import type { AdmissionYear } from "@/lib/derive/admissions";

export function AddSurahForm({ year }: { year: AdmissionYear }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await addSurahCatalogItem(formData);
      if (result.ok) {
        formRef.current?.reset();
        setOpen(false);
      } else {
        setError(result.message ?? "Could not add this surah.");
      }
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="self-start rounded-lg bg-primary px-4 py-2 text-small font-medium text-primary-foreground"
      >
        + Add surah to {year} curriculum
      </button>
    );
  }

  return (
    <form ref={formRef} action={handleSubmit} className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-[var(--surface)] p-4">
      <input type="hidden" name="year" value={year} />
      <label className="flex flex-1 min-w-48 flex-col gap-1 text-small">
        <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Surah name</span>
        <input
          name="name"
          required
          className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body"
          placeholder="e.g. Surah Mulk"
        />
      </label>
      <label className="flex w-32 flex-col gap-1 text-small">
        <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Verses (optional)</span>
        <input
          type="number"
          name="verseCount"
          min={1}
          step={1}
          className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-primary px-4 py-2 text-small font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
      >
        Add
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="rounded-lg px-4 py-2 text-small font-medium text-[var(--ink-2)] hover:bg-[var(--surface-2)]"
      >
        Cancel
      </button>
      {error && <p className="w-full text-small text-[var(--alert)]">{error}</p>}
    </form>
  );
}
