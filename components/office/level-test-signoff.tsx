"use client";

import { useRef, useState, useTransition } from "react";
import { clearLevelTest, confirmLevelTest } from "@/app/(office)/progress-trackers/safar-qaaidah/actions";

const TESTER_ROLES = ["Qur'an Curriculum Lead", "Headteacher"] as const;

export function LevelTestSignoff({
  levelNumber,
  testedByName,
  testedByRole,
  testedAt,
}: {
  levelNumber: number;
  testedByName: string | null;
  testedByRole: string | null;
  testedAt: string | null;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleConfirm(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await confirmLevelTest(formData);
      if (!result.ok) setError(result.message ?? "Could not confirm the test.");
    });
  }

  function handleClear() {
    startTransition(async () => {
      await clearLevelTest(levelNumber);
    });
  }

  return (
    <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
      <p className="mb-1 font-medium text-[var(--ink)]">Level test sign-off</p>
      {testedByName && testedByRole && testedAt ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-small text-[var(--ink-2)]">
            Tested by {testedByName} ({testedByRole}) on{" "}
            {new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", day: "numeric", month: "long", year: "numeric" }).format(
              new Date(testedAt),
            )}
          </p>
          <button
            onClick={handleClear}
            disabled={pending}
            className="rounded-lg px-3 py-1.5 text-small font-medium text-[var(--ink-2)] hover:bg-[var(--surface-2)] disabled:opacity-50"
          >
            Clear
          </button>
        </div>
      ) : (
        <form ref={formRef} action={handleConfirm} className="flex flex-wrap items-end gap-3">
          <input type="hidden" name="levelNumber" value={levelNumber} />
          <div className="flex flex-col gap-1 text-small">
            <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Test by</span>
            <select name="testedByRole" required className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body">
              {TESTER_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-1 min-w-48 flex-col gap-1 text-small">
            <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Name</span>
            <input name="testedByName" required placeholder="Name" className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body" />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-primary px-4 py-2 text-small font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            Confirm test
          </button>
          {error && <p className="w-full text-small text-[var(--alert)]">{error}</p>}
        </form>
      )}
    </div>
  );
}
