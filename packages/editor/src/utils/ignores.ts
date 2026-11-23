/** Whether `element` lies inside an element matching the `selector` of elements to ignore. */
export const ignores = (element: Element, selector: string | undefined): boolean =>
  !!selector && element.closest(selector) !== null;
