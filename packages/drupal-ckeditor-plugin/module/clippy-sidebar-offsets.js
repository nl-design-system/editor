// @ts-check

const DRAWER = 'clippy-validations-drawer';
const SIDEBAR_TOGGLE = 'SIDEBAR_TOGGLE';
const OPEN_INLINE_SIZE = '--clippy-drupal-open-sidebar-inline-size';
const PREVIEW_BAR = '.node-preview-container';
const PREVIEW_BAR_BLOCK_END = '--clippy-drupal-preview-bar-block-end';

/**
 * @param {{ displace: () => unknown }} drupal
 * @returns {() => void}
 */
export const observeSidebarOffsets = (drupal) => {
  const root = globalThis.document.documentElement;
  const edge = root.dir === 'rtl' ? 'left' : 'right';

  const update = () => {
    let openInlineSize = 0;
    for (const drawer of globalThis.document.querySelectorAll(DRAWER)) {
      const width = drawer.hasAttribute('open') ? Math.round(drawer.getBoundingClientRect().width) : 0;
      const inlineSize = width < root.clientWidth ? width : 0;
      openInlineSize = Math.max(openInlineSize, inlineSize);
      drawer.setAttribute(`data-offset-${edge}`, String(inlineSize));
    }
    if (openInlineSize) {
      root.style.setProperty(OPEN_INLINE_SIZE, `${openInlineSize}px`);
    } else {
      root.style.removeProperty(OPEN_INLINE_SIZE);
    }
    drupal.displace();
    const previewBar = globalThis.document.querySelector(PREVIEW_BAR);
    if (previewBar) {
      root.style.setProperty(PREVIEW_BAR_BLOCK_END, `${Math.round(previewBar.getBoundingClientRect().bottom)}px`);
    } else {
      root.style.removeProperty(PREVIEW_BAR_BLOCK_END);
    }
  };

  const observer = new globalThis.MutationObserver(update);
  observer.observe(globalThis.document.body, { childList: true });
  globalThis.addEventListener(SIDEBAR_TOGGLE, update);
  globalThis.addEventListener('resize', update);
  update();

  return () => {
    observer.disconnect();
    globalThis.removeEventListener(SIDEBAR_TOGGLE, update);
    globalThis.removeEventListener('resize', update);
  };
};

const { Drupal } = /** @type {{ Drupal?: { displace: () => unknown } }} */ (/** @type {unknown} */ (globalThis));
if (Drupal) observeSidebarOffsets(Drupal);
