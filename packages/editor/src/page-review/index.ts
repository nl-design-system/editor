import '@/components/toolbar/toolbar-accessibility-notifications';
import '@/components/validations/drawer';
import type { ViolationsMap } from '@/types/validation';
import { ClippyHub } from '@/hub';
import { initializeLocale } from '@/localization';

const IDENTIFIER = 'clippy-page-review';
const DEFAULT_REVIEW_ROOT = 'main, [role=main]';

export interface PageReviewOptions {
  /** Where the trigger goes. */
  mount: HTMLElement;
  /** The Review root selector. Falls back to `main, [role=main]`, then `body`. */
  reviewRoot?: string;
}

const resolveReviewRoot = (selector?: string): HTMLElement =>
  (selector ? document.querySelector<HTMLElement>(selector) : null) ??
  document.querySelector<HTMLElement>(DEFAULT_REVIEW_ROOT) ??
  document.body;

const withoutCorrections = (violationsMap: ViolationsMap): ViolationsMap => {
  for (const violation of violationsMap.values()) {
    delete violation.correction;
  }
  return violationsMap;
};

initializeLocale().catch(console.error);

export class PageReview extends ClippyHub {
  readonly #trigger = document.createElement('clippy-accessibility-notifications');
  readonly #drawer = document.createElement('clippy-validations-drawer');

  constructor({ mount, reviewRoot }: PageReviewOptions) {
    super({ adaptViolations: withoutCorrections, identifier: IDENTIFIER, target: resolveReviewRoot(reviewRoot) });

    mount.append(this.#trigger);
    this.#drawer.overlay = true;
    document.body.append(this.#drawer);
    this.connect({ drawer: this.#drawer, trigger: this.#trigger });

    (globalThis.requestIdleCallback ?? setTimeout)(() => this.validate());
  }

  override destroy(): void {
    super.destroy();
    this.#trigger.remove();
    this.#drawer.remove();
  }
}
