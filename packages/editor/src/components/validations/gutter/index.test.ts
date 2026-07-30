import { describe, it, expect, afterEach, vi } from 'vitest';
import { page } from 'vitest/browser';
import type { ValidationsMap } from '@/types/validation';
import { blockValidations } from '@/constants';
import type { Gutter } from './index';
import './index';

/** Build a Range that has a non-zero bounding rect so the gutter renders an indicator. */
const rangeOver = (element: Element): Range => {
  const range = document.createRange();
  range.selectNodeContents(element);
  return range;
};

describe('<clippy-validations-gutter>', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('labels the indicator button via aria-labelledby, without announcing the heading markdown comment', async () => {
    const content = document.createElement('p');
    content.textContent = 'Deze hele alinea is dikgedrukt.';
    document.body.append(content);

    const gutter = document.createElement('clippy-validations-gutter') as Gutter;
    document.body.append(gutter);

    const validationsMap: ValidationsMap = new Map([
      [
        rangeOver(content),
        { severity: 'warning', validatorKey: blockValidations.PARAGRAPH_SHOULD_NOT_BE_ENTIRELY_BOLD },
      ],
    ]);
    gutter.validationsMap = validationsMap;
    await gutter.updateComplete;

    // The button's accessible name resolves through aria-labelledby to the rendered
    // heading. The imported editor-error.md ships with a `<!-- @license -->` comment
    // that is stripped before rendering, so it must not leak into the name.
    const button = page.getByRole('button', { name: 'De hele alinea is dikgedrukt.' });
    await vi.waitFor(() => expect.element(button).toBeInTheDocument());

    const nameContainsComment = page.getByRole('button', { name: /@license/ });
    expect(nameContainsComment.query()).toBeNull();

    // The license comment must not be rendered into the DOM at all.
    expect(gutter.shadowRoot?.innerHTML).not.toContain('@license');
  });
});
