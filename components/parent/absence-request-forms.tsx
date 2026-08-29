"use client";

import { useRef, useState, useTransition } from "react";
import { reportAbsence, requestHolidayLeave } from "@/app/parent/requests/actions";

const REPORT_REASONS = ["Illness", "Doctor's or dental appointment", "Family emergency", "Religious or family occasion", "Other"];
const HOLIDAY_REASONS = ["Family holiday / travel", "Family emergency", "Bereavement (family funeral)", "Religious/cultural observance not on the calendar", "Other"];

export function AbsenceRequestForms({ pupilId }: { pupilId: string }) {
  const [mode, setMode] = useState<"today" | "holiday">("today");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = mode === "today" ? await reportAbsence(formData) : await requestHolidayLeave(formData);
      if (result.ok) formRef.current?.reset();
      else setError(result.message ?? "Could not submit this request.");
    });
  }

  return (
    <div className="rounded-xl border border-border bg-[var(--surface)] p-5">
      <p className="mb-3 text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Requests to the office</p>
      <div className="mb-3 flex gap-2">
        <button
          onClick={() => setMode("today")}
          className={mode === "today" ? "rounded-full bg-[var(--ink)] px-3 py-1 text-small font-medium text-[var(--surface)]" : "rounded-full bg-[var(--surface-2)] px-3 py-1 text-small font-medium text-[var(--ink-2)]"}
        >
          Report absence (today)
        </button>
        <button
          onClick={() => setMode("holiday")}
          className={mode === "holiday" ? "rounded-full bg-[var(--ink)] px-3 py-1 text-small font-medium text-[var(--surface)]" : "rounded-full bg-[var(--surface-2)] px-3 py-1 text-small font-medium text-[var(--ink-2)]"}
        >
          Holiday / leave request
        </button>
      </div>

      <form ref={formRef} action={handleSubmit} className="flex flex-col gap-3">
        <input type="hidden" name="pupilId" value={pupilId} />
        {mode === "today" ? (
          <label className="flex flex-col gap-1 text-small">
            <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Reason</span>
            <select name="reportReason" required className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body">
              <option value="">Choose…</option>
              {REPORT_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1 text-small">
                <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Start date</span>
                <input type="date" name="startDate" required className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body" />
              </label>
              <label className="flex flex-col gap-1 text-small">
                <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">End date</span>
                <input type="date" name="endDate" required className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body" />
              </label>
            </div>
            <label className="flex flex-col gap-1 text-small">
              <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Reason for request</span>
              <select name="holidayReason" required className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body">
                <option value="">Choose…</option>
                {HOLIDAY_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-small text-[var(--ink-2)]">
              <input type="checkbox" name="acknowledgedPolicy" />I have spoken to the office about this holiday request before booking, or understand I should do so.
            </label>
            <label className="flex flex-col gap-1 text-small">
              <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Please explain the reason for the holiday</span>
              <textarea name="explanation" rows={2} className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body" />
            </label>
          </>
        )}

        {error && <p className="text-small text-[var(--alert)]">{error}</p>}

        <button type="submit" disabled={pending} className="self-start rounded-lg bg-primary px-4 py-2 text-small font-medium text-primary-foreground disabled:opacity-50">
          {mode === "today" ? "Submit report" : "Submit request"}
        </button>
        {mode === "today" && <p className="text-tiny text-[var(--muted)]">Reports must be submitted before 4:30pm to count as same-day.</p>}
      </form>
    </div>
  );
}
