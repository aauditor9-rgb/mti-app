"use client";

import { useTransition } from "react";
import { decideLeaveRequest } from "@/app/(office)/attendance/leave-requests/actions";
import { cn } from "@/lib/utils";

const STATUS_STYLE: Record<string, string> = {
  Pending: "bg-[var(--warn-bg)] text-[var(--ink-2)]",
  Approved: "bg-[var(--success-bg)] text-[var(--success)]",
  Declined: "bg-[var(--alert-bg)] text-[var(--alert)]",
};

export function LeaveRequestRow({
  id,
  pupilName,
  kind,
  reason,
  startDate,
  endDate,
  explanation,
  status,
}: {
  id: string;
  pupilName: string;
  kind: string;
  reason: string | null;
  startDate: string;
  endDate: string | null;
  explanation: string | null;
  status: "Pending" | "Approved" | "Declined";
}) {
  const [pending, startTransition] = useTransition();

  function decide(next: "Approved" | "Declined") {
    startTransition(async () => {
      await decideLeaveRequest(id, next);
    });
  }

  return (
    <div className={cn("border-t border-border p-3 first:border-t-0", pending && "opacity-70")}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-small font-medium text-[var(--ink)]">
            {pupilName} · {kind}
          </p>
          <p className="text-tiny text-[var(--ink-2)]">
            {reason} · {startDate}
            {endDate && endDate !== startDate && ` – ${endDate}`}
          </p>
          {explanation && <p className="text-tiny text-[var(--muted)]">{explanation}</p>}
        </div>
        <span className={cn("rounded-full px-2 py-0.5 text-tiny font-medium", STATUS_STYLE[status])}>{status}</span>
      </div>
      {status === "Pending" && (
        <div className="mt-2 flex gap-2">
          <button onClick={() => decide("Approved")} disabled={pending} className="rounded-lg bg-[var(--success-bg)] px-3 py-1 text-tiny font-medium text-[var(--success)] disabled:opacity-50">
            Approve
          </button>
          <button onClick={() => decide("Declined")} disabled={pending} className="rounded-lg bg-[var(--alert-bg)] px-3 py-1 text-tiny font-medium text-[var(--alert)] disabled:opacity-50">
            Decline
          </button>
        </div>
      )}
    </div>
  );
}
