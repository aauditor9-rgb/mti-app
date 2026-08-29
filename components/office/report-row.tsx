"use client";

import { useState, useTransition } from "react";
import { saveReportSummary, togglePublishReport } from "@/app/(office)/reports/actions";
import { cn } from "@/lib/utils";

export function ReportRow({
  pupilId,
  pupilName,
  termId,
  summary,
  status,
}: {
  pupilId: string;
  pupilName: string;
  termId: string;
  summary: string;
  status: "Draft" | "Published" | null;
}) {
  const [value, setValue] = useState(summary);
  const [pending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      await saveReportSummary(pupilId, termId, value);
    });
  }

  function togglePublish() {
    startTransition(async () => {
      await togglePublishReport(pupilId, termId, status !== "Published");
    });
  }

  return (
    <div className="flex flex-col gap-2 border-t border-border p-3 first:border-t-0">
      <div className="flex items-center justify-between">
        <p className="text-small font-medium text-[var(--ink)]">{pupilName}</p>
        <span className={cn("rounded-full px-2 py-0.5 text-tiny font-medium", status === "Published" ? "bg-[var(--success-bg)] text-[var(--success)]" : "bg-[var(--surface-2)] text-[var(--muted)]")}>
          {status ?? "Draft"}
        </span>
      </div>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={save}
        rows={2}
        placeholder="Report summary…"
        className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-small"
      />
      <button
        onClick={togglePublish}
        disabled={pending}
        className="self-start rounded-lg bg-[var(--surface-2)] px-3 py-1 text-tiny font-medium text-[var(--ink-2)] hover:bg-border disabled:opacity-50"
      >
        {status === "Published" ? "Unpublish" : "Publish"}
      </button>
    </div>
  );
}
