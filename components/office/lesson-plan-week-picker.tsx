"use client";

import { useRouter } from "next/navigation";

export function LessonPlanWeekPicker({
  value,
  basePath = "/lesson-plans",
  extraParams,
}: {
  value: string;
  basePath?: string;
  extraParams?: Record<string, string>;
}) {
  const router = useRouter();

  return (
    <label className="flex items-center gap-2 text-small">
      <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Week</span>
      <input
        type="week"
        defaultValue={value}
        onChange={(e) => {
          if (!e.target.value) return;
          const params = new URLSearchParams({ ...extraParams, week: e.target.value });
          router.push(`${basePath}?${params.toString()}`);
        }}
        className="rounded-lg border border-border bg-[var(--surface)] px-2.5 py-1.5 text-body text-[var(--ink)]"
      />
    </label>
  );
}
