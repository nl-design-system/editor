import { coreValidationRules, coreValidations } from '@nl-design-system-community/clippy-a11y-validator';
import { beforeEach, describe, expect, it } from 'vitest';
import { ClippyPage } from './index';
import { registerProxySource } from './proxySource';

const { PARAGRAPH_SHOULD_NOT_BE_EMPTY } = coreValidationRules;

let page: ClippyPage;
let anchor: HTMLInputElement;

beforeEach(() => {
  anchor = document.createElement('input');
  document.body.replaceChildren(anchor);
  page = new ClippyPage();
  page.registerValidation(coreValidations[PARAGRAPH_SHOULD_NOT_BE_EMPTY]);
});

describe('registerProxySource', () => {
  it('validates what render puts in its detached container', async () => {
    const { id } = registerProxySource(page, {
      anchor,
      label: 'Summary',
      render: (container) => container.replaceChildren(document.createElement('p')),
    });
    await new Promise((resolve) => setTimeout(resolve));

    expect(page.violations.map(({ element, source }) => ({ connected: element.isConnected, source }))).toEqual([
      { connected: false, source: id },
    ]);
  });

  it('renders again when one of its events fires and when the host calls update', () => {
    let renders = 0;
    const { update } = registerProxySource(page, {
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
    const { unregister } = registerProxySource(page, {
      anchor,
      events: ['input'],
      label: 'Summary',
      render: () => renders++,
    });

    unregister();
    anchor.dispatchEvent(new Event('input'));

    expect(renders).toBe(1);
  });
});
