import { describe, expect, it, vi } from 'vitest';
import { blockValidations } from '@/constants';
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

  it('passes the host definition-term label through', () => {
    const list = el('<dl><dt></dt><dd>x</dd></dl>');
    buildCorrection(
      { element: list, validatorKey: blockValidations.DESCRIPTION_LIST_MUST_CONTAIN_TERM },
      {
        definitionTermLabel: 'definitieterm',
      },
    )!();
    expect(list.querySelector('dt')!.textContent).toBe('definitieterm');
  });

  it('only offers the image fix when the host can collect alt text', () => {
    const img = el('<img src="x.png" alt="">');
    expect(buildCorrection({ element: img, validatorKey: blockValidations.IMAGE_MUST_HAVE_ALT_TEXT })).toBeUndefined();

    const onRequestAltText = vi.fn();
    buildCorrection({ element: img, validatorKey: blockValidations.IMAGE_MUST_HAVE_ALT_TEXT }, { onRequestAltText })!();
    expect(onRequestAltText).toHaveBeenCalledOnce();
  });

  it('extends the base set with a custom correction', () => {
    const marker: string[] = [];
    const custom: Correction = () => () => marker.push('fixed');
    const corrections = extendCorrections([['CUSTOM_RULE', custom]]);

    expect(corrections.size).toBe(baseCorrections.size + 1);
    buildCorrection({ element: el('<p></p>'), validatorKey: 'CUSTOM_RULE' }, {}, corrections)!();
    expect(marker).toEqual(['fixed']);
  });
});
