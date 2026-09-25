import type { ClippyPage } from './index';
import { type RegisteredProxySource, registerProxySource } from './proxySource';

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type HeadingSourceRegistration = {
  input: HTMLInputElement | HTMLTextAreaElement;
  label: string;
  level: HeadingLevel;
};

export const registerHeadingSource = (
  page: ClippyPage,
  { input, label, level }: HeadingSourceRegistration,
): RegisteredProxySource => {
  const heading = input.ownerDocument.createElement(`h${level}`);

  return registerProxySource(page, {
    anchor: input,
    events: ['input', 'change'],
    label,
    render: (container) => {
      if (heading.parentNode !== container) container.replaceChildren(heading);
      if (heading.textContent !== input.value) heading.textContent = input.value;
    },
  });
};
