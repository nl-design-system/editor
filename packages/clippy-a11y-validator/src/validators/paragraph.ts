import type { ContentValidator } from '@/types';
import { paragraphValidations, validationSeverity } from '@/constants';
import { correctConvertToList, correctEntirelyBoldParagraph, correctHeadingResemblingParagraph } from '@/correctors';
import { getParagraphLinesFromDOM, isEmptyOrWhitespace, orderedListIndicator, unorderedListIndicator } from '@/helpers';

// ── List helpers ──────────────────────────────────────────────────────────────

const decrementPrefix = (prefix: string): string => (prefix.startsWith('2') ? prefix.replace('2', '1') : prefix);

const getPrefix = (text: string): string => text.substring(0, 2);

// ── Element validators ────────────────────────────────────────────────────────

const paragraphShouldNotBeEntirelyBold: ContentValidator = (_dom, node) => {
  if (node.tagName !== 'P') return null;
  const text = node.textContent?.trim() ?? '';
  if (isEmptyOrWhitespace(text)) return null;
  const nonEmptyChildren = Array.from(node.childNodes).filter(
    (n) => n.nodeType !== Node.TEXT_NODE || (n.textContent?.trim().length ?? 0) > 0,
  );
  if (nonEmptyChildren.length === 0) return null;
  const allBold = nonEmptyChildren.every((n) => n instanceof Element && (n.tagName === 'STRONG' || n.tagName === 'B'));
  if (!allBold) return null;
  return {
    correct: correctEntirelyBoldParagraph(node),
    element: node,
    scope: 'block',
    severity: validationSeverity.WARNING,
  };
};

const paragraphShouldNotResembleHeading: ContentValidator = (_dom, node) => {
  if (node.tagName !== 'P') return null;
  const text = node.textContent?.trim() ?? '';
  if (isEmptyOrWhitespace(text) || text.length > 60) return null;
  const nonEmptyChildren = Array.from(node.childNodes).filter(
    (n) => n.nodeType !== Node.TEXT_NODE || (n.textContent?.trim().length ?? 0) > 0,
  );
  if (nonEmptyChildren.length === 0) return null;
  const allBold = nonEmptyChildren.every((n) => n instanceof Element && (n.tagName === 'STRONG' || n.tagName === 'B'));
  if (!allBold) return null;
  return {
    correct: correctHeadingResemblingParagraph(node, text),
    element: node,
    scope: 'block',
    severity: validationSeverity.INFO,
  };
};

export const paragraphMustUseSemanticList: ContentValidator = (_dom, node) => {
  if (node.tagName !== 'P') return null;

  const text = node.textContent ?? '';
  const firstPrefix = getPrefix(text);
  const isOrdered = orderedListIndicator.test(firstPrefix);
  const isUnordered = unorderedListIndicator.test(firstPrefix);

  if (!isOrdered && !isUnordered) return null;

  // Check if the next sibling paragraph continues the list pattern
  const nextSibling = node.nextElementSibling;
  if (nextSibling?.tagName === 'P') {
    const secondPrefix = getPrefix(nextSibling.textContent ?? '');
    if (decrementPrefix(secondPrefix) === firstPrefix) {
      return {
        correct: correctConvertToList(node, isOrdered),
        element: node,
        scope: 'block',
        severity: validationSeverity.INFO,
        solutionPayload: { isOrdered, prefix: firstPrefix.trim() },
      };
    }
  }

  // Check <br>-separated lines within the paragraph
  const lines = getParagraphLinesFromDOM(node);
  if (lines.length > 1 && firstPrefix === decrementPrefix(getPrefix(lines[1] ?? ''))) {
    return {
      correct: correctConvertToList(node, isOrdered),
      element: node,
      scope: 'block',
      severity: validationSeverity.INFO,
      solutionPayload: { isOrdered, prefix: firstPrefix.trim() },
    };
  }

  return null;
};

// ── Validator map ─────────────────────────────────────────────────────────────

export const paragraphContentValidators: Record<string, ContentValidator> = {
  [paragraphValidations.PARAGRAPH_SHOULD_NOT_BE_ENTIRELY_BOLD]: paragraphShouldNotBeEntirelyBold,
  [paragraphValidations.PARAGRAPH_SHOULD_NOT_RESEMBLE_HEADING]: paragraphShouldNotResembleHeading,
  [paragraphValidations.PARAGRAPH_SHOULD_NOT_RESEMBLE_LIST]: paragraphMustUseSemanticList,
};
