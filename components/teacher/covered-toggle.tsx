"use client";

import { useTransition } from "react";
import { toggleLessonPlanCovered } from "@/app/(office)/lesson-plans/actions";

export function CoveredToggle({ planId, covered }: { planId: string; covered: boolean }) {
  const [pending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      await toggleLessonPlanCovered(planId, !covered);
    });
  }

  return (
    <button
      onClick={toggle}
      disabled={pending}
      className={
        covered
          ? "rounded-full bg-[var(--success-bg)] px-2.5 py-1 text-tiny font-medium text-[var(--success)] disabled:opacity-50"
          : "rounded-full bg-[var(--surface-2)] px-2.5 py-1 text-tiny font-medium text-[var(--ink-2)] hover:bg-border disabled:opacity-50"
      }
    >
      {covered ? "✓ Covered" : "Mark covered"}
    </button>
  );
}
