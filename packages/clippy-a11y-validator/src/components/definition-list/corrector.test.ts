import { mount, unmountAll } from '@test/dom-fixtures';
import { afterEach, describe, expect, it } from 'vitest';
import { correctDefinitionListMissingTerm, correctDefinitionTermMissingDescription } from './corrector';

afterEach(unmountAll);

describe('definition-list correctors', () => {
  it('correctDefinitionListMissingTerm fills the empty term with the default placeholder', () => {
    const root = mount('<dl><dt></dt><dd>description</dd></dl>');
    correctDefinitionListMissingTerm(root.querySelector('dl')!)();
    expect(root.querySelector('dt')!.textContent?.trim().length).toBeGreaterThan(0);
  });

  it('correctDefinitionTermMissingDescription fills the term with the default placeholder', () => {
    const root = mount('<dl><dt id="t"></dt><dd>description</dd></dl>');
    correctDefinitionTermMissingDescription(root.querySelector('#t')!)();
    expect(root.querySelector('#t')!.textContent?.trim().length).toBeGreaterThan(0);
  });
});
