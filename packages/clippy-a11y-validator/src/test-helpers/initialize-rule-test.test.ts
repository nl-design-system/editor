import { describe, expect, it } from 'vitest';
import { defineValidation } from '../define-validation.ts';
import { initializeRuleTest } from './initialize-rule-test.ts';

const paragraphMustNotBeEmpty = defineValidation({
  condition: (paragraph) => paragraph.textContent !== '',
  correct: (paragraph) => () => paragraph.remove(),
  messages: { nl: { error: 'Deze alinea is leeg.' } },
  rule: 'TEST_PARAGRAPH_MUST_NOT_BE_EMPTY',
  scope: 'element',
  selector: 'p',
  severity: 'error',
});

const { fragment, validate, validator } = initializeRuleTest([paragraphMustNotBeEmpty]);
const initialFragment = fragment;

/** The pairs below lean on tests running in source order, which holds as long as `sequence.shuffle` stays off. */
describe('initializeRuleTest', () => {
  it('validates the html it renders into the fragment', () => {
    const [violation] = validate('<p></p>');

    expect(violation?.rule).toBe('TEST_PARAGRAPH_MUST_NOT_BE_EMPTY');
    expect(fragment.innerHTML).toBe('<p></p>');
  });

  it('accepts html that satisfies the rule', () => {
    expect(validate('<p>tekst</p>')).toHaveLength(0);
  });

  it('hands back the validator that validate uses', () => {
    validate('<p></p>');

    expect(validator.validate([fragment])).toHaveLength(1);
  });

  it('keeps the fragment attached as the only child of the body', () => {
    expect(fragment.isConnected).toBe(true);
    expect([...document.body.children]).toEqual([fragment]);
  });

  it('never swaps the fragment for a new element', () => {
    expect(fragment).toBe(initialFragment);
  });

  it('corrects the element inside the fragment it handed out', () => {
    const [violation] = validate('<p></p><p>tekst</p>');
    violation?.correct?.();

    expect(fragment.innerHTML).toBe('<p>tekst</p>');
  });

  it('leaves content behind for the next test to clean up', () => {
    validate('<p></p><p></p>');

    expect(fragment.children).toHaveLength(2);
  });

  it('starts with an empty fragment even after the previous test filled it', () => {
    expect(fragment.innerHTML).toBe('');
  });

  it('lets a test put siblings next to the fragment', () => {
    document.body.replaceChildren(document.createElement('h1'), fragment);

    expect(document.body.children).toHaveLength(2);
  });

  it('removes siblings the previous test added to the body', () => {
    expect([...document.body.children]).toEqual([fragment]);
  });

  describe('inside a nested describe', () => {
    it('still runs the setup before every test', () => {
      expect(fragment.innerHTML).toBe('');
      expect(fragment.isConnected).toBe(true);
    });
  });
});
