import { coreValidationRules } from '@nl-design-system-community/clippy-a11y-validator';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Violation, ViolationsMap } from '@/types/validation';
import '@/components/toolbar/toolbar-accessibility-notifications';
import '@/components/validations/drawer';
import '@/components/validations/gutter';
import { CustomEvents } from '@/events';
import { VALIDATION_HOVER_HIGHLIGHT_NAMES } from '@/utils/highlights';
import { ClippyHub } from './index';

const IDENTIFIER = 'clippy-hub-test';

let target: HTMLElement;
let hub: ClippyHub | undefined;

const rulesIn = (map: ViolationsMap | undefined): string[] => [...(map?.values() ?? [])].map(({ rule }) => rule);

const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));

const createTrigger = () => document.body.appendChild(document.createElement('clippy-accessibility-notifications'));

beforeEach(() => {
  document.documentElement.lang = 'nl';
  target = document.createElement('div');
  document.body.replaceChildren(target);
});

afterEach(() => {
  vi.useRealTimers();
  hub?.destroy();
  hub = undefined;
  document.body.replaceChildren();
});

describe('ClippyHub', () => {
  it('validates only the target element and pushes the violations to the connected trigger', async () => {
    target.innerHTML = '<h1>Titel</h1><p></p>';
    document.body.append(document.createElement('h3'));
    const trigger = createTrigger();

    hub = new ClippyHub({ identifier: IDENTIFIER, target });
    hub.connect({ trigger });
    await hub.validate();

    expect(trigger.identifier).toBe(IDENTIFIER);
    expect(rulesIn(trigger.violationsMap)).toEqual([coreValidationRules.PARAGRAPH_SHOULD_NOT_BE_EMPTY]);
  });

  it('feeds the drawer and the gutter the same violations, target and identifier', async () => {
    target.innerHTML = '<h1>Titel</h1><p></p>';
    const drawer = document.body.appendChild(document.createElement('clippy-validations-drawer'));
    const gutter = document.body.appendChild(document.createElement('clippy-validations-gutter'));

    hub = new ClippyHub({ identifier: IDENTIFIER, target });
    hub.connect({ drawer, gutter });
    await hub.validate();

    expect(drawer.identifier).toBe(IDENTIFIER);
    expect(gutter.identifier).toBe(IDENTIFIER);
    expect(drawer.htmlDocument).toBe(target);
    expect(rulesIn(drawer.violationsMap)).toEqual([coreValidationRules.PARAGRAPH_SHOULD_NOT_BE_EMPTY]);
    expect(gutter.violationsMap).toBe(drawer.violationsMap);
  });

  it('gives a view connected after a validation the latest violations', async () => {
    target.innerHTML = '<h1>Titel</h1><p></p>';
    hub = new ClippyHub({ identifier: IDENTIFIER, target });
    await hub.validate();

    const trigger = createTrigger();
    hub.connect({ trigger });

    expect(rulesIn(trigger.violationsMap)).toEqual([coreValidationRules.PARAGRAPH_SHOULD_NOT_BE_EMPTY]);
  });

  it('lets the host adapt the violations before they reach the views', async () => {
    target.innerHTML = '<h1>Titel</h1><p></p>';
    const trigger = createTrigger();

    hub = new ClippyHub({ adaptViolations: () => new Map(), identifier: IDENTIFIER, target });
    hub.connect({ trigger });
    await hub.validate();

    expect(trigger.violationsMap?.size).toBe(0);
  });

  it('waits for media inside the target to settle before validating', async () => {
    target.innerHTML = '<h1>Titel</h1><video></video><p></p>';
    const trigger = createTrigger();
    hub = new ClippyHub({ identifier: IDENTIFIER, target });
    hub.connect({ trigger });

    const validated = hub.validate();
    await nextFrame();
    expect(trigger.violationsMap).toBeUndefined();

    target.querySelector('video')?.dispatchEvent(new Event('loadedmetadata'));
    await validated;
    expect(rulesIn(trigger.violationsMap)).toContain(coreValidationRules.PARAGRAPH_SHOULD_NOT_BE_EMPTY);
  });

  it('stops waiting for media that never settles', async () => {
    vi.useFakeTimers();
    target.innerHTML = '<h1>Titel</h1><video></video><p></p>';
    const trigger = createTrigger();
    hub = new ClippyHub({ identifier: IDENTIFIER, target });
    hub.connect({ trigger });

    const validated = hub.validate();
    await vi.advanceTimersByTimeAsync(10_000);
    await validated;

    expect(rulesIn(trigger.violationsMap)).toContain(coreValidationRules.PARAGRAPH_SHOULD_NOT_BE_EMPTY);
  });

  it('stops pushing results once destroyed', async () => {
    target.innerHTML = '<h1>Titel</h1><p></p>';
    const trigger = createTrigger();
    hub = new ClippyHub({ identifier: IDENTIFIER, target });
    hub.connect({ trigger });

    hub.destroy();
    await hub.validate();

    expect(trigger.violationsMap).toBeUndefined();
  });
});

describe('ClippyHub drawer session', () => {
  const createDrawer = () => document.body.appendChild(document.createElement('clippy-validations-drawer'));

  const openDrawer = () =>
    globalThis.dispatchEvent(
      new CustomEvent(CustomEvents.OPEN_DOCUMENT_OVERVIEW, { detail: { identifier: IDENTIFIER, mode: 'validations' } }),
    );

  const closeDrawer = () =>
    globalThis.dispatchEvent(
      new CustomEvent(CustomEvents.CLOSE_VALIDATIONS_DRAWER, { detail: { identifier: IDENTIFIER } }),
    );

  const focusButtons = (drawer: Element) =>
    [
      ...(drawer.shadowRoot
        ?.querySelector('clippy-validations-list')
        ?.shadowRoot?.querySelectorAll('clippy-validation-item') ?? []),
    ].map((item) =>
      item.shadowRoot?.querySelector('clippy-button[purpose="secondary"]')?.shadowRoot?.querySelector('button'),
    );

  const highlightedText = () =>
    Object.values(VALIDATION_HOVER_HIGHLIGHT_NAMES).flatMap((name) =>
      [...(CSS.highlights.get(name)?.keys() ?? [])].map((range) => range.toString()),
    );

  it('re-validates the target when its drawer opens', async () => {
    target.innerHTML = '<h1>Titel</h1><p></p>';
    const trigger = createTrigger();
    hub = new ClippyHub({ identifier: IDENTIFIER, target });
    hub.connect({ drawer: createDrawer(), trigger });
    await hub.validate();
    expect(trigger.violationsMap?.size).toBe(1);

    target.append(document.createElement('p'));
    openDrawer();

    await expect.poll(() => trigger.violationsMap?.size).toBe(2);
  });

  it('moves focus into the drawer when it opens, and back to the trigger when it closes', async () => {
    target.innerHTML = '<h1>Titel</h1><p></p>';
    const trigger = createTrigger();
    const drawer = createDrawer();
    hub = new ClippyHub({ identifier: IDENTIFIER, target });
    hub.connect({ drawer, trigger });
    await hub.validate();

    openDrawer();
    await expect.poll(() => document.activeElement).toBe(drawer);

    closeDrawer();
    await expect.poll(() => document.activeElement).toBe(trigger);
  });

  it('hands the violation of a focused drawer item to focusViolation', async () => {
    target.innerHTML = '<h1>Titel</h1><p></p>';
    const drawer = createDrawer();
    const focused: Violation[] = [];
    hub = new ClippyHub({ focusViolation: (violation) => focused.push(violation), identifier: IDENTIFIER, target });
    hub.connect({ drawer });
    await hub.validate();

    openDrawer();
    await expect.poll(() => focusButtons(drawer).length).toBe(1);
    focusButtons(drawer)[0]?.click();

    expect(focused.map(({ element }) => element)).toEqual([target.querySelector('p')]);
  });

  it('scrolls a focused violation into view by default, without highlighting it', async () => {
    target.innerHTML = '<h1>Titel</h1><div style="block-size: 300vh"></div><h3>Overgeslagen</h3>';
    const heading = target.querySelector('h3')!;
    const drawer = createDrawer();
    hub = new ClippyHub({ identifier: IDENTIFIER, target });
    hub.connect({ drawer });
    await hub.validate();

    openDrawer();
    await expect.poll(() => focusButtons(drawer).length).toBe(1);
    focusButtons(drawer)[0]?.click();

    await expect.poll(() => heading.getBoundingClientRect().bottom <= window.innerHeight).toBe(true);
    expect(highlightedText()).toEqual([]);
  });
});
