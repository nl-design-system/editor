import { describe, expect, it, vi } from 'vitest';
import { blockValidations, validatorEvents } from '@/constants';
import { baseCorrections, buildCorrection, extendCorrections, type Correction } from '@/correctors';

const el = (html: string): Element => {
  const container = document.createElement('div');
  container.innerHTML = html;
  return container.firstElementChild!;
};

describe('correction registry', () => {
  it('appends a working fix for a known rule', () => {
    const heading = el('<h1></h1>');
    const correct = buildCorrection({ element: heading, validatorKey: blockValidations.HEADING_MUST_NOT_BE_EMPTY });
    expect(correct).toBeTypeOf('function');
    correct!();
    expect(heading.isConnected).toBe(false); // removed from its (detached) parent
  });

  it('returns undefined for a result without a registered rule', () => {
    expect(buildCorrection({ element: el('<p></p>'), validatorKey: 'NOT_A_RULE' })).toBeUndefined();
    expect(buildCorrection({ element: el('<p></p>') })).toBeUndefined();
  });

  it('fills a missing term with the hard-coded default label', () => {
    const list = el('<dl><dt></dt><dd>x</dd></dl>');
    buildCorrection({ element: list, validatorKey: blockValidations.DESCRIPTION_LIST_MUST_CONTAIN_TERM })!();
    expect(list.querySelector('dt')!.textContent?.trim().length).toBeGreaterThan(0);
  });

  it('surfaces the image fix through a global event', () => {
    const img = el('<img src="x.png" alt="">');
    const correct = buildCorrection({ element: img, validatorKey: blockValidations.IMAGE_MUST_HAVE_ALT_TEXT });
    expect(correct).toBeTypeOf('function');

    const listener = vi.fn();
    globalThis.addEventListener(validatorEvents.OPEN_IMAGE_DIALOG, listener, { once: true });
    correct!();
    expect(listener).toHaveBeenCalledOnce();
  });

  it('extends the base set with a custom correction', () => {
    const marker: string[] = [];
    const custom: Correction = () => () => marker.push('fixed');
    const corrections = extendCorrections([['CUSTOM_RULE', custom]]);

    expect(corrections.size).toBe(baseCorrections.size + 1);
    buildCorrection({ element: el('<p></p>'), validatorKey: 'CUSTOM_RULE' }, corrections)!();
    expect(marker).toEqual(['fixed']);
  });
});
