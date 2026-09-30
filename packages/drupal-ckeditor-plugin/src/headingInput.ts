import {
  type ClippyDocument,
  type HeadingLevel,
  registerHeadingSource,
} from '@nl-design-system-community/ckeditor-plugin';

const HEADING_LEVELS: readonly HeadingLevel[] = [1, 2, 3, 4, 5, 6];

const headingLevel = (input: HTMLInputElement): HeadingLevel | undefined =>
  HEADING_LEVELS.find((level) => String(level) === input.dataset['clippyHeadingLevel']);

export const registerHeadingInput = (input: HTMLInputElement, clippyDocument: ClippyDocument): (() => void) => {
  const level = headingLevel(input);
  if (!level) return () => {};

  const label = input.labels?.[0]?.textContent?.trim() || 'Heading';
  return registerHeadingSource(clippyDocument, { input, label, level }).unregister;
};
