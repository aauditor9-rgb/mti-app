import Link from "next/link";
import { AckPolicyButton, SignDocumentButton } from "@/components/parent/ack-buttons";
import { cn } from "@/lib/utils";
import {
  getCurrentGuardian,
  getHouseholdFeeSummaryForPupil,
  getMadrasah,
  listDocumentsForGuardian,
  listPoliciesForGuardian,
} from "@/lib/db/queries";

const STATUS_STYLE: Record<string, string> = {
  Paid: "bg-[var(--success-bg)] text-[var(--success)]",
  Due: "bg-[var(--warn-bg)] text-[var(--ink-2)]",
  Overdue: "bg-[var(--alert-bg)] text-[var(--alert)]",
};

export default async function ParentFeesPage({
  searchParams,
}: {
  searchParams: Promise<{ child?: string; tab?: string }>;
}) {
  const { child, tab = "fees" } = await searchParams;
  const madrasah = await getMadrasah();
  const guardianRow = await getCurrentGuardian(madrasah.id);
  if (!guardianRow) return null;
  const activeChild = guardianRow.children.find((c) => c.id === child) ?? guardianRow.children[0];
  if (!activeChild) return null;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Enrolment &amp; policies</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Fees &amp; Documents</h1>
      </div>

      <div className="flex gap-2">
        {(["fees", "documents"] as const).map((t) => (
          <Link
            key={t}
            href={`/parent/fees?tab=${t}${child ? `&child=${child}` : ""}`}
            className={cn(
              "rounded-full px-3 py-1 text-small font-medium",
              tab === t ? "bg-[var(--ink)] text-[var(--surface)]" : "bg-[var(--surface-2)] text-[var(--ink-2)]",
            )}
          >
            {t === "fees" ? "Fees" : "Documents to Sign"}
          </Link>
        ))}
      </div>

      {tab === "fees" && <FeesTab madrasahId={madrasah.id} pupilId={activeChild.id} />}
      {tab === "documents" && <DocumentsTab madrasahId={madrasah.id} guardianId={guardianRow.id} />}
    </div>
  );
}

async function FeesTab({ madrasahId, pupilId }: { madrasahId: string; pupilId: string }) {
  const fees = await getHouseholdFeeSummaryForPupil(madrasahId, pupilId);

  if (!fees) {
    return (
      <p className="rounded-xl border border-border bg-[var(--surface)] p-8 text-center text-small text-[var(--muted)]">
        No fee lines on record yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-border bg-[var(--surface)] p-5">
        <div className="flex items-center justify-between">
          <p className="font-medium text-[var(--ink)]">Household status</p>
          <span className={cn("rounded-full px-2.5 py-1 text-tiny font-medium", STATUS_STYLE[fees.householdStatus])}>{fees.householdStatus}</span>
        </div>
        <p className="mt-1 text-small text-[var(--ink-2)]">
          £{fees.totalPaid.toFixed(2)} paid of £{fees.totalInvoiced.toFixed(2)} · £{fees.totalOutstanding.toFixed(2)} outstanding
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-[var(--surface)]">
        {fees.lines.map((l) => (
          <div key={l.id} className="flex items-center justify-between border-t border-border p-3 first:border-t-0 text-small">
            <div>
              <p className="font-medium text-[var(--ink)]">{l.label}</p>
              <p className="text-tiny text-[var(--muted)]">
                {l.pupilName} · due {l.dueDate}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[var(--ink)]">£{Math.abs(l.amount).toFixed(2)}</span>
              <span className={cn("rounded-full px-2 py-0.5 text-tiny font-medium", STATUS_STYLE[l.status])}>{l.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

async function DocumentsTab({ madrasahId, guardianId }: { madrasahId: string; guardianId: string }) {
  const [documents, policies] = await Promise.all([
    listDocumentsForGuardian(madrasahId, guardianId),
    listPoliciesForGuardian(madrasahId, guardianId),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-border bg-[var(--surface)] p-5">
        <p className="mb-2 text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Documents to sign</p>
        {documents.length === 0 ? (
          <p className="text-small text-[var(--muted)]">No documents need your signature right now.</p>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {documents.map((d) => (
              <div key={d.id} className="flex items-center justify-between py-2.5 text-small">
                <div>
                  <p className="font-medium text-[var(--ink)]">{d.title}</p>
                  {d.description && <p className="text-tiny text-[var(--muted)]">{d.description}</p>}
                </div>
                <SignDocumentButton documentId={d.id} signed={!!d.signedAt} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-[var(--surface)] p-5">
        <p className="mb-2 text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">School policy acknowledgements</p>
        {policies.length === 0 ? (
          <p className="text-small text-[var(--muted)]">No policies published yet.</p>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {policies.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-2 text-small">
                <span className="text-[var(--ink)]">{p.title}</span>
                <AckPolicyButton policyId={p.id} acknowledged={!!p.acknowledgedAt} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
