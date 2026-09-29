const css = (strings: TemplateStringsArray) => strings.join('');

const CLIPPY_STYLES = css`
  .ck-toolbar__items > .clippy-ckeditor-button:last-child {
    margin-inline-start: auto !important;
  }

  clippy-panel.clippy-ckeditor-panel:not([hidden]) {
    background: var(--ck-color-base-background);
    border-inline-start: 1px solid var(--ck-color-base-border);
    box-shadow: var(--ck-drop-shadow);
    box-sizing: border-box;
    display: block;
    inline-size: min(24rem, 100vw);
    inset-block: 0;
    inset-inline-end: 0;
    overflow-y: auto;
    padding: var(--ck-spacing-large);
    position: fixed;
    z-index: var(--ck-z-panel);
  }
`;

const sheet = new CSSStyleSheet();
sheet.replaceSync(CLIPPY_STYLES);

// Make sure styles are only applied once per document, even when more CKEditors are present
export function adoptClippyStyles(): void {
  if (
    typeof document === 'undefined' ||
    !('adoptedStyleSheets' in document) ||
    document.adoptedStyleSheets.includes(sheet)
  ) {
    return;
  }

  document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
}
