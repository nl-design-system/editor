import { describe, expect, it } from 'vitest';
import fixture from '../cli/fixtures/document.html?raw';
import { coreValidations } from './components/index.ts';

const page = new DOMParser().parseFromString(fixture, 'text/html');

const elementValidations = Object.values(coreValidations).filter((validation) => validation.scope === 'element');

// An element validation reads only its element and what it contains.
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
