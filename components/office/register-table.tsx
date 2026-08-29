"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  ATTENDANCE_LABELS,
  isAuthorisedAbsence,
  type AttendanceCode,
} from "@/lib/derive/attendance";
import { reopenRegister, setAttendanceMark, submitRegister } from "@/app/(office)/attendance/actions";
import { cn } from "@/lib/utils";

const ABSENCE_REASONS: AttendanceCode[] = ["I", "F", "T", "A", "U"];

type RegisterPupil = {
  id: string;
  displayId: string;
  name: string;
  mark: { code: AttendanceCode } | null;
};

export function RegisterTable({
  classId,
  date,
  pupils,
  submittedAt,
}: {
  classId: string;
  date: string;
  pupils: RegisterPupil[];
  submittedAt: string | null;
}) {
  const [pending, startTransition] = useTransition();
  const [pendingPupilId, setPendingPupilId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const locked = submittedAt !== null;
  const markedCount = pupils.filter((p) => p.mark).length;

  function mark(pupilId: string, code: AttendanceCode) {
    setError(null);
    setPendingPupilId(pupilId);
    startTransition(async () => {
      const result = await setAttendanceMark(classId, pupilId, date, code);
      if (!result.ok) setError(result.message ?? "Could not save that mark.");
      setPendingPupilId(null);
    });
  }

  function markAll(code: AttendanceCode) {
    setError(null);
    startTransition(async () => {
      for (const p of pupils) {
        const result = await setAttendanceMark(classId, p.id, date, code);
        if (!result.ok) {
          setError(result.message ?? "Could not save marks.");
          return;
        }
      }
    });
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await submitRegister(classId, date);
      if (!result.ok) setError(result.message ?? "Could not submit the register.");
    });
  }

  function reopen() {
    setError(null);
    startTransition(async () => {
      await reopenRegister(classId, date);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {locked ? (
        <div className="flex items-center justify-between rounded-lg border border-border bg-[var(--success-bg)] px-4 py-3">
          <p className="text-small font-medium text-[var(--success)]">
            Submitted at{" "}
            {new Intl.DateTimeFormat("en-GB", {
              timeZone: "Europe/London",
              hour: "numeric",
              minute: "2-digit",
            }).format(new Date(submittedAt))}{" "}
            — this register is locked.
          </p>
          <button
            onClick={reopen}
            disabled={pending}
            className="text-small font-medium text-[var(--ink-2)] hover:underline disabled:opacity-50"
          >
            Reopen to edit
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <p className="text-small text-[var(--muted)]">
            {markedCount}/{pupils.length} marked
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => markAll("P")}
              disabled={pending}
              className="rounded-full bg-[var(--success-bg)] px-3 py-1 text-small font-medium text-[var(--success)] disabled:opacity-50"
            >
              Mark all present
            </button>
            <button
              onClick={() => markAll("L")}
              disabled={pending}
              className="rounded-full bg-[var(--warn-bg)] px-3 py-1 text-small font-medium text-[var(--ink-2)] disabled:opacity-50"
            >
              Mark all late
            </button>
            <button
              onClick={() => markAll("U")}
              disabled={pending}
              className="rounded-full bg-[var(--alert-bg)] px-3 py-1 text-small font-medium text-[var(--alert)] disabled:opacity-50"
            >
              Mark all absent
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="rounded-lg border border-[var(--alert)] bg-[var(--alert-bg)] px-3 py-2 text-small text-[var(--alert)]">
          {error}
        </p>
      )}

      <div className="overflow-hidden rounded-lg border border-border">
        {pupils.map((p) => {
          const code = p.mark?.code ?? null;
          const isAbsent = code !== null && code !== "P" && code !== "L";
          const rowPending = pending && pendingPupilId === p.id;
          return (
            <div
              key={p.id}
              className={cn(
                "flex flex-wrap items-center gap-3 border-t border-border p-3 first:border-t-0",
                rowPending && "opacity-50",
              )}
            >
              <Link
                href={`/students/${p.displayId}`}
                className="min-w-0 flex-1 truncate font-medium text-[var(--ink)] hover:text-[var(--primary)]"
              >
                {p.name}
              </Link>

              <div className="flex overflow-hidden rounded-lg border border-border">
                {(["P", "L"] as const).map((c) => (
                  <button
                    key={c}
                    disabled={locked || pending}
                    onClick={() => mark(p.id, c)}
                    className={cn(
                      "px-3 py-1 text-small font-medium disabled:cursor-not-allowed",
                      code === c
                        ? c === "P"
                          ? "bg-[var(--success)] text-[var(--surface)]"
                          : "bg-[var(--warn-bg)] text-[var(--ink)]"
                        : "bg-[var(--surface)] text-[var(--ink-2)] hover:bg-[var(--surface-2)]",
                    )}
                  >
                    {ATTENDANCE_LABELS[c]}
                  </button>
                ))}
                <button
                  disabled={locked || pending}
                  onClick={() => mark(p.id, "U")}
                  className={cn(
                    "px-3 py-1 text-small font-medium disabled:cursor-not-allowed",
                    isAbsent
                      ? "bg-[var(--alert)] text-[var(--surface)]"
                      : "bg-[var(--surface)] text-[var(--ink-2)] hover:bg-[var(--surface-2)]",
                  )}
                >
                  Absent
                </button>
              </div>

              {isAbsent && (
                <select
                  value={code ?? "U"}
                  disabled={locked || pending}
                  onChange={(e) => mark(p.id, e.target.value as AttendanceCode)}
                  className="rounded-lg border border-border bg-[var(--surface)] px-2 py-1 text-small text-[var(--ink)] disabled:cursor-not-allowed"
                >
                  {ABSENCE_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {ATTENDANCE_LABELS[r]} {isAuthorisedAbsence(r) ? "(authorised)" : "(unauthorised)"}
                    </option>
                  ))}
                </select>
              )}
            </div>
          );
        })}
      </div>

      {!locked && (
        <button
          onClick={submit}
          disabled={pending || markedCount < pupils.length}
          className="self-start rounded-lg bg-primary px-4 py-2 text-small font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          Submit register
        </button>
      )}
    </div>
  );
}
