import type { Validation } from './types/validation.ts';

export type AutofixableSolutions = Record<string, { rule: string; solutionIds: string[] }>;

/**
 * Per rule in `@nl-design-system-unstable/documentation`, keyed by its id, the solutions a correction
 * of the validator carries out. Published as `autofixes.json` so the documentation can mark them.
 */
export const autofixableSolutions = (validations: readonly Validation[]): AutofixableSolutions =>
  Object.fromEntries(
    validations.flatMap(({ corrections, documentationId, rule }) => {
      const solutionIds = [
        ...new Set((corrections ?? []).flatMap(({ solutionId }) => (solutionId === undefined ? [] : [solutionId]))),
      ].sort();

      return documentationId === undefined || solutionIds.length === 0
        ? []
        : [[documentationId, { rule, solutionIds }]];
    }),
  );
