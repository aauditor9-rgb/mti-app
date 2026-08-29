// Du'as tracker — "fully memorised" and per-item adherence, computed live from
// dua_pupil_status (invariant 1). A du'a counts as fully memorised only once both
// the Arabic and its translation are marked memorised.

export function isFullyMemorised(status: { arabicMemorised: boolean; translationMemorised: boolean }): boolean {
  return status.arabicMemorised && status.translationMemorised;
}

export function computeItemAdherence(
  statuses: { arabicMemorised: boolean; translationMemorised: boolean }[],
  pupilCount: number,
) {
  const fullyMemorisedCount = statuses.filter(isFullyMemorised).length;
  const pct = pupilCount === 0 ? 0 : Math.round((fullyMemorisedCount / pupilCount) * 100);
  return { fullyMemorisedCount, pct };
}
