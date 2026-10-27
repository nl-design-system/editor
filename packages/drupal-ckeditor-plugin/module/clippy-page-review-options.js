// @ts-check

const THEME_CLASSES = ['ma-theme', 'clippy-theme', 'utrecht-theme'];

/**
 * @param {string} placementClass
 * @returns {HTMLElement}
 */
const createReviewElement = (placementClass) => {
  const reviewElement = globalThis.document.createElement('div');
  reviewElement.classList.add('clippy-page-review-mount', placementClass, ...THEME_CLASSES);
  return reviewElement;
};

/** @returns {HTMLElement | undefined} */
const adminBarMount = () => {
  const toolbar = globalThis.document.querySelector('#toolbar-bar');
  if (toolbar) {
    const reviewElement = createReviewElement('toolbar-tab');
    toolbar.append(reviewElement);
    return reviewElement;
  }
  const topBarActions = globalThis.document.querySelector('.top-bar__actions');
  if (topBarActions) {
    const reviewElement = createReviewElement('clippy-page-review-top-bar');
    topBarActions.prepend(reviewElement);
    return reviewElement;
  }
  return undefined;
};

/**
 * @param {{ clippy?: { pageReview?: { gutter?: 'always' | 'drawer', reviewRoot?: string } } } | undefined} settings
 * @returns {import('@nl-design-system-community/editor/page-review').PageReviewOptions}
 */
export const pageReviewOptions = (settings) => ({
  gutter: settings?.clippy?.pageReview?.gutter,
  mount: adminBarMount(),
  reviewRoot: settings?.clippy?.pageReview?.reviewRoot || undefined,
});
