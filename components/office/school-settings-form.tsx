"use client";

import { useState, useTransition } from "react";
import { updateSchoolSettings } from "@/app/(office)/settings/school/actions";

function timeValue(v: string | null) {
  return v ? v.slice(0, 5) : "";
}

export function SchoolSettingsForm({
  madrasah,
}: {
  madrasah: {
    shortName: string | null;
    address: string | null;
    phone: string | null;
    email: string | null;
    officePhone: string | null;
    officeEmail: string | null;
    arrivalExpectedBy: string | null;
    markedLateAfter: string | null;
    classesBeginAt: string | null;
    absenceReportingDeadline: string | null;
    attendanceReviewThresholdPct: number | null;
    termlyTuitionFee: string;
    enrolmentFee: string;
    siblingDiscountPct: number;
  };
}) {
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setStatus("idle");
    setError(null);
    startTransition(async () => {
      const result = await updateSchoolSettings(formData);
      if (result.ok) {
        setStatus("saved");
      } else {
        setStatus("error");
        setError(result.message ?? "Could not save settings.");
      }
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-6">
      <div className="rounded-xl border border-border bg-[var(--surface)] p-5">
        <p className="mb-3 text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">School details</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-small">
            <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Short name</span>
            <input name="shortName" defaultValue={madrasah.shortName ?? ""} className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body" />
          </label>
          <label className="flex flex-col gap-1 text-small">
            <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Address</span>
            <input name="address" defaultValue={madrasah.address ?? ""} className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body" />
          </label>
          <label className="flex flex-col gap-1 text-small">
            <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Phone</span>
            <input name="phone" defaultValue={madrasah.phone ?? ""} className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body" />
          </label>
          <label className="flex flex-col gap-1 text-small">
            <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Email</span>
            <input type="email" name="email" defaultValue={madrasah.email ?? ""} className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body" />
          </label>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-[var(--surface)] p-5">
        <p className="mb-3 text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Institutional contact</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-small">
            <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Office phone (never shown to parents/students)</span>
            <input name="officePhone" defaultValue={madrasah.officePhone ?? ""} className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body" />
          </label>
          <label className="flex flex-col gap-1 text-small">
            <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Office email</span>
            <input type="email" name="officeEmail" defaultValue={madrasah.officeEmail ?? ""} className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body" />
          </label>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-[var(--surface)] p-5">
        <p className="mb-1 text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Attendance &amp; punctuality rules</p>
        <p className="mb-3 text-tiny text-[var(--muted)]">
          Stored for reference only — the existing Attendance register still uses its own fixed 5:05pm cutoff and doesn&apos;t
          read these values yet.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-small">
            <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Arrival expected by</span>
            <input type="time" name="arrivalExpectedBy" defaultValue={timeValue(madrasah.arrivalExpectedBy)} className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body" />
          </label>
          <label className="flex flex-col gap-1 text-small">
            <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Marked late after</span>
            <input type="time" name="markedLateAfter" defaultValue={timeValue(madrasah.markedLateAfter)} className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body" />
          </label>
          <label className="flex flex-col gap-1 text-small">
            <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Classes begin</span>
            <input type="time" name="classesBeginAt" defaultValue={timeValue(madrasah.classesBeginAt)} className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body" />
          </label>
          <label className="flex flex-col gap-1 text-small">
            <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Absence reporting deadline</span>
            <input type="time" name="absenceReportingDeadline" defaultValue={timeValue(madrasah.absenceReportingDeadline)} className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body" />
          </label>
          <label className="flex flex-col gap-1 text-small">
            <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Attendance review threshold (%)</span>
            <input type="number" min={0} max={100} name="attendanceReviewThresholdPct" defaultValue={madrasah.attendanceReviewThresholdPct ?? ""} className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body" />
          </label>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-[var(--surface)] p-5">
        <p className="mb-1 text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Fee configuration</p>
        <p className="mb-3 text-tiny text-[var(--muted)]">Changes apply to invoices generated after this save — existing invoice lines aren&apos;t retroactively recalculated.</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <label className="flex flex-col gap-1 text-small">
            <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Termly tuition (£)</span>
            <input type="number" min="0" step="0.01" name="termlyTuitionFee" defaultValue={madrasah.termlyTuitionFee} required className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body" />
          </label>
          <label className="flex flex-col gap-1 text-small">
            <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Enrolment fee (£)</span>
            <input type="number" min="0" step="0.01" name="enrolmentFee" defaultValue={madrasah.enrolmentFee} required className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body" />
          </label>
          <label className="flex flex-col gap-1 text-small">
            <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Sibling discount (%)</span>
            <input type="number" min="0" max="100" name="siblingDiscountPct" defaultValue={madrasah.siblingDiscountPct} className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body" />
          </label>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="self-start rounded-lg bg-primary px-4 py-2 text-small font-medium text-primary-foreground disabled:opacity-50">
          Save settings
        </button>
        {status === "saved" && <span className="text-small text-[var(--success)]">Saved.</span>}
        {status === "error" && <span className="text-small text-[var(--alert)]">{error}</span>}
      </div>
    </form>
  );
}
