import { coreValidations, type CoreValidationRule } from '@nl-design-system-community/clippy-a11y-validator';
import { ClippyHub } from '@nl-design-system-community/editor/hub';

/**
 * Each example runs only the rule it demonstrates, named in `data-validations`, so the rest of the example
 * markup stays unflagged.
 */
const hubs: ClippyHub[] = [];

for (const example of document.querySelectorAll<HTMLElement>('[data-validations]')) {
  const target = example.querySelector<HTMLElement>('[contenteditable]');
  if (!target) continue;

  const validations = (example.dataset['validations'] ?? '')
    .split(' ')
    .map((rule) => coreValidations[rule as CoreValidationRule]);

  const gutter = example.querySelector('clippy-validations-gutter');
  if (gutter) gutter.contentElement = target;

  const hub = new ClippyHub({ identifier: example.id, target, validations });
  hub.connect({ gutter, list: example.querySelector('clippy-validations-list') });
  target.addEventListener('input', () => hub.scheduleValidation());
  hubs.push(hub);
}

try {
  await Promise.all(hubs.map((hub) => hub.validate()));
} catch (error) {
  console.error(error);
}
