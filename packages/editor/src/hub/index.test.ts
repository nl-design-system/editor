import { coreValidationRules } from '@nl-design-system-community/clippy-a11y-validator';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ViolationsMap } from '@/types/validation';
import '@/components/toolbar/toolbar-accessibility-notifications';
import '@/components/validations/drawer';
import '@/components/validations/gutter';
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
