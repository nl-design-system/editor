import type { Validation } from '@nl-design-system-community/clippy-a11y-validator';
import type { ViolationsMap } from '@/types/validation';
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
  drawer?: ClippyHubDrawer | null;
  gutter?: ClippyHubView | null;
  trigger?: ClippyHubView | null;
}

export interface ClippyHubOptions {
  identifier: string;
  target: HTMLElement;
  adaptViolations?: (violationsMap: ViolationsMap) => ViolationsMap;
  validations?: readonly Validation[];
}

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
  readonly #identifier: string;
  readonly #target: HTMLElement;
  readonly #validations: readonly Validation[] | undefined;
  readonly #views: ClippyHubViews = {};
  #violationsMap: ViolationsMap | undefined;
  #latestRun = 0;
  #destroyed = false;

  constructor({
    adaptViolations = (violationsMap) => violationsMap,
    identifier,
    target,
    validations,
  }: ClippyHubOptions) {
    this.#adaptViolations = adaptViolations;
    this.#identifier = identifier;
    this.#target = target;
    this.#validations = validations;
  }

  readonly scheduleValidation = debounce(() => this.validate(), VALIDATION_TIMEOUT);

  connect(views: ClippyHubViews): void {
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
