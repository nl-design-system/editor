import { type Validation, Validator } from '@nl-design-system-community/clippy-a11y-validator';
import type {
  ClippyRegistryOptions,
  RegisteredSource,
  RegistryListener,
  RegistryViolation,
  SourceRegistration,
} from './types';

const byAnchor = ({ anchor: a }: SourceRegistration, { anchor: b }: SourceRegistration): number => {
  if (a === b) return 0;

  return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_PRECEDING ? 1 : -1;
};

export class ClippyRegistry {
  readonly #listeners = new Set<RegistryListener>();
  #sources: readonly (SourceRegistration & { id: string })[] = [];
  readonly #validator: Validator;
  #nextSourceId = 1;
  #scheduledPass: ReturnType<typeof setTimeout> | undefined;
  #violations: readonly RegistryViolation[] = [];

  constructor(options: ClippyRegistryOptions = {}) {
    this.#validator = new Validator(options);
  }

  get violations(): readonly RegistryViolation[] {
    return this.#violations;
  }

  register({ anchor, label, root }: SourceRegistration): RegisteredSource {
    const id = `clippy-source-${this.#nextSourceId++}`;
    const observer = new MutationObserver(() => this.#schedulePass());
    observer.observe(root, { attributes: true, characterData: true, childList: true, subtree: true });
    this.#sources = [...this.#sources, { id, anchor, label, root }].sort(byAnchor);
    this.#schedulePass();

    return {
      id,
      unregister: () => {
        observer.disconnect();
        const remaining = this.#sources.filter((source) => source.id !== id);
        if (remaining.length === this.#sources.length) return;

        this.#sources = remaining;
        this.#schedulePass();
      },
    };
  }

  registerValidation(validation: Validation): () => void {
    const unregister = this.#validator.register(validation);
    this.#schedulePass();

    return () => {
      unregister();
      this.#schedulePass();
    };
  }

  // Called after every validation pass with the current violations
  // Used to update views like the panel, the Clippy button count and the gutter.
  subscribe(listener: RegistryListener): () => void {
    this.#listeners.add(listener);

    return () => {
      this.#listeners.delete(listener);
    };
  }

  #schedulePass() {
    if (this.#scheduledPass !== undefined) return;

    this.#scheduledPass = setTimeout(() => {
      this.#scheduledPass = undefined;
      this.#validate();
    });
  }

  #validate() {
    this.#violations = this.#validator.validate(this.#sources.map(({ root }) => root)).map((violation) => ({
      ...violation,
      source: this.#sources.find(({ root }) => root.contains(violation.element))!.id,
    }));
    this.#listeners.forEach((listener) => listener(this.#violations));
  }
}
