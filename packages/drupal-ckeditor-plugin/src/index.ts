import { coreValidations, getClippyDocument, setColorSchemeHost } from '@nl-design-system-community/ckeditor-plugin';
import { type ClippyApi, createClippyApi } from './api.ts';
import { drupalColorSchemeHost } from './colorSchemeHost.ts';
import { registerHeadingInput } from './headingInput.ts';
import { attachReport } from './report.ts';

type Behavior = {
  attach: (context: Document | Element) => void;
  detach: (context: Document | Element, settings: unknown, trigger: string) => void;
};

declare const Drupal: { behaviors: Record<string, Behavior>; clippy?: ClippyApi };
declare const once: {
  <T extends Element>(id: string, selector: string, context: Document | Element): T[];
  remove: <T extends Element>(id: string, selector: string, context: Document | Element) => T[];
};

setColorSchemeHost(drupalColorSchemeHost);

const clippyDocument = getClippyDocument();
Object.values(coreValidations).forEach((validation) => clippyDocument.registerValidation(validation));

Drupal.clippy = createClippyApi(clippyDocument);

const onceBehavior = <T extends Element>(
  id: string,
  selector: string,
  attach: (element: T) => () => void,
): Behavior => {
  const detachers = new WeakMap<T, () => void>();

  return {
    attach: (context) => {
      once<T>(id, selector, context).forEach((element) => detachers.set(element, attach(element)));
    },
    detach: (context, _settings, trigger) => {
      if (trigger !== 'unload') return;

      once.remove<T>(id, selector, context).forEach((element) => {
        detachers.get(element)?.();
        detachers.delete(element);
      });
    },
  };
};

Drupal.behaviors['clippyReport'] = onceBehavior<HTMLFormElement>('clippy-report', 'form.node-form', (form) =>
  attachReport(form, clippyDocument),
);

Drupal.behaviors['clippyHeadingInput'] = onceBehavior<HTMLInputElement>(
  'clippy-heading-input',
  'input[data-clippy-heading-level]',
  (input) => registerHeadingInput(input, clippyDocument),
);

export { ClippyPlugin, ContentClasses } from '@nl-design-system-community/ckeditor-plugin';
