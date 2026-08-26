import paragraphStrongErrorRaw from '@nl-design-system-unstable/documentation/componenten/paragraph/_issues/strong/editor-error.md?raw';
import paragraphStrongSolutionRaw from '@nl-design-system-unstable/documentation/componenten/paragraph/_issues/strong/solution.md?raw';

/**
 * Prose NL Design System publishes for individual rules, preferred over our own
 * wording where it exists.
 *
 * The snippets are Dutch-language originals, so they belong to the Dutch table
 * only — the English table keeps its own wording. Vite inlines the markdown at
 * build time, so this costs the published bundle a string, not a dependency.
 */

/** Strips the `<!-- @license -->` header (and any other comment) the snippets ship with. */
const stripHtmlComments = (markdown: string): string => markdown.replace(/<!--[\s\S]*?-->/g, '').trim();

export const paragraphStrongError = stripHtmlComments(paragraphStrongErrorRaw);
export const paragraphStrongSolution = stripHtmlComments(paragraphStrongSolutionRaw);
