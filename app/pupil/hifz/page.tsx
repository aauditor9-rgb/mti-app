import { computeHifzSummary } from "@/lib/derive/hifz";
import { getCurrentPupilFromCookie, getHifzSummaryForPupil, getMadrasah } from "@/lib/db/queries";

export default async function PupilHifzPage() {
  const madrasah = await getMadrasah();
  const pupil = await getCurrentPupilFromCookie(madrasah.id);
  if (!pupil) return null;

  const records = await getHifzSummaryForPupil(pupil.id);
  const summary = computeHifzSummary(records);
  const latest = [...records].sort((a, b) => b.date.localeCompare(a.date))[0];

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">My Memorisation</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">My Hifz</h1>
      </div>

      <div className="rounded-xl border border-border bg-gradient-to-br from-primary/10 to-transparent p-5">
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Today</p>
        {latest ? (
          <>
            <p className="mt-1 font-heading text-h4 font-medium text-[var(--ink)]">
              {latest.type} · Juz {latest.juz}
              {latest.pageFrom && latest.pageTo && ` · pg ${latest.pageFrom}–${latest.pageTo}`}
            </p>
            <p className="text-small text-[var(--ink-2)]">Last heard {latest.date} · {latest.quality}</p>
          </>
        ) : (
          <p className="mt-1 text-small text-[var(--ink-2)]">No hifz records yet.</p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className="font-heading text-h3 font-medium text-[var(--ink)]">{summary.currentJuz ?? "—"}</p>
          <p className="text-small text-[var(--muted)]">Juz</p>
        </div>
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className="font-heading text-h3 font-medium text-[var(--ink)]">{summary.pagesMemorised}</p>
          <p className="text-small text-[var(--muted)]">Pages memorised</p>
        </div>
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className="font-heading text-h3 font-medium text-[var(--ink)]">{summary.streakDays} 🔥</p>
          <p className="text-small text-[var(--muted)]">Day prep streak</p>
        </div>
      </div>
    </div>
  );
}
