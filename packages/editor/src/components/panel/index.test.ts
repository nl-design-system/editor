import { coreValidationRules, coreValidations } from '@nl-design-system-community/clippy-a11y-validator';
import { waitFor } from '@testing-library/dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { DocumentViolation, SourceRegistration } from '@/document/types';
import { ClippyDocument } from '@/document';
import type { Panel } from './index';
import './index';

const { HEADING_MUST_NOT_BE_EMPTY, PARAGRAPH_SHOULD_NOT_BE_EMPTY, PARAGRAPH_SHOULD_NOT_BE_ENTIRELY_BOLD } =
  coreValidationRules;

const createSource = (html: string, label: string): SourceRegistration & { fragment: HTMLElement } => {
  const anchor = document.createElement('div');
  anchor.innerHTML = html;
  return { anchor, fragment: anchor, label };
};

const prose = (word: string) => `${word} is volledig dikgedrukt en veel te lang om nog als een kop door te gaan.`;
const bold = (word: string) => `<p><strong>${prose(word)}</strong></p>`;

const mountPanel = (clippyDocument: ClippyDocument, attributes: Record<string, string> = {}) => {
  const panel = document.createElement('clippy-panel');
  panel.clippyDocument = clippyDocument;
  Object.entries(attributes).forEach(([name, value]) => panel.setAttribute(name, value));
  document.body.append(panel);
  return panel;
};

const items = (panel: Panel) =>
  [...(panel.shadowRoot?.querySelectorAll('li') ?? [])].map((item) => ({
    label: item.querySelector('.clippy-panel__source')?.textContent?.trim(),
    message: item.querySelector('.clippy-panel__message')?.textContent?.trim(),
  }));

const itemElements = (panel: Panel) => [...(panel.shadowRoot?.querySelectorAll('li') ?? [])];

let clippyDocument: ClippyDocument;

beforeEach(() => {
  document.body.replaceChildren();
  clippyDocument = new ClippyDocument();
  clippyDocument.registerValidation(coreValidations[PARAGRAPH_SHOULD_NOT_BE_EMPTY]);
  clippyDocument.registerValidation(coreValidations[HEADING_MUST_NOT_BE_EMPTY]);
});

afterEach(() => {
  document.body.replaceChildren();
});

describe('<clippy-panel>', () => {
  it('lists violations from every source in document order with the source label and message', async () => {
    const intro = createSource('<p></p><h2></h2>', 'Intro');
    const body = createSource('<h2></h2><p></p>', 'Body');
    document.body.append(body.anchor);
    body.anchor.before(intro.anchor);
    clippyDocument.register(body);
    clippyDocument.register(intro);

    const panel = mountPanel(clippyDocument);

    await waitFor(() =>
      expect(items(panel)).toEqual([
        { label: 'Intro', message: 'Deze alinea is leeg.' },
        { label: 'Intro', message: 'Deze kop is leeg.' },
        { label: 'Body', message: 'Deze kop is leeg.' },
        { label: 'Body', message: 'Deze alinea is leeg.' },
      ]),
    );
  });

  it('updates when the violations change', async () => {
    const body = createSource('<p>Tekst</p>', 'Body');
    document.body.append(body.anchor);
    clippyDocument.register(body);
    const panel = mountPanel(clippyDocument);
    await waitFor(() => expect(panel.shadowRoot?.querySelector('ul')).not.toBeNull());

    body.fragment.querySelector('p')!.textContent = '';

    await waitFor(() => expect(items(panel)).toEqual([{ label: 'Body', message: 'Deze alinea is leeg.' }]));
  });

  it('renders violations that already existed before it was mounted', async () => {
    const body = createSource('<p></p>', 'Body');
    document.body.append(body.anchor);
    clippyDocument.register(body);
    await waitFor(() => expect(clippyDocument.violations).toHaveLength(1));

    const panel = mountPanel(clippyDocument);

    await waitFor(() => expect(items(panel)).toEqual([{ label: 'Body', message: 'Deze alinea is leeg.' }]));
  });

  it('limits the report to one source when filtered, and restores it when the filter is cleared', async () => {
    const intro = createSource('<p></p>', 'Intro');
    const body = createSource('<h2></h2>', 'Body');
    document.body.append(intro.anchor, body.anchor);
    clippyDocument.register(intro);
    const { id } = clippyDocument.register(body);

    const panel = mountPanel(clippyDocument, { source: id });

    await waitFor(() => expect(items(panel)).toEqual([{ label: 'Body', message: 'Deze kop is leeg.' }]));

    panel.removeAttribute('source');

    await waitFor(() =>
      expect(items(panel)).toEqual([
        { label: 'Intro', message: 'Deze alinea is leeg.' },
        { label: 'Body', message: 'Deze kop is leeg.' },
      ]),
    );
  });

  it('restores the full report when the filter is set to empty', async () => {
    const intro = createSource('<p></p>', 'Intro');
    const body = createSource('<h2></h2>', 'Body');
    document.body.append(intro.anchor, body.anchor);
    clippyDocument.register(intro);
    const { id } = clippyDocument.register(body);
    const panel = mountPanel(clippyDocument, { source: id });
    await waitFor(() => expect(items(panel)).toHaveLength(1));

    panel.setAttribute('source', '');

    await waitFor(() => expect(items(panel)).toHaveLength(2));
  });

  it('catches up on changes made while it was out of the document', async () => {
    const body = createSource('<p>Tekst</p>', 'Body');
    document.body.append(body.anchor);
    clippyDocument.register(body);
    const panel = mountPanel(clippyDocument);
    await waitFor(() => expect(panel.shadowRoot?.querySelector('ul')).not.toBeNull());
    panel.remove();
    body.fragment.querySelector('p')!.textContent = '';
    await waitFor(() => expect(clippyDocument.violations).toHaveLength(1));

    document.body.append(panel);

    await waitFor(() => expect(items(panel)).toEqual([{ label: 'Body', message: 'Deze alinea is leeg.' }]));
  });

  it('drops items of a source that unregisters', async () => {
    const intro = createSource('<p></p>', 'Intro');
    const body = createSource('<h2></h2>', 'Body');
    document.body.append(intro.anchor, body.anchor);
    const { unregister } = clippyDocument.register(intro);
    clippyDocument.register(body);
    const panel = mountPanel(clippyDocument);
    await waitFor(() => expect(items(panel)).toHaveLength(2));

    unregister();

    await waitFor(() => expect(items(panel)).toEqual([{ label: 'Body', message: 'Deze kop is leeg.' }]));
  });

  it('stops following the Clippy document once removed from the DOM', async () => {
    const body = createSource('<p>Tekst</p>', 'Body');
    document.body.append(body.anchor);
    clippyDocument.register(body);
    const panel = mountPanel(clippyDocument);
    await waitFor(() => expect(panel.shadowRoot?.querySelector('ul')).not.toBeNull());
    panel.remove();

    body.fragment.querySelector('p')!.textContent = '';
    await waitFor(() => expect(clippyDocument.violations).toHaveLength(1));

    expect(items(panel)).toEqual([]);
  });

  it('focuses the content of the source that owns an item when the item is clicked', async () => {
    const focused: [string, HTMLElement][] = [];
    const intro = createSource('<p></p>', 'Intro');
    const body = createSource('<p>Tekst</p><p></p>', 'Body');
    document.body.append(intro.anchor, body.anchor);
    clippyDocument.register({ ...intro, focus: ({ element }) => focused.push(['Intro', element]) });
    clippyDocument.register({ ...body, focus: ({ element }) => focused.push(['Body', element]) });
    const panel = mountPanel(clippyDocument);
    await waitFor(() => expect(items(panel)).toHaveLength(2));

    itemElements(panel)[1]!.querySelector<HTMLElement>('.clippy-panel__focus')!.click();

    expect(focused).toEqual([['Body', body.fragment.querySelectorAll('p')[1]]]);
  });

  it('corrects the flagged content through the source that owns it', async () => {
    clippyDocument.registerValidation(coreValidations[PARAGRAPH_SHOULD_NOT_BE_ENTIRELY_BOLD]);
    const corrected: string[] = [];
    const correctAs = (label: string) => (violation: DocumentViolation) => {
      corrected.push(label);
      violation.correct?.();
    };
    const intro = createSource(bold('Een'), 'Intro');
    const body = createSource(bold('Twee') + bold('Drie'), 'Body');
    document.body.append(intro.anchor, body.anchor);
    clippyDocument.register({ ...intro, correct: correctAs('Intro') });
    clippyDocument.register({ ...body, correct: correctAs('Body') });
    const panel = mountPanel(clippyDocument);
    await waitFor(() => expect(items(panel)).toHaveLength(3));

    itemElements(panel)[2]!.querySelector<HTMLElement>('.clippy-panel__correct')!.click();

    expect(corrected).toEqual(['Body']);
    expect(intro.fragment.innerHTML).toBe(bold('Een'));
    expect(body.fragment.innerHTML).toBe(`${bold('Twee')}<p>${prose('Drie')}</p>`);
    await waitFor(() => expect(items(panel)).toHaveLength(2));
  });

  it('offers a correction only on items whose validation offers one and whose source can apply it', async () => {
    clippyDocument.registerValidation(coreValidations[PARAGRAPH_SHOULD_NOT_BE_ENTIRELY_BOLD]);
    const intro = createSource(`${bold('Een')}<p></p>`, 'Intro');
    const body = createSource(bold('Twee'), 'Body');
    document.body.append(intro.anchor, body.anchor);
    clippyDocument.register({ ...intro, correct: (violation) => violation.correct?.() });
    clippyDocument.register(body);
    const panel = mountPanel(clippyDocument);
    await waitFor(() => expect(items(panel)).toHaveLength(3));

    expect(itemElements(panel).map((item) => item.querySelector('.clippy-panel__correct') !== null)).toEqual([
      true,
      false,
      false,
    ]);
  });

  it('renders an item its source cannot focus without a focus affordance', async () => {
    const intro = createSource('<p></p>', 'Intro');
    const body = createSource('<p></p>', 'Body');
    document.body.append(intro.anchor, body.anchor);
    clippyDocument.register({ ...intro, focus: () => undefined });
    clippyDocument.register(body);
    const panel = mountPanel(clippyDocument);
    await waitFor(() => expect(items(panel)).toHaveLength(2));

    expect(itemElements(panel).map((item) => item.querySelector('button') !== null)).toEqual([true, false]);
  });

  it('names each correction after the violation it corrects', async () => {
    clippyDocument.registerValidation(coreValidations[PARAGRAPH_SHOULD_NOT_BE_ENTIRELY_BOLD]);
    const body = createSource(bold('Een'), 'Body');
    document.body.append(body.anchor);
    clippyDocument.register({ ...body, correct: () => undefined });
    const panel = mountPanel(clippyDocument);
    await waitFor(() => expect(items(panel)).toHaveLength(1));

    expect(itemElements(panel)[0]!.querySelector('.clippy-panel__correct')?.textContent).toContain(
      'De hele alinea is dikgedrukt.',
    );
  });
});
