import type { ContentValidator } from '@/types';
import { linkValidations, validationSeverity } from '@/constants';
import { correctGenericLinkText } from '@/correctors';

const genericLinkTexts = new Set(['lees meer', 'klik hier']);

const linkShouldNotBeTooGeneric: ContentValidator = (_dom, node) => {
  if (node.tagName !== 'A') return null;
  const text = (node.textContent ?? '').trim().toLowerCase();
  if (!genericLinkTexts.has(text)) return null;
  return {
    correct: correctGenericLinkText(node),
    element: node,
    scope: 'inline',
    severity: validationSeverity.INFO,
  };
};

// ── Validator map ─────────────────────────────────────────────────────────────

export const linkContentValidators: Record<string, ContentValidator> = {
  [linkValidations.LINK_SHOULD_NOT_BE_TOO_GENERIC]: linkShouldNotBeTooGeneric,
};
