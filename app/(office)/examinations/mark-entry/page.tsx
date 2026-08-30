import Link from "next/link";
import { HubTabs } from "@/components/office/hub-tabs";
import { EXAMINATIONS_TABS } from "@/lib/office-hubs";
import { getMadrasah, listExaminations } from "@/lib/db/queries";

export default async function MarkEntryPage() {
  const madrasah = await getMadrasah();
  const examinations = await listExaminations(madrasah.id);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <HubTabs tabs={EXAMINATIONS_TABS} />
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Reports &amp; Assessment · Examinations</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Mark Entry</h1>
        <p className="text-small text-[var(--muted)]">Choose an exam to enter or edit scores.</p>
      </div>

      {examinations.length === 0 ? (
        <p className="rounded-xl border border-border bg-[var(--surface)] p-8 text-center text-small text-[var(--muted)]">
          No examinations set up yet.
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-[var(--surface)]">
          {examinations.map((e) => (
            <Link key={e.id} href={`/examinations/${e.id}`} className="flex items-center justify-between border-t border-border p-3 first:border-t-0 text-small hover:bg-[var(--surface-2)]">
              <span className="text-[var(--ink)]">{e.title}</span>
              <span className="text-tiny text-[var(--muted)]">{e.results.length} scores entered</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
