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
  for (const el of elements) {
    const customEl = el as CustomElement;
    if (typeof customEl.componentOnReady === 'function') {
      console.log('---\n' + customEl.tagName + '\n');
      await customEl.componentOnReady();
    }
    if (customEl.updateComplete instanceof Promise) {
      await customEl.updateComplete;
    }
  }
  return element;
};
