import { mount, unmountAll } from '@test/dom-fixtures';
import { afterEach, describe, expect, it } from 'vitest';
import {
  correctDuplicateHeadingOne,
  correctEmptyHeading,
  correctHeadingLevel,
  correctHeadingWithFormatting,
  correctMissingTopLevelHeading,
} from './corrector';

afterEach(unmountAll);

describe('heading correctors', () => {
  it('correctEmptyHeading removes the heading', () => {
    const root = mount('<h1></h1><p>body</p>');
    correctEmptyHeading(root.querySelector('h1')!)();
    expect(root.querySelector('h1')).toBeNull();
  });

  it('correctHeadingWithFormatting removes bold and italic from the heading', () => {
    const root = mount('<h2>Title <strong>bold</strong> <em>italic</em></h2>');
    correctHeadingWithFormatting(root.querySelector('h2')!)();
    expect(root.querySelector('strong')).toBeNull();
    expect(root.querySelector('em')).toBeNull();
    expect(root.querySelector('h2')!.textContent).toContain('bold');
  });

  it('correctHeadingLevel changes the heading tag to the target level', () => {
    const root = mount('<h1>Title</h1><h3>Sub</h3>');
    correctHeadingLevel(root.querySelector('h3')!, 2)();
    expect(root.querySelector('h3')).toBeNull();
    expect(root.querySelector('h2')!.textContent).toBe('Sub');
  });

  it('correctDuplicateHeadingOne demotes an h1 to h2', () => {
    const root = mount('<h1>One</h1><h1 id="dup">Two</h1>');
    correctDuplicateHeadingOne(root.querySelector('#dup')!)();
    expect(root.querySelectorAll('h1')).toHaveLength(1);
    expect(root.querySelector('h2')!.textContent).toBe('Two');
  });

  it('correctMissingTopLevelHeading promotes the target to h1', () => {
    const root = mount('<h2>Title</h2>');
    correctMissingTopLevelHeading(root.querySelector('h2')!)();
    expect(root.querySelector('h1')!.textContent).toBe('Title');
  });
});
