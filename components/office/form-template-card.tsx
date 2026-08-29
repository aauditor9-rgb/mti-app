"use client";

import { useState, useTransition } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { toggleFormResponse } from "@/app/(office)/communications/forms/actions";
import { cn } from "@/lib/utils";

type Response = { id: string; guardianName: string; completedAt: Date | null };

export function FormTemplateCard({
  title,
  audienceLabel,
  deadline,
  totalCount,
  completedCount,
  outstandingCount,
  responses,
}: {
  title: string;
  audienceLabel: string;
  deadline: string;
  totalCount: number;
  completedCount: number;
  outstandingCount: number;
  responses: Response[];
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function toggle(id: string, completed: boolean) {
    startTransition(async () => {
      await toggleFormResponse(id, completed);
    });
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-[var(--surface)]">
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex w-full items-start justify-between gap-3 p-4 text-left hover:bg-[var(--surface-2)]">
        <div className="flex items-start gap-2">
          {open ? <ChevronDown className="mt-1 size-4 text-[var(--muted)]" /> : <ChevronRight className="mt-1 size-4 text-[var(--muted)]" />}
          <div>
            <p className="font-medium text-[var(--ink)]">{title}</p>
            <p className="text-tiny text-[var(--muted)]">
              {audienceLabel} · {totalCount} families · deadline {deadline}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-small font-medium text-[var(--ink)]">
            {completedCount} of {totalCount} completed
          </p>
          <p className="text-tiny text-[var(--muted)]">{outstandingCount} outstanding</p>
        </div>
      </button>

      {open && (
        <div className={cn("border-t border-border", pending && "opacity-70")}>
          {responses.length === 0 ? (
            <p className="p-3 text-small text-[var(--muted)]">No households targeted by this form.</p>
          ) : (
            responses.map((r) => (
              <label key={r.id} className="flex cursor-pointer items-center gap-3 border-t border-border p-3 first:border-t-0 hover:bg-[var(--surface-2)]">
                <input
                  type="checkbox"
                  checked={!!r.completedAt}
                  disabled={pending}
                  onChange={(e) => toggle(r.id, e.target.checked)}
                  className="size-4"
                />
                <span className="flex-1 text-small font-medium text-[var(--ink)]">{r.guardianName}</span>
                <span className={cn("rounded-full px-2 py-0.5 text-tiny font-medium", r.completedAt ? "bg-[var(--success-bg)] text-[var(--success)]" : "bg-[var(--surface-2)] text-[var(--muted)]")}>
                  {r.completedAt ? "Completed" : "Outstanding"}
                </span>
              </label>
            ))
          )}
        </div>
      )}
    </div>
  );
}
