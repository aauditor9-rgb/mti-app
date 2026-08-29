import type { IhsanCategory } from "@/lib/derive/ihsan";
import { AwardPointsForm } from "@/components/office/award-points-form";
import { getCurrentStaff, getMadrasah, getTeacherClasses, listIhsanAwards, listIhsanTotals } from "@/lib/db/queries";

export default async function TeacherIhsanPage() {
  const madrasah = await getMadrasah();
  const staff = await getCurrentStaff(madrasah.id);
  if (!staff) return null;

  const classes = await getTeacherClasses(madrasah.id, staff.id);
  const classIds = new Set(classes.map((c) => c.id));
  const [totals, awards] = await Promise.all([listIhsanTotals(madrasah.id), listIhsanAwards()]);
  const manualAwards = awards.filter((a) => !a.automatic);

  const myPupils = totals.filter((p) => p.classId && classIds.has(p.classId));
  const recent = myPupils
    .flatMap((p) => p.manualRows.map((r) => ({ ...r, pupilName: p.name })))
    .sort((a, b) => b.awardedAt.getTime() - a.awardedAt.getTime())
    .slice(0, 15);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Pastoral</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Iḥsān Points</h1>
      </div>

      <div className="rounded-xl border border-border bg-[var(--surface)] p-5">
        <p className="mb-3 text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Award points</p>
        <AwardPointsForm
          pupils={totals.map((p) => ({ id: p.id, name: p.name, className: p.class?.name ?? null }))}
          awards={manualAwards.map((a) => ({ id: a.id, category: a.category as IhsanCategory, name: a.name, points: a.points }))}
        />
      </div>

      <div className="rounded-xl border border-border bg-[var(--surface)] p-5">
        <p className="mb-3 text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Recent awards to my class</p>
        {recent.length === 0 ? (
          <p className="text-small text-[var(--muted)]">No points awarded yet.</p>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {recent.map((row) => (
              <div key={row.id} className="flex items-center justify-between py-2.5 text-small">
                <div>
                  <span className="font-medium text-[var(--ink)]">{row.pupilName}</span>{" "}
                  <span className="text-[var(--success)]">+{row.award.points}</span>
                  <p className="text-tiny text-[var(--muted)]">{row.award.name}</p>
                </div>
                <span className="text-tiny text-[var(--muted)]">{row.awardedAt.toISOString().slice(0, 10)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
