import { describe, expect, it } from 'vitest';
import type { Validation } from './types/validation.ts';
import { autofixableSolutions, autofixesJson } from './autofixes.ts';
import { coreValidations } from './components/index.ts';

const validation = (overrides: Partial<Validation>): Validation =>
  ({
    condition: () => true,
    messages: { nl: { title: 'x' } },
    rule: 'SPY',
    scope: 'element',
    selector: 'p',
    severity: 'info',
    ...overrides,
  }) as Validation;

const correction = (solutionId?: string) => ({
  execute: () => () => {},
  ...(solutionId === undefined ? {} : { solutionId }),
});

describe('autofixableSolutions', () => {
  it('lists the solution ids of each documented rule, sorted, keyed by its documentation id', () => {
    expect(
      autofixableSolutions([
        validation({ corrections: [correction('b'), correction('a')], documentationId: 'rule-id', rule: 'RULE' }),
      ]),
    ).toEqual({ 'rule-id': { rule: 'RULE', solutionIds: ['a', 'b'] } });
  });

  it('lists a solution id once', () => {
    expect(
      autofixableSolutions([
        validation({ corrections: [correction('a'), correction('a')], documentationId: 'rule-id' }),
      ]),
    ).toEqual({ 'rule-id': { rule: 'SPY', solutionIds: ['a'] } });
  });

  it('leaves out a rule without a documentation id or without a correction that names a solution', () => {
    expect(
      autofixableSolutions([
        validation({ corrections: [correction('a')] }),
        validation({ corrections: [correction()], documentationId: 'without-solution' }),
        validation({ documentationId: 'without-corrections' }),
      ]),
    ).toEqual({});
  });

  it('covers the core rules', () => {
    const autofixes = autofixableSolutions(Object.values(coreValidations));

    expect(autofixes['c4ef9fcd-016e-4f8f-aea7-6f7e5bcd6fe2']).toEqual({
      rule: 'HEADING_MUST_NOT_BE_EMPTY',
      solutionIds: ['b67939a5-91e1-4570-812e-f74fd314a749'],
    });
    expect(autofixes['af5a0a05-bf3a-4218-b0de-f635f00a1456']?.solutionIds).toEqual([
      '77ec1d80-1931-40f3-bf4a-502cdffb98c6',
      'e7347d49-e751-4f82-9105-0f8ef77e3bba',
    ]);
  });
});

describe('autofixesJson', () => {
  it('explains itself in a $comment next to the rules', () => {
    const json = autofixesJson([validation({ corrections: [correction('a')], documentationId: 'rule-id' })]);

    expect(json.$comment).toContain('@nl-design-system-unstable/documentation');
    expect(json['rule-id']).toEqual({ rule: 'SPY', solutionIds: ['a'] });
  });
});
