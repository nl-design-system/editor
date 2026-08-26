import {
  type Locale,
  type ValidationKey,
  type ValidationMessage,
  validationMessages as catalogue,
} from '@nl-design-system-community/clippy-a11y-validator';
import { html, nothing, type TemplateResult } from 'lit';
import { getDocumentLang } from '@/localization';
import { renderMarkdown } from '@/utils/markdown';

export type { ValidationKey, ValidationMessage };

/**
 * The validator's rule catalogue in the document's language.
 *
 * All rule text — description, guidance link, correct-button label, and the
 * per-occurrence solution — lives in the validator package, including the prose
 * NL Design System publishes for individual rules. The editor UI and the
 * static-analysis tool therefore cannot drift apart. This wrapper only supplies
 * the locale, which `@lit/localize` resolves from the same source.
 */
export const validationMessages = (
  locale: Locale = getDocumentLang() as Locale,
): Record<ValidationKey, ValidationMessage> => catalogue(locale);

/**
 * Renders a validation solution into the `solution-html` slot of a
 * `<clippy-validation-item>`.
 *
 * The text comes from the detection result, already translated with this
 * occurrence's values filled in. It is markdown.
 */
export const renderSolution = (solution: string | undefined): TemplateResult | typeof nothing => {
  if (!solution) {
    return nothing;
  }

  return html`<p class="nl-paragraph" slot="solution-html">${renderMarkdown(solution)}</p>`;
};
