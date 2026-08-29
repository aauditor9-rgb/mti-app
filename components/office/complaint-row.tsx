"use client";

import { useTransition } from "react";
import { updateComplaintStatus } from "@/app/(office)/communications/complaints/actions";
import { complaintStatusEnum } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

const STATUS_STYLE: Record<string, string> = {
  Open: "bg-[var(--surface-2)] text-[var(--muted)]",
  Acknowledged: "bg-[var(--warn-bg)] text-[var(--ink-2)]",
  Investigating: "bg-[var(--warn-bg)] text-[var(--ink-2)]",
  Resolved: "bg-[var(--success-bg)] text-[var(--success)]",
};

export function ComplaintRow({
  id,
  reference,
  title,
  raisedByName,
  category,
  submittedAt,
  investigatorName,
  status,
  daysSinceSubmitted,
  ackOverdue,
  resolveOverdue,
}: {
  id: string;
  reference: string;
  title: string;
  raisedByName: string;
  category: string;
  submittedAt: string;
  investigatorName: string | null;
  status: string;
  daysSinceSubmitted: number;
  ackOverdue: boolean;
  resolveOverdue: boolean;
}) {
  const [pending, startTransition] = useTransition();

  function updateStatus(next: string) {
    startTransition(async () => {
      await updateComplaintStatus(id, next);
    });
  }

  return (
    <div className={cn("rounded-xl border border-border bg-[var(--surface)] p-4", pending && "opacity-70")}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium text-[var(--ink)]">
            {reference} — {title}
          </p>
          <p className="text-tiny text-[var(--muted)]">
            {raisedByName} · {category} · Submitted {submittedAt}
            {investigatorName && ` · Investigator: ${investigatorName}`}
          </p>
          {(ackOverdue || resolveOverdue) && status !== "Resolved" && (
            <p className="mt-1 text-tiny font-medium text-[var(--alert)]">
              {resolveOverdue ? "Past the 10-day response SLA" : "Past the 5-day acknowledgement SLA"} · {daysSinceSubmitted} days since
              submitted
            </p>
          )}
        </div>
        <select
          value={status}
          disabled={pending}
          onChange={(e) => updateStatus(e.target.value)}
          className={cn("rounded-full border-0 px-2.5 py-1 text-tiny font-medium", STATUS_STYLE[status])}
        >
          {complaintStatusEnum.enumValues.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
