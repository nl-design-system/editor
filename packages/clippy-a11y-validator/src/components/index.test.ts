import * as documentationComponentRules from '@nl-design-system-unstable/documentation/dist/component-rules.json' with { type: 'json' };
import { describe, expect, it } from 'vitest';
import { coreValidationRules, coreValidations } from './index.ts';

const solutionIdsByRuleId = new Map(
  documentationComponentRules.rules.map(({ id, solutions }) => [id, solutions.map((solution) => solution.id)]),
);

describe('the core registry', () => {
  it('implements every declared rule', () => {
    expect(Object.keys(coreValidations).sort()).toEqual(Object.keys(coreValidationRules).sort());
  });

  /**
   * Components spread their rules into one flat object, so two different validations claiming the same key
   * would silently drop one of them. `list-item-should-not-be-empty` is deliberately shared between the two
   * list components — that collapses to a single entry because it is the same validation object.
   */
  it('keys every validation by its own rule', () => {
    const mismatched = Object.entries(coreValidations).filter(([key, validation]) => validation.rule !== key);

    expect(mismatched).toEqual([]);
  });

  /** A `{key}` placeholder is filled in per violation, so the rule's own tests cover it. */
  it('points every correction of a documented rule at one of its own solutions', () => {
    const misplaced = Object.values(coreValidations).flatMap(({ corrections, documentationId, rule }) =>
      documentationId === undefined
        ? []
        : (corrections ?? [])
            .filter(({ solutionId }) => !solutionId?.includes('{'))
            .filter(({ solutionId }) => !solutionIdsByRuleId.get(documentationId)?.includes(solutionId ?? ''))
            .map(({ solutionId }) => ({ rule, solutionId })),
    );

    expect(misplaced).toEqual([]);
  });
});
