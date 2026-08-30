import Link from "next/link";
import { AddSurahForm } from "@/components/office/add-surah-form";
import { SurahCatalogItem } from "@/components/office/surah-catalog-item";
import { HubTabs } from "@/components/office/hub-tabs";
import type { AdmissionYear } from "@/lib/derive/admissions";
import { computeItemAdherence } from "@/lib/derive/surahs";
import { getSurahTrackerForYear, getMadrasah } from "@/lib/db/queries";
import { PROGRESS_TRACKER_TABS } from "@/lib/office-hubs";
import { cn } from "@/lib/utils";

const SURAH_YEARS: AdmissionYear[] = ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6", "Year 7", "Year 8"];

function isSurahYear(value: string): value is AdmissionYear {
  return (SURAH_YEARS as readonly string[]).includes(value);
}

export default async function SurahsTrackerPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const { year: rawYear } = await searchParams;
  const year: AdmissionYear = rawYear && isSurahYear(rawYear) ? rawYear : "Year 1";

  const madrasah = await getMadrasah();
  const { pupils, items } = await getSurahTrackerForYear(madrasah.id, year);

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
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Surahs Tracker</h1>
        <p className="text-small text-[var(--muted)]">
          Track each pupil&apos;s memorisation and tajwīd of the surahs curriculum, year by year.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className="font-heading text-h3 font-medium text-[var(--ink)]">{items.length}</p>
          <p className="text-small text-[var(--muted)]">Surahs in the {year} curriculum</p>
        </div>
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className="font-heading text-h3 font-medium text-[var(--ink)]">{averagePct}%</p>
          <p className="text-small text-[var(--muted)]">Average memorisation (memorisation + tajwīd)</p>
        </div>
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className="font-heading text-h3 font-medium text-[var(--ink)]">{pupils.length}</p>
          <p className="text-small text-[var(--muted)]">Pupils on roll in {year}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {SURAH_YEARS.map((y) => (
          <Link
            key={y}
            href={`/progress-trackers/surahs?year=${encodeURIComponent(y)}`}
            className={cn(
              "rounded-full px-3 py-1 text-small font-medium",
              y === year ? "bg-primary text-primary-foreground" : "bg-[var(--surface-2)] text-[var(--ink-2)] hover:bg-border",
            )}
          >
            {y}
          </Link>
        ))}
      </div>

      <AddSurahForm year={year} />

      <div className="flex flex-col gap-2">
        {itemsWithAdherence.length === 0 ? (
          <p className="rounded-xl border border-border bg-[var(--surface)] p-8 text-center text-small text-[var(--muted)]">
            No surahs have been added to the {year} curriculum yet.
          </p>
        ) : (
          itemsWithAdherence.map(({ item, fullyMemorisedCount, pct }) => (
            <SurahCatalogItem
              key={item.id}
              itemId={item.id}
              name={item.name}
              verseCount={item.verseCount}
              fullyMemorisedCount={fullyMemorisedCount}
              pct={pct}
              pupils={pupils.map((p) => {
                const status = item.statuses.find((s) => s.pupilId === p.id);
                return {
                  pupilId: p.id,
                  pupilName: p.name,
                  memorised: status?.memorised ?? false,
                  tajweedSound: status?.tajweedSound ?? false,
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
