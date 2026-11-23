import type { ReactiveController, ReactiveControllerHost } from 'lit';

type DrawerHost = ReactiveControllerHost & HTMLElement & { open: boolean; updateComplete: Promise<boolean> };

const openHosts = new Set<DrawerHost>();

const canScroll = (element: Element, deltaY: number): boolean => {
  const { overflowY } = getComputedStyle(element);
  if (overflowY !== 'auto' && overflowY !== 'scroll') return false;
  const { clientHeight, scrollHeight, scrollTop } = element;
  return deltaY < 0 ? scrollTop > 0 : deltaY > 0 && scrollTop + clientHeight < scrollHeight - 1;
};

const elementAtCentre = (): Element | null => {
  const { left, right } = document.documentElement.getBoundingClientRect();
  const x = (Math.max(left, 0) + Math.min(right, globalThis.innerWidth)) / 2;
  const element = document.elementFromPoint(x, globalThis.innerHeight / 2);
  return element && ![...openHosts].some((host) => host.contains(element)) ? element : null;
};

const updatePageWidth = () => {
  const [openHost] = openHosts;
  const root = document.documentElement;
  const { style } = root;
  const width = openHost?.getBoundingClientRect().width ?? 0;
  const margin = !width || width >= root.clientWidth ? '' : `${width}px`;
  if (style.marginInlineEnd === margin) return;
  const anchor = elementAtCentre();
  const before = anchor?.getBoundingClientRect().top ?? 0;
  if (margin) {
    style.marginInlineEnd = margin;
    style.maxInlineSize = `calc(100% - ${margin})`;
  } else {
    style.removeProperty('margin-inline-end');
    style.removeProperty('max-inline-size');
  }
  const shift = anchor ? anchor.getBoundingClientRect().top - before : 0;
  if (shift) globalThis.scrollBy({ behavior: 'instant', top: shift });
};

/**
 * Docking of a `clippy-sidebar`: narrows the page by the width of the open drawer while keeping
 * the text at the centre of the viewport in place, keeps scrolling over it away from the page,
 * and keeps one drawer open per page. Fires a `toggle` event (a `ToggleEvent`) on the host once
 * it shows a change of its open state.
 */
export class DrawerController implements ReactiveController {
  readonly #host: DrawerHost;
  readonly #resizeObserver = new ResizeObserver(() => updatePageWidth());
  #announced = false;

  constructor(host: DrawerHost) {
    this.#host = host;
  }

  hostConnected(): void {
    this.#resizeObserver.observe(this.#host);
    this.#host.addEventListener('wheel', this.#keepWheelInDrawer, { passive: false });
    if (this.#host.open) {
      openHosts.add(this.#host);
      updatePageWidth();
    }
  }

  hostDisconnected(): void {
    this.#resizeObserver.disconnect();
    this.#host.removeEventListener('wheel', this.#keepWheelInDrawer);
    openHosts.delete(this.#host);
    updatePageWidth();
  }

  hostUpdated(): void {
    const { open } = this.#host;
    if (this.#announced === open) return;
    this.#announced = open;
    if (open) {
      for (const other of openHosts) {
        if (other !== this.#host) other.open = false;
      }
      openHosts.add(this.#host);
    } else {
      openHosts.delete(this.#host);
    }
    updatePageWidth();
    this.#host.dispatchEvent(
      new ToggleEvent('toggle', { newState: open ? 'open' : 'closed', oldState: open ? 'closed' : 'open' }),
    );
  }

  readonly #keepWheelInDrawer = (event: WheelEvent) => {
    const path = event.composedPath();
    const inDrawer = path.slice(0, path.indexOf(this.#host)).filter((target) => target instanceof Element);
    if (!inDrawer.some((element) => canScroll(element, event.deltaY))) {
      event.preventDefault();
    }
  };
}
