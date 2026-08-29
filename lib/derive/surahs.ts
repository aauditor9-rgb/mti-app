// Surahs tracker — "fully memorised" and per-item adherence, computed live from
// surah_pupil_status (invariant 1). A surah counts as fully memorised only once both
// memorisation and tajweed are marked sound, per the prototype's own header text
// ("fully memorised (memorisation + tajweed)") — read-at-home isn't part of that.

export function isFullyMemorised(status: { memorised: boolean; tajweedSound: boolean }): boolean {
  return status.memorised && status.tajweedSound;
}

export function computeItemAdherence(
  statuses: { memorised: boolean; tajweedSound: boolean }[],
  pupilCount: number,
) {
  const fullyMemorisedCount = statuses.filter(isFullyMemorised).length;
  const pct = pupilCount === 0 ? 0 : Math.round((fullyMemorisedCount / pupilCount) * 100);
  return { fullyMemorisedCount, pct };
}
