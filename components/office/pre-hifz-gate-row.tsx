"use client";

import { useTransition } from "react";
import { togglePreHifzGate } from "@/app/(office)/hifz/actions";
import { cn } from "@/lib/utils";

const GATES = [
  { field: "readingAssessmentAt", label: "Reading assessment" },
  { field: "tajwidAssessmentAt", label: "Tajwīd assessment" },
  { field: "behaviourAssessmentAt", label: "Behaviour assessment" },
  { field: "pupilInterviewAt", label: "Pupil interview" },
  { field: "parentInterviewAt", label: "Parent interview" },
] as const;

type Assessment = Record<(typeof GATES)[number]["field"], string | null> | null;

export function PreHifzGateRow({ pupilId, pupilName, assessment }: { pupilId: string; pupilName: string; assessment: Assessment }) {
  const [pending, startTransition] = useTransition();
  const clearedCount = GATES.filter((g) => assessment?.[g.field]).length;
  const allClear = clearedCount === GATES.length;

  function toggle(field: (typeof GATES)[number]["field"], value: boolean) {
    startTransition(async () => {
      await togglePreHifzGate(pupilId, field, value);
    });
  }

  return (
    <div className={cn("rounded-xl border border-border bg-[var(--surface)] p-4", pending && "opacity-70")}>
      <div className="mb-2 flex items-center justify-between">
        <p className="font-medium text-[var(--ink)]">{pupilName}</p>
        <span className={cn("rounded-full px-2.5 py-1 text-tiny font-medium", allClear ? "bg-[var(--success-bg)] text-[var(--success)]" : "bg-[var(--surface-2)] text-[var(--ink-2)]")}>
          {clearedCount} of {GATES.length} gates cleared
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {GATES.map((g) => {
          const cleared = !!assessment?.[g.field];
          return (
            <button
              key={g.field}
              onClick={() => toggle(g.field, !cleared)}
              disabled={pending}
              className={cn(
                "rounded-full px-2.5 py-1 text-tiny font-medium disabled:opacity-50",
                cleared ? "bg-[var(--success-bg)] text-[var(--success)]" : "bg-[var(--surface-2)] text-[var(--muted)] hover:bg-border",
              )}
            >
              {cleared ? "✓ " : ""}
              {g.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
