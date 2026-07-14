const css = (strings: TemplateStringsArray) => strings.join('');

const CLIPPY_STYLES = css`
  /* Make sure the absolutely-positioned gutter aligns to the content instead of the toolbar */
  .ck.ck-editor__main {
    position: relative;
  }

  /* Make sure the accessibility button aligns to the right - CKEditor does not support such a setting natively */
  clippy-accessibility-notifications {
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
