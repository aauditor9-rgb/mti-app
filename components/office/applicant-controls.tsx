"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  advanceStage,
  declineApplicant,
  enrolApplicant,
  setApplicantClass,
} from "@/app/(office)/admissions/actions";
import { PIPELINE_STAGES, type AdmissionStage } from "@/lib/derive/admissions";
import { cn } from "@/lib/utils";

type ClassOption = { id: string; name: string };

export function ApplicantControls({
  applicantId,
  stage,
  classId,
  classes,
}: {
  applicantId: string;
  stage: AdmissionStage;
  classId: string | null;
  classes: ClassOption[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [declining, setDeclining] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const locked = stage === "Enrolled" || stage === "Declined";

  function goToStage(s: AdmissionStage) {
    setError(null);
    startTransition(async () => {
      const result = await advanceStage(applicantId, s);
      if (!result.ok) setError(result.message ?? "Could not update the stage.");
    });
  }

  function submitDecline() {
    setError(null);
    startTransition(async () => {
      await declineApplicant(applicantId, reason);
      setDeclining(false);
    });
  }

  function changeClass(newClassId: string) {
    startTransition(async () => {
      await setApplicantClass(applicantId, newClassId);
    });
  }

  function enrol() {
    setError(null);
    startTransition(async () => {
      const result = await enrolApplicant(applicantId);
      if (result.ok && result.pupilId) {
        router.push(`/students`);
      } else if (!result.ok) {
        setError(result.message ?? "Could not enrol this applicant.");
      }
    });
  }

  return (
    <div className={cn("flex flex-col gap-3", pending && "opacity-60")}>
      {error && <p className="text-small text-[var(--alert)]">{error}</p>}

      {!locked && (
        <>
          <div>
            <p className="mb-1 text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Stage</p>
            <div className="flex flex-wrap gap-1.5">
              {PIPELINE_STAGES.map((s) => (
                <button
                  key={s}
                  disabled={pending}
                  onClick={() => goToStage(s)}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-tiny font-medium disabled:cursor-not-allowed",
                    stage === s
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-[var(--ink-2)] hover:bg-[var(--surface-2)]",
                  )}
                >
                  {s}
                </button>
              ))}
              <button
                disabled={pending}
                onClick={() => goToStage("Waiting list")}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-tiny font-medium disabled:cursor-not-allowed",
                  stage === "Waiting list"
                    ? "border-[var(--ink)] bg-primary text-primary-foreground"
                    : "border-border bg-background text-[var(--ink-2)] hover:bg-[var(--surface-2)]",
                )}
              >
                Waiting list
              </button>
            </div>
          </div>

          <div>
            <p className="mb-1 text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Class allocation</p>
            <select
              value={classId ?? ""}
              disabled={pending}
              onChange={(e) => changeClass(e.target.value)}
              className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-small text-[var(--ink)]"
            >
              <option value="">Not allocated</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-2">
            {stage === "Offer" && (
              <button
                onClick={enrol}
                disabled={pending}
                className="rounded-lg bg-primary px-4 py-2 text-small font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                Accept &amp; enrol
              </button>
            )}

            {!declining ? (
              <button
                onClick={() => setDeclining(true)}
                disabled={pending}
                className="rounded-lg bg-[var(--alert-bg)] px-4 py-2 text-small font-medium text-[var(--alert)] disabled:opacity-50"
              >
                Decline
              </button>
            ) : (
              <div className="flex flex-1 items-center gap-2">
                <input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Reason for declining…"
                  className="flex-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-small"
                />
                <button
                  onClick={submitDecline}
                  disabled={pending}
                  className="rounded-lg bg-[var(--alert)] px-3 py-1.5 text-small font-medium text-[var(--surface)] disabled:opacity-50"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setDeclining(false)}
                  className="text-small text-[var(--ink-2)] hover:underline"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
