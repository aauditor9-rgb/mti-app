"use client";

import Link from "next/link";
import { useTransition } from "react";
import { toggleSubmission } from "@/app/(office)/homework/actions";
import { cn } from "@/lib/utils";

type SubmissionRow = {
  id: string;
  completed: boolean;
  pupilDisplayId: string;
  pupilName: string;
};

export function HomeworkChecklist({ submissions }: { submissions: SubmissionRow[] }) {
  const [pending, startTransition] = useTransition();

  function toggle(id: string, completed: boolean) {
    startTransition(async () => {
      await toggleSubmission(id, completed);
    });
  }

  return (
    <div className={cn("overflow-hidden rounded-lg border border-border", pending && "opacity-70")}>
      {submissions.map((s) => (
        <label
          key={s.id}
          className="flex cursor-pointer items-center gap-3 border-t border-border p-3 first:border-t-0 hover:bg-[var(--surface-2)]"
        >
          <input
            type="checkbox"
            checked={s.completed}
            disabled={pending}
            onChange={(e) => toggle(s.id, e.target.checked)}
            className="size-4"
          />
          <Link
            href={`/students/${s.pupilDisplayId}`}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 text-small font-medium text-[var(--ink)] hover:text-[var(--primary)]"
          >
            {s.pupilName}
          </Link>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-tiny font-medium",
              s.completed ? "bg-[var(--success-bg)] text-[var(--success)]" : "bg-[var(--surface-2)] text-[var(--muted)]",
            )}
          >
            {s.completed ? "Done" : "Not yet"}
          </span>
        </label>
      ))}
    </div>
  );
}
