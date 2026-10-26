import type { AccessibilityNotifications } from '@nl-design-system-community/editor/accessibility-notifications';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { pageReviewBehavior } from './pageReviewBehavior.ts';

const trigger = () => document.querySelector<AccessibilityNotifications>('clippy-accessibility-notifications');

const violationCount = () => trigger()?.violationsMap?.size;

const drawerTitle = () =>
  document
    .querySelector('clippy-validations-drawer')
    ?.shadowRoot?.querySelector('#clippy-drawer-title')
    ?.textContent?.trim();

const once = (id: string, element: HTMLElement): HTMLElement[] => {
  const ids = element.dataset['once']?.split(' ') ?? [];
  if (ids.includes(id)) {
    return [];
  }
  element.dataset['once'] = [...ids, id].join(' ');
  return [element];
};

beforeEach(() => {
  vi.stubGlobal('once', once);
  document.documentElement.lang = 'nl';
});

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.replaceChildren();
  document.body.removeAttribute('data-once');
});

describe('pageReviewBehavior', () => {
  it('reviews the main content region by default', async () => {
    document.body.innerHTML = '<h2></h2><main><h1>Titel</h1><h2></h2></main>';

    pageReviewBehavior.attach();

    await expect.poll(violationCount).toBe(1);
  });

  it('renders the drawer in the page language, which Drupal sets to the interface language', async () => {
    document.documentElement.lang = 'en';
    document.body.innerHTML = '<main><h1>Titel</h1></main>';

    pageReviewBehavior.attach();

    await expect.poll(drawerTitle).toBe('Errors, warnings or tips');
  });

  it('adds one Page review per page when behaviors attach again after an AJAX request', () => {
    document.body.innerHTML = '<main><h1>Titel</h1><div id="ajax"></div></main>';

    pageReviewBehavior.attach();
    pageReviewBehavior.attach();

    expect(document.querySelectorAll('clippy-accessibility-notifications')).toHaveLength(1);
    expect(document.querySelectorAll('clippy-validations-drawer')).toHaveLength(1);
  });
});
