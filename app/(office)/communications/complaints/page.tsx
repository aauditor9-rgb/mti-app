import { AddComplaintForm } from "@/components/office/add-complaint-form";
import { ComplaintRow } from "@/components/office/complaint-row";
import { complaintSlaStatus } from "@/lib/derive/complaints";
import { getMadrasah, listComplaints, listPupils, listStaff } from "@/lib/db/queries";

export default async function ComplaintsPage() {
  const madrasah = await getMadrasah();
  const [complaints, pupils, staff] = await Promise.all([
    listComplaints(madrasah.id),
    listPupils(madrasah.id),
    listStaff(madrasah.id),
  ]);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Operations · Communications</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Complaints</h1>
        <p className="text-small text-[var(--muted)]">
          Formal complaints acknowledged within 5 working days and answered within 10.
        </p>
      </div>

      <AddComplaintForm
        pupilOptions={pupils.filter((p) => p.enrolmentState === "Enrolled").map((p) => ({ id: p.id, name: p.name }))}
        staffOptions={staff.map((s) => ({ id: s.id, name: s.name }))}
      />

      <div className="flex flex-col gap-2">
        {complaints.length === 0 ? (
          <p className="rounded-xl border border-border bg-[var(--surface)] p-8 text-center text-small text-[var(--muted)]">
            No complaints logged.
          </p>
        ) : (
          complaints.map((c) => {
            const sla = complaintSlaStatus(
              c.submittedAt,
              c.acknowledgedAt ? c.acknowledgedAt.toISOString() : null,
              c.resolvedAt ? c.resolvedAt.toISOString() : null,
            );
            return (
              <ComplaintRow
                key={c.id}
                id={c.id}
                reference={c.reference}
                title={c.title}
                raisedByName={c.raisedByName}
                category={c.category}
                submittedAt={c.submittedAt}
                investigatorName={c.investigator?.name ?? null}
                status={c.status}
                daysSinceSubmitted={sla.daysSinceSubmitted}
                ackOverdue={sla.ackOverdue}
                resolveOverdue={sla.resolveOverdue}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
