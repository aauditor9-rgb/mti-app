import { ConcernCard, type ConcernCardData } from "@/components/office/concern-card";
import { LogConcernForm } from "@/components/office/log-concern-form";
import { getCurrentStaff, getMadrasah, getTeacherClasses, listConcerns, listStaff } from "@/lib/db/queries";

export default async function TeacherConcernsPage() {
  const madrasah = await getMadrasah();
  const staff = await getCurrentStaff(madrasah.id);
  if (!staff) return null;

  const classes = await getTeacherClasses(madrasah.id, staff.id);
  const classIds = new Set(classes.map((c) => c.id));
  const activeClass = classes[0];
  const [concerns, allStaff] = await Promise.all([listConcerns(madrasah.id), listStaff(madrasah.id)]);

  const myConcerns = concerns.filter((c) => c.classId && classIds.has(c.classId));
  const myPupils = activeClass ? activeClass.pupils : [];

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Pastoral</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Concerns</h1>
        <p className="text-small text-[var(--muted)]">{myConcerns.filter((c) => c.status === "Open").length} open for your class.</p>
      </div>

      <LogConcernForm
        pupils={myPupils.map((p) => ({ id: p.id, name: p.name, className: activeClass?.name ?? null }))}
        staff={allStaff.map((s) => ({ id: s.id, name: s.name }))}
      />

      {myConcerns.length === 0 ? (
        <p className="rounded-xl border border-border bg-[var(--surface)] p-8 text-center text-small text-[var(--muted)]">
          No concerns logged for your class.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {myConcerns.map((c) => {
            const data: ConcernCardData = {
              id: c.id,
              category: c.category,
              note: c.note,
              severity: c.severity,
              status: c.status,
              safeguardingNotified: c.safeguardingNotified,
              safeguardingNotifiedAt: c.safeguardingNotifiedAt ? c.safeguardingNotifiedAt.toISOString() : null,
              parentInformedAt: c.parentInformedAt ? c.parentInformedAt.toISOString() : null,
              createdAt: c.createdAt.toISOString(),
              pupil: c.pupil ? { displayId: c.pupil.displayId, name: c.pupil.name } : null,
              className: c.class?.name ?? null,
              ownerStaffId: c.ownerStaffId,
              raisedByName: c.raisedBy?.name ?? null,
            };
            return <ConcernCard key={c.id} concern={data} staff={allStaff.map((s) => ({ id: s.id, name: s.name }))} />;
          })}
        </div>
      )}
    </div>
  );
}
