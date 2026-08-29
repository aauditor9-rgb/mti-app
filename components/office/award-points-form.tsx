"use client";

import { useRef, useState, useTransition } from "react";
import { awardPoints } from "@/app/(office)/ihsan/actions";
import { IHSAN_CATEGORY_LABELS, type IhsanCategory } from "@/lib/derive/ihsan";

type Award = { id: string; category: IhsanCategory; name: string; points: number };
type PupilOption = { id: string; name: string; className: string | null };

export function AwardPointsForm({ pupils, awards }: { pupils: PupilOption[]; awards: Award[] }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const byCategory = new Map<IhsanCategory, Award[]>();
  for (const a of awards) {
    if (!byCategory.has(a.category)) byCategory.set(a.category, []);
    byCategory.get(a.category)!.push(a);
  }

  function handleSubmit(formData: FormData) {
    const pupilId = String(formData.get("pupilId") ?? "");
    const awardId = String(formData.get("awardId") ?? "");
    if (!pupilId || !awardId) {
      setMessage({ ok: false, text: "Choose a student and a reason." });
      return;
    }
    setMessage(null);
    startTransition(async () => {
      const result = await awardPoints(pupilId, awardId);
      if (result.ok) {
        setMessage({ ok: true, text: "Points awarded." });
        formRef.current?.reset();
      } else {
        setMessage({ ok: false, text: result.message ?? "Could not award points." });
      }
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-small">
          <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Student</span>
          <select
            name="pupilId"
            required
            className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body text-[var(--ink)]"
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
          <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Reason</span>
          <select
            name="awardId"
            required
            className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body text-[var(--ink)]"
          >
            <option value="">Choose a reason…</option>
            {[...byCategory.entries()].map(([category, categoryAwards]) => (
              <optgroup key={category} label={IHSAN_CATEGORY_LABELS[category]}>
                {categoryAwards.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} (+{a.points})
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
      </div>

      {message && (
        <p
          className={
            message.ok
              ? "text-small text-[var(--success)]"
              : "text-small text-[var(--alert)]"
          }
        >
          {message.text}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-lg bg-primary px-4 py-2 text-small font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
      >
        Award points
      </button>
    </form>
  );
}
