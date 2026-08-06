const css = (strings: TemplateStringsArray) => strings.join('');

const CLIPPY_STYLES = css`
  /* Re-apply basic CKEditor theme inside the clippy-editor-content-wrapper component */
  clippy-editor-content-wrapper > .ck-editor__editable {
    background: var(--ck-color-base-background);
  }

  clippy-editor-content-wrapper > .ck-editor__editable:not(.ck-focused) {
    border-color: var(--ck-color-base-border);
  }

  /* Push the accessibility button to the right edge when it's the last toolbar item */
  clippy-accessibility-notifications:last-child {
    margin-inline-start: auto !important;
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
