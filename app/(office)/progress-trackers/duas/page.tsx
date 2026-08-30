import Link from "next/link";
import { AddDuaForm } from "@/components/office/add-dua-form";
import { DuaCatalogItem } from "@/components/office/dua-catalog-item";
import { HubTabs } from "@/components/office/hub-tabs";
import { ADMISSION_YEARS, type AdmissionYear } from "@/lib/derive/admissions";
import { computeItemAdherence } from "@/lib/derive/duas";
import { getDuaTrackerForYear, getMadrasah } from "@/lib/db/queries";
import { PROGRESS_TRACKER_TABS } from "@/lib/office-hubs";
import { cn } from "@/lib/utils";

function isAdmissionYear(value: string): value is AdmissionYear {
  return (ADMISSION_YEARS as readonly string[]).includes(value);
}

export default async function DuasTrackerPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const { year: rawYear } = await searchParams;
  const year: AdmissionYear = rawYear && isAdmissionYear(rawYear) ? rawYear : "Reception";

  const madrasah = await getMadrasah();
  const { pupils, items } = await getDuaTrackerForYear(madrasah.id, year);

  const itemsWithAdherence = items.map((item) => {
    const { fullyMemorisedCount, pct } = computeItemAdherence(item.statuses, pupils.length);
    return { item, fullyMemorisedCount, pct };
  });
  const averagePct =
    itemsWithAdherence.length === 0
      ? 0
      : Math.round(itemsWithAdherence.reduce((sum, i) => sum + i.pct, 0) / itemsWithAdherence.length);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <HubTabs tabs={PROGRESS_TRACKER_TABS} />
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Teaching &amp; learning · Progress trackers</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Du&apos;as Tracker</h1>
        <p className="text-small text-[var(--muted)]">
          Track each pupil&apos;s memorisation of the du&apos;as curriculum, year by year.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className="font-heading text-h3 font-medium text-[var(--ink)]">{items.length}</p>
          <p className="text-small text-[var(--muted)]">Du&apos;as in the {year} curriculum</p>
        </div>
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className="font-heading text-h3 font-medium text-[var(--ink)]">{averagePct}%</p>
          <p className="text-small text-[var(--muted)]">Average memorisation across du&apos;as</p>
        </div>
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className="font-heading text-h3 font-medium text-[var(--ink)]">{pupils.length}</p>
          <p className="text-small text-[var(--muted)]">Pupils on roll in {year}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {ADMISSION_YEARS.map((y) => (
          <Link
            key={y}
            href={`/progress-trackers/duas?year=${encodeURIComponent(y)}`}
            className={cn(
              "rounded-full px-3 py-1 text-small font-medium",
              y === year ? "bg-[var(--ink)] text-[var(--surface)]" : "bg-[var(--surface-2)] text-[var(--ink-2)] hover:bg-border",
            )}
          >
            {y}
          </Link>
        ))}
      </div>

      <AddDuaForm year={year} />

      <div className="flex flex-col gap-2">
        {itemsWithAdherence.length === 0 ? (
          <p className="rounded-xl border border-border bg-[var(--surface)] p-8 text-center text-small text-[var(--muted)]">
            No du&apos;as have been added to the {year} curriculum yet.
          </p>
        ) : (
          itemsWithAdherence.map(({ item, fullyMemorisedCount, pct }) => (
            <DuaCatalogItem
              key={item.id}
              itemId={item.id}
              name={item.name}
              fullyMemorisedCount={fullyMemorisedCount}
              pct={pct}
              pupils={pupils.map((p) => {
                const status = item.statuses.find((s) => s.pupilId === p.id);
                return {
                  pupilId: p.id,
                  pupilName: p.name,
                  arabicMemorised: status?.arabicMemorised ?? false,
                  translationMemorised: status?.translationMemorised ?? false,
                  readAtHome: status?.readAtHome ?? false,
                };
              })}
            />
          ))
        )}
      </div>
    </div>
  );
}
