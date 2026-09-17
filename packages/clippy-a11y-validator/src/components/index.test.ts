import { describe, expect, it } from 'vitest';
import { coreValidationRules, coreValidations } from './index.ts';

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
});
