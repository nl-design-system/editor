import { describe, expect, it } from 'vitest';
import fixture from '../cli/fixtures/document.html?raw';
import { coreValidations } from './components/index.ts';

const page = new DOMParser().parseFromString(fixture, 'text/html');

const elementValidations = Object.values(coreValidations).filter((validation) => validation.scope === 'element');

// Element validations must only depend on the element and its descendants; anything that reads its surroundings belongs in a page validation.
// This test fails when an element validation's result changes once the element is detached from its surroundings.
describe('element scope', () => {
  it.each(elementValidations.map((validation) => [validation.rule, validation] as const))(
    '%s judges an element the same when it is detached from the page',
    (_rule, validation) => {
      const elements = [...page.body.querySelectorAll<HTMLElement>(validation.selector)];

      expect(elements.length).toBeGreaterThan(0);
      expect(elements.map((element) => validation.condition(element.cloneNode(true) as HTMLElement))).toEqual(
        elements.map((element) => validation.condition(element)),
      );
    },
  );
});
