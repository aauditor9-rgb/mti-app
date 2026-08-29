import Link from "next/link";
import { RegisterTable } from "@/components/office/register-table";
import { todayLondon } from "@/lib/derive/age";
import { computeClockStatus } from "@/lib/derive/staff";
import { cn } from "@/lib/utils";
import {
  getCurrentStaff,
  getMadrasah,
  getRegisterForClass,
  getStaffClockEvents,
  getTeacherClasses,
} from "@/lib/db/queries";

export default async function TeacherRegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string }>;
}) {
  const { classId } = await searchParams;
  const madrasah = await getMadrasah();
  const staff = await getCurrentStaff(madrasah.id);
  if (!staff) return null;

  const classes = await getTeacherClasses(madrasah.id, staff.id);
  const activeClass = classes.find((c) => c.id === classId) ?? classes[0];

  if (!activeClass) {
    return (
      <p className="mx-auto max-w-2xl rounded-xl border border-border bg-[var(--surface)] p-8 text-center text-small text-[var(--muted)]">
        You aren&apos;t set as the lead teacher of any class yet.
      </p>
    );
  }

  const [events, register] = await Promise.all([
    getStaffClockEvents(staff.id),
    getRegisterForClass(madrasah.id, activeClass.id, todayLondon()),
  ]);
  const checkedIn = computeClockStatus(events).clockedIn;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Today</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">{activeClass.name} — My Register</h1>
      </div>

      {classes.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {classes.map((c) => (
            <Link
              key={c.id}
              href={`/teacher/register?classId=${c.id}`}
              className={cn(
                "rounded-full px-3 py-1 text-small font-medium",
                c.id === activeClass.id ? "bg-[var(--ink)] text-[var(--surface)]" : "bg-[var(--surface-2)] text-[var(--ink-2)]",
              )}
            >
              {c.name}
            </Link>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-border bg-[var(--surface)] p-5">
        {!checkedIn && (
          <div className="mb-4 rounded-lg border border-border bg-[var(--warn-bg)] p-3 text-small text-[var(--ink-2)]">
            You are not checked in yet, so marks are read-only.{" "}
            <Link href="/teacher/clock" className="font-medium text-[var(--primary)] hover:underline">
              Check in on site
            </Link>{" "}
            to unlock the register.
          </div>
        )}
        {register && (
          <fieldset disabled={!checkedIn} className={!checkedIn ? "opacity-60" : undefined}>
            <RegisterTable
              classId={activeClass.id}
              date={todayLondon()}
              pupils={register.pupils.map((p) => ({
                id: p.id,
                displayId: p.displayId,
                name: p.name,
                mark: p.mark ? { code: p.mark.code } : null,
              }))}
              submittedAt={register.submittedAt ? register.submittedAt.toISOString() : null}
            />
          </fieldset>
        )}
      </div>
    </div>
  );
}
