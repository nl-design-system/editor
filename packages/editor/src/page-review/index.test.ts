import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CustomEvents } from '@/events';
import { PageReview, type PageReviewOptions } from './index';

let review: PageReview | undefined;

const trigger = () => document.querySelector('clippy-accessibility-notifications');

const drawer = () => document.querySelector('clippy-validations-drawer');

const violationCount = () => trigger()?.violationsMap?.size;

const gutterIndicators = () => [
  ...(document
    .querySelector('clippy-validations-gutter')
    ?.shadowRoot?.querySelectorAll<HTMLElement>('.clippy-validations-gutter__indicator') ?? []),
];

const createPageReview = (options: Partial<PageReviewOptions> = {}) => {
  const mount = 'mount' in options ? options.mount : document.body.appendChild(document.createElement('header'));
  return PageReview.mount({ ...options, mount });
};

const openDrawer = () =>
  globalThis.dispatchEvent(
    new CustomEvent(CustomEvents.OPEN_DOCUMENT_OVERVIEW, {
      detail: { identifier: 'clippy-page-review', mode: 'validations' },
    }),
  );

const closeDrawer = () =>
  globalThis.dispatchEvent(
    new CustomEvent(CustomEvents.CLOSE_VALIDATIONS_DRAWER, { detail: { identifier: 'clippy-page-review' } }),
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
  document.body.removeAttribute('style');
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

  it('removes everything it added to the page when destroyed', async () => {
    document.body.innerHTML = '<header></header><main><h1>Titel</h1><h3>Overgeslagen</h3></main>';
    const before = document.body.innerHTML;
    review = createPageReview({ mount: document.querySelector('header')! });
    openDrawer();
    await expect.poll(() => gutterIndicators().length).toBe(1);

    review.destroy();
    review = undefined;

    expect(document.body.innerHTML).toBe(before);
  });

  describe('gutter', () => {
    const indicatorFor = (element: Element) =>
      gutterIndicators().find(
        (indicator) => Math.abs(indicator.getBoundingClientRect().top - element.getBoundingClientRect().top) < 1,
      );

    const reviewWithDrawerOpen = async (count: number) => {
      review = createPageReview();
      await expect.poll(violationCount).toBe(count);
      openDrawer();
      await expect.poll(() => gutterIndicators().length).toBe(count);
    };

    it('shows markers without opening the drawer by default', async () => {
      document.body.innerHTML = '<main><h1>Titel</h1><h3>Overgeslagen</h3></main>';

      review = createPageReview();

      await expect.poll(() => gutterIndicators().length).toBe(1);
      openDrawer();
      await expect.poll(() => validationItems().length).toBe(1);
      closeDrawer();
      await new Promise(requestAnimationFrame);
      expect(gutterIndicators()).toHaveLength(1);
    });

    it('shows markers only while the drawer is open when set to the drawer', async () => {
      document.body.innerHTML = '<main><h1>Titel</h1><h3>Overgeslagen</h3></main>';
      review = createPageReview({ gutter: 'drawer' });
      await expect.poll(violationCount).toBe(1);
      expect(document.querySelector('clippy-validations-gutter')).toBeNull();

      openDrawer();
      await expect.poll(() => gutterIndicators().length).toBe(1);

      closeDrawer();
      await expect.poll(() => document.querySelector('clippy-validations-gutter')).toBeNull();
    });

    it('keeps its markers out of the tab order', async () => {
      document.body.innerHTML = '<main><h1>Titel</h1><h3>Overgeslagen</h3></main>';

      await reviewWithDrawerOpen(1);

      const buttons = [...document.querySelector('clippy-validations-gutter')!.shadowRoot!.querySelectorAll('button')];
      expect(buttons.length).toBeGreaterThan(0);
      expect(buttons.every(({ tabIndex }) => tabIndex === -1)).toBe(true);
    });

    it('opens the matching drawer item when an indicator is clicked', async () => {
      document.body.innerHTML =
        '<main><h1>Titel</h1><h3>Overgeslagen</h3><p>1 - Eerste item<br>2 - Tweede item</p></main>';
      await reviewWithDrawerOpen(2);

      const heading = document.querySelector('h3')!;
      indicatorFor(heading)!.querySelector('button')!.click();

      await expect.poll(() => validationItems().length).toBe(1);
      expect(validationItems()[0].range?.intersectsNode(heading)).toBe(true);
    });
  });

  describe('without a mount element', () => {
    it('floats the trigger over the page, outside the Review root', async () => {
      document.body.innerHTML = '<main><h1>Titel</h1><h3>Overgeslagen</h3></main>';

      review = createPageReview({ mount: undefined });

      await expect.poll(violationCount).toBe(1);
      expect(trigger()!.parentElement).toBe(document.body);
      expect(getComputedStyle(trigger()!).position).toBe('fixed');
    });

    it('applies the theme classes to its own elements, not to the page', () => {
      document.body.innerHTML = '<main><h1>Titel</h1></main>';

      review = createPageReview({ mount: undefined });

      for (const element of [drawer()!, trigger()!, document.querySelector('clippy-validations-gutter')!]) {
        expect([...element.classList]).toEqual(['ma-theme', 'clippy-theme', 'utrecht-theme']);
      }
      expect(document.documentElement.classList).toHaveLength(0);
      expect(document.body.classList).toHaveLength(0);
    });

    it('removes the floating trigger when destroyed', () => {
      document.body.innerHTML = '<main><h1>Titel</h1></main>';
      const before = document.body.innerHTML;
      review = createPageReview({ mount: undefined });

      review.destroy();
      review = undefined;

      expect(document.body.innerHTML).toBe(before);
    });
  });
});
