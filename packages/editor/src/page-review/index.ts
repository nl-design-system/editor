import type { ViolationsMap } from '@/types/validation';
import '@/components/validations/gutter';
import {
  DEFAULT_FLOATING_POSITION,
  isFloatingPosition,
  type FloatingPosition,
} from '@/components/toolbar/toolbar-accessibility-notifications';
import { validationInteractionMode } from '@/constants';
import { CustomEvents, type SidebarToggleEvent } from '@/events';
import { ClippyHub } from '@/hub';
import { THEME_CLASSES } from '@/utils/colorScheme';

const IDENTIFIER = 'clippy-page-review';
const DEFAULT_REVIEW_ROOT = 'main, [role=main]';

export type { FloatingPosition };

export interface PageReviewOptions {
  /** Where the trigger goes. Without one, the trigger floats over the page. */
  mount?: HTMLElement;
  /** The screen corner of a floating trigger. Defaults to `bottom-right`. */
  floatingPosition?: FloatingPosition;
  /** The Review root selector. Falls back to `main, [role=main]`, then `body`. */
  reviewRoot?: string;
  /** Show the gutter markers from load (default), or only while the sidebar is open. */
  gutter?: 'always' | 'sidebar';
}

const resolveReviewRoot = (selector?: string): HTMLElement =>
  (selector ? document.querySelector<HTMLElement>(selector) : null) ??
  document.querySelector<HTMLElement>(DEFAULT_REVIEW_ROOT) ??
  document.body;

const withoutCorrections = (violationsMap: ViolationsMap): ViolationsMap => {
  for (const violation of violationsMap.values()) {
    delete violation.corrections;
  }
  return violationsMap;
};

export class PageReview extends ClippyHub {
  readonly #trigger = document.createElement('clippy-accessibility-notifications');
  readonly #gutter = document.createElement('clippy-validations-gutter');
  readonly #reviewRoot: HTMLElement;

  static mount(options: PageReviewOptions = {}): PageReview {
    return new PageReview(options);
  }

  private constructor({
    floatingPosition = DEFAULT_FLOATING_POSITION,
    gutter = 'always',
    mount,
    reviewRoot,
  }: PageReviewOptions) {
    const target = resolveReviewRoot(reviewRoot);
    super({ adaptViolations: withoutCorrections, identifier: IDENTIFIER, target });
    this.#reviewRoot = target;

    if (mount) {
      mount.append(this.#trigger);
    } else {
      this.#trigger.floating = true;
      if (isFloatingPosition(floatingPosition)) {
        this.#trigger.floatingPosition = floatingPosition;
      }
      this.#trigger.classList.add(...THEME_CLASSES);
      document.body.append(this.#trigger);
    }
    this.#gutter.classList.add(...THEME_CLASSES);
    this.#gutter.mode = validationInteractionMode.SIDEBAR;
    this.#gutter.overlay = true;
    this.#gutter.contentElement = this.#reviewRoot;
    this.connect({ gutter: this.#gutter, trigger: this.#trigger });
    if (gutter === 'always') {
      this.#reviewRoot.append(this.#gutter);
    } else {
      globalThis.addEventListener(CustomEvents.SIDEBAR_TOGGLE, this.#handleSidebarToggle);
    }

    (globalThis.requestIdleCallback ?? setTimeout)(() => this.validate().catch(console.error));
  }

  readonly #handleSidebarToggle = (event: Event): void => {
    if ((event as SidebarToggleEvent).detail.identifier !== IDENTIFIER) return;
    if (this.sidebar?.open) {
      this.#reviewRoot.append(this.#gutter);
    } else {
      this.#gutter.remove();
    }
  };

  override destroy(): void {
    super.destroy();
    globalThis.removeEventListener(CustomEvents.SIDEBAR_TOGGLE, this.#handleSidebarToggle);
    this.#gutter.remove();
    this.#trigger.remove();
  }
}
