"use client";

import { useState, useTransition } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { setDuaStatus } from "@/app/(office)/progress-trackers/duas/actions";
import { cn } from "@/lib/utils";

type PupilStatus = {
  pupilId: string;
  pupilName: string;
  arabicMemorised: boolean;
  translationMemorised: boolean;
  readAtHome: boolean;
};

type StatusField = "arabicMemorised" | "translationMemorised" | "readAtHome";

export function DuaCatalogItem({
  itemId,
  name,
  pupils,
  fullyMemorisedCount,
  pct,
}: {
  itemId: string;
  name: string;
  pupils: PupilStatus[];
  fullyMemorisedCount: number;
  pct: number;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function toggle(pupilId: string, field: StatusField, value: boolean) {
    startTransition(async () => {
      await setDuaStatus(pupilId, itemId, field, value);
    });
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 bg-background p-3 text-left hover:bg-[var(--surface-2)]"
      >
        {open ? <ChevronDown className="size-4 text-[var(--muted)]" /> : <ChevronRight className="size-4 text-[var(--muted)]" />}
        <span className="flex-1 text-small font-medium text-[var(--ink)]">{name}</span>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-tiny font-medium",
            pct >= 80 ? "bg-[var(--success-bg)] text-[var(--success)]" : "bg-[var(--surface-2)] text-[var(--muted)]",
          )}
        >
          {fullyMemorisedCount}/{pupils.length} fully memorised · {pct}%
        </span>
      </button>

      {open && (
        <div className={cn("border-t border-border", pending && "opacity-70")}>
          {pupils.length === 0 ? (
            <p className="p-3 text-small text-[var(--muted)]">No pupils on roll for this year.</p>
          ) : (
            <table className="w-full text-left text-small">
              <thead className="bg-[var(--surface-2)] text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">
                <tr>
                  <th className="px-3 py-2">Pupil</th>
                  <th className="px-3 py-2">Arabic</th>
                  <th className="px-3 py-2">Translation</th>
                  <th className="px-3 py-2">Read at home</th>
                </tr>
              </thead>
              <tbody>
                {pupils.map((p) => (
                  <tr key={p.pupilId} className="border-t border-border">
                    <td className="px-3 py-2 font-medium text-[var(--ink)]">{p.pupilName}</td>
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={p.arabicMemorised}
                        disabled={pending}
                        onChange={(e) => toggle(p.pupilId, "arabicMemorised", e.target.checked)}
                        className="size-4"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={p.translationMemorised}
                        disabled={pending}
                        onChange={(e) => toggle(p.pupilId, "translationMemorised", e.target.checked)}
                        className="size-4"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={p.readAtHome}
                        disabled={pending}
                        onChange={(e) => toggle(p.pupilId, "readAtHome", e.target.checked)}
                        className="size-4"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
