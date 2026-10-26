import '@/components/toolbar/toolbar-accessibility-notifications';
import '@/components/validations/drawer';
import '@/components/validations/gutter';
import type { Gutter } from '@/components/validations/gutter';
import type { ViolationsMap } from '@/types/validation';
import { validationInteractionMode } from '@/constants';
import { ClippyHub } from '@/hub';
import { initializeLocale } from '@/localization';

const IDENTIFIER = 'clippy-page-review';
const DEFAULT_REVIEW_ROOT = 'main, [role=main]';

export interface PageReviewOptions {
  /** Where the trigger goes. Without one, the trigger floats over the page. */
  mount?: HTMLElement;
  /** The Review root selector. Falls back to `main, [role=main]`, then `body`. */
  reviewRoot?: string;
  /** Shows indicators in the margin of the Review root. Off by default. */
  gutter?: boolean;
}

const createFloatingMount = (): HTMLElement => {
  const mount = document.createElement('clippy-page-review-trigger');
  Object.assign(mount.style, {
    backgroundColor: 'var(--basis-color-default-bg-document, Canvas)',
    insetBlockEnd: '1rem',
    insetInlineEnd: '1rem',
    position: 'fixed',
    zIndex: '2147482000',
  });
  return document.body.appendChild(mount);
};

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
  readonly #reviewRoot: HTMLElement;
  readonly #floatingMount: HTMLElement | null = null;
  #gutter: Gutter | null = null;
  #gutterWrapper: HTMLElement | null = null;

  constructor({ gutter = false, mount, reviewRoot }: PageReviewOptions) {
    const target = resolveReviewRoot(reviewRoot);
    super({ adaptViolations: withoutCorrections, identifier: IDENTIFIER, target });
    this.#reviewRoot = target;

    if (!mount) {
      this.#floatingMount = createFloatingMount();
    }
    (mount ?? this.#floatingMount)?.append(this.#trigger);
    this.#drawer.overlay = true;
    document.body.append(this.#drawer);
    if (gutter) {
      this.#gutter = this.#addGutter();
    }
    this.connect({ drawer: this.#drawer, gutter: this.#gutter, trigger: this.#trigger });

    (globalThis.requestIdleCallback ?? setTimeout)(() => this.validate());
  }

  #addGutter(): Gutter {
    const gutter = document.createElement('clippy-validations-gutter');
    gutter.mode = validationInteractionMode.DRAWER;
    gutter.contentElement = this.#reviewRoot;
    if (this.#reviewRoot === document.body) {
      document.body.append(gutter);
      return gutter;
    }
    this.#gutterWrapper = document.createElement('div');
    this.#gutterWrapper.style.position = 'relative';
    this.#reviewRoot.replaceWith(this.#gutterWrapper);
    this.#gutterWrapper.append(gutter, this.#reviewRoot);
    return gutter;
  }

  override destroy(): void {
    super.destroy();
    this.#trigger.remove();
    this.#floatingMount?.remove();
    this.#drawer.remove();
    this.#gutter?.remove();
    this.#gutterWrapper?.replaceWith(this.#reviewRoot);
  }
}
