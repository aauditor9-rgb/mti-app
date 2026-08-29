// Knowledge Passport — a per-pupil cross-strand rollup, computed live from the three
// progress trackers actually built (Du'as, Surahs, Safar Qaaidah; invariant 1: nothing
// here is stored). The prototype's own screen also shows "Kalimas" and "Practical"
// strands with hardcoded, non-derivable numbers (e.g. a fixed "15" du'as and "30"
// surahs per pupil, unrelated to any real catalog) — those strands have no backing
// catalog anywhere in this app and are omitted rather than fabricated.
import { isFullyMemorised as isDuaFullyMemorised } from "./duas";
import { isFullyMemorised as isSurahFullyMemorised } from "./surahs";
import { isFullyMastered as isSafarFullyMastered, type SafarCriterion } from "./safar-qaaidah";

export type StrandSummary = {
  label: "Du'as" | "Surahs" | "Safar Qaaidah";
  applicable: boolean;
  completedCount: number;
  totalCount: number;
  pct: number;
};

export type RecentlyVerifiedRow = {
  label: string;
  strand: "Du'a" | "Surah" | "Safar Qaaidah";
  verifiedAt: Date;
};

type DuaItem = { name: string; statuses: { arabicMemorised: boolean; translationMemorised: boolean; updatedAt: Date }[] };
type SurahItem = { name: string; statuses: { memorised: boolean; tajweedSound: boolean; updatedAt: Date }[] };
type SafarItem = {
  name: string;
  statuses: {
    recognitionMet: boolean;
    makharijMet: boolean;
    fluencyMet: boolean;
    accuracyMet: boolean;
    updatedAt: Date;
  }[];
};
type SafarLevel = { criteria: SafarCriterion[]; items: SafarItem[] };

export function computeKnowledgePassport(input: {
  duasApplicable: boolean;
  duas: DuaItem[];
  surahsApplicable: boolean;
  surahs: SurahItem[];
  safarQaaidahApplicable: boolean;
  safarLevels: SafarLevel[];
}) {
  const duaCompleted = input.duas.filter((d) => d.statuses[0] && isDuaFullyMemorised(d.statuses[0])).length;
  const duaStrand: StrandSummary = {
    label: "Du'as",
    applicable: input.duasApplicable,
    completedCount: duaCompleted,
    totalCount: input.duas.length,
    pct: input.duas.length === 0 ? 0 : Math.round((duaCompleted / input.duas.length) * 100),
  };

  const surahCompleted = input.surahs.filter((s) => s.statuses[0] && isSurahFullyMemorised(s.statuses[0])).length;
  const surahStrand: StrandSummary = {
    label: "Surahs",
    applicable: input.surahsApplicable,
    completedCount: surahCompleted,
    totalCount: input.surahs.length,
    pct: input.surahs.length === 0 ? 0 : Math.round((surahCompleted / input.surahs.length) * 100),
  };

  const safarItems = input.safarLevels.flatMap((l) => l.items.map((item) => ({ level: l, item })));
  const safarCompleted = safarItems.filter(
    ({ level, item }) => item.statuses[0] && isSafarFullyMastered(level.criteria, item.statuses[0]),
  ).length;
  const safarStrand: StrandSummary = {
    label: "Safar Qaaidah",
    applicable: input.safarQaaidahApplicable,
    completedCount: safarCompleted,
    totalCount: safarItems.length,
    pct: safarItems.length === 0 ? 0 : Math.round((safarCompleted / safarItems.length) * 100),
  };

  const strands = [duaStrand, surahStrand, safarStrand].filter((s) => s.applicable);
  const overallCompleted = strands.reduce((sum, s) => sum + s.completedCount, 0);
  const overallTotal = strands.reduce((sum, s) => sum + s.totalCount, 0);
  const overallPct = overallTotal === 0 ? 0 : Math.round((overallCompleted / overallTotal) * 100);

  const recentlyVerified: RecentlyVerifiedRow[] = [
    ...input.duas
      .filter((d) => d.statuses[0] && isDuaFullyMemorised(d.statuses[0]))
      .map((d) => ({ label: d.name, strand: "Du'a" as const, verifiedAt: d.statuses[0].updatedAt })),
    ...input.surahs
      .filter((s) => s.statuses[0] && isSurahFullyMemorised(s.statuses[0]))
      .map((s) => ({ label: s.name, strand: "Surah" as const, verifiedAt: s.statuses[0].updatedAt })),
    ...safarItems
      .filter(({ level, item }) => item.statuses[0] && isSafarFullyMastered(level.criteria, item.statuses[0]))
      .map(({ item }) => ({ label: item.name, strand: "Safar Qaaidah" as const, verifiedAt: item.statuses[0].updatedAt })),
  ]
    .sort((a, b) => b.verifiedAt.getTime() - a.verifiedAt.getTime())
    .slice(0, 8);

  return { duaStrand, surahStrand, safarStrand, overallCompleted, overallTotal, overallPct, recentlyVerified };
}
