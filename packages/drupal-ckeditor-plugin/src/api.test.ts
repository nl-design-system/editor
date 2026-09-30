import {
  ClippyDocument,
  coreValidationRules,
  coreValidations,
  type DocumentViolation,
} from '@nl-design-system-community/ckeditor-plugin';
import { beforeEach, describe, expect, it } from 'vitest';
import { type ClippyApi, createClippyApi } from './api.ts';

const { LINK_SHOULD_NOT_BE_TOO_GENERIC } = coreValidationRules;

const validationPass = async () => {
  await Promise.resolve();
  await new Promise((resolve) => setTimeout(resolve));
};

const reported = (violations: readonly DocumentViolation[]) =>
  violations.map(({ element, label, rule }) => ({ element, label, rule }));

const registerCallToAction = ({ clippyDocument, registerProxySource }: ClippyApi, text: string) => {
  const wrapper = document.createElement('div');
  const input = document.createElement('input');
  input.value = text;
  wrapper.append(input);
  document.body.append(wrapper);
  const link = document.createElement('a');

  registerProxySource(clippyDocument, {
    anchor: wrapper,
    events: ['input'],
    label: 'Call to action',
    render: (container) => {
      if (link.parentNode !== container) container.replaceChildren(link);
      link.textContent = input.value;
    },
  });

  return { input, link };
};

let api: ClippyApi;

beforeEach(() => {
  document.body.replaceChildren();
  const clippyDocument = new ClippyDocument();
  Object.values(coreValidations).forEach((validation) => clippyDocument.registerValidation(validation));
  api = createClippyApi(clippyDocument);
});

describe('createClippyApi', () => {
  it('lets another module add the markup it renders to the report', async () => {
    const { link } = registerCallToAction(api, 'Klik hier');
    await validationPass();

    expect(reported(api.clippyDocument.violations)).toEqual([
      { element: link, label: 'Call to action', rule: LINK_SHOULD_NOT_BE_TOO_GENERIC },
    ]);
  });

  it('renders the markup again on the events the module listens for', async () => {
    const { input } = registerCallToAction(api, 'Klik hier');
    await validationPass();

    input.value = 'Vraag een paspoort aan';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await validationPass();

    expect(api.clippyDocument.violations).toEqual([]);
  });
});
