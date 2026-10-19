import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CustomEvents } from '@/events';
import { PageReview, type PageReviewOptions } from './index';

let review: PageReview | undefined;

const trigger = () => document.querySelector('clippy-accessibility-notifications');

const drawer = () => document.querySelector('clippy-validations-drawer');

const violationCount = () => trigger()?.violationsMap?.size;

const createPageReview = (options: Partial<PageReviewOptions> = {}) => {
  const mount = options.mount ?? document.body.appendChild(document.createElement('header'));
  return new PageReview({ ...options, mount });
};

const openDrawer = () =>
  globalThis.dispatchEvent(
    new CustomEvent(CustomEvents.OPEN_DOCUMENT_OVERVIEW, {
      detail: { identifier: 'clippy-page-review', mode: 'validations' },
    }),
  );

const validationItems = () => [
  ...(drawer()
    ?.shadowRoot?.querySelector('clippy-validations-list')
    ?.shadowRoot?.querySelectorAll('clippy-validation-item') ?? []),
];

const focusButtons = () =>
  validationItems().map((item) => item.shadowRoot?.querySelector('clippy-button')?.shadowRoot?.querySelector('button'));

beforeEach(() => {
  document.documentElement.lang = 'nl';
});

afterEach(() => {
  review?.destroy();
  review = undefined;
  document.body.replaceChildren();
});

describe('PageReview', () => {
  it('validates the main content region by default', async () => {
    document.body.innerHTML = '<h2></h2><main><h1>Titel</h1><h2></h2></main>';

    review = createPageReview();

    await expect.poll(violationCount).toBe(1);
  });

  it('validates the element matching the Review root selector', async () => {
    document.body.innerHTML =
      '<main><h1>Titel</h1><h2></h2></main><div id="content"><h1>Titel</h1><h2></h2><p></p></div>';

    review = createPageReview({ reviewRoot: '#content' });

    await expect.poll(violationCount).toBe(2);
  });

  it('falls back to the main content region when the Review root selector matches nothing', async () => {
    document.body.innerHTML = '<div role="main"><h1>Titel</h1><h2></h2></div><p></p>';

    review = createPageReview({ reviewRoot: '#missing' });

    await expect.poll(violationCount).toBe(1);
  });

  it('falls back to the body when the page has no main content region', async () => {
    document.body.innerHTML = '<h1>Titel</h1><h2></h2><div><p></p></div>';

    review = createPageReview();

    await expect.poll(violationCount).toBe(2);
  });

  it('offers no corrections, only the action that shows the element on the page', async () => {
    document.body.innerHTML =
      '<main><h1>Titel</h1><h3>Overgeslagen</h3><p>1 - Eerste item<br>2 - Tweede item</p></main>';
    review = createPageReview();
    await expect.poll(violationCount).toBe(2);

    openDrawer();
    await expect.poll(() => focusButtons().length).toBe(2);
    const buttonsPerItem = validationItems().map(
      (item) => item.shadowRoot?.querySelectorAll('.clippy-validation-item-actions clippy-button').length,
    );
    expect(buttonsPerItem).toEqual([1, 1]);
  });

  it('removes everything it added to the page when destroyed', () => {
    document.body.innerHTML = '<header></header><main><h1>Titel</h1></main>';
    const before = document.body.innerHTML;
    review = createPageReview({ mount: document.querySelector('header')! });

    review.destroy();
    review = undefined;

    expect(document.body.innerHTML).toBe(before);
  });
});
