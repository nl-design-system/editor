/**
 * Server-side entry point for the SSR demo.
 *
 * Exports a `render` function that returns the static HTML shell of the page.
 * Custom elements are rendered as plain HTML tags — the browser upgrades them
 * to interactive web components once the client-side bundle is loaded.
 *
 * No DOM APIs are used here; TipTap is initialised client-side only via
 * `element: null` in the editor constructor and `mount()` in Content.firstUpdated().
 */
export function render(): string {
  return `
    <h1>Clippy Editor SSR</h1>
    <clippy-editor id="clippy-editor-ssr" top-heading-level="2">
      <div slot="value">
        <p>
          Server rendered content. The editor is initialized
          client-side.
        </p>
      </div>
    </clippy-editor>
  `;
}
