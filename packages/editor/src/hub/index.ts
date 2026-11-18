import type { Validation } from '@nl-design-system-community/clippy-a11y-validator';
import type { ContentViews } from '@/components/content-views';
import type { Sidebar } from '@/components/sidebar';
import type { ValidationsView } from '@/components/validations/view';
import type { Violation, ViolationsMap } from '@/types/validation';
import '@/components/content-views';
import '@/components/sidebar';
import '@/components/validations/view';
import { CustomEvents, type CorrectValidationIssueEvent, type FocusNodeEvent, type SidebarToggleEvent } from '@/events';
import { setDarkColorScheme, THEME_CLASSES, watchHostColorScheme } from '@/utils/colorScheme';
import { debounce } from '@/utils/debounce';
import { waitForMedia } from '@/utils/waitForMedia';
import { runValidation, VALIDATION_TIMEOUT } from '@/validations';

const MEDIA_SETTLE_TIMEOUT = 2000;

export interface ClippyHubView {
  identifier?: string;
  violationsMap?: ViolationsMap;
}

export interface ClippyHubViews {
  gutter?: ClippyHubView | null;
  list?: ClippyHubView | null;
  trigger?: (ClippyHubView & HTMLElement) | null;
}

export interface ClippyHubOptions {
  identifier: string;
  target: HTMLElement;
  /** The element whose surrounding color scheme the sidebar follows. Defaults to `target`. */
  colorSchemeElement?: HTMLElement;
  /** Whether the hub docks a sidebar with the validations view and the Content views in `<body>`. Defaults to `true`. */
  createSidebar?: boolean;
  adaptViolations?: (violationsMap: ViolationsMap) => ViolationsMap;
  /** Shows the violation of a focused validations view item. Defaults to scrolling it into view. */
  focusViolation?: (violation: Violation) => void;
  validations?: readonly Validation[];
}

const identifiers = new Set<string>();

const scrollIntoView = ({ element }: Violation): void => {
  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
};

const settleMedia = async (target: HTMLElement): Promise<void> => {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  await Promise.race([
    Promise.all([...target.querySelectorAll('img, video, audio')].map((el) => waitForMedia(el))),
    new Promise<void>((resolve) => {
      timeout = setTimeout(() => {
        console.warn(`Media did not settle within ${MEDIA_SETTLE_TIMEOUT}ms, validating anyway`);
        resolve();
      }, MEDIA_SETTLE_TIMEOUT);
    }),
  ]);
  clearTimeout(timeout);
};

export class ClippyHub {
  readonly sidebar: Sidebar | null = null;
  readonly validationsView: ValidationsView | null = null;
  readonly contentViews: ContentViews | null = null;
  #unwatchColorScheme?: () => void;
  readonly #adaptViolations: (violationsMap: ViolationsMap) => ViolationsMap;
  readonly #focusViolation: (violation: Violation) => void;
  readonly #identifier: string;
  readonly #target: HTMLElement;
  #validations: readonly Validation[] | undefined;
  readonly #views: ClippyHubViews = {};
  #violationsMap: ViolationsMap | undefined;
  #latestRun = 0;
  #destroyed = false;

  constructor({
    adaptViolations = (violationsMap) => violationsMap,
    colorSchemeElement,
    createSidebar = true,
    focusViolation = scrollIntoView,
    identifier,
    target,
    validations,
  }: ClippyHubOptions) {
    if (identifiers.has(identifier)) {
      throw new Error(
        `[clippy-hub] Duplicate identifier "${identifier}". Each Clippy hub on a page needs a unique identifier.`,
      );
    }
    identifiers.add(identifier);
    this.#adaptViolations = adaptViolations;
    this.#focusViolation = focusViolation;
    this.#identifier = identifier;
    this.#target = target;
    this.#validations = validations;

    globalThis.addEventListener(CustomEvents.SIDEBAR_TOGGLE, this.#handleSidebarToggle);
    globalThis.addEventListener(CustomEvents.FOCUS_NODE, this.#handleFocusNode);
    globalThis.addEventListener(CustomEvents.CORRECT_VALIDATION_ISSUE, this.#handleCorrection);
    if (!createSidebar) return;
    const sidebar = document.createElement('clippy-sidebar');
    this.sidebar = sidebar;
    this.validationsView = document.createElement('clippy-validations-view');
    this.contentViews = document.createElement('clippy-content-views');
    this.contentViews.htmlDocument = target;
    for (const element of [sidebar, this.validationsView, this.contentViews]) {
      element.identifier = identifier;
    }
    sidebar.classList.add(...THEME_CLASSES);
    this.#unwatchColorScheme = watchHostColorScheme(colorSchemeElement ?? target, (colorScheme) =>
      setDarkColorScheme(colorScheme === 'dark', sidebar),
    );
    sidebar.append(this.validationsView, this.contentViews);
    document.body.append(sidebar);
  }

  set validations(validations: readonly Validation[] | undefined) {
    this.#validations = validations;
  }

  readonly scheduleValidation = debounce(() => this.validate().catch(console.error), VALIDATION_TIMEOUT);

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
    if (this.#destroyed) return;
    this.#destroyed = true;
    identifiers.delete(this.#identifier);
    globalThis.removeEventListener(CustomEvents.SIDEBAR_TOGGLE, this.#handleSidebarToggle);
    globalThis.removeEventListener(CustomEvents.FOCUS_NODE, this.#handleFocusNode);
    globalThis.removeEventListener(CustomEvents.CORRECT_VALIDATION_ISSUE, this.#handleCorrection);
    this.#unwatchColorScheme?.();
    this.sidebar?.remove();
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

  readonly #handleSidebarToggle = (event: Event): void => {
    const { identifier, open } = (event as SidebarToggleEvent).detail;
    if (identifier !== this.#identifier) return;

    const { trigger } = this.#views;
    if (open) {
      this.validate().catch(console.error);
      [this.validationsView, this.contentViews].find((view) => view?.open)?.focus();
      return;
    }
    const active = document.activeElement;
    if (!active || active === document.body || this.sidebar?.contains(active)) {
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

  /** The correction runs right after this event, so validation is scheduled rather than run now. */
  readonly #handleCorrection = (event: Event): void => {
    if ((event as CorrectValidationIssueEvent).detail?.identifier !== this.#identifier) return;
    this.scheduleValidation();
  };

  #render(): void {
    const violationsMap = this.#violationsMap;
    if (!violationsMap) {
      return;
    }
    const { gutter, list, trigger } = this.#views;
    if (gutter) {
      gutter.violationsMap = violationsMap;
    }
    if (list) {
      list.violationsMap = violationsMap;
    }
    if (trigger) {
      trigger.violationsMap = violationsMap;
    }
    if (this.validationsView) {
      this.validationsView.violationsMap = violationsMap;
    }
    if (this.contentViews) {
      this.contentViews.violationsMap = violationsMap;
    }
  }
}
