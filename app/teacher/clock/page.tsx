import { ClockRow } from "@/components/office/clock-row";
import { computeClockStatus, formatHours } from "@/lib/derive/staff";
import { getCurrentStaff, getMadrasah, getStaffClockEvents } from "@/lib/db/queries";

export default async function TeacherClockPage() {
  const madrasah = await getMadrasah();
  const staff = await getCurrentStaff(madrasah.id);
  if (!staff) return null;

  const events = await getStaffClockEvents(staff.id);
  const status = computeClockStatus(events);

  const now = new Date();
  const last7 = [...events]
    .filter((e) => {
      const days = (now.getTime() - e.clockedInAt.getTime()) / 86400000;
      return days <= 7;
    })
    .sort((a, b) => b.clockedInAt.getTime() - a.clockedInAt.getTime());

  const dateFmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", weekday: "short", day: "numeric", month: "short" });
  const timeFmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", hour: "numeric", minute: "2-digit" });

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Today</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Check-in &amp; Clock</h1>
        <p className="text-small text-[var(--muted)]">
          Sign in when you arrive and sign out when you leave — this is also your timesheet for pay.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-[var(--surface)] shadow-sm">
        <ClockRow
          staffId={staff.id}
          name={staff.name}
          role={staff.title ?? staff.role}
          clockedIn={status.clockedIn}
          clockedInAt={status.clockedInAt ? status.clockedInAt.toISOString() : null}
          todayHours={status.todayHours}
          weekHours={status.weekHours}
        />
      </div>

      <div className="rounded-xl border border-border bg-[var(--surface)] p-5">
        <p className="mb-3 text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">My attendance record — last 7 days</p>
        {last7.length === 0 ? (
          <p className="text-small text-[var(--muted)]">No clock events yet.</p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-left text-small">
              <thead className="bg-[var(--surface-2)] text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">
                <tr>
                  <th className="px-3 py-2">Day</th>
                  <th className="px-3 py-2">Signed in</th>
                  <th className="px-3 py-2">Signed out</th>
                  <th className="px-3 py-2 text-right">Hours</th>
                </tr>
              </thead>
              <tbody>
                {last7.map((e) => {
                  const hours = e.clockedOutAt ? (e.clockedOutAt.getTime() - e.clockedInAt.getTime()) / 3600000 : null;
                  return (
                    <tr key={e.id} className="border-t border-border">
                      <td className="px-3 py-2 text-[var(--ink)]">{dateFmt.format(e.clockedInAt)}</td>
                      <td className="px-3 py-2 text-[var(--ink-2)]">{timeFmt.format(e.clockedInAt)}</td>
                      <td className="px-3 py-2 text-[var(--ink-2)]">{e.clockedOutAt ? timeFmt.format(e.clockedOutAt) : "—"}</td>
                      <td className="px-3 py-2 text-right text-[var(--ink-2)]">{hours !== null ? formatHours(hours) : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
