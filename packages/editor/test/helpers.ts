import { collectAllElementsDeep } from 'query-selector-shadow-dom';

interface LitElement extends HTMLElement {
  updateComplete?: Promise<boolean>;
}

interface StencilElement extends HTMLElement {
  componentOnReady?: () => Promise<void>;
}

type CustomElement = HTMLElement & Partial<LitElement> & Partial<StencilElement>;

export const getDeeplyMountedCustomElement = async <T extends LitElement>(selector: string): Promise<T> => {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`<${selector}> was not found in the document`);
  await element.updateComplete;

  const elements = collectAllElementsDeep('*', element);

  // First, ensure all custom elements are defined
  const customElementTags = new Set<string>();
  elements.forEach((el) => {
    const tagName = el.tagName.toLowerCase();
    if (tagName.includes('-')) {
      customElementTags.add(tagName);
    }
  });

  await Promise.all(
    Array.from(customElementTags).map(async (tagName) => {
      try {
        await customElements.whenDefined(tagName);
      } catch (error) {
        console.warn(`Custom element ${tagName} not defined, skipping`, error?.toString());
      }
    }),
  );

  // Then wait for all components to be ready
  await Promise.all(
    elements.map(async (el) => {
      const customEl = el as CustomElement;

      if (typeof customEl.componentOnReady === 'function') {
        try {
          await customEl.componentOnReady();
        } catch (error) {
          console.warn(`Failed to wait for ${customEl.tagName}:`, error);
        }
      }

      if (customEl.updateComplete instanceof Promise) {
        await customEl.updateComplete;
      }
    }),
  );

  return element;
};
