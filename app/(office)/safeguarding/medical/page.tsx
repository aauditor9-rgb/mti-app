import { AddFirstAidForm } from "@/components/office/add-first-aid-form";
import { HubTabs } from "@/components/office/hub-tabs";
import { getMadrasah, listFirstAidLog, listPupils, listStaff } from "@/lib/db/queries";
import { SAFEGUARDING_TABS } from "@/lib/office-hubs";

export default async function MedicalRegisterPage() {
  const madrasah = await getMadrasah();
  const [pupils, firstAidLog, staff] = await Promise.all([
    listPupils(madrasah.id),
    listFirstAidLog(madrasah.id),
    listStaff(madrasah.id),
  ]);

  const onRoll = pupils.filter((p) => p.enrolmentState === "Enrolled");
  const withConditions = onRoll.filter((p) => p.allergies && p.allergies !== "None on file");

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <HubTabs tabs={SAFEGUARDING_TABS} />
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Operations · Safeguarding</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Medical Register</h1>
        <p className="text-small text-[var(--muted)]">
          {withConditions.length} student{withConditions.length === 1 ? "" : "s"} with recorded conditions.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-[var(--surface)]">
        <table className="w-full text-left text-small">
          <thead className="bg-[var(--surface-2)] text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">
            <tr>
              <th className="px-4 py-2.5">Student</th>
              <th className="px-4 py-2.5">Class</th>
              <th className="px-4 py-2.5">Condition / Allergy</th>
              <th className="px-4 py-2.5">Emergency contact</th>
            </tr>
          </thead>
          <tbody>
            {onRoll.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="px-4 py-2.5 font-medium text-[var(--ink)]">{p.name}</td>
                <td className="px-4 py-2.5 text-[var(--ink-2)]">{p.class?.name ?? "Unallocated"}</td>
                <td className="px-4 py-2.5 text-[var(--ink-2)]">{p.allergies || "None recorded"}</td>
                <td className="px-4 py-2.5 text-[var(--ink-2)]">{p.household?.guardians[0]?.phone ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AddFirstAidForm
        pupilOptions={onRoll.map((p) => ({ id: p.id, name: p.name }))}
        staffOptions={staff.map((s) => ({ id: s.id, name: s.name }))}
      />

      <div className="rounded-xl border border-border bg-[var(--surface)] p-5">
        <p className="mb-3 text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">First-aid log</p>
        {firstAidLog.length === 0 ? (
          <p className="text-small text-[var(--muted)]">No first-aid entries logged yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {firstAidLog.map((entry) => (
              <div key={entry.id} className="border-t border-border pt-3 first:border-t-0 first:pt-0">
                <p className="text-small font-medium text-[var(--ink)]">
                  {entry.date} · {entry.pupil?.name ?? "Unknown pupil"}
                </p>
                <p className="text-small text-[var(--ink-2)]">{entry.note}</p>
                {entry.loggedBy && <p className="text-tiny text-[var(--muted)]">by {entry.loggedBy.name}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
