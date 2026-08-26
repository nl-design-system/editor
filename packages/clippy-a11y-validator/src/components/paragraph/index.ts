import type { ContentValidator } from '@/types';
import { paragraphValidations, validationSeverity } from '@/constants';
import { correctConvertToList, correctEntirelyBoldParagraph, correctHeadingResemblingParagraph } from './corrector';
import { detectListLikeParagraph, isEntirelyBoldParagraph, resemblesHeading } from './rules';

// ── Element validators ────────────────────────────────────────────────────────

const paragraphShouldNotBeEntirelyBold: ContentValidator = (_dom, node, { t }) => {
  if (!isEntirelyBoldParagraph(node)) return null;
  return {
    correct: correctEntirelyBoldParagraph(node),
    element: node,
    scope: 'block',
    severity: validationSeverity.WARNING,
    solution: t(`${paragraphValidations.PARAGRAPH_SHOULD_NOT_BE_ENTIRELY_BOLD}.solution`),
  };
};

const paragraphShouldNotResembleHeading: ContentValidator = (_dom, node) => {
  if (!resemblesHeading(node)) return null;
  return {
    correct: correctHeadingResemblingParagraph(node, node.textContent?.trim() ?? ''),
    element: node,
    scope: 'block',
    severity: validationSeverity.INFO,
  };
};

export const paragraphMustUseSemanticList: ContentValidator = (_dom, node, { t }) => {
  const listLike = detectListLikeParagraph(node);
  if (!listLike) return null;

  return {
    correct: correctConvertToList(node, listLike.isOrdered),
    element: node,
    scope: 'block',
    severity: validationSeverity.INFO,
    solution: t(`${paragraphValidations.PARAGRAPH_SHOULD_NOT_RESEMBLE_LIST}.solution`, { prefix: listLike.prefix }),
  };
};

// ── Validator map ─────────────────────────────────────────────────────────────

export const paragraphContentValidators: Record<string, ContentValidator> = {
  [paragraphValidations.PARAGRAPH_SHOULD_NOT_BE_ENTIRELY_BOLD]: paragraphShouldNotBeEntirelyBold,
  [paragraphValidations.PARAGRAPH_SHOULD_NOT_RESEMBLE_HEADING]: paragraphShouldNotResembleHeading,
  [paragraphValidations.PARAGRAPH_SHOULD_NOT_RESEMBLE_LIST]: paragraphMustUseSemanticList,
};
