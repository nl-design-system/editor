import type { Validation } from '@nl-design-system-community/clippy-a11y-validator';
import type { Drawer } from '@/components/drawer';
import type { ValidationsView } from '@/components/validations/view';
import type { Violation, ViolationsMap } from '@/types/validation';
import { isContentView, type ContentViews } from '@/components/content-views';
import '@/components/content-views';
import '@/components/drawer';
import '@/components/validations/view';
import {
  CustomEvents,
  type CloseValidationsDrawerEvent,
  type CorrectValidationIssueEvent,
  type FocusNodeEvent,
  type FocusValidationItemInDrawerEvent,
  type OpenDocumentOverviewEvent,
  type OpenValidationGroupEvent,
  type ValidationsDrawerToggleDetail,
} from '@/events';
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
  /** The element whose surrounding color scheme the Drawer follows. Defaults to `target`. */
  colorSchemeElement?: HTMLElement;
  /** Whether the hub docks a Drawer in `<body>`. Defaults to `true`. */
  createDrawer?: boolean;
  adaptViolations?: (violationsMap: ViolationsMap) => ViolationsMap;
  /** Shows the violation of a focused drawer item. Defaults to scrolling it into view. */
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
  readonly drawer: Drawer | null = null;
  readonly #validationsView: ValidationsView | null = null;
  readonly #contentViews: ContentViews | null = null;
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
    createDrawer = true,
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

    globalThis.addEventListener(CustomEvents.FOCUS_NODE, this.#handleFocusNode);
    globalThis.addEventListener(CustomEvents.CORRECT_VALIDATION_ISSUE, this.#handleCorrection);
    if (!createDrawer) return;
    globalThis.addEventListener(CustomEvents.OPEN_DOCUMENT_OVERVIEW, this.#handleOverviewOpen);
    globalThis.addEventListener(CustomEvents.OPEN_VALIDATION_GROUP, this.#handleValidationGroupOpen);
    globalThis.addEventListener(CustomEvents.FOCUS_VALIDATION_ITEM_IN_DRAWER, this.#handleValidationItemFocus);
    globalThis.addEventListener(CustomEvents.CLOSE_VALIDATIONS_DRAWER, this.#handleDrawerClose);
    const drawer = document.createElement('clippy-sidebar');
    this.drawer = drawer;
    this.#validationsView = document.createElement('clippy-validations-view');
    this.#contentViews = document.createElement('clippy-content-views');
    this.#contentViews.htmlDocument = target;
    for (const view of [this.#validationsView, this.#contentViews]) {
      view.identifier = identifier;
      view.hidden = true;
    }
    drawer.classList.add(...THEME_CLASSES);
    this.#unwatchColorScheme = watchHostColorScheme(colorSchemeElement ?? target, (colorScheme) =>
      setDarkColorScheme(colorScheme === 'dark', drawer),
    );
    drawer.addEventListener('toggle', this.#handleDrawerToggle);
    drawer.append(this.#validationsView, this.#contentViews);
    document.body.append(drawer);
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
    globalThis.removeEventListener(CustomEvents.FOCUS_NODE, this.#handleFocusNode);
    globalThis.removeEventListener(CustomEvents.CORRECT_VALIDATION_ISSUE, this.#handleCorrection);
    globalThis.removeEventListener(CustomEvents.OPEN_DOCUMENT_OVERVIEW, this.#handleOverviewOpen);
    globalThis.removeEventListener(CustomEvents.OPEN_VALIDATION_GROUP, this.#handleValidationGroupOpen);
    globalThis.removeEventListener(CustomEvents.FOCUS_VALIDATION_ITEM_IN_DRAWER, this.#handleValidationItemFocus);
    globalThis.removeEventListener(CustomEvents.CLOSE_VALIDATIONS_DRAWER, this.#handleDrawerClose);
    this.#unwatchColorScheme?.();
    this.drawer?.remove();
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

  /** Shows `view` in the drawer, named and headed by its label, and opens the drawer. */
  #openDrawer(view: ValidationsView | ContentViews | null): void {
    const { drawer } = this;
    if (!drawer || !view) return;
    for (const other of [this.#validationsView, this.#contentViews]) {
      if (other) other.hidden = other !== view;
    }
    drawer.label = view.label;
    if (drawer.open) {
      drawer.updateComplete.then(() => drawer.focus()).catch(console.error);
    } else {
      drawer.open = true;
    }
  }

  readonly #handleOverviewOpen = (event: Event): void => {
    const { identifier, mode } = (event as OpenDocumentOverviewEvent).detail;
    if (identifier !== this.#identifier) return;
    if (isContentView(mode)) {
      if (this.#contentViews) this.#contentViews.view = mode;
      this.#openDrawer(this.#contentViews);
    } else {
      if (this.#validationsView) this.#validationsView.focusedValidationGroup = null;
      this.#openDrawer(this.#validationsView);
    }
  };

  readonly #handleValidationGroupOpen = (event: Event): void => {
    const { identifier, ranges } = (event as OpenValidationGroupEvent).detail;
    if (identifier !== this.#identifier || !this.#validationsView) return;
    this.#validationsView.focusedValidationGroup = ranges;
    this.#openDrawer(this.#validationsView);
  };

  readonly #handleValidationItemFocus = (event: Event): void => {
    const view = this.#validationsView;
    if ((event as FocusValidationItemInDrawerEvent).detail.identifier !== this.#identifier || !view) return;
    if (this.drawer?.open && !view.hidden) return;
    view.focusedValidationGroup = null;
    this.#openDrawer(view);
  };

  readonly #handleDrawerClose = (event: Event): void => {
    if ((event as CloseValidationsDrawerEvent).detail.identifier !== this.#identifier || !this.drawer) return;
    this.drawer.open = false;
  };

  readonly #handleDrawerToggle = (event: Event): void => {
    const open = (event as ToggleEvent).newState === 'open';
    globalThis.dispatchEvent(
      new CustomEvent<ValidationsDrawerToggleDetail>(CustomEvents.VALIDATIONS_DRAWER_TOGGLE, {
        detail: { identifier: this.#identifier, open },
      }),
    );

    const { trigger } = this.#views;
    if (open) {
      this.validate().catch(console.error);
      this.drawer?.focus();
      return;
    }
    const active = document.activeElement;
    if (!active || active === document.body || this.drawer?.contains(active)) {
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
    if (this.drawer) this.drawer.open = false;
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
    if (this.#validationsView) {
      this.#validationsView.violationsMap = violationsMap;
    }
    if (this.#contentViews) {
      this.#contentViews.violationsMap = violationsMap;
    }
  }
}
