// Shared DOM fixtures for the colocated component tests.
//
// `parse` is enough for rules: they only read the DOM, so a detached document
// needs no mounting. Correctors that move focus or set a selection need a real,
// attached, editable host — that's what `mount` provides.

/** Parse an HTML fragment into a detached `<body>`. */
export const parse = (html: string): HTMLElement => new DOMParser().parseFromString(html, 'text/html').body;

/** Parse `html` and return the first element matching `selector`. */
export const parseAndSelect = (html: string, selector: string): Element => {
  const element = parse(html).querySelector(selector);
  if (!element) throw new Error(`No element matched "${selector}" in: ${html}`);
  return element;
};

let containers: HTMLElement[] = [];

/** Mount HTML in a contenteditable element attached to the document so selection/range APIs work. */
export const mount = (html: string): HTMLElement => {
  const container = document.createElement('div');
  container.contentEditable = 'true';
  container.innerHTML = html;
  document.body.appendChild(container);
  containers.push(container);
  return container;
};

/** Remove everything {@link mount} attached. Pass to `afterEach`. */
export const unmountAll = (): void => {
  for (const container of containers) container.remove();
  containers = [];
};
