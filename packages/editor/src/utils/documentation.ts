import componentRules from '@nl-design-system-unstable/documentation/dist/component-rules.json';

/**
 * A rule in `@nl-design-system-unstable/documentation`, as `component-rules.json` ships it: an id,
 * the subject it belongs to and a title, alongside a handful of ready-made HTML blocks. Which
 * blocks a rule has varies — every rule explains and solves, some offer alternative solutions
 * (`solution-heading`, `solution-lead`, `solution-quote`) or point at related guidelines.
 */
type DocumentationRule = {
  explanation: string;
  id: string;
  relatedguidelines?: string;
  solution: string;
  subject: string;
  title: string;
} & Record<string, string | undefined>;

/** The keys that identify a rule rather than describe the problem, so never worth rendering. */
const IDENTITY_KEYS = new Set(['id', 'subject', 'title']);

/**
 * Typed once here rather than let TypeScript infer the whole JSON literal, which would otherwise
 * end up in the emitted declarations.
 */
const rulesById = new Map<string, DocumentationRule>(
  (componentRules as { rules: DocumentationRule[] }).rules.map((rule) => [rule.id, rule]),
);

/**
 * The documentation for one rule, as HTML blocks in reading order: the explanation, then every
 * solution the rule offers, then the guidelines it relates to. Empty when the rule names no
 * documentation, or names documentation this version of the package does not describe — a card
 * then falls back to the validation's own copy.
 *
 * The HTML comes from the bundled package and nowhere else, which is what makes it safe to render
 * as markup: a validation a host wrote itself can only point at a rule, never supply one.
 */
export const documentationSections = (id?: string): string[] => {
  const rule = id === undefined ? undefined : rulesById.get(id);
  if (!rule) return [];

  const { relatedguidelines, ...described } = rule;
  const sections = Object.entries(described)
    .filter(([key, html]) => !IDENTITY_KEYS.has(key) && html !== undefined)
    .map(([, html]) => html as string);

  return relatedguidelines === undefined ? sections : [...sections, relatedguidelines];
};
