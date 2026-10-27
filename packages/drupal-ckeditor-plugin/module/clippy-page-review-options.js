// @ts-check

const THEME_CLASSES = ['ma-theme', 'clippy-theme', 'utrecht-theme'];

/**
 * @param {Element} parent
 * @param {string} className
 * @param {'append' | 'prepend'} position
 * @returns {HTMLElement}
 */
const addMount = (parent, className, position) => {
  const mount = globalThis.document.createElement('div');
  mount.classList.add('clippy-page-review-mount', className, ...THEME_CLASSES);
  parent[position](mount);
  return mount;
};

/** @returns {HTMLElement | undefined} */
const adminBarMount = () => {
  const toolbar = globalThis.document.querySelector('#toolbar-bar');
  if (toolbar) {
    return addMount(toolbar, 'toolbar-tab', 'append');
  }
  const topBarActions = globalThis.document.querySelector('.top-bar__actions');
  if (topBarActions) {
    return addMount(topBarActions, 'clippy-page-review-top-bar', 'prepend');
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
