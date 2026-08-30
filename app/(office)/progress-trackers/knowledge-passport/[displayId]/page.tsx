import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { computeKnowledgePassport, type StrandSummary } from "@/lib/derive/knowledge-passport";
import { getKnowledgePassportForPupil, getMadrasah } from "@/lib/db/queries";

function StrandCard({ strand }: { strand: StrandSummary }) {
  return (
    <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
      <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">{strand.label}</p>
      {strand.applicable ? (
        <>
          <p className="mt-1 font-heading text-h3 font-medium text-[var(--ink)]">
            {strand.completedCount}/{strand.totalCount}
          </p>
          <div className="mt-2 h-[7px] overflow-hidden rounded-full bg-[var(--surface-2)]">
            <div className="h-full rounded-full bg-primary" style={{ width: `${strand.pct}%` }} />
          </div>
          <p className="mt-1 text-tiny text-[var(--muted)]">{strand.pct}% complete</p>
        </>
      ) : (
        <p className="mt-1 text-small text-[var(--muted)]">Not applicable to this pupil&apos;s class</p>
      )}
    </div>
  );
}

export default async function KnowledgePassportPupilPage(props: PageProps<"/progress-trackers/knowledge-passport/[displayId]">) {
  const { displayId } = await props.params;
  const madrasah = await getMadrasah();
  const data = await getKnowledgePassportForPupil(madrasah.id, displayId);
  if (!data) notFound();

  const passport = computeKnowledgePassport(data);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Teaching &amp; learning · Progress trackers</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Islamic Knowledge Passport</h1>
      </div>

      <div className="rounded-xl border border-border bg-[var(--surface)] p-5">
        <Link
          href="/progress-trackers/knowledge-passport"
          className="mb-4 inline-flex items-center gap-1 text-small font-medium text-[var(--ink-2)] hover:text-[var(--ink)]"
        >
          <ArrowLeft className="size-3.5" /> Back to Knowledge Passport
        </Link>

        <h2 className="font-heading text-h3 font-medium text-[var(--ink)]">{data.pupil.name}</h2>
        <p className="text-small text-[var(--ink-2)]">{data.pupil.class?.name ?? "Unallocated"}</p>

        {passport.overallTotal === 0 ? (
          <p className="mt-4 text-small text-[var(--muted)]">
            None of the built trackers (Du&apos;as, Surahs, Safar Qaaidah) apply to this pupil&apos;s class.
          </p>
        ) : (
          <div className="mt-4">
            <p className="font-heading text-h2 font-medium text-[var(--ink)]">{passport.overallPct}%</p>
            <p className="text-small text-[var(--muted)]">
              {passport.overallCompleted}/{passport.overallTotal} items verified across every strand
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StrandCard strand={passport.duaStrand} />
        <StrandCard strand={passport.surahStrand} />
        <StrandCard strand={passport.safarStrand} />
      </div>

      <div className="rounded-xl border border-border bg-[var(--surface)] p-5">
        <p className="mb-3 text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Recently verified</p>
        {passport.recentlyVerified.length === 0 ? (
          <p className="text-small text-[var(--muted)]">Nothing verified yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {passport.recentlyVerified.map((row, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg bg-[var(--surface-2)] p-3">
                <span className="text-small font-medium text-[var(--ink)]">{row.label}</span>
                <span className="text-tiny text-[var(--muted)]">{row.strand}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
