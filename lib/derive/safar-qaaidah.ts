// Safar Qaaidah tracker — "fully mastered" checks only the criteria a level actually
// lists (invariant 1), matching the prototype's own per-level header text (e.g.
// "fully mastered (Accuracy + Fluency)"). Levels vary which of the four criteria apply.

export type SafarCriterion = "Recognition" | "Makharij" | "Fluency" | "Accuracy";

export type SafarCriteriaStatus = {
  recognitionMet: boolean;
  makharijMet: boolean;
  fluencyMet: boolean;
  accuracyMet: boolean;
};

const CRITERION_FIELD: Record<SafarCriterion, keyof SafarCriteriaStatus> = {
  Recognition: "recognitionMet",
  Makharij: "makharijMet",
  Fluency: "fluencyMet",
  Accuracy: "accuracyMet",
};

export function isFullyMastered(criteria: SafarCriterion[], status: SafarCriteriaStatus): boolean {
  return criteria.every((c) => status[CRITERION_FIELD[c]]);
}

export function computeItemAdherence(criteria: SafarCriterion[], statuses: SafarCriteriaStatus[], pupilCount: number) {
  const fullyMasteredCount = statuses.filter((s) => isFullyMastered(criteria, s)).length;
  const pct = pupilCount === 0 ? 0 : Math.round((fullyMasteredCount / pupilCount) * 100);
  return { fullyMasteredCount, pct };
}
