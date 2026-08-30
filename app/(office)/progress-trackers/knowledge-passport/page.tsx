import Link from "next/link";
import { HubTabs } from "@/components/office/hub-tabs";
import { getMadrasah, listPupils } from "@/lib/db/queries";
import { PROGRESS_TRACKER_TABS } from "@/lib/office-hubs";

export default async function KnowledgePassportIndexPage() {
  const madrasah = await getMadrasah();
  const pupils = await listPupils(madrasah.id);
  const onRoll = pupils.filter((p) => p.enrolmentState === "Enrolled");

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <HubTabs tabs={PROGRESS_TRACKER_TABS} />
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Teaching &amp; learning · Progress trackers</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Islamic Knowledge Passport</h1>
        <p className="text-small text-[var(--muted)]">
          Every pupil&apos;s journey across the trackers, in one place — Du&apos;as, Surahs and Safar Qaaidah.
        </p>
      </div>

      {onRoll.length === 0 ? (
        <p className="rounded-xl border border-border bg-[var(--surface)] p-8 text-center text-small text-[var(--muted)]">
          No pupils on roll yet.
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-[var(--surface)] shadow-sm">
          <table className="w-full text-left text-small">
            <thead className="bg-[var(--surface-2)] text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">
              <tr>
                <th className="px-4 py-2.5">Pupil</th>
                <th className="px-4 py-2.5">Class</th>
              </tr>
            </thead>
            <tbody>
              {onRoll.map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="px-4 py-2.5">
                    <Link
                      href={`/progress-trackers/knowledge-passport/${p.displayId}`}
                      className="font-medium text-[var(--primary)] hover:underline"
                    >
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-[var(--ink-2)]">{p.class?.name ?? "Unallocated"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
