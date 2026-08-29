"use client";

import { useState, useTransition } from "react";
import { verifyPupilPasscode } from "@/app/pupil/session-actions";
import { cn } from "@/lib/utils";

const DIGITS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

export function PasscodePad() {
  const [value, setValue] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function press(d: string) {
    if (value.length >= 4 || pending) return;
    const next = value + d;
    setValue(next);
    setError(null);
    if (next.length === 4) {
      startTransition(async () => {
        const result = await verifyPupilPasscode(next);
        if (result && !result.ok) {
          setError(result.message ?? "Incorrect passcode.");
          setValue("");
        }
      });
    }
  }

  function backspace() {
    setValue((v) => v.slice(0, -1));
    setError(null);
  }

  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-background p-6">
      <div className="w-full max-w-xs rounded-xl border border-border bg-[var(--surface)] p-6 text-center">
        <h1 className="font-heading text-h3 font-medium text-[var(--ink)]">Pupil Sign-in</h1>
        <p className="mt-1 text-small text-[var(--muted)]">Hand the device over — enter your passcode.</p>

        <div className="my-5 flex justify-center gap-3">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className={cn("size-3 rounded-full border border-[var(--muted)]", i < value.length && "bg-primary border-primary")}
            />
          ))}
        </div>

        {error && <p className="mb-3 text-small text-[var(--alert)]">{error}</p>}

        <div className="grid grid-cols-3 gap-2">
          {DIGITS.map((d) => (
            <button
              key={d}
              onClick={() => press(d)}
              disabled={pending}
              className="rounded-lg bg-background py-3 text-h4 font-medium text-[var(--ink)] hover:bg-[var(--surface-2)] disabled:opacity-50"
            >
              {d}
            </button>
          ))}
          <span />
          <button
            onClick={() => press("0")}
            disabled={pending}
            className="rounded-lg bg-background py-3 text-h4 font-medium text-[var(--ink)] hover:bg-[var(--surface-2)] disabled:opacity-50"
          >
            0
          </button>
          <button
            onClick={backspace}
            disabled={pending}
            className="rounded-lg bg-background py-3 text-h4 font-medium text-[var(--ink)] hover:bg-[var(--surface-2)] disabled:opacity-50"
          >
            ⌫
          </button>
        </div>
      </div>
    </div>
  );
}
