import Link from "next/link";
import { ReportRow } from "@/components/office/report-row";
import { cn } from "@/lib/utils";
import { getMadrasah, listReportsForTerm, listTermsForMadrasah } from "@/lib/db/queries";

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ term?: string }> }) {
  const { term: termParam } = await searchParams;
  const madrasah = await getMadrasah();
  const terms = await listTermsForMadrasah(madrasah.id);
  const activeTerm = terms.find((t) => t.id === termParam) ?? terms[0];

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Reports &amp; Assessment</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Student Reports</h1>
      </div>

      {terms.length === 0 ? (
        <p className="rounded-xl border border-border bg-[var(--surface)] p-8 text-center text-small text-[var(--muted)]">
          No terms set up yet — add one in Settings &gt; Calendars.
        </p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {terms.map((t) => (
              <Link
                key={t.id}
                href={`/reports?term=${t.id}`}
                className={cn(
                  "rounded-full px-3 py-1 text-small font-medium",
                  activeTerm?.id === t.id ? "bg-[var(--ink)] text-[var(--surface)]" : "bg-[var(--surface-2)] text-[var(--ink-2)]",
                )}
              >
                {t.name}
              </Link>
            ))}
          </div>

          {activeTerm && <ReportsList madrasahId={madrasah.id} termId={activeTerm.id} />}
        </>
      )}
    </div>
  );
}

async function ReportsList({ madrasahId, termId }: { madrasahId: string; termId: string }) {
  const rows = await listReportsForTerm(madrasahId, termId);

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-[var(--surface)]">
      {rows.map(({ pupil, report }) => (
        <ReportRow
          key={pupil.id}
          pupilId={pupil.id}
          pupilName={pupil.name}
          termId={termId}
          summary={report?.summary ?? ""}
          status={report?.status ?? null}
        />
      ))}
    </div>
  );
}
