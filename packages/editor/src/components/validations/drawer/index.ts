import type { ValidationSeverity } from '@nl-design-system-community/clippy-a11y-validator';
import tabsStyles from '@amsterdam/design-system-css/dist/tabs/tabs.css?inline';
import { localized, msg } from '@lit/localize';
import numberBadgeStyles from '@nl-design-system-candidate/number-badge-css/number-badge.css?inline';
import paragraphStyle from '@nl-design-system-candidate/paragraph-css/paragraph.css?inline';
import { safeCustomElement } from '@nl-design-system-community/clippy-components/lib/decorators';
import X from '@tabler/icons/outline/x.svg?raw';
import { html, LitElement, nothing, unsafeCSS, type PropertyValues } from 'lit';
import '@/components/validations/list';
import '@/components/content-views/heading-structure';
import '@/components/content-views/link-list';
import '@/components/content-views/language-changes';
import { property, state } from 'lit/decorators.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import type { ValidationItem } from '@/components/validations/validation-item';
import type { ViolationsMap } from '@/types/validation';
import '@/components/validation-filters';
import '@nl-design-system-community/clippy-components/clippy-button';
import '@nl-design-system-community/clippy-components/clippy-icon';
import {
  CustomEvents,
  type CloseSidebarEvent,
  type CorrectValidationIssueEvent,
  type DocumentOverviewMode,
  type FilterChangeEvent,
  type FocusNodeEvent,
  type OpenDocumentOverviewEvent,
  type OpenValidationGroupEvent,
  type SidebarToggleDetail,
  type SidebarToggleEvent,
} from '@/events';
import { localizeHost } from '@/localization';
import drawerStyles from './styles';

const tag = 'clippy-validations-drawer';

const NO_VIOLATIONS: ViolationsMap = new Map();

const canScroll = (element: Element, deltaY: number): boolean => {
  const { overflowY } = getComputedStyle(element);
  if (overflowY !== 'auto' && overflowY !== 'scroll') return false;
  const { clientHeight, scrollHeight, scrollTop } = element;
  return deltaY < 0 ? scrollTop > 0 : deltaY > 0 && scrollTop + clientHeight < scrollHeight - 1;
};

const CONTENT_VIEWS = ['heading-structure', 'link-list', 'language-changes'] as const;

type ContentView = (typeof CONTENT_VIEWS)[number];

const isContentView = (mode: DocumentOverviewMode): mode is ContentView => CONTENT_VIEWS.includes(mode as ContentView);

const tabId = (view: ContentView) => `clippy-drawer-tab-${view}`;

const panelId = (view: ContentView) => `clippy-drawer-panel-${view}`;

/**
 * Docked drawer panel that lists all accessibility violations and
 * provides document overview panels (heading structure, link list, language
 * changes). Opens and closes in response to the global
 * `CustomEvents.OPEN_DOCUMENT_OVERVIEW` event, scoped to the current editor
 * identifier so that only the drawer of the editor that dispatched it opens.
 *
 * @tag clippy-validations-drawer
 *
 * @fires {OpenDocumentOverviewEvent} OPEN_DOCUMENT_OVERVIEW - Listens for this event to
 *   toggle the panel open state.
 * @fires {CustomEvent} FILTER_CHANGE - Listens to filter the displayed validations
 *   by severity.
 * @fires {SidebarToggleEvent} SIDEBAR_TOGGLE - Dispatched on `globalThis`
 *   whenever the drawer opens or closes.
 *
 * @example
 * ```html
 * <clippy-validations-drawer></clippy-validations-drawer>
 * ```
 */
@localized()
@safeCustomElement(tag)
export class ValidationsDrawer extends LitElement {
  static override readonly styles = [
    drawerStyles,
    unsafeCSS(numberBadgeStyles),
    unsafeCSS(paragraphStyle),
    unsafeCSS(tabsStyles),
  ];
  @state()
  private open = false;

  @state()
  private selectedSeverity: ValidationSeverity | null = null;

  @state()
  private _mode: DocumentOverviewMode = 'validations';

  /**
   * When set, the drawer shows only these validation ranges — a clicked gutter
   * item plus any validations whose range intersects it (they share content, so
   * their indicators sit on the same spot) — and hides the severity filters.
   * `null` means the full, filterable list is shown.
   */
  @state()
  private focusedValidationGroup: Range[] | null = null;

  /**
   * The violations to list, pushed by a Clippy hub. The drawer passes them on to its
   * filters, list and Content views.
   */
  @property({ attribute: false })
  violationsMap?: ViolationsMap;

  /** The validated element, which the Content views read. @see {@link violationsMap} */
  @property({ attribute: false })
  htmlDocument?: HTMLElement;

  /** @see {@link violationsMap} */
  @property({ attribute: false })
  identifier?: string;

  readonly #resizeObserver = new ResizeObserver(() => this.#updatePageWidth());

  get #violations(): ViolationsMap {
    return this.violationsMap ?? NO_VIOLATIONS;
  }

  override updated(changed: PropertyValues) {
    super.updated(changed);
    if (!changed.has('open')) return;
    this.toggleAttribute('open', this.open);
    this.#updatePageWidth();
    if (this.open || changed.get('open') !== undefined) {
      globalThis.dispatchEvent(
        new CustomEvent<SidebarToggleDetail>(CustomEvents.SIDEBAR_TOGGLE, {
          detail: { identifier: this.identifier, open: this.open },
        }),
      );
    }
  }

  /** Focus the drawer title. */
  override focus() {
    this.shadowRoot?.querySelector<HTMLElement>('.clippy-drawer__title')?.focus();
  }

  #updatePageWidth() {
    const openDrawer = document.querySelector(`${tag}[open]`);
    const root = document.documentElement;
    const { style } = root;
    const width = openDrawer?.getBoundingClientRect().width ?? 0;
    if (!width || width >= root.clientWidth) {
      style.removeProperty('margin-inline-end');
      style.removeProperty('max-inline-size');
      return;
    }
    style.marginInlineEnd = `${width}px`;
    style.maxInlineSize = `calc(100% - ${width}px)`;
  }

  override connectedCallback() {
    super.connectedCallback();
    localizeHost(this);
    this.#resizeObserver.observe(this);
    this.addEventListener('wheel', this.#keepWheelInDrawer, { passive: false });
    if (this.hasUpdated) this.#updatePageWidth();
    globalThis.addEventListener(CustomEvents.CLOSE_SIDEBAR, this.#handleCloseDrawer);
    globalThis.addEventListener(CustomEvents.CORRECT_VALIDATION_ISSUE, this.#closeDialog);
    globalThis.addEventListener(CustomEvents.FILTER_CHANGE, this.#handleFilterChange);
    globalThis.addEventListener(CustomEvents.FOCUS_NODE, this.#focusNode);
    globalThis.addEventListener(CustomEvents.FOCUS_VALIDATION_ITEM_IN_SIDEBAR, this.#focusValidationItem);
    globalThis.addEventListener(CustomEvents.OPEN_DOCUMENT_OVERVIEW, this.#handleOverviewOpen);
    globalThis.addEventListener(CustomEvents.OPEN_VALIDATION_GROUP, this.#openValidationGroup);
    globalThis.addEventListener(CustomEvents.SIDEBAR_TOGGLE, this.#handleDrawerToggle);
  }

  override disconnectedCallback() {
    this.#resizeObserver.disconnect();
    this.removeEventListener('wheel', this.#keepWheelInDrawer);
    this.#updatePageWidth();
    globalThis.removeEventListener(CustomEvents.CLOSE_SIDEBAR, this.#handleCloseDrawer);
    globalThis.removeEventListener(CustomEvents.CORRECT_VALIDATION_ISSUE, this.#closeDialog);
    globalThis.removeEventListener(CustomEvents.FILTER_CHANGE, this.#handleFilterChange);
    globalThis.removeEventListener(CustomEvents.FOCUS_NODE, this.#focusNode);
    globalThis.removeEventListener(CustomEvents.FOCUS_VALIDATION_ITEM_IN_SIDEBAR, this.#focusValidationItem);
    globalThis.removeEventListener(CustomEvents.OPEN_DOCUMENT_OVERVIEW, this.#handleOverviewOpen);
    globalThis.removeEventListener(CustomEvents.OPEN_VALIDATION_GROUP, this.#openValidationGroup);
    globalThis.removeEventListener(CustomEvents.SIDEBAR_TOGGLE, this.#handleDrawerToggle);
    super.disconnectedCallback();
  }

  readonly #keepWheelInDrawer = (event: WheelEvent) => {
    const path = event.composedPath();
    const inDrawer = path.slice(0, path.indexOf(this)).filter((target) => target instanceof Element);
    if (!inDrawer.some((element) => canScroll(element, event.deltaY))) {
      event.preventDefault();
    }
  };

  readonly #closeDialog = (event: Event) => {
    if (event instanceof CustomEvent) {
      const eventIdentifier = (event as CorrectValidationIssueEvent).detail?.identifier;
      if (eventIdentifier !== this.identifier) return;
    }
    if (this.open) {
      this.open = false;
    }
  };

  readonly #handleOverviewOpen = (event: Event) => {
    const { identifier, mode } = (event as OpenDocumentOverviewEvent).detail;
    if (identifier !== this.identifier) return;

    this._mode = mode;
    this.focusedValidationGroup = null;
    if (!this.open) {
      this.open = true;
    }
  };

  readonly #openValidationGroup = (event: Event) => {
    const { identifier, ranges } = (event as OpenValidationGroupEvent).detail;
    if (identifier !== this.identifier) return;
    this._mode = 'validations';
    this.selectedSeverity = null;
    this.focusedValidationGroup = ranges;
    this.open = true;
  };

  readonly #closeDrawer = () => {
    this.open = false;
    this.focusedValidationGroup = null;
  };

  readonly #handleDrawerToggle = (event: Event) => {
    const { identifier, open } = (event as SidebarToggleEvent).detail;
    if (open && identifier !== this.identifier && this.open) {
      this.#closeDrawer();
    }
  };

  readonly #handleCloseDrawer = (event: Event) => {
    const { identifier } = (event as CloseSidebarEvent).detail;
    if (identifier !== this.identifier) return;
    this.#closeDrawer();
  };

  // Clears the focused group so the full, filterable validation list is shown.
  readonly #showAllValidations = () => {
    this.focusedValidationGroup = null;
  };

  // The drawer is a docked panel rather than a native dialog, so Escape-to-close
  // is handled explicitly to preserve keyboard dismissal.
  readonly #handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && this.open) {
      event.preventDefault();
      this.#closeDrawer();
    }
  };

  readonly #focusNode = (event: Event) => {
    const { range } = (event as FocusNodeEvent).detail;
    if (!range) return;

    const selection = globalThis.getSelection();
    if (selection) {
      selection.collapse(range.startContainer, range.startOffset);
    }
  };

  readonly #focusValidationItem = async (event: CustomEventInit<{ range: Range; identifier: string }>) => {
    const { identifier, range } = event.detail || {};
    if (!range) return;

    if (!this.open && identifier === this.identifier) {
      this._mode = 'validations';
      this.focusedValidationGroup = null;
      this.open = true;
    }

    await this.updateComplete;

    const listEl = this.shadowRoot?.querySelector('clippy-validations-list');
    const items = listEl?.shadowRoot?.querySelectorAll('clippy-validation-item');
    const match = [...(items ?? [])].find((el) => (el as ValidationItem).range === range);
    if (match instanceof HTMLElement) {
      match.scrollIntoView({ behavior: 'smooth', block: 'center' });
      (match as ValidationItem).focus();
    }
  };

  readonly #handleFilterChange = (event: Event) => {
    const { identifier, severity } = (event as FilterChangeEvent).detail;
    if (identifier !== this.identifier) return;

    this.selectedSeverity = (severity as ValidationSeverity) || null;
  };

  /** Title of the content currently shown in the drawer. */
  #getTitle(): string {
    return this.#getLabel(this._mode);
  }

  #getLabel(mode: DocumentOverviewMode): string {
    switch (mode) {
      case 'heading-structure':
        return msg('Heading structure');
      case 'link-list':
        return msg('Links');
      case 'language-changes':
        return msg('Language changes');
      default:
        return msg('Errors, warnings or tips');
    }
  }

  /** Whether the drawer is focused on a single validation group. */
  get #hasFocusedValidationGroup(): boolean {
    return this.focusedValidationGroup !== null;
  }

  /** Severity applied to the list; suppressed while a focused group is shown. */
  get #listSeverity(): ValidationSeverity | null {
    if (this.#hasFocusedValidationGroup) return null;
    return this.selectedSeverity;
  }

  /** "Show all validations" button, rendered only while a group is focused. */
  #renderShowAllButton() {
    if (!this.#hasFocusedValidationGroup) return nothing;
    return html`<clippy-button
      class="clippy-drawer__show-all"
      purpose="secondary"
      size="small"
      @click=${this.#showAllValidations}
    >
      ${msg('Show all validations')}
    </clippy-button>`;
  }

  readonly #handleTabKeydown = async (event: KeyboardEvent) => {
    if (!isContentView(this._mode)) return;
    const next = this.#getNextContentView(event.key, CONTENT_VIEWS.indexOf(this._mode));
    if (!next) return;

    event.preventDefault();
    this._mode = next;
    await this.updateComplete;
    this.shadowRoot?.getElementById(tabId(next))?.focus();
  };

  #getNextContentView(key: string, index: number): ContentView | undefined {
    const { length } = CONTENT_VIEWS;
    switch (key) {
      case 'ArrowRight':
        return CONTENT_VIEWS[(index + 1) % length];
      case 'ArrowLeft':
        return CONTENT_VIEWS[(index - 1 + length) % length];
      case 'Home':
        return CONTENT_VIEWS[0];
      case 'End':
        return CONTENT_VIEWS[length - 1];
      default:
        return undefined;
    }
  }

  /** Tabs to switch between the Content views, rendered only while one is shown. */
  #renderTabs() {
    if (!isContentView(this._mode)) return nothing;
    return html`<div class="clippy-drawer__tabs ams-tabs__list" role="tablist">
      ${CONTENT_VIEWS.map((view) => {
        const selected = view === this._mode;
        const label = this.#getLabel(view);
        return html`<button
          class="ams-tabs__button"
          id=${tabId(view)}
          role="tab"
          type="button"
          aria-controls=${panelId(view)}
          aria-selected=${selected}
          tabindex=${selected ? 0 : -1}
          @click=${() => (this._mode = view)}
          @keydown=${this.#handleTabKeydown}
        >
          <span class="ams-tabs__button-label">${label}</span>
          <span class="ams-tabs__button-label-hidden">${label}</span>
        </button>`;
      })}
    </div>`;
  }

  #renderContentViewPanel(view: ContentView, content: unknown) {
    return html`<div
      class="ams-tabs__panel"
      id=${panelId(view)}
      role="tabpanel"
      aria-labelledby=${tabId(view)}
      tabindex="0"
      ?hidden=${this._mode !== view}
    >
      ${content}
    </div>`;
  }

  override render() {
    const isValidations = this._mode === 'validations';
    const violations = this.#violations;
    const htmlDocument = this.htmlDocument;
    return html`
      <div
        data-testid="clippy-validations-drawer"
        class="clippy-drawer__content"
        role="region"
        aria-labelledby="clippy-drawer-title"
        ?hidden=${!this.open}
        @keydown=${this.#handleKeydown}
      >
        <div class="clippy-drawer__header">
          <h3 id="clippy-drawer-title" class="clippy-drawer__title" tabindex="-1">${this.#getTitle()}</h3>
          <clippy-button class="clippy-drawer__close-button" icon-only purpose="subtle" @click=${this.#closeDrawer}>
            <clippy-icon slot="iconStart">${unsafeSVG(X)}</clippy-icon>
            ${msg('Close')}
          </clippy-button>
        </div>
        ${this.#renderTabs()}
        <div class="clippy-drawer__filters">
          <clippy-validation-filters
            .identifier=${this.identifier}
            .violationsMap=${violations}
            ?hidden=${!isValidations || this.#hasFocusedValidationGroup}
          ></clippy-validation-filters>
          ${this.#renderShowAllButton()}
        </div>
        <div class="clippy-drawer__body">
          ${this.#renderContentViewPanel(
            'heading-structure',
            html`<clippy-heading-structure
              .htmlDocument=${htmlDocument}
              .violationsMap=${violations}
            ></clippy-heading-structure>`,
          )}
          ${this.#renderContentViewPanel(
            'link-list',
            html`<clippy-link-list .htmlDocument=${htmlDocument} .violationsMap=${violations}></clippy-link-list>`,
          )}
          ${this.#renderContentViewPanel(
            'language-changes',
            html`<clippy-language-changes .htmlDocument=${htmlDocument}></clippy-language-changes>`,
          )}
          <div role="region" aria-label=${msg('Validations')} ?hidden=${!isValidations}>
            <clippy-validations-list
              .identifier=${this.identifier}
              .violationsMap=${violations}
              .severity=${this.#listSeverity}
              .focusedValidationGroup=${this.focusedValidationGroup}
            ></clippy-validations-list>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'clippy-validations-drawer': ValidationsDrawer;
  }
}
