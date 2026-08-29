"use client";

import { useState, useTransition } from "react";
import { updateClockSettings } from "@/app/(office)/staff/clock/actions";
import { clockModeEnum } from "@/lib/db/schema";

export function ClockSettingsForm({
  requireLocationToClockIn,
  clockMode,
}: {
  requireLocationToClockIn: boolean;
  clockMode: string;
}) {
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleSubmit(formData: FormData) {
    setSaved(false);
    startTransition(async () => {
      const result = await updateClockSettings(formData);
      if (result.ok) setSaved(true);
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4 rounded-xl border border-border bg-[var(--surface)] p-4">
      <div>
        <p className="text-small font-medium text-[var(--ink)]">Require location to clock in/out</p>
        <p className="text-tiny text-[var(--muted)]">
          When on, staff must turn location on and be within the madrasah boundary to clock in — no QR codes. When off,
          staff can clock from anywhere.
        </p>
        <label className="mt-2 inline-flex items-center gap-2 text-small">
          <input type="checkbox" name="requireLocationToClockIn" defaultChecked={requireLocationToClockIn} className="size-4" />
          On
        </label>
      </div>

      <div>
        <p className="text-small font-medium text-[var(--ink)]">What do teachers record each session?</p>
        <p className="text-tiny text-[var(--muted)]">Teachers sign in on arrival and sign out when they leave — the two stamps form their timesheet for pay.</p>
        <select name="clockMode" defaultValue={clockMode} className="mt-2 rounded-lg border border-border bg-background px-2.5 py-1.5 text-small">
          {clockModeEnum.enumValues.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="self-start rounded-lg bg-primary px-4 py-2 text-small font-medium text-primary-foreground disabled:opacity-50">
          Save settings
        </button>
        {saved && <span className="text-small text-[var(--success)]">Saved.</span>}
      </div>
    </form>
  );
}
