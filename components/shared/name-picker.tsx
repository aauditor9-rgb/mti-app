"use client";

import { useTransition } from "react";
import { useState } from "react";

// The provisional "sign-in" for Teacher/Parent portals (lib/session.ts) — mirrors the
// prototype's own demo account list: pick a name, no password. Whichever real staff/
// guardian rows have portal access appear here.
export function NamePicker({
  title,
  subtitle,
  people,
  onPick,
}: {
  title: string;
  subtitle: string;
  people: { id: string; name: string; detail?: string | null }[];
  onPick: (id: string) => Promise<{ ok: boolean; message?: string } | void>;
}) {
  const [pending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function pick(id: string) {
    setError(null);
    setPendingId(id);
    startTransition(async () => {
      const result = await onPick(id);
      if (result && !result.ok) setError(result.message ?? "Could not sign in.");
      setPendingId(null);
    });
  }

  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm rounded-xl border border-border bg-[var(--surface)] p-6">
        <h1 className="font-heading text-h3 font-medium text-[var(--ink)]">{title}</h1>
        <p className="mt-1 text-small text-[var(--muted)]">{subtitle}</p>

        {people.length === 0 ? (
          <p className="mt-4 rounded-lg border border-border bg-background p-4 text-small text-[var(--muted)]">
            No portal accounts are set up yet.
          </p>
        ) : (
          <div className="mt-4 flex flex-col gap-1.5">
            {people.map((p) => (
              <button
                key={p.id}
                onClick={() => pick(p.id)}
                disabled={pending}
                className="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2.5 text-left hover:border-primary disabled:opacity-50"
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-tiny font-medium text-primary-foreground">
                  {p.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-small font-medium text-[var(--ink)]">
                    {p.name}
                    {pendingId === p.id && pending && "…"}
                  </p>
                  {p.detail && <p className="truncate text-tiny text-[var(--muted)]">{p.detail}</p>}
                </div>
              </button>
            ))}
          </div>
        )}

        {error && <p className="mt-3 text-small text-[var(--alert)]">{error}</p>}
      </div>
    </div>
  );
}
