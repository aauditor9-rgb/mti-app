import Link from "next/link";
import { notFound } from "next/navigation";
import { AddSafarQaaidahItemForm } from "@/components/office/add-safar-qaaidah-item-form";
import { LevelTestSignoff } from "@/components/office/level-test-signoff";
import { SafarQaaidahItem } from "@/components/office/safar-qaaidah-item";
import { HubTabs } from "@/components/office/hub-tabs";
import { computeItemAdherence, type SafarCriterion } from "@/lib/derive/safar-qaaidah";
import { getSafarQaaidahTrackerForLevel, getMadrasah } from "@/lib/db/queries";
import { PROGRESS_TRACKER_TABS } from "@/lib/office-hubs";
import { cn } from "@/lib/utils";

const LEVEL_NUMBERS = Array.from({ length: 13 }, (_, i) => i + 1);

export default async function SafarQaaidahTrackerPage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string }>;
}) {
  const { level: rawLevel } = await searchParams;
  const parsedLevel = rawLevel ? Number(rawLevel) : 1;
  const levelNumber = LEVEL_NUMBERS.includes(parsedLevel) ? parsedLevel : 1;

  const madrasah = await getMadrasah();
  const { pupils, level } = await getSafarQaaidahTrackerForLevel(madrasah.id, levelNumber);
  if (!level) notFound();

  const criteria = level.criteria as SafarCriterion[];
  const criteriaLabel = criteria.join(" + ");

  const itemsWithAdherence = level.items.map((item) => {
    const { fullyMasteredCount, pct } = computeItemAdherence(criteria, item.statuses, pupils.length);
    return { item, fullyMasteredCount, pct };
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
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Safar Qaaidah Tracker</h1>
        <p className="text-small text-[var(--muted)]">
          Track each pupil&apos;s Qaaidah level progress. Shown for pupils in classes that teach Qaaidah (Reception–Year 2).
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className="font-heading text-h3 font-medium text-[var(--ink)]">{level.items.length}</p>
          <p className="text-small text-[var(--muted)]">Items in Level {levelNumber}</p>
        </div>
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className="font-heading text-h3 font-medium text-[var(--ink)]">{averagePct}%</p>
          <p className="text-small text-[var(--muted)]">Average mastery ({criteriaLabel})</p>
        </div>
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className="font-heading text-h3 font-medium text-[var(--ink)]">{pupils.length}</p>
          <p className="text-small text-[var(--muted)]">Pupils in the Qaaidah band</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {LEVEL_NUMBERS.map((n) => (
          <Link
            key={n}
            href={`/progress-trackers/safar-qaaidah?level=${n}`}
            className={cn(
              "rounded-full px-3 py-1 text-small font-medium",
              n === levelNumber ? "bg-[var(--ink)] text-[var(--surface)]" : "bg-[var(--surface-2)] text-[var(--ink-2)] hover:bg-border",
            )}
          >
            Level {n}
          </Link>
        ))}
      </div>

      <AddSafarQaaidahItemForm levelNumber={levelNumber} />

      <div className="flex flex-col gap-2">
        {itemsWithAdherence.length === 0 ? (
          <p className="rounded-xl border border-border bg-[var(--surface)] p-8 text-center text-small text-[var(--muted)]">
            No items have been added to Level {levelNumber} yet.
          </p>
        ) : (
          itemsWithAdherence.map(({ item, fullyMasteredCount, pct }) => (
            <SafarQaaidahItem
              key={item.id}
              itemId={item.id}
              name={item.name}
              criteria={criteria}
              fullyMasteredCount={fullyMasteredCount}
              pct={pct}
              pupils={pupils.map((p) => {
                const status = item.statuses.find((s) => s.pupilId === p.id);
                return {
                  pupilId: p.id,
                  pupilName: p.name,
                  recognitionMet: status?.recognitionMet ?? false,
                  makharijMet: status?.makharijMet ?? false,
                  fluencyMet: status?.fluencyMet ?? false,
                  accuracyMet: status?.accuracyMet ?? false,
                  readAtHome: status?.readAtHome ?? false,
                };
              })}
            />
          ))
        )}
      </div>

      <LevelTestSignoff
        levelNumber={levelNumber}
        testedByName={level.testedByName}
        testedByRole={level.testedByRole}
        testedAt={level.testedAt ? level.testedAt.toISOString() : null}
      />
    </div>
  );
}
