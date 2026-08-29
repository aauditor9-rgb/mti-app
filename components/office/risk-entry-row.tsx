"use client";

import { useTransition } from "react";
import { updateRiskStatus } from "@/app/(office)/safeguarding/risk-register/actions";
import { riskStatusEnum } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

const SEVERITY_STYLE: Record<string, string> = {
  Low: "bg-[var(--surface-2)] text-[var(--muted)]",
  Medium: "bg-[var(--warn-bg)] text-[var(--ink-2)]",
  High: "bg-[var(--alert-bg)] text-[var(--alert)]",
};

export function RiskEntryRow({
  id,
  title,
  ownerName,
  reviewByDate,
  severity,
  status,
  note,
}: {
  id: string;
  title: string;
  ownerName: string | null;
  reviewByDate: string;
  severity: string;
  status: string;
  note: string | null;
}) {
  const [pending, startTransition] = useTransition();

  function updateStatus(next: string) {
    startTransition(async () => {
      await updateRiskStatus(id, next);
    });
  }

  return (
    <div className={cn("rounded-xl border border-border bg-[var(--surface)] p-4", pending && "opacity-70")}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium text-[var(--ink)]">{title}</p>
          <p className="text-tiny text-[var(--muted)]">
            Owner: {ownerName ?? "Unassigned"} · Review by {reviewByDate}
          </p>
          {note && <p className="mt-1 text-small text-[var(--ink-2)]">{note}</p>}
        </div>
        <div className="flex items-center gap-2">
          <span className={cn("rounded-full px-2 py-0.5 text-tiny font-medium", SEVERITY_STYLE[severity])}>{severity}</span>
          <select
            value={status}
            disabled={pending}
            onChange={(e) => updateStatus(e.target.value)}
            className="rounded-full border-0 bg-[var(--surface-2)] px-2.5 py-1 text-tiny font-medium text-[var(--ink-2)]"
          >
            {riskStatusEnum.enumValues.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
