import Link from "next/link";
import { LogSalahForm } from "@/components/office/log-salah-form";
import { toneForRate } from "@/lib/derive/salah";
import { getMadrasah, getSalahDashboard, listPupils } from "@/lib/db/queries";
import { cn } from "@/lib/utils";

const TONE_TEXT = {
  success: "text-[var(--success)]",
  warn: "text-[var(--ink-2)]",
  alert: "text-[var(--alert)]",
} as const;
const TONE_BG = {
  success: "bg-[var(--success-bg)]",
  warn: "bg-[var(--warn-bg)]",
  alert: "bg-[var(--alert-bg)]",
} as const;

export default async function SalahPage() {
  const madrasah = await getMadrasah();
  const [dashboard, pupils] = await Promise.all([getSalahDashboard(madrasah.id), listPupils(madrasah.id)]);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Attendance &amp; behaviour · Tarbiyah</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Ṣalāh &amp; Tarbiyah</h1>
        <p className="text-small text-[var(--muted)]">
          The madrasah-wide view of ṣalāh engagement, rolled up from students&apos; ṣalāh logs over the last 7 days.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className={cn("font-heading text-h3 font-medium", TONE_TEXT[toneForRate(dashboard.overall.loggingRate)])}>
            {dashboard.overall.loggingRate}%
          </p>
          <p className="text-small text-[var(--muted)]">
            Logging ṣalāh · {dashboard.overall.loggedPupils}/{dashboard.onRollCount} pupils
          </p>
        </div>
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className={cn("font-heading text-h3 font-medium", TONE_TEXT[toneForRate(dashboard.overall.jamaahRate)])}>
            {dashboard.overall.jamaahRate}%
          </p>
          <p className="text-small text-[var(--muted)]">Avg jamā&apos;ah adherence</p>
        </div>
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className="font-heading text-h3 font-medium text-[var(--ink)]">{dashboard.lowAdherence.length + dashboard.notLogging.length}</p>
          <p className="text-small text-[var(--muted)]">Pupils needing follow-up</p>
        </div>
      </div>

      <LogSalahForm pupils={pupils.map((p) => ({ id: p.id, name: p.name, className: p.class?.name ?? null }))} />

      <div className="rounded-xl border border-border bg-[var(--surface)] p-5">
        <p className="mb-3 text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Ṣalāh engagement by class</p>
        {dashboard.byClass.length === 0 ? (
          <p className="text-small text-[var(--muted)]">No classes have pupils allocated yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {dashboard.byClass.map((c) => (
              <div key={c.class.id} className="rounded-lg border border-border bg-background p-3">
                <p className="font-medium text-[var(--ink)]">{c.class.name}</p>
                <p className="text-small text-[var(--ink-2)]">
                  Jamā&apos;ah <span className={TONE_TEXT[toneForRate(c.jamaahRate)]}>{c.jamaahRate}%</span> · Logging{" "}
                  {c.loggedPupils}/{c.class.pupils.length}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-[var(--surface)] p-5">
        <p className="mb-3 text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Needs follow-up</p>
        {dashboard.lowAdherence.length === 0 && dashboard.notLogging.length === 0 ? (
          <p className="text-small text-[var(--muted)]">Everyone on roll is logging well this week.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {dashboard.lowAdherence.map(({ pupil, prayedRate, logCount }) => (
              <div key={pupil.id} className={cn("flex items-center justify-between rounded-lg p-3", TONE_BG[toneForRate(prayedRate)])}>
                <Link href={`/students/${pupil.displayId}`} className="font-medium text-[var(--ink)] hover:underline">
                  {pupil.name}
                </Link>
                <span className="text-small text-[var(--ink-2)]">
                  {prayedRate}% prayed · {logCount} logged this week
                </span>
              </div>
            ))}
            {dashboard.notLogging.map((pupil) => (
              <div key={pupil.id} className="flex items-center justify-between rounded-lg bg-[var(--surface-2)] p-3">
                <Link href={`/students/${pupil.displayId}`} className="font-medium text-[var(--ink)] hover:underline">
                  {pupil.name}
                </Link>
                <span className="text-small text-[var(--muted)]">Not logging this week</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
