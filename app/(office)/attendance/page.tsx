import Link from "next/link";
import { Input } from "@/components/ui/input";
import { todayLondon } from "@/lib/derive/age";
import { REGISTER_CLOSE_TIME } from "@/lib/derive/attendance";
import { getMadrasah, listClassesForRegister } from "@/lib/db/queries";
import { cn } from "@/lib/utils";

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date = todayLondon() } = await searchParams;
  const madrasah = await getMadrasah();
  const classes = await listClassesForRegister(madrasah.id, date);

  const withPupils = classes.filter((c) => c.pupils.length > 0);
  const submittedCount = withPupils.filter((c) => c.submittedAt).length;
  const presentTotal = classes.reduce(
    (sum, c) => sum + c.attendanceMarks.filter((m) => m.code === "P").length,
    0,
  );
  const lateTotal = classes.reduce(
    (sum, c) => sum + c.attendanceMarks.filter((m) => m.code === "L").length,
    0,
  );
  const absentTotal = classes.reduce(
    (sum, c) => sum + c.attendanceMarks.filter((m) => m.code !== "P" && m.code !== "L").length,
    0,
  );

  const closeHour = Number(REGISTER_CLOSE_TIME.slice(0, 2));
  const closeMinute = REGISTER_CLOSE_TIME.slice(3);
  const closeLabel = `${((closeHour + 11) % 12) + 1}:${closeMinute}${closeHour >= 12 ? "pm" : "am"}`;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Attendance</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Today&apos;s Attendance</h1>
        <p className="text-small text-[var(--muted)]">Registers close at {closeLabel}.</p>
      </div>

      <form className="flex items-center gap-2" action="/attendance">
        <label className="text-small text-[var(--ink-2)]" htmlFor="date">
          Date
        </label>
        <Input id="date" type="date" name="date" defaultValue={date} className="w-auto bg-[var(--surface)]" />
      </form>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className="font-heading text-h3 font-medium text-[var(--ink)]">
            {submittedCount}/{withPupils.length}
          </p>
          <p className="text-small text-[var(--muted)]">Registers in</p>
        </div>
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className="font-heading text-h3 font-medium text-[var(--success)]">{presentTotal}</p>
          <p className="text-small text-[var(--muted)]">Present</p>
        </div>
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className="font-heading text-h3 font-medium text-[var(--ink)]">{lateTotal}</p>
          <p className="text-small text-[var(--muted)]">Late</p>
        </div>
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className="font-heading text-h3 font-medium text-[var(--alert)]">{absentTotal}</p>
          <p className="text-small text-[var(--muted)]">Absent</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-[var(--surface)]">
        <table className="w-full text-left text-small">
          <thead className="bg-[var(--surface-2)] text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">
            <tr>
              <th className="px-4 py-2.5">Class</th>
              <th className="px-4 py-2.5">Teacher</th>
              <th className="px-4 py-2.5">Students</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {classes.map((c) => (
              <tr key={c.id} className="border-t border-border">
                <td className="px-4 py-2.5 font-medium text-[var(--ink)]">{c.name}</td>
                <td className="px-4 py-2.5 text-[var(--ink-2)]">{c.leadTeacher?.name ?? "Unassigned"}</td>
                <td className="px-4 py-2.5 text-[var(--ink-2)]">{c.pupils.length}</td>
                <td className="px-4 py-2.5">
                  {c.pupils.length === 0 ? (
                    <span className="text-[var(--muted-2)]">No students</span>
                  ) : c.submittedAt ? (
                    <span className="rounded-full bg-[var(--success-bg)] px-2 py-0.5 text-tiny font-medium text-[var(--success)]">
                      Submitted at{" "}
                      {new Intl.DateTimeFormat("en-GB", {
                        timeZone: "Europe/London",
                        hour: "numeric",
                        minute: "2-digit",
                      }).format(c.submittedAt)}
                    </span>
                  ) : c.markedCount > 0 ? (
                    <span className="rounded-full bg-[var(--warn-bg)] px-2 py-0.5 text-tiny font-medium text-[var(--ink-2)]">
                      In progress · {c.markedCount}/{c.pupils.length} marked
                    </span>
                  ) : (
                    <span className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-tiny font-medium text-[var(--muted)]">
                      Not marked
                    </span>
                  )}
                </td>
                <td className="px-4 py-2.5 text-right">
                  {c.pupils.length > 0 && (
                    <Link
                      href={`/attendance/${c.id}?date=${date}`}
                      className={cn(
                        "text-small font-medium hover:underline",
                        c.submittedAt ? "text-[var(--ink-2)]" : "text-[var(--primary)]",
                      )}
                    >
                      {c.submittedAt ? "View" : "Mark it now"}
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
