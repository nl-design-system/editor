import { getElementRange } from './helpers';

// Shared DOM mutation primitives for the per-component `corrector.ts` modules.
// Inspection helpers live in `./helpers`; these are the ones that write.

/** Unwrap an element: replace it with its children in-place. */
export const unwrapElement = (element: Element): void => {
  const parent = element.parentNode;
  if (!parent) return;
  while (element.firstChild) {
    parent.insertBefore(element.firstChild, element);
  }
  element.remove();
};

// Select the element and move focus to it. Outside an editor the browser won't
// focus the contenteditable itself, so walk up to the nearest focusable ancestor.
// The `Range` is derived here, at correct-time, so an earlier correction moving
// the element can't leave us selecting a stale position.
export const selectElement = (element: Element): void => {
  const range = getElementRange(element);
  if (!range) return;

  const focusTarget =
    element.closest<HTMLElement>('[contenteditable]') ??
    element.closest<HTMLElement>('[tabindex]') ??
    element.parentElement;
  focusTarget?.focus();

  const selection = globalThis.getSelection();
  if (!selection) return;
  selection.removeAllRanges();
  selection.addRange(range);
};

/** Change the tag name of an element while preserving attributes and inner HTML. */
export const changeTagName = (element: Element, newTag: string): void => {
  const newEl = document.createElement(newTag);
  for (const attr of element.attributes) {
    newEl.setAttribute(attr.name, attr.value);
  }
  newEl.innerHTML = element.innerHTML;
  element.parentNode?.replaceChild(newEl, element);
};
