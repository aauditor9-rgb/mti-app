import { HubTabs } from "@/components/office/hub-tabs";
import { ATTENDANCE_LABELS, isAuthorisedAbsence, type AttendanceCode } from "@/lib/derive/attendance";
import { todayLondon } from "@/lib/derive/age";
import { ATTENDANCE_TABS } from "@/lib/office-hubs";
import { getMadrasah, listAbsencesInRange } from "@/lib/db/queries";
import { cn } from "@/lib/utils";

// Last 30 days — a reasonable working window rather than the whole year's history.
function daysAgo(n: number): string {
  const d = new Date(`${todayLondon()}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

export default async function AbsencesPage() {
  const madrasah = await getMadrasah();
  const absences = await listAbsencesInRange(madrasah.id, daysAgo(30));
  const unauthorisedCount = absences.filter((a) => !isAuthorisedAbsence(a.code)).length;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <HubTabs tabs={ATTENDANCE_TABS} />
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Attendance &amp; Behaviour</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Absences</h1>
        <p className="text-small text-[var(--muted)]">Last 30 days · {unauthorisedCount} unauthorised</p>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-[var(--surface)] shadow-sm">
        {absences.length === 0 ? (
          <p className="p-8 text-center text-small text-[var(--muted)]">No absences in this window.</p>
        ) : (
          absences.map((a) => (
            <div key={a.id} className="flex items-center gap-3 border-t border-border p-3 first:border-t-0 text-small">
              <span className="w-24 shrink-0 text-tiny text-[var(--muted)]">{a.date}</span>
              <span className="flex-1 text-[var(--ink)]">{a.pupil?.name ?? "Unknown pupil"}</span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-tiny font-medium",
                  isAuthorisedAbsence(a.code as AttendanceCode) ? "bg-[var(--warn-bg)] text-[var(--ink-2)]" : "bg-[var(--alert-bg)] text-[var(--alert)]",
                )}
              >
                {ATTENDANCE_LABELS[a.code as AttendanceCode]} {isAuthorisedAbsence(a.code as AttendanceCode) ? "(authorised)" : "(unauthorised)"}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
