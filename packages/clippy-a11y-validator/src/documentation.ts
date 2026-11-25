import * as documentationComponentRules from '@nl-design-system-unstable/documentation/dist/component-rules.json' with { type: 'json' };

/**
 * A rule in `component-rules.json`, down to the fields a violation's messages take — `id` and
 * `subject` identify the rule rather than describe the issue, so they stay out. What this returns is
 * what spreads onto the messages, nothing more.
 */
type DocumentationComponentRule = {
  explanation: string;
  solutions: string[];
  title: string;
};

type DocumentationSolution = { html: string; id: string };

const componentRulesMappedById = new Map(
  documentationComponentRules.rules.map(({ id, explanation, solutions, title }) => [
    id,
    { explanation, solutions: solutions.map(({ id, html }): DocumentationSolution => ({ id, html })), title },
  ]),
);

/** The solutions `order` names come first, in that order; the rest follow in documentation order. */
const orderSolutions = (solutions: DocumentationSolution[], order: readonly string[]): DocumentationSolution[] => {
  const rank = (id: string) => {
    const index = order.indexOf(id);
    return index === -1 ? order.length : index;
  };

  return solutions.toSorted((a, b) => rank(a.id) - rank(b.id));
};

export const getDocumentationComponentRuleById = (
  id?: string,
  solutionOrder: readonly string[] = [],
): DocumentationComponentRule | undefined => {
  const rule = id === undefined ? undefined : componentRulesMappedById.get(id);
  if (!rule) return undefined;

  return { ...rule, solutions: orderSolutions(rule.solutions, solutionOrder).map(({ html }) => html) };
};
