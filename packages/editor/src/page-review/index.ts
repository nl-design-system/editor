import '@/components/toolbar/toolbar-accessibility-notifications';
import '@/components/validations/drawer';
import '@/components/validations/gutter';
import type { ViolationsMap } from '@/types/validation';
import { validationInteractionMode } from '@/constants';
import { CustomEvents, type ValidationsDrawerToggleEvent } from '@/events';
import { ClippyHub } from '@/hub';
import { initializeLocale } from '@/localization';

const IDENTIFIER = 'clippy-page-review';
const DEFAULT_REVIEW_ROOT = 'main, [role=main]';
const THEME_CLASSES = ['ma-theme', 'clippy-theme', 'utrecht-theme'];

export interface PageReviewOptions {
  /** Where the trigger goes. Without one, the trigger floats over the page. */
  mount?: HTMLElement;
  /** The Review root selector. Falls back to `main, [role=main]`, then `body`. */
  reviewRoot?: string;
  /** Show the gutter markers from load (default), or only while the drawer is open. */
  gutter?: 'always' | 'drawer';
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
  readonly #gutter = document.createElement('clippy-validations-gutter');
  readonly #reviewRoot: HTMLElement;

  static mount(options: PageReviewOptions = {}): PageReview {
    return new PageReview(options);
  }

  private constructor({ gutter = 'always', mount, reviewRoot }: PageReviewOptions) {
    const target = resolveReviewRoot(reviewRoot);
    super({ adaptViolations: withoutCorrections, identifier: IDENTIFIER, target });
    this.#reviewRoot = target;

    if (mount) {
      mount.append(this.#trigger);
    } else {
      this.#trigger.floating = true;
      this.#trigger.classList.add(...THEME_CLASSES);
      document.body.append(this.#trigger);
    }
    this.#drawer.overlay = true;
    this.#drawer.classList.add(...THEME_CLASSES);
    document.body.append(this.#drawer);
    this.#gutter.classList.add(...THEME_CLASSES);
    this.#gutter.mode = validationInteractionMode.DRAWER;
    this.#gutter.overlay = true;
    this.#gutter.tabbable = false;
    this.#gutter.contentElement = this.#reviewRoot;
    this.connect({ drawer: this.#drawer, gutter: this.#gutter, trigger: this.#trigger });
    if (gutter === 'always') {
      this.#reviewRoot.append(this.#gutter);
    } else {
      globalThis.addEventListener(CustomEvents.VALIDATIONS_DRAWER_TOGGLE, this.#handleDrawerToggle);
    }

    (globalThis.requestIdleCallback ?? setTimeout)(() => this.validate());
  }

  readonly #handleDrawerToggle = (event: Event): void => {
    const { identifier, open } = (event as ValidationsDrawerToggleEvent).detail;
    if (identifier !== IDENTIFIER) return;
    if (open) {
      this.#reviewRoot.append(this.#gutter);
    } else {
      this.#gutter.remove();
    }
  };

  override destroy(): void {
    super.destroy();
    globalThis.removeEventListener(CustomEvents.VALIDATIONS_DRAWER_TOGGLE, this.#handleDrawerToggle);
    this.#gutter.remove();
    this.#trigger.remove();
    this.#drawer.remove();
  }
}
