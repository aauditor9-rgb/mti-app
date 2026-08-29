import Link from "next/link";
import { computeHifzSummary } from "@/lib/derive/hifz";
import { cn } from "@/lib/utils";
import {
  getCurrentGuardian,
  getHifzSummaryForPupil,
  getMadrasah,
  getPupilDuaTracker,
  getPupilSurahTracker,
} from "@/lib/db/queries";

export default async function ParentMemorisationPage({
  searchParams,
}: {
  searchParams: Promise<{ child?: string; tab?: string }>;
}) {
  const { child, tab = "journey" } = await searchParams;
  const madrasah = await getMadrasah();
  const guardianRow = await getCurrentGuardian(madrasah.id);
  if (!guardianRow) return null;
  const activeChild = guardianRow.children.find((c) => c.id === child) ?? guardianRow.children[0];
  if (!activeChild) return null;

  const isHifz = activeChild.class?.hifdhType && activeChild.class.hifdhType !== "None";
  const tabs = isHifz ? (["journey", "hifz", "tonight"] as const) : (["journey"] as const);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">{activeChild.name}&apos;s memorisation checklist</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Memorisation {tab === "journey" ? "Journey" : tab === "hifz" ? "· Hifz Dashboard" : tab === "tonight" ? "· Tonight's Prep" : ""}</h1>
      </div>

      {tabs.length > 1 && (
        <div className="flex gap-2">
          {tabs.map((t) => (
            <Link
              key={t}
              href={`/parent/memorisation?tab=${t}${child ? `&child=${child}` : ""}`}
              className={cn(
                "rounded-full px-3 py-1 text-small font-medium",
                tab === t ? "bg-[var(--ink)] text-[var(--surface)]" : "bg-[var(--surface-2)] text-[var(--ink-2)]",
              )}
            >
              {t === "journey" ? "Journey" : t === "hifz" ? "Hifz Dashboard" : "Tonight's Prep"}
            </Link>
          ))}
        </div>
      )}

      {tab === "journey" && activeChild.class?.yearBand && (
        <JourneyTab madrasahId={madrasah.id} pupilId={activeChild.id} year={activeChild.class.yearBand} />
      )}
      {tab === "hifz" && isHifz && <HifzDashboardTab pupilId={activeChild.id} />}
      {tab === "tonight" && isHifz && <TonightsPrepTab pupilId={activeChild.id} />}
    </div>
  );
}

async function JourneyTab({ madrasahId, pupilId, year }: { madrasahId: string; pupilId: string; year: "Reception" | "Year 1" | "Year 2" | "Year 3" | "Year 4" | "Year 5" | "Year 6" | "Year 7" | "Year 8" }) {
  const [duas, surahs] = await Promise.all([
    getPupilDuaTracker(madrasahId, pupilId, year),
    getPupilSurahTracker(madrasahId, pupilId, year),
  ]);

  const duasMemorised = duas.filter((d) => d.status?.arabicMemorised).length;
  const surahsMemorised = surahs.filter((s) => s.status?.memorised && s.status?.tajweedSound).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-border bg-[var(--surface)] p-5">
        <p className="mb-2 text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">
          Du&apos;as · {duasMemorised} of {duas.length} memorised
        </p>
        {duas.length === 0 ? (
          <p className="text-small text-[var(--muted)]">No du&apos;as catalogued for this year yet.</p>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {duas.map((d) => (
              <div key={d.id} className="flex items-center justify-between py-2 text-small">
                <span className="text-[var(--ink)]">{d.name}</span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-tiny font-medium",
                    d.status?.arabicMemorised ? "bg-[var(--success-bg)] text-[var(--success)]" : "bg-[var(--surface-2)] text-[var(--muted)]",
                  )}
                >
                  {d.status?.arabicMemorised ? "Memorised" : "Not yet heard"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-[var(--surface)] p-5">
        <p className="mb-2 text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">
          Surahs · {surahsMemorised} of {surahs.length} fully memorised
        </p>
        {surahs.length === 0 ? (
          <p className="text-small text-[var(--muted)]">No surahs catalogued for this year yet.</p>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {surahs.map((s) => (
              <div key={s.id} className="flex items-center justify-between py-2 text-small">
                <span className="text-[var(--ink)]">{s.name}</span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-tiny font-medium",
                    s.status?.memorised && s.status?.tajweedSound
                      ? "bg-[var(--success-bg)] text-[var(--success)]"
                      : "bg-[var(--surface-2)] text-[var(--muted)]",
                  )}
                >
                  {s.status?.memorised && s.status?.tajweedSound ? "Memorised" : "Not yet heard"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

async function HifzDashboardTab({ pupilId }: { pupilId: string }) {
  const records = await getHifzSummaryForPupil(pupilId);
  const summary = computeHifzSummary(records);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
        <p className="font-heading text-h3 font-medium text-[var(--ink)]">{summary.currentJuz ?? "—"}</p>
        <p className="text-small text-[var(--muted)]">Current juz</p>
      </div>
      <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
        <p className="font-heading text-h3 font-medium text-[var(--ink)]">{summary.pagesMemorised}</p>
        <p className="text-small text-[var(--muted)]">Pages memorised</p>
      </div>
      <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
        <p className="font-heading text-h3 font-medium text-[var(--ink)]">{summary.streakDays} 🔥</p>
        <p className="text-small text-[var(--muted)]">Day prep streak</p>
      </div>
    </div>
  );
}

async function TonightsPrepTab({ pupilId }: { pupilId: string }) {
  const records = (await getHifzSummaryForPupil(pupilId)).sort((a, b) => b.date.localeCompare(a.date));
  const latest = records[0];

  return (
    <div className="rounded-xl border border-border bg-[var(--surface)] p-5">
      {latest ? (
        <>
          <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Last heard · {latest.date}</p>
          <p className="font-heading text-h4 font-medium text-[var(--ink)]">
            {latest.type} · Juz {latest.juz}
            {latest.pageFrom && latest.pageTo && ` · pg ${latest.pageFrom}–${latest.pageTo}`}
          </p>
          <p className="text-small text-[var(--ink-2)]">Quality: {latest.quality}</p>
        </>
      ) : (
        <p className="text-small text-[var(--muted)]">No hifz records yet.</p>
      )}
    </div>
  );
}
