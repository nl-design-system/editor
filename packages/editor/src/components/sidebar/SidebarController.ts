import type { ReactiveController, ReactiveControllerHost } from 'lit';
import { CustomEvents, type CloseSidebarEvent, type SidebarToggleDetail, type SidebarToggleEvent } from '@/events';

type SidebarHost = ReactiveControllerHost &
  HTMLElement & { identifier?: string; open: boolean; hide: () => void; updateComplete: Promise<boolean> };

const openHosts = new Set<HTMLElement>();

const canScroll = (element: Element, deltaY: number): boolean => {
  const { overflowY } = getComputedStyle(element);
  if (overflowY !== 'auto' && overflowY !== 'scroll') return false;
  const { clientHeight, scrollHeight, scrollTop } = element;
  return deltaY < 0 ? scrollTop > 0 : deltaY > 0 && scrollTop + clientHeight < scrollHeight - 1;
};

const updatePageWidth = () => {
  const [openHost] = openHosts;
  const root = document.documentElement;
  const { style } = root;
  const width = openHost?.getBoundingClientRect().width ?? 0;
  if (!width || width >= root.clientWidth) {
    style.removeProperty('margin-inline-end');
    style.removeProperty('max-inline-size');
    return;
  }
  style.marginInlineEnd = `${width}px`;
  style.maxInlineSize = `calc(100% - ${width}px)`;
};

/**
 * Docking of a `clippy-sidebar`: narrows the page by the width of the open sidebar, keeps
 * scrolling over it away from the page, and keeps one sidebar open per page. Announces every
 * change with {@link CustomEvents.SIDEBAR_TOGGLE} and closes on {@link CustomEvents.CLOSE_SIDEBAR},
 * both scoped to the host's hub identifier.
 */
export class SidebarController implements ReactiveController {
  readonly #host: SidebarHost;
  readonly #resizeObserver = new ResizeObserver(() => updatePageWidth());
  #announced = false;
  #pending = false;
  #announcing = false;

  constructor(host: SidebarHost) {
    this.#host = host;
    host.addController(this);
  }

  /** Announces the open state after the next update, even when it did not change. */
  announce(): void {
    this.#pending = true;
  }

  hostConnected(): void {
    this.#resizeObserver.observe(this.#host);
    this.#host.addEventListener('wheel', this.#keepWheelInSidebar, { passive: false });
    globalThis.addEventListener(CustomEvents.CLOSE_SIDEBAR, this.#handleClose);
    globalThis.addEventListener(CustomEvents.SIDEBAR_TOGGLE, this.#handleToggle);
    if (this.#host.open) {
      openHosts.add(this.#host);
      updatePageWidth();
    }
  }

  hostDisconnected(): void {
    this.#resizeObserver.disconnect();
    this.#host.removeEventListener('wheel', this.#keepWheelInSidebar);
    globalThis.removeEventListener(CustomEvents.CLOSE_SIDEBAR, this.#handleClose);
    globalThis.removeEventListener(CustomEvents.SIDEBAR_TOGGLE, this.#handleToggle);
    openHosts.delete(this.#host);
    updatePageWidth();
  }

  async hostUpdated(): Promise<void> {
    const { open } = this.#host;
    if (this.#announced === open && !this.#pending) return;
    this.#announced = open;
    this.#pending = false;
    if (open) {
      openHosts.add(this.#host);
    } else {
      openHosts.delete(this.#host);
    }
    updatePageWidth();
    // Announce once the views show the change, so they can take focus.
    await Promise.all(
      [this.#host, ...this.#host.children].map((element) => (element as Partial<SidebarHost>).updateComplete),
    );
    this.#announcing = true;
    globalThis.dispatchEvent(
      new CustomEvent<SidebarToggleDetail>(CustomEvents.SIDEBAR_TOGGLE, {
        detail: { identifier: this.#host.identifier, open },
      }),
    );
    this.#announcing = false;
  }

  readonly #handleClose = (event: Event): void => {
    if ((event as CloseSidebarEvent).detail.identifier !== this.#host.identifier) return;
    this.#host.hide();
  };

  readonly #handleToggle = (event: Event): void => {
    if ((event as SidebarToggleEvent).detail.open && !this.#announcing && this.#host.open) {
      this.#host.hide();
    }
  };

  readonly #keepWheelInSidebar = (event: WheelEvent) => {
    const path = event.composedPath();
    const inSidebar = path.slice(0, path.indexOf(this.#host)).filter((target) => target instanceof Element);
    if (!inSidebar.some((element) => canScroll(element, event.deltaY))) {
      event.preventDefault();
    }
  };
}
