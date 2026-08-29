import { LeaveRequestRow } from "@/components/office/leave-request-row";
import { getMadrasah, listLeaveRequests } from "@/lib/db/queries";

export default async function LeaveRequestsPage() {
  const madrasah = await getMadrasah();
  const requests = await listLeaveRequests(madrasah.id);
  const pendingCount = requests.filter((r) => r.status === "Pending").length;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Attendance</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Leave Requests</h1>
        <p className="text-small text-[var(--muted)]">{pendingCount} awaiting a decision.</p>
      </div>

      {requests.length === 0 ? (
        <p className="rounded-xl border border-border bg-[var(--surface)] p-8 text-center text-small text-[var(--muted)]">
          No requests submitted yet.
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-[var(--surface)]">
          {requests.map((r) => (
            <LeaveRequestRow
              key={r.id}
              id={r.id}
              pupilName={r.pupil?.name ?? "Unknown pupil"}
              kind={r.kind}
              reason={r.kind === "Absence today" ? r.reportReason : r.holidayReason}
              startDate={r.startDate}
              endDate={r.endDate}
              explanation={r.explanation}
              status={r.status}
            />
          ))}
        </div>
      )}
    </div>
  );
}
