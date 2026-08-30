import { AddDocumentForm } from "@/components/office/add-document-form";
import { HubTabs } from "@/components/office/hub-tabs";
import { getMadrasah, listDocumentsWithSignatureCounts } from "@/lib/db/queries";
import { COMMUNICATIONS_TABS } from "@/lib/office-hubs";

export default async function DocumentsPage() {
  const madrasah = await getMadrasah();
  const documents = await listDocumentsWithSignatureCounts(madrasah.id);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <HubTabs tabs={COMMUNICATIONS_TABS} />
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Operations · Communications</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Documents to Sign</h1>
        <p className="text-small text-[var(--muted)]">
          Parents review and sign these from Fees &amp; documents. No document text is stored — title and description only.
        </p>
      </div>

      <AddDocumentForm />

      {documents.length === 0 ? (
        <p className="rounded-xl border border-border bg-[var(--surface)] p-8 text-center text-small text-[var(--muted)]">
          No documents published yet.
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-[var(--surface)] shadow-sm">
          {documents.map((d) => (
            <div key={d.id} className="flex items-center justify-between border-t border-border p-3 first:border-t-0 text-small">
              <div>
                <p className="font-medium text-[var(--ink)]">{d.title}</p>
                {d.description && <p className="text-tiny text-[var(--muted)]">{d.description}</p>}
              </div>
              <span className="rounded-full bg-[var(--surface-2)] px-2.5 py-1 text-tiny font-medium text-[var(--ink-2)]">
                {d.signedCount} of {d.totalGuardians} signed
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
