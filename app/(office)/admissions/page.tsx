import Link from "next/link";
import { LogApplicantForm } from "@/components/office/log-applicant-form";
import { ADMISSION_STAGES, slaStatus, type AdmissionStage, type PriorityBand } from "@/lib/derive/admissions";
import { getMadrasah, listApplicants } from "@/lib/db/queries";
import { cn } from "@/lib/utils";

const PRIORITY_BANDS: PriorityBand[] = ["High", "Medium", "Standard"];

const BAND_STYLE: Record<PriorityBand, string> = {
  High: "bg-[var(--alert-bg)] text-[var(--alert)]",
  Medium: "bg-[var(--warn-bg)] text-[var(--ink-2)]",
  Standard: "bg-[var(--surface-2)] text-[var(--muted)]",
};

function buildHref(params: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value) search.set(key, value);
  const qs = search.toString();
  return qs ? `/admissions?${qs}` : "/admissions";
}

export default async function AdmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ stage?: string; band?: string }>;
}) {
  const { stage = "all", band = "all" } = await searchParams;

  const madrasah = await getMadrasah();
  const applicants = await listApplicants(madrasah.id);

  const inPipeline = applicants.filter((a) => a.stage !== "Enrolled" && a.stage !== "Declined").length;
  const overdueCount = applicants.filter((a) => slaStatus(a.stage, a.stageEnteredAt).overdue).length;

  let filtered = applicants;
  if (stage !== "all") filtered = filtered.filter((a) => a.stage === stage);
  if (band !== "all") filtered = filtered.filter((a) => a.priority.band === band);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">People</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Admissions</h1>
        <p className="text-small text-[var(--muted)]">
          Enquiry → Application → Assessment → Offer → Enrolled. Priority is scored from criteria, never typed.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className="font-heading text-h3 font-medium text-[var(--ink)]">{applicants.length}</p>
          <p className="text-small text-[var(--muted)]">Applicants</p>
        </div>
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className="font-heading text-h3 font-medium text-[var(--ink)]">{inPipeline}</p>
          <p className="text-small text-[var(--muted)]">In the pipeline</p>
        </div>
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className={cn("font-heading text-h3 font-medium", overdueCount > 0 ? "text-[var(--alert)]" : "text-[var(--ink)]")}>
            {overdueCount}
          </p>
          <p className="text-small text-[var(--muted)]">Past SLA</p>
        </div>
      </div>

      <LogApplicantForm />

      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={buildHref({ band: band === "all" ? undefined : band })}
          className={cn(
            "rounded-full px-3 py-1 text-small font-medium",
            stage === "all" ? "bg-primary text-primary-foreground" : "bg-[var(--surface-2)] text-[var(--ink-2)] hover:bg-border",
          )}
        >
          All ({applicants.length})
        </Link>
        {ADMISSION_STAGES.map((s) => {
          const count = applicants.filter((a) => a.stage === s).length;
          return (
            <Link
              key={s}
              href={buildHref({ stage: s, band: band === "all" ? undefined : band })}
              className={cn(
                "rounded-full px-3 py-1 text-small font-medium",
                stage === s ? "bg-primary text-primary-foreground" : "bg-[var(--surface-2)] text-[var(--ink-2)] hover:bg-border",
              )}
            >
              {s} ({count})
            </Link>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={buildHref({ stage: stage === "all" ? undefined : stage })}
          className={cn(
            "rounded-full px-3 py-1 text-small font-medium",
            band === "all" ? "bg-primary text-primary-foreground" : "bg-[var(--surface-2)] text-[var(--ink-2)] hover:bg-border",
          )}
        >
          All priority
        </Link>
        {PRIORITY_BANDS.map((b) => (
          <Link
            key={b}
            href={buildHref({ stage: stage === "all" ? undefined : stage, band: b })}
            className={cn(
              "rounded-full px-3 py-1 text-small font-medium",
              band === b ? "bg-primary text-primary-foreground" : "bg-[var(--surface-2)] text-[var(--ink-2)] hover:bg-border",
            )}
          >
            {b}
          </Link>
        ))}
      </div>

      <p className="text-small text-[var(--muted)]">{filtered.length} applicants</p>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-border bg-[var(--surface)] p-8 text-center text-small text-[var(--muted)]">
          No applicants match this filter.
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-[var(--surface)] shadow-sm">
          <table className="w-full text-left text-small">
            <thead className="bg-[var(--surface-2)] text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">
              <tr>
                <th className="px-4 py-2.5">Applicant</th>
                <th className="px-4 py-2.5">Year</th>
                <th className="px-4 py-2.5">Priority</th>
                <th className="px-4 py-2.5">Stage</th>
                <th className="px-4 py-2.5">SLA</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => {
                const sla = slaStatus(a.stage as AdmissionStage, a.stageEnteredAt);
                return (
                  <tr key={a.id} className="border-t border-border">
                    <td className="px-4 py-2.5">
                      <Link href={`/admissions/${a.id}`} className="font-medium text-[var(--primary)] hover:underline">
                        {a.firstName} {a.lastName}
                      </Link>
                      <p className="text-tiny text-[var(--muted)]">{a.guardianName}</p>
                    </td>
                    <td className="px-4 py-2.5 text-[var(--ink-2)]">{a.requestedYear}</td>
                    <td className="px-4 py-2.5">
                      <span className={cn("rounded-full px-2 py-0.5 text-tiny font-medium", BAND_STYLE[a.priority.band])}>
                        {a.priority.band} · {a.priority.score}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-[var(--ink-2)]">{a.stage}</td>
                    <td className="px-4 py-2.5">
                      {sla.slaDays !== null ? (
                        <span className={cn("text-tiny", sla.overdue ? "font-medium text-[var(--alert)]" : "text-[var(--muted)]")}>
                          {sla.daysInStage}d of {sla.slaDays}d{sla.overdue ? " · overdue" : ""}
                        </span>
                      ) : (
                        <span className="text-tiny text-[var(--muted)]">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
