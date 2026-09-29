import { coreValidationRules, coreValidations } from '@nl-design-system-community/clippy-a11y-validator';
import { beforeEach, describe, expect, it } from 'vitest';
import { ClippyDocument } from './index';
import { registerProxySource } from './proxySource';

const { PARAGRAPH_SHOULD_NOT_BE_EMPTY, PARAGRAPH_SHOULD_NOT_BE_ENTIRELY_BOLD } = coreValidationRules;
const BOLD_PROSE = 'Deze samenvatting is volledig dikgedrukt en veel te lang om nog als een kop door te gaan.';

let clippyDocument: ClippyDocument;
let anchor: HTMLInputElement;

beforeEach(() => {
  anchor = document.createElement('input');
  document.body.replaceChildren(anchor);
  clippyDocument = new ClippyDocument();
  clippyDocument.registerValidation(coreValidations[PARAGRAPH_SHOULD_NOT_BE_EMPTY]);
});

describe('registerProxySource', () => {
  it('validates what render puts in its detached container', async () => {
    const { id } = registerProxySource(clippyDocument, {
      anchor,
      label: 'Summary',
      render: (container) => container.replaceChildren(document.createElement('p')),
    });
    await new Promise((resolve) => setTimeout(resolve));

    expect(
      clippyDocument.violations.map(({ element, source }) => ({ connected: element.isConnected, source })),
    ).toEqual([{ connected: false, source: id }]);
  });

  it('renders again when one of its events fires and when the host calls update', () => {
    let renders = 0;
    const { update } = registerProxySource(clippyDocument, {
      anchor,
      events: ['input'],
      label: 'Summary',
      render: () => renders++,
    });

    anchor.dispatchEvent(new Event('input'));
    update();

    expect(renders).toBe(3);
  });

  it('stops rendering on its events once it unregisters', () => {
    let renders = 0;
    const { unregister } = registerProxySource(clippyDocument, {
      anchor,
      events: ['input'],
      label: 'Summary',
      render: () => renders++,
    });

    unregister();
    anchor.dispatchEvent(new Event('input'));

    expect(renders).toBe(1);
  });

  it('hands its focus and correction handlers to the page', async () => {
    clippyDocument.registerValidation(coreValidations[PARAGRAPH_SHOULD_NOT_BE_ENTIRELY_BOLD]);
    registerProxySource(clippyDocument, {
      anchor,
      correct: () => undefined,
      focus: () => undefined,
      label: 'Summary',
      render: (container) => {
        container.innerHTML = `<p><strong>${BOLD_PROSE}</strong></p>`;
      },
    });
    await new Promise((resolve) => setTimeout(resolve));

    expect(clippyDocument.violations.map(({ correctable, focusable }) => ({ correctable, focusable }))).toEqual([
      { correctable: true, focusable: true },
    ]);
  });

  it('hands focus and correction actions on its proxy content to the host', async () => {
    const received: [string, HTMLElement][] = [];
    registerProxySource(clippyDocument, {
      anchor,
      correct: ({ element }) => received.push(['correct', element]),
      focus: ({ element }) => received.push(['focus', element]),
      label: 'Summary',
      render: (container) => container.replaceChildren(document.createElement('p')),
    });
    await new Promise((resolve) => setTimeout(resolve));
    const [violation] = clippyDocument.violations;

    clippyDocument.dispatch({ type: 'focus', violation: violation! });
    clippyDocument.dispatch({ type: 'correct', violation: violation! });

    expect(received).toEqual([
      ['focus', violation!.element],
      ['correct', violation!.element],
    ]);
  });
});
