import { SetHomeworkForm } from "@/components/office/set-homework-form";
import { getClass, getCurrentStaff, getMadrasah, getTeacherClasses } from "@/lib/db/queries";

export default async function TeacherSetWorkPage() {
  const madrasah = await getMadrasah();
  const staff = await getCurrentStaff(madrasah.id);
  if (!staff) return null;

  const classes = await getTeacherClasses(madrasah.id, staff.id);
  const activeClassRow = classes[0];
  const activeClass = activeClassRow ? await getClass(madrasah.id, activeClassRow.id) : null;

  if (!activeClass) {
    return (
      <p className="mx-auto max-w-2xl rounded-xl border border-border bg-[var(--surface)] p-8 text-center text-small text-[var(--muted)]">
        You aren&apos;t set as the lead teacher of any class yet.
      </p>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">{activeClass.name}</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Set Work</h1>
      </div>

      <SetHomeworkForm
        classes={[{ id: activeClass.id, name: activeClass.name }]}
        staff={[{ id: staff.id, name: staff.name }]}
        fixedClassId={activeClass.id}
        pupilsByClass={{ [activeClass.id]: activeClass.pupils.map((p) => ({ id: p.id, name: p.name })) }}
      />
    </div>
  );
}
