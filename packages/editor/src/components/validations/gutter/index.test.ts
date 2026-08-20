import { describe, it, expect, afterEach, vi } from 'vitest';
import { page } from 'vitest/browser';
import type { ValidationsMap } from '@/types/validation';
import { blockValidations, inlineValidations, validationInteractionMode } from '@/constants';
import { CustomEvents, type OpenValidationGroupEvent } from '@/events';
import { VALIDATION_HIGHLIGHT_NAMES, VALIDATION_HOVER_HIGHLIGHT_NAMES } from '@/utils/highlights';
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
    CSS.highlights.clear();
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

  it('scopes OPEN_VALIDATION_GROUP to the standalone `identifier` prop when there is no context provider', async () => {
    // Mirrors the CKEditor setup: no `<clippy-context>` ancestor, and the gutter
    // is a sibling of the drawer rather than a descendant, so the identifier can
    // only reach the drawer via the prop.
    const content = document.createElement('p');
    content.textContent = 'Deze hele alinea is dikgedrukt.';
    document.body.append(content);

    const gutter = document.createElement('clippy-validations-gutter') as Gutter;
    gutter.mode = validationInteractionMode.DRAWER;
    gutter.identifier = 'clippy-ckeditor-1';
    document.body.append(gutter);

    const range = rangeOver(content);
    gutter.validationsMap = new Map([
      [range, { severity: 'warning', validatorKey: blockValidations.PARAGRAPH_SHOULD_NOT_BE_ENTIRELY_BOLD }],
    ]) satisfies ValidationsMap;
    await gutter.updateComplete;

    const onOpen = vi.fn();
    globalThis.addEventListener(CustomEvents.OPEN_VALIDATION_GROUP, onOpen);

    const button = gutter.shadowRoot?.querySelector<HTMLButtonElement>('.clippy-validations-gutter__toggle');
    button?.click();

    globalThis.removeEventListener(CustomEvents.OPEN_VALIDATION_GROUP, onOpen);

    expect(onOpen).toHaveBeenCalledOnce();
    const { detail } = onOpen.mock.calls[0][0] as OpenValidationGroupEvent;
    expect(detail.identifier).toBe('clippy-ckeditor-1');
    expect(detail.ranges).toEqual([range]);
  });

  it('marks a block-level indicator with its scope and severity so the band can be tinted', async () => {
    const content = document.createElement('p');
    content.textContent = 'Deze hele alinea is dikgedrukt.';
    document.body.append(content);

    const gutter = document.createElement('clippy-validations-gutter') as Gutter;
    document.body.append(gutter);
    gutter.validationsMap = new Map([
      [
        rangeOver(content),
        { scope: 'block', severity: 'warning', validatorKey: blockValidations.PARAGRAPH_SHOULD_NOT_BE_ENTIRELY_BOLD },
      ],
    ]) satisfies ValidationsMap;
    await gutter.updateComplete;

    const indicator = gutter.shadowRoot?.querySelector('.clippy-validations-gutter__indicator');
    expect(indicator?.getAttribute('data-scope')).toBe('block');
    expect(indicator?.getAttribute('data-severity')).toBe('warning');
  });

  it('highlights the text of inline validations and emphasises the hovered one', async () => {
    const content = document.createElement('p');
    content.innerHTML = 'Ga naar <a href="#">lees meer</a>.';
    document.body.append(content);

    const gutter = document.createElement('clippy-validations-gutter') as Gutter;
    document.body.append(gutter);

    const link = content.querySelector('a')!;
    const range = rangeOver(link);
    gutter.validationsMap = new Map([
      [range, { scope: 'inline', severity: 'info', validatorKey: inlineValidations.LINK_SHOULD_NOT_BE_TOO_GENERIC }],
    ]) satisfies ValidationsMap;
    await gutter.updateComplete;

    const highlight = CSS.highlights.get(VALIDATION_HIGHLIGHT_NAMES.info);
    expect(highlight && [...highlight]).toEqual([range]);

    const button = gutter.shadowRoot?.querySelector<HTMLButtonElement>('.clippy-validations-gutter__toggle');
    button?.dispatchEvent(new MouseEvent('mouseenter'));
    const hover = CSS.highlights.get(VALIDATION_HOVER_HIGHLIGHT_NAMES.info);
    expect(hover && [...hover]).toEqual([range]);

    button?.dispatchEvent(new MouseEvent('mouseleave'));
    expect(CSS.highlights.has(VALIDATION_HOVER_HIGHLIGHT_NAMES.info)).toBe(false);

    gutter.remove();
    expect(CSS.highlights.has(VALIDATION_HIGHLIGHT_NAMES.info)).toBe(false);
  });
});
