import type { ReactiveController, ReactiveControllerHost } from 'lit';

type ToolbarHost = ReactiveControllerHost & HTMLElement;

/**
 * Finds the innermost focusable element (button, input, select) inside shadow roots.
 * Toolbar items like clippy-button, clippy-combobox wrap native focusable elements in shadow DOM.
 */
function findFocusableElement(el: Element): HTMLElement | null {
  const focusable = el as HTMLElement;

  // If the element itself is a native focusable, return it
  if (focusable.matches('button, input, select, [tabindex]')) {
    return focusable;
  }

  // Look inside shadow root
  if (focusable.shadowRoot) {
    const inner = focusable.shadowRoot.querySelector('button, input, select, [tabindex]');
    if (inner) {
      return inner as HTMLElement;
    }
  }

  // Look in light DOM children
  const child = focusable.querySelector('button, input, select, [tabindex]');
  if (child) {
    return child as HTMLElement;
  }

  return null;
}

function isItemVisible(el: Element): boolean {
  const htmlEl = el as HTMLElement;
  return !htmlEl.hidden && getComputedStyle(htmlEl).display !== 'none';
}

function isItemDisabled(el: Element): boolean {
  return (el as HTMLElement).hasAttribute('disabled');
}

function getVisibleEnabledItems(group: Element): Element[] {
  const items = Array.from(group.querySelectorAll('[data-toolbar-item]'));
  return items.filter((item) => isItemVisible(item) && !isItemDisabled(item));
}

export class ToolbarKeyboardNavigationController implements ReactiveController {
  readonly #host: ToolbarHost;
  #activeGroupIndex = 0;
  #activeItemIndices: Map<number, number> = new Map();

  constructor(host: ToolbarHost) {
    this.#host = host;
    host.addController(this);
  }

  hostConnected(): void {
    // Listen on the shadow root so events from shadow DOM children are not retargeted
    const root = this.#host.shadowRoot ?? this.#host;
    root.addEventListener('keydown', this.#handleKeyDown as EventListener);
    root.addEventListener('focusin', this.#handleFocusIn);
  }

  hostDisconnected(): void {
    const root = this.#host.shadowRoot ?? this.#host;
    root.removeEventListener('keydown', this.#handleKeyDown as EventListener);
    root.removeEventListener('focusin', this.#handleFocusIn);
  }

  #getGroups(): Element[] {
    const root = this.#host.shadowRoot ?? this.#host;
    return Array.from(root.querySelectorAll('[role="group"]'));
  }

  #getVisibleGroups(): Element[] {
    return this.#getGroups().filter((group) => getVisibleEnabledItems(group).length > 0);
  }

  /**
   * Focus the active item in the active group, used when the toolbar receives focus via FOCUS_TOOLBAR.
   */
  focusActiveItem(): void {
    const groups = this.#getVisibleGroups();
    if (groups.length === 0) return;

    const groupIndex = Math.min(this.#activeGroupIndex, groups.length - 1);
    const items = getVisibleEnabledItems(groups[groupIndex]);
    if (items.length === 0) return;

    const itemIndex = Math.min(this.#activeItemIndices.get(groupIndex) ?? 0, items.length - 1);
    const focusable = findFocusableElement(items[itemIndex]);
    focusable?.focus();
  }

  readonly #handleFocusIn = (event: Event): void => {
    const path = event.composedPath();
    const groups = this.#getVisibleGroups();

    for (let gi = 0; gi < groups.length; gi++) {
      const items = getVisibleEnabledItems(groups[gi]);
      for (let ii = 0; ii < items.length; ii++) {
        if (path.includes(items[ii])) {
          this.#activeGroupIndex = gi;
          this.#activeItemIndices.set(gi, ii);
          return;
        }
      }
    }
  };

  readonly #handleKeyDown = (event: KeyboardEvent): void => {
    const groups = this.#getVisibleGroups();
    if (groups.length === 0) return;

    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        this.#moveWithinGroup(groups, 1);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.#moveWithinGroup(groups, -1);
        break;
      case 'Home':
        event.preventDefault();
        this.#moveToEdge(groups, 'first');
        break;
      case 'End':
        event.preventDefault();
        this.#moveToEdge(groups, 'last');
        break;
      case 'Tab': {
        const moved = this.#moveBetweenGroups(groups, event.shiftKey ? -1 : 1);
        if (moved) {
          event.preventDefault();
        }
        // If not moved, let the default Tab behavior take focus out of the toolbar
        break;
      }
    }
  };

  #moveWithinGroup(groups: Element[], direction: 1 | -1): void {
    const groupIndex = Math.min(this.#activeGroupIndex, groups.length - 1);
    const items = getVisibleEnabledItems(groups[groupIndex]);
    if (items.length === 0) return;

    const currentIndex = this.#activeItemIndices.get(groupIndex) ?? 0;
    const nextIndex = (currentIndex + direction + items.length) % items.length;

    this.#activeItemIndices.set(groupIndex, nextIndex);
    const focusable = findFocusableElement(items[nextIndex]);
    focusable?.focus();
  }

  #moveToEdge(groups: Element[], edge: 'first' | 'last'): void {
    const groupIndex = Math.min(this.#activeGroupIndex, groups.length - 1);
    const items = getVisibleEnabledItems(groups[groupIndex]);
    if (items.length === 0) return;

    const targetIndex = edge === 'first' ? 0 : items.length - 1;
    this.#activeItemIndices.set(groupIndex, targetIndex);
    const focusable = findFocusableElement(items[targetIndex]);
    focusable?.focus();
  }

  #moveBetweenGroups(groups: Element[], direction: 1 | -1): boolean {
    let nextGroupIndex = this.#activeGroupIndex + direction;

    // Skip groups with no enabled items
    while (nextGroupIndex >= 0 && nextGroupIndex < groups.length) {
      const items = getVisibleEnabledItems(groups[nextGroupIndex]);
      if (items.length > 0) {
        this.#activeGroupIndex = nextGroupIndex;
        const itemIndex = this.#activeItemIndices.get(nextGroupIndex) ?? 0;
        const clampedIndex = Math.min(itemIndex, items.length - 1);
        this.#activeItemIndices.set(nextGroupIndex, clampedIndex);

        const focusable = findFocusableElement(items[clampedIndex]);
        focusable?.focus();
        return true;
      }
      nextGroupIndex += direction;
    }

    // At the edge — let Tab leave the toolbar
    return false;
  }
}
