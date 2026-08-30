"use client";

import { useState, useTransition } from "react";
import { updateBranding } from "@/app/(office)/settings/branding/actions";

export function BrandingForm({ name, brandAccent }: { name: string; brandAccent: string }) {
  const [pending, startTransition] = useTransition();
  const [preview, setPreview] = useState(brandAccent);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function handleSubmit(formData: FormData) {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateBranding(formData);
      if (result.ok) setSaved(true);
      else setError(result.message ?? "Could not save.");
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-3 rounded-xl border border-border bg-[var(--surface)] p-5">
      <label className="flex flex-col gap-1 text-small">
        <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Madrasah name</span>
        <input name="name" defaultValue={name} required className="rounded-lg border border-border bg-background px-2.5 py-1.5" />
      </label>
      <label className="flex flex-col gap-1 text-small">
        <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Accent colour</span>
        <div className="flex items-center gap-3">
          <input
            type="color"
            name="brandAccent"
            defaultValue={brandAccent}
            onChange={(e) => setPreview(e.target.value)}
            className="h-9 w-16 cursor-pointer rounded-lg border border-border bg-background"
          />
          <span className="flex size-9 items-center justify-center rounded-lg text-tiny font-medium text-white" style={{ backgroundColor: preview }}>
            Aa
          </span>
          <span className="text-tiny text-[var(--muted)]">{preview}</span>
        </div>
      </label>
      {error && <p className="text-small text-[var(--alert)]">{error}</p>}
      <button type="submit" disabled={pending} className="self-start rounded-lg bg-primary px-4 py-2 text-small font-medium text-primary-foreground disabled:opacity-50">
        {saved && !pending ? "Saved" : "Save"}
      </button>
    </form>
  );
}
