import { type Validation, Validator } from '@nl-design-system-community/clippy-a11y-validator';
import type {
  Action,
  ClippyDocumentOptions,
  DocumentViolation,
  RegisteredSource,
  SourceRegistration,
  ViolationsListener,
} from './types';
import { byAnchor, hasChanges } from './utils';

export class ClippyDocument {
  readonly #listeners = new Set<ViolationsListener>();
  readonly #moveObserver = new MutationObserver((records) => {
    if (records.some(({ addedNodes }) => [...addedNodes].some((node) => this.#containsAnchor(node)))) {
      this.#schedulePass();
    }
  });
  #sources: readonly (SourceRegistration & { id: string; observer: MutationObserver })[] = [];
  readonly #validator: Validator;
  #nextSourceId = 1;
  #scheduledPass: ReturnType<typeof setTimeout> | undefined;
  #violations: readonly DocumentViolation[] = [];

  constructor(options: ClippyDocumentOptions = {}) {
    this.#validator = new Validator(options);
  }

  get violations(): readonly DocumentViolation[] {
    return this.#violations;
  }

  dispatch({ type, violation }: Action): void {
    if (!this.#violations.includes(violation)) return;

    this.#sources.find(({ id }) => id === violation.source)?.[type]?.(violation);
  }

  register({ anchor, correct, focus, fragment, label }: SourceRegistration): RegisteredSource {
    const id = `clippy-source-${this.#nextSourceId++}`;
    const observer = new MutationObserver(() => this.#schedulePass());
    observer.observe(fragment, { attributes: true, characterData: true, childList: true, subtree: true });
    this.#moveObserver.observe(anchor.ownerDocument, { childList: true, subtree: true });
    this.#dropDisconnectedSources();
    this.#sources = [...this.#sources, { id, anchor, correct, focus, fragment, label, observer }];
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

  #containsAnchor(node: Node) {
    return this.#sources.some(({ anchor }) => node.contains(anchor));
  }

  #dropDisconnectedSources() {
    const disconnected = this.#sources.filter(({ anchor }) => !anchor.isConnected);
    disconnected.forEach(({ observer }) => observer.disconnect());
    this.#sources = this.#sources.filter((source) => !disconnected.includes(source));
  }

  #schedulePass() {
    if (this.#scheduledPass !== undefined) return;

    this.#scheduledPass = setTimeout(() => {
      this.#scheduledPass = undefined;
      this.#validate();
    });
  }

  #validate() {
    this.#dropDisconnectedSources();
    this.#sources = [...this.#sources].sort(byAnchor);
    const violations = this.#validator.validate(this.#sources.map(({ fragment }) => fragment)).map((violation) => {
      const { id, correct, focus, label } = this.#sources.find(({ fragment }) => fragment.contains(violation.element))!;
      return {
        ...violation,
        correctable: Boolean(violation.correct && correct),
        focusable: Boolean(focus),
        label,
        source: id,
      };
    });
    if (!hasChanges(this.#violations, violations)) return;

    this.#violations = violations;
    this.#listeners.forEach((listener) => listener(this.#violations));
  }
}
