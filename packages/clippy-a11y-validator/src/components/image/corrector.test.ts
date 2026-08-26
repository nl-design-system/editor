import { mount, unmountAll } from '@test/dom-fixtures';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { validatorEvents } from '@/constants';
import { correctImageMissingAltText } from './corrector';

afterEach(unmountAll);

describe('correctImageMissingAltText', () => {
  it('dispatches an alt-text request with the current src', () => {
    const root = mount('<p>x</p><img src="cat.png" alt="">');
    const img = root.querySelector('img') as HTMLImageElement;
    const listener = vi.fn();
    globalThis.addEventListener(validatorEvents.OPEN_IMAGE_DIALOG, listener, { once: true });
    correctImageMissingAltText(img)();
    expect(listener).toHaveBeenCalledOnce();
    const { detail } = listener.mock.calls[0][0];
    expect(detail.replace).toBe(true);
    expect(detail.files[0].url).toContain('cat.png');
  });
});
