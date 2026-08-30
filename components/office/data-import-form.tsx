"use client";

import { useState, useTransition } from "react";
import { importStudentsCsv } from "@/app/(office)/settings/data-import/actions";

export function DataImportForm() {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; message?: string } | null>(null);

  function handleSubmit(formData: FormData) {
    setResult(null);
    startTransition(async () => {
      const res = await importStudentsCsv(formData);
      setResult(res);
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-3 rounded-xl border border-border bg-[var(--surface)] p-5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-small text-[var(--ink-2)]">Columns: name, dob, class, gender, guardian, guardian_email</span>
      </div>
      <textarea
        name="csv"
        placeholder={"name,dob,class,gender,guardian,guardian_email\nZayd Ahmed,2019-05-02,Year 1a,M,Fatima Ahmed,f.ahmed@example.com"}
        rows={8}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-small"
      />
      {result && (
        <p className={result.ok ? "text-small text-[var(--success)]" : "text-small text-[var(--alert)]"}>{result.message}</p>
      )}
      <button type="submit" disabled={pending} className="self-start rounded-lg bg-primary px-4 py-2 text-small font-medium text-primary-foreground disabled:opacity-50">
        Import students
      </button>
    </form>
  );
}
