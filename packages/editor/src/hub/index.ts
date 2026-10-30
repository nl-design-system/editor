import type { Validation } from '@nl-design-system-community/clippy-a11y-validator';
import type { Violation, ViolationsMap } from '@/types/validation';
import { CustomEvents, type FocusNodeEvent, type ValidationsDrawerToggleEvent } from '@/events';
import { debounce } from '@/utils/debounce';
import { waitForMedia } from '@/utils/waitForMedia';
import { runValidation, VALIDATION_TIMEOUT } from '@/validations';

const MEDIA_SETTLE_TIMEOUT = 2000;

export interface ClippyHubView {
  identifier?: string;
  violationsMap?: ViolationsMap;
}

export interface ClippyHubDrawer extends ClippyHubView {
  htmlDocument?: HTMLElement;
}

export interface ClippyHubViews {
  drawer?: (ClippyHubDrawer & HTMLElement) | null;
  gutter?: ClippyHubView | null;
  trigger?: (ClippyHubView & HTMLElement) | null;
}

export interface ClippyHubOptions {
  identifier: string;
  target: HTMLElement;
  adaptViolations?: (violationsMap: ViolationsMap) => ViolationsMap;
  /** Shows the violation of a focused drawer item. Defaults to scrolling it into view. */
  focusViolation?: (violation: Violation) => void;
  validations?: readonly Validation[];
}

const scrollIntoView = ({ element }: Violation): void => {
  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
};

const settleMedia = async (target: HTMLElement): Promise<void> => {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  await Promise.race([
    Promise.all([...target.querySelectorAll('img, video, audio')].map((el) => waitForMedia(el))),
    new Promise((resolve) => {
      timeout = setTimeout(resolve, MEDIA_SETTLE_TIMEOUT);
    }),
  ]);
  clearTimeout(timeout);
};

export class ClippyHub {
  readonly #adaptViolations: (violationsMap: ViolationsMap) => ViolationsMap;
  readonly #focusViolation: (violation: Violation) => void;
  readonly #identifier: string;
  readonly #target: HTMLElement;
  readonly #validations: readonly Validation[] | undefined;
  readonly #views: ClippyHubViews = {};
  #violationsMap: ViolationsMap | undefined;
  #latestRun = 0;
  #destroyed = false;

  constructor({
    adaptViolations = (violationsMap) => violationsMap,
    focusViolation = scrollIntoView,
    identifier,
    target,
    validations,
  }: ClippyHubOptions) {
    this.#adaptViolations = adaptViolations;
    this.#focusViolation = focusViolation;
    this.#identifier = identifier;
    this.#target = target;
    this.#validations = validations;
  }

  readonly scheduleValidation = debounce(() => this.validate().catch(console.error), VALIDATION_TIMEOUT);

  connect(views: ClippyHubViews): void {
    globalThis.addEventListener(CustomEvents.VALIDATIONS_DRAWER_TOGGLE, this.#handleDrawerToggle);
    globalThis.addEventListener(CustomEvents.FOCUS_NODE, this.#handleFocusNode);
    Object.assign(this.#views, views);
    for (const view of Object.values(views)) {
      if (view) {
        view.identifier = this.#identifier;
      }
    }
    this.#render();
  }

  destroy(): void {
    this.#destroyed = true;
    globalThis.removeEventListener(CustomEvents.VALIDATIONS_DRAWER_TOGGLE, this.#handleDrawerToggle);
    globalThis.removeEventListener(CustomEvents.FOCUS_NODE, this.#handleFocusNode);
  }

  async validate(): Promise<void> {
    const run = ++this.#latestRun;
    await settleMedia(this.#target);
    if (this.#destroyed || run !== this.#latestRun) {
      return;
    }

    runValidation(this.#target, this.#validations, (reported) => {
      this.#violationsMap = this.#adaptViolations(reported);
    });
    this.#render();
  }

  readonly #handleDrawerToggle = (event: Event): void => {
    const { identifier, open } = (event as ValidationsDrawerToggleEvent).detail;
    if (identifier !== this.#identifier) return;

    const { drawer, trigger } = this.#views;
    if (open) {
      this.validate().catch(console.error);
      drawer?.focus();
      return;
    }
    const active = document.activeElement;
    if (!active || active === document.body || active === drawer) {
      trigger?.focus();
    }
  };

  readonly #handleFocusNode = (event: Event): void => {
    const { identifier, range } = (event as FocusNodeEvent).detail;
    if (identifier !== this.#identifier) return;

    const violation = this.#violationsMap?.get(range);
    if (violation) {
      this.#focusViolation(violation);
    }
  };

  #render(): void {
    const violationsMap = this.#violationsMap;
    if (!violationsMap) {
      return;
    }
    const { drawer, gutter, trigger } = this.#views;
    if (gutter) {
      gutter.violationsMap = violationsMap;
    }
    if (trigger) {
      trigger.violationsMap = violationsMap;
    }
    if (drawer) {
      drawer.htmlDocument = this.#target;
      drawer.violationsMap = violationsMap;
    }
  }
}
