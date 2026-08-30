import { HifzRecordForm } from "@/components/teacher/hifz-record-form";
import { HIFZ_QUALITY_TONE } from "@/lib/derive/hifz";
import { cn } from "@/lib/utils";
import { getCurrentStaff, getMadrasah, getTeacherClasses, listHifzRecordsForClass } from "@/lib/db/queries";

const TONE_CLASS = {
  success: "bg-[var(--success-bg)] text-[var(--success)]",
  warn: "bg-[var(--warn-bg)] text-[var(--ink-2)]",
  alert: "bg-[var(--alert-bg)] text-[var(--alert)]",
} as const;

export default async function TeacherHifzDiaryPage() {
  const madrasah = await getMadrasah();
  const staff = await getCurrentStaff(madrasah.id);
  if (!staff) return null;
  if (!staff.isHifzTeacher) {
    return (
      <p className="mx-auto max-w-2xl rounded-xl border border-border bg-[var(--surface)] p-8 text-center text-small text-[var(--muted)]">
        Hifz Diary is only available to hifz-teaching staff.
      </p>
    );
  }

  const classes = await getTeacherClasses(madrasah.id, staff.id);
  const hifzClass = classes.find((c) => c.hifdhType !== "None") ?? classes[0];

  if (!hifzClass) {
    return (
      <p className="mx-auto max-w-2xl rounded-xl border border-border bg-[var(--surface)] p-8 text-center text-small text-[var(--muted)]">
        You aren&apos;t set as the lead teacher of a hifz class yet.
      </p>
    );
  }

  const records = await listHifzRecordsForClass(madrasah.id, hifzClass.id);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Teaching · {hifzClass.name}</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Hifz Diary</h1>
        <p className="text-small text-[var(--muted)]">Record sabaq, sabqī and manzil heard today, with a quality rating.</p>
      </div>

      <HifzRecordForm pupils={hifzClass.pupils.map((p) => ({ id: p.id, name: p.name }))} />

      <div className="overflow-hidden rounded-lg border border-border bg-[var(--surface)] shadow-sm">
        {records.length === 0 ? (
          <p className="p-8 text-center text-small text-[var(--muted)]">No records yet.</p>
        ) : (
          records.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center gap-3 border-t border-border p-3 first:border-t-0">
              <span className="w-24 shrink-0 text-tiny text-[var(--muted)]">{r.date}</span>
              <span className="min-w-0 flex-1 text-small">
                <span className="font-medium text-[var(--ink)]">{r.pupil.name}</span>{" "}
                <span className="text-[var(--ink-2)]">
                  · {r.type} · Juz {r.juz}
                  {r.pageFrom && r.pageTo && ` · pg ${r.pageFrom}–${r.pageTo}`}
                </span>
                {r.mistakeNotes && <p className="text-tiny text-[var(--muted)]">{r.mistakeNotes}</p>}
              </span>
              <span className={cn("rounded-full px-2 py-0.5 text-tiny font-medium", TONE_CLASS[HIFZ_QUALITY_TONE[r.quality]])}>
                {r.quality}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
