import { type Validation, Validator } from '@nl-design-system-community/clippy-a11y-validator';
import type {
  ClippyPageOptions,
  PageViolation,
  RegisteredSource,
  SourceRegistration,
  ViolationsListener,
} from './types';
import { byAnchor, hasChanges } from './utils';

export class ClippyPage {
  readonly #listeners = new Set<ViolationsListener>();
  #sources: readonly (SourceRegistration & { id: string })[] = [];
  readonly #validator: Validator;
  #nextSourceId = 1;
  #scheduledPass: ReturnType<typeof setTimeout> | undefined;
  #violations: readonly PageViolation[] = [];

  constructor(options: ClippyPageOptions = {}) {
    this.#validator = new Validator(options);
  }

  get violations(): readonly PageViolation[] {
    return this.#violations;
  }

  register({ anchor, fragment, label }: SourceRegistration): RegisteredSource {
    const id = `clippy-source-${this.#nextSourceId++}`;
    const observer = new MutationObserver(() => this.#schedulePass());
    observer.observe(fragment, { attributes: true, characterData: true, childList: true, subtree: true });
    this.#sources = [...this.#sources, { id, anchor, fragment, label }].sort(byAnchor);
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

  subscribe(listener: ViolationsListener): () => void {
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
    const violations = this.#validator.validate(this.#sources.map(({ fragment }) => fragment)).map((violation) => ({
      ...violation,
      source: this.#sources.find(({ fragment }) => fragment.contains(violation.element))!.id,
    }));
    if (!hasChanges(this.#violations, violations)) return;

    this.#violations = violations;
    this.#listeners.forEach((listener) => listener(this.#violations));
  }
}
