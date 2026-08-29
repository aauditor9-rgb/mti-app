import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { RegisterTable } from "@/components/office/register-table";
import { Input } from "@/components/ui/input";
import { todayLondon } from "@/lib/derive/age";
import { getMadrasah, getRegisterForClass } from "@/lib/db/queries";

export default async function ClassRegisterPage(
  props: PageProps<"/attendance/[classId]"> & {
    searchParams: Promise<{ date?: string }>;
  },
) {
  const { classId } = await props.params;
  const { date = todayLondon() } = await props.searchParams;

  const madrasah = await getMadrasah();
  const register = await getRegisterForClass(madrasah.id, classId, date);
  if (!register) notFound();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Attendance</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">{register.name} · Register</h1>
      </div>

      <div className="rounded-xl border border-border bg-[var(--surface)] p-5">
        <Link
          href="/attendance"
          className="mb-4 inline-flex items-center gap-1 text-small font-medium text-[var(--ink-2)] hover:text-[var(--ink)]"
        >
          <ArrowLeft className="size-3.5" /> Back to attendance
        </Link>

        <div className="mb-4 flex items-center justify-between">
          <p className="text-small text-[var(--ink-2)]">{register.leadTeacher?.name ?? "Unassigned"}</p>
          <form action={`/attendance/${classId}`} className="flex items-center gap-2">
            <Input type="date" name="date" defaultValue={date} className="w-auto bg-background" />
          </form>
        </div>

        <RegisterTable
          classId={classId}
          date={date}
          pupils={register.pupils.map((p) => ({
            id: p.id,
            displayId: p.displayId,
            name: p.name,
            mark: p.mark ? { code: p.mark.code } : null,
          }))}
          submittedAt={register.submittedAt ? register.submittedAt.toISOString() : null}
        />
      </div>
    </div>
  );
}
