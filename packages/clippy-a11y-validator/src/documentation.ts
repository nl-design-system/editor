import * as componentRules from '@nl-design-system-unstable/documentation/dist/component-rules.json' with { type: 'json' };

/**
 * A rule in `component-rules.json`, down to the fields a violation's messages take — `id` and
 * `subject` identify the rule rather than describe the issue, so they stay out. What this returns is
 * what spreads onto the messages, nothing more.
 */
type DocumentationRule = {
  explanation: string;
  solution: string;
  title: string;
};

const rulesMappedById = new Map<string, DocumentationRule>(
  componentRules.rules.map(({ id, explanation, solution, title }) => [id, { explanation, solution, title }]),
);

export const getRuleById = (id?: string): DocumentationRule | undefined =>
  id === undefined ? undefined : rulesMappedById.get(id);
