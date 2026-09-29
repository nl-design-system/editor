import type { ClippyDocument } from './index';
import { type RegisteredProxySource, registerProxySource } from './proxySource';

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type HeadingSourceRegistration = {
  input: HTMLInputElement | HTMLTextAreaElement;
  label: string;
  level: HeadingLevel;
};

export const registerHeadingSource = (
  clippyDocument: ClippyDocument,
  { input, label, level }: HeadingSourceRegistration,
): RegisteredProxySource => {
  const heading = input.ownerDocument.createElement(`h${level}`);

  return registerProxySource(clippyDocument, {
    anchor: input,
    events: ['input', 'change'],
    focus: () => input.focus(),
    label,
    render: (container) => {
      if (heading.parentNode !== container) container.replaceChildren(heading);
      if (heading.textContent !== input.value) heading.textContent = input.value;
    },
  });
};
