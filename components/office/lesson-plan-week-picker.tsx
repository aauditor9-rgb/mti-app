"use client";

import { useRouter } from "next/navigation";

export function LessonPlanWeekPicker({ value }: { value: string }) {
  const router = useRouter();

  return (
    <label className="flex items-center gap-2 text-small">
      <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Week</span>
      <input
        type="week"
        defaultValue={value}
        onChange={(e) => {
          if (e.target.value) router.push(`/lesson-plans?week=${e.target.value}`);
        }}
        className="rounded-lg border border-border bg-[var(--surface)] px-2.5 py-1.5 text-body text-[var(--ink)]"
      />
    </label>
  );
}
