import Link from "next/link";
import { HifzRecordForm } from "@/components/teacher/hifz-record-form";
import { PreHifzGateRow } from "@/components/office/pre-hifz-gate-row";
import { computeHifzSummary, computeJuzStatuses, type JuzStatus } from "@/lib/derive/hifz";
import { recordHifzOffice } from "./actions";
import { cn } from "@/lib/utils";
import { getHifzRosterMadrasah, getMadrasah, listPreHifzAssessments } from "@/lib/db/queries";

const STATUS_STYLE: Record<JuzStatus, string> = {
  unmemorised: "bg-[var(--surface-2)]",
  untested: "bg-[var(--border-2)]",
  weak: "bg-[var(--alert-bg)]",
  urgent: "bg-[var(--warn-bg)]",
  solid: "bg-[var(--success)]",
};

const STATUS_LABEL: Record<JuzStatus, string> = {
  unmemorised: "Unmemorised",
  untested: "Untested",
  weak: "Weak",
  urgent: "Needs dawr",
  solid: "Solid",
};

export default async function HifzProgrammePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab = "roster" } = await searchParams;
  const madrasah = await getMadrasah();
  const roster = await getHifzRosterMadrasah(madrasah.id);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4">
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Teaching &amp; Learning</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Hifz Programme</h1>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["roster", "heatmap", "prehifz"] as const).map((t) => (
          <Link
            key={t}
            href={`/hifz?tab=${t}`}
            className={cn(
              "rounded-full px-3 py-1 text-small font-medium",
              tab === t ? "bg-[var(--ink)] text-[var(--surface)]" : "bg-[var(--surface-2)] text-[var(--ink-2)]",
            )}
          >
            {t === "roster" ? "Roster" : t === "heatmap" ? "Qur'an Heat Map" : "Pre-Hifz & Consolidation"}
          </Link>
        ))}
      </div>

      {tab === "roster" && (
        <>
          <HifzRecordForm pupils={roster.map((r) => ({ id: r.pupil.id, name: r.pupil.name }))} action={recordHifzOffice} />
          <div className="overflow-hidden rounded-lg border border-border bg-[var(--surface)]">
            <div className="flex items-center gap-3 bg-[var(--surface-2)] p-3 text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">
              <span className="flex-1">Student</span>
              <span className="w-20 text-right">Juz</span>
              <span className="w-28 text-right">Pages</span>
              <span className="w-24 text-right">Streak</span>
            </div>
            {roster.map(({ pupil, records }) => {
              const summary = computeHifzSummary(records);
              return (
                <div key={pupil.id} className="flex items-center gap-3 border-t border-border p-3 text-small">
                  <span className="flex-1 text-[var(--ink)]">
                    {pupil.name} <span className="text-tiny text-[var(--muted)]">· {pupil.class?.name}</span>
                  </span>
                  <span className="w-20 text-right text-[var(--ink-2)]">{summary.currentJuz ?? "—"}</span>
                  <span className="w-28 text-right text-[var(--ink-2)]">{summary.pagesMemorised}</span>
                  <span className="w-24 text-right text-[var(--ink-2)]">{summary.streakDays} 🔥</span>
                </div>
              );
            })}
          </div>
        </>
      )}

      {tab === "heatmap" && (
        <div className="overflow-x-auto rounded-lg border border-border bg-[var(--surface)] p-3">
          <div className="mb-3 flex flex-wrap gap-3 text-tiny text-[var(--muted)]">
            {(Object.keys(STATUS_LABEL) as JuzStatus[]).map((s) => (
              <span key={s} className="flex items-center gap-1.5">
                <span className={cn("size-3 rounded-sm", STATUS_STYLE[s])} />
                {STATUS_LABEL[s]}
              </span>
            ))}
          </div>
          <table className="w-full text-left text-tiny">
            <thead>
              <tr>
                <th className="p-1">Student</th>
                {Array.from({ length: 30 }, (_, i) => (
                  <th key={i} className="p-0.5 text-center font-normal text-[var(--muted)]">
                    {i + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {roster.map(({ pupil, records }) => {
                const statuses = computeJuzStatuses(records);
                return (
                  <tr key={pupil.id}>
                    <td className="whitespace-nowrap p-1 font-medium text-[var(--ink)]">{pupil.name}</td>
                    {Array.from({ length: 30 }, (_, i) => (
                      <td key={i} className="p-0.5">
                        <span title={STATUS_LABEL[statuses[i + 1]]} className={cn("block size-4 rounded-sm", STATUS_STYLE[statuses[i + 1]])} />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {tab === "prehifz" && <PreHifzTab madrasahId={madrasah.id} />}
    </div>
  );
}

async function PreHifzTab({ madrasahId }: { madrasahId: string }) {
  const rows = await listPreHifzAssessments(madrasahId);

  return (
    <div className="flex flex-col gap-3">
      {rows.length === 0 ? (
        <p className="rounded-xl border border-border bg-[var(--surface)] p-8 text-center text-small text-[var(--muted)]">
          No Pre-Hifdh pupils on roll.
        </p>
      ) : (
        rows.map(({ pupil, assessment }) => <PreHifzGateRow key={pupil.id} pupilId={pupil.id} pupilName={pupil.name} assessment={assessment} />)
      )}
    </div>
  );
}
