// https://nldesignsystem.nl/emphasis
export const emphasisValidationRules = {
  EMPHASIS_SHOULD_NOT_BE_EMPTY: 'EMPHASIS_SHOULD_NOT_BE_EMPTY',
  EMPHASIS_SHOULD_NOT_BE_UNDERLINED: 'EMPHASIS_SHOULD_NOT_BE_UNDERLINED',
} as const;

/**
 * Groups the inline tags by the kind of emphasis they carry, so a violation can name what is empty.
 * Feeds `payload.variant`, which selects the matching entry from `messages.solutions`.
 */
const EMPHASIS_VARIANTS: Readonly<Record<string, string>> = {
  B: 'bold',
  CODE: 'code',
  DEL: 'strike',
  EM: 'italic',
  I: 'italic',
  MARK: 'highlight',
  S: 'strike',
  STRIKE: 'strike',
  STRONG: 'bold',
  U: 'underline',
};

export const emphasisVariant = (element: Element): string => EMPHASIS_VARIANTS[element.tagName] ?? 'unknown';
