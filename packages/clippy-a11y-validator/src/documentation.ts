import * as documentationComponentRules from '@nl-design-system-unstable/documentation/dist/component-rules.json' with { type: 'json' };

/**
 * A rule in `component-rules.json`, down to the fields a violation's messages take — `id` and
 * `subject` identify the rule rather than describe the issue, so they stay out. What this returns is
 * what spreads onto the messages, nothing more.
 */
type DocumentationComponentRule = {
  explanation: string;
  solution: string;
  title: string;
};

const componentRulesMappedById = new Map<string, DocumentationComponentRule>(
  documentationComponentRules.rules.map(({ id, explanation, solution, title }) => [
    id,
    { explanation, solution, title },
  ]),
);

export const getDocumentationComponentRuleById = (id?: string): DocumentationComponentRule | undefined =>
  id === undefined ? undefined : componentRulesMappedById.get(id);
