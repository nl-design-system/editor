import { mount, unmountAll } from '@test/dom-fixtures';
import { afterEach, describe, expect, it } from 'vitest';
import { correctGenericLinkText } from './corrector';

afterEach(unmountAll);

describe('correctGenericLinkText', () => {
  it('selects the link range without throwing', () => {
    const root = mount('<p><a href="https://example.com">Lees meer</a></p>');
    const link = root.querySelector('a')!;
    expect(() => correctGenericLinkText(link)()).not.toThrow();
  });
});
