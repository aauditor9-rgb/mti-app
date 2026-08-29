"use client";

import { useRef, useState, useTransition } from "react";
import { getExistingLog, logSalahDay } from "@/app/(office)/salah/actions";
import { SALAH_PRAYERS, type SalahPrayer } from "@/lib/derive/salah";
import { todayLondon } from "@/lib/derive/age";

type PupilOption = { id: string; name: string; className: string | null };
type PrayerState = Record<SalahPrayer, { prayed: boolean; jamaah: boolean }>;

function emptyState(): PrayerState {
  return Object.fromEntries(SALAH_PRAYERS.map((p) => [p, { prayed: true, jamaah: false }])) as PrayerState;
}

export function LogSalahForm({ pupils }: { pupils: PupilOption[] }) {
  const [open, setOpen] = useState(false);
  const [pupilId, setPupilId] = useState("");
  const [date, setDate] = useState(todayLondon());
  const [state, setState] = useState<PrayerState>(emptyState());
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function loadExisting(nextPupilId: string, nextDate: string) {
    if (!nextPupilId || !nextDate) return;
    startTransition(async () => {
      const rows = await getExistingLog(nextPupilId, nextDate);
      const next = emptyState();
      for (const r of rows) next[r.prayer as SalahPrayer] = { prayed: r.prayed, jamaah: r.jamaah };
      setState(next);
    });
  }

  function handlePupilChange(value: string) {
    setPupilId(value);
    loadExisting(value, date);
  }
  function handleDateChange(value: string) {
    setDate(value);
    loadExisting(pupilId, value);
  }

  function submit(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      const result = await logSalahDay(formData);
      setMessage(result.ok ? "Saved." : (result.message ?? "Could not save."));
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="self-start rounded-lg bg-primary px-4 py-2 text-small font-medium text-primary-foreground"
      >
        + Log a day&apos;s ṣalāh
      </button>
    );
  }

  return (
    <form
      ref={formRef}
      action={submit}
      className="flex flex-col gap-3 rounded-xl border border-border bg-[var(--surface)] p-5"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-small">
          <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Student</span>
          <select
            name="pupilId"
            required
            value={pupilId}
            onChange={(e) => handlePupilChange(e.target.value)}
            className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body"
          >
            <option value="">Choose a student…</option>
            {pupils.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} {p.className ? `· ${p.className}` : ""}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-small">
          <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Date</span>
          <input
            type="date"
            name="date"
            required
            value={date}
            onChange={(e) => handleDateChange(e.target.value)}
            className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body"
          />
        </label>
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-left text-small">
          <thead className="bg-[var(--surface-2)] text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">
            <tr>
              <th className="px-3 py-2">Prayer</th>
              <th className="px-3 py-2">Prayed</th>
              <th className="px-3 py-2">In jamā&apos;ah</th>
            </tr>
          </thead>
          <tbody>
            {SALAH_PRAYERS.map((prayer) => (
              <tr key={prayer} className="border-t border-border">
                <td className="px-3 py-2 font-medium text-[var(--ink)]">{prayer}</td>
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    name={`prayed_${prayer}`}
                    checked={state[prayer].prayed}
                    onChange={(e) =>
                      setState((s) => ({ ...s, [prayer]: { ...s[prayer], prayed: e.target.checked } }))
                    }
                    className="size-4"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    name={`jamaah_${prayer}`}
                    checked={state[prayer].jamaah}
                    disabled={!state[prayer].prayed}
                    onChange={(e) =>
                      setState((s) => ({ ...s, [prayer]: { ...s[prayer], jamaah: e.target.checked } }))
                    }
                    className="size-4 disabled:opacity-40"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {message && <p className="text-small text-[var(--ink-2)]">{message}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending || !pupilId}
          className="rounded-lg bg-primary px-4 py-2 text-small font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          Save
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg px-4 py-2 text-small font-medium text-[var(--ink-2)] hover:bg-[var(--surface-2)]"
        >
          Close
        </button>
      </div>
    </form>
  );
}
