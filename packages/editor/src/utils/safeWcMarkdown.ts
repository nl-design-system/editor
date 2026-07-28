// Registers the `<wc-markdown>` custom element (used to render documentation snippets)
// while tolerating a second bundled copy of the editor on the same page.
//
// `@vanillawc/wc-markdown` calls `customElements.define('wc-markdown', …)` unconditionally
// when imported (the import below is hoisted, so it runs first). If a second bundled copy
// of the editor loads on the same page — e.g. a demo that mounts both the web component
// and its React wrapper — that repeated registration would throw `NotSupportedError` and
// crash hydration. The guard makes `customElements.define` a no-op for an already
// registered name: modules evaluate atomically, so the first copy to load registers the
// element and installs the guard before any later copy runs its own registration. The
// flag keeps the guard idempotent across bundles that share the global registry.
import '@vanillawc/wc-markdown';

if (typeof customElements !== 'undefined') {
  const registry = customElements as CustomElementRegistry & { __clippyDefineGuard?: boolean };
  if (!registry.__clippyDefineGuard) {
    const nativeDefine = registry.define.bind(registry);
    registry.define = (name: string, constructor: CustomElementConstructor, options?: ElementDefinitionOptions) => {
      if (registry.get(name)) return;
      nativeDefine(name, constructor, options);
    };
    registry.__clippyDefineGuard = true;
  }
}
