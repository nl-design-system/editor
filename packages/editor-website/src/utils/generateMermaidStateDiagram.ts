import type { AnyStateMachine } from 'xstate';

type TransitionMap = Record<string, Array<{ eventType: string; target: Array<{ key: string }> }>>;

function getTransitionLines(stateKey: string, on: TransitionMap): string[] {
  const lines: string[] = [];

  for (const [eventType, transitions] of Object.entries(on)) {
    if (eventType === 'BACK') continue;
    for (const transition of transitions) {
      for (const target of transition.target) {
        lines.push(`    ${stateKey} --> ${target.key}: ${eventType}`);
      }
    }
  }

  return lines;
}

/**
 * Generates a Mermaid stateDiagram-v2 string from an XState machine definition.
 * Excludes BACK transitions to keep the diagram focused on forward flow.
 */
export function generateMermaidStateDiagram(machine: AnyStateMachine): string {
  const rootDef = machine.definition;
  const lines: string[] = ['stateDiagram-v2'];

  const initialTarget = rootDef.initial?.target?.[0] as { key: string } | undefined;
  if (initialTarget) {
    lines.push(`    [*] --> ${initialTarget.key}`);
  }

  for (const [stateKey, stateDef] of Object.entries(rootDef.states)) {
    const on = (stateDef as unknown as Record<string, unknown>)['on'] as TransitionMap | undefined;
    if (!on) continue;

    lines.push(...getTransitionLines(stateKey, on));
  }

  return lines.join('\n');
}
