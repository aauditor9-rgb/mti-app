"use client";

import { useTransition } from "react";
import Link from "next/link";
import {
  notifySafeguarding,
  updateConcernOwner,
  updateConcernSeverity,
  updateConcernStatus,
} from "@/app/(office)/concerns/actions";
import { CONCERN_SEVERITIES, CONCERN_STATUSES, type ConcernSeverity, type ConcernStatus } from "@/lib/derive/concern";
import { cn } from "@/lib/utils";

export type ConcernCardData = {
  id: string;
  category: string;
  note: string;
  severity: ConcernSeverity;
  status: ConcernStatus;
  safeguardingNotified: boolean;
  safeguardingNotifiedAt: string | null;
  parentInformedAt: string | null;
  createdAt: string;
  pupil: { displayId: string; name: string } | null;
  className: string | null;
  ownerStaffId: string | null;
  raisedByName: string | null;
};

const SEVERITY_STYLE: Record<ConcernSeverity, string> = {
  Low: "bg-[var(--surface-2)] text-[var(--ink-2)]",
  Medium: "bg-[var(--warn-bg)] text-[var(--ink-2)]",
  High: "bg-[var(--alert-bg)] text-[var(--alert)]",
};

function fmtDate(iso: string) {
  return new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", day: "numeric", month: "short", year: "numeric" }).format(
    new Date(iso),
  );
}

export function ConcernCard({ concern, staff }: { concern: ConcernCardData; staff: { id: string; name: string }[] }) {
  const [pending, startTransition] = useTransition();

  function setStatus(status: ConcernStatus) {
    startTransition(async () => {
      await updateConcernStatus(concern.id, status);
    });
  }
  function setSeverity(severity: ConcernSeverity) {
    startTransition(async () => {
      await updateConcernSeverity(concern.id, severity);
    });
  }
  function setOwner(ownerStaffId: string) {
    startTransition(async () => {
      await updateConcernOwner(concern.id, ownerStaffId);
    });
  }
  function notify() {
    startTransition(async () => {
      await notifySafeguarding(concern.id);
    });
  }

  return (
    <div className={cn("rounded-xl border border-border bg-[var(--surface)] p-4", pending && "opacity-60")}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-medium text-[var(--ink)]">{concern.category}</p>
          <p className="text-small text-[var(--ink-2)]">
            {concern.pupil ? (
              <Link href={`/students/${concern.pupil.displayId}`} className="font-medium text-[var(--primary)] hover:underline">
                {concern.pupil.name}
              </Link>
            ) : (
              "Unknown student"
            )}{" "}
            {concern.className && <>· {concern.className}</>}
          </p>
        </div>
        <span className={cn("rounded-full px-2 py-0.5 text-tiny font-medium", SEVERITY_STYLE[concern.severity])}>
          {concern.severity}
        </span>
      </div>

      <p className="mt-2 text-small text-[var(--ink)]">{concern.note}</p>

      <p className="mt-2 text-tiny text-[var(--muted)]">
        {concern.parentInformedAt ? `Parent informed ${fmtDate(concern.parentInformedAt)}` : "Parent not yet informed"}
      </p>

      {concern.safeguardingNotified ? (
        <p className="mt-1 text-tiny font-medium text-[var(--alert)]">
          Safeguarding notified{concern.safeguardingNotifiedAt ? ` · ${fmtDate(concern.safeguardingNotifiedAt)}` : ""}
        </p>
      ) : (
        <button
          onClick={notify}
          disabled={pending}
          className="mt-1 text-tiny font-medium text-[var(--alert)] underline decoration-dotted disabled:opacity-50"
        >
          Notify safeguarding lead
        </button>
      )}

      <p className="mt-2 text-tiny text-[var(--muted)]">
        {fmtDate(concern.createdAt)}
        {concern.raisedByName && <> · by {concern.raisedByName}</>}
      </p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {CONCERN_STATUSES.map((s) => (
          <button
            key={s}
            disabled={pending}
            onClick={() => setStatus(s)}
            className={cn(
              "rounded-full border px-2.5 py-1 text-tiny font-medium disabled:cursor-not-allowed",
              concern.status === s
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-[var(--ink-2)] hover:bg-[var(--surface-2)]",
            )}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-3">
        <div className="flex gap-1.5">
          {CONCERN_SEVERITIES.map((s) => (
            <button
              key={s}
              disabled={pending}
              onClick={() => setSeverity(s)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-tiny font-medium disabled:cursor-not-allowed",
                concern.severity === s
                  ? "border-[var(--ink)] bg-primary text-primary-foreground"
                  : "border-border bg-background text-[var(--ink-2)] hover:bg-[var(--surface-2)]",
              )}
            >
              {s}
            </button>
          ))}
        </div>

        <select
          value={concern.ownerStaffId ?? ""}
          disabled={pending}
          onChange={(e) => setOwner(e.target.value)}
          className="rounded-lg border border-border bg-background px-2 py-1 text-tiny text-[var(--ink-2)] disabled:opacity-50"
        >
          <option value="">Unassigned</option>
          {staff.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
