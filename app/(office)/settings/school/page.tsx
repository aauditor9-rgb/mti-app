import { SchoolSettingsForm } from "@/components/office/school-settings-form";
import { getMadrasah } from "@/lib/db/queries";

export default async function SchoolSettingsPage() {
  const madrasah = await getMadrasah();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Operations · Settings</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">School Settings</h1>
        <p className="text-small text-[var(--muted)]">School details and operational values in one place.</p>
      </div>

      <SchoolSettingsForm
        madrasah={{
          shortName: madrasah.shortName,
          address: madrasah.address,
          phone: madrasah.phone,
          email: madrasah.email,
          officePhone: madrasah.officePhone,
          officeEmail: madrasah.officeEmail,
          arrivalExpectedBy: madrasah.arrivalExpectedBy,
          markedLateAfter: madrasah.markedLateAfter,
          classesBeginAt: madrasah.classesBeginAt,
          absenceReportingDeadline: madrasah.absenceReportingDeadline,
          attendanceReviewThresholdPct: madrasah.attendanceReviewThresholdPct,
          termlyTuitionFee: madrasah.termlyTuitionFee,
          enrolmentFee: madrasah.enrolmentFee,
          siblingDiscountPct: madrasah.siblingDiscountPct,
        }}
      />
    </div>
  );
}
