import { ClockRow } from "@/components/office/clock-row";
import { ClockSettingsForm } from "@/components/office/clock-settings-form";
import { getMadrasah, listStaffClockStatuses } from "@/lib/db/queries";

export default async function StaffClockPage() {
  const madrasah = await getMadrasah();
  const statuses = await listStaffClockStatuses(madrasah.id);
  const onSiteCount = statuses.filter((s) => s.clockedIn).length;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">People · Staff</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Staff Clock In/Out</h1>
        <p className="text-small text-[var(--muted)]">
          {onSiteCount} of {statuses.length} staff on site now. Hours total automatically for payroll.
        </p>
      </div>

      <ClockSettingsForm requireLocationToClockIn={madrasah.requireLocationToClockIn} clockMode={madrasah.clockMode} />

      <div className="overflow-hidden rounded-lg border border-border bg-[var(--surface)]">
        <div className="flex items-center gap-3 bg-[var(--surface-2)] p-3 text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">
          <span className="flex-1">Staff</span>
          <span className="w-[76px]">Status</span>
          <span className="w-20 text-right">Today</span>
          <span className="w-20 text-right">This week</span>
          <span className="w-[92px]" />
        </div>
        {statuses.map(({ staff: s, clockedIn, clockedInAt, todayHours, weekHours }) => (
          <ClockRow
            key={s.id}
            staffId={s.id}
            name={s.name}
            role={s.title ?? s.role}
            clockedIn={clockedIn}
            clockedInAt={clockedInAt ? clockedInAt.toISOString() : null}
            todayHours={todayHours}
            weekHours={weekHours}
          />
        ))}
      </div>
    </div>
  );
}
