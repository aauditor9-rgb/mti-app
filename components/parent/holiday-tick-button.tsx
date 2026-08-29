"use client";

import { useTransition } from "react";
import { toggleHolidayRevisionCompletion } from "@/app/teacher/holiday-revision/actions";
import { cn } from "@/lib/utils";

export function HolidayTickButton({
  dayId,
  pupilId,
  guardianId,
  completed,
}: {
  dayId: string;
  pupilId: string;
  guardianId: string;
  completed: boolean;
}) {
  const [pending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      await toggleHolidayRevisionCompletion(dayId, pupilId, !completed, guardianId);
    });
  }

  return (
    <button
      onClick={toggle}
      disabled={pending}
      className={cn(
        "shrink-0 rounded-full px-2.5 py-1 text-tiny font-medium disabled:opacity-50",
        completed ? "bg-[var(--success-bg)] text-[var(--success)]" : "bg-[var(--surface-2)] text-[var(--muted)] hover:bg-border",
      )}
    >
      {completed ? "✓ Done" : "Tick off"}
    </button>
  );
}
