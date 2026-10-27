import type { ReactiveController, ReactiveControllerHost } from 'lit';

const DEFAULT_DEBOUNCE_MS = 100;

export class ResizeController implements ReactiveController {
  private readonly host: ReactiveControllerHost;
  private observer: ResizeObserver | undefined;
  private timeout: ReturnType<typeof setTimeout> | undefined;

  constructor(host: ReactiveControllerHost) {
    this.host = host;
    host.addController(this);
  }

  observe(...elements: Element[]): void {
    this.disconnect();
    this.observer = new ResizeObserver(() => {
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        this.host.requestUpdate();
      }, DEFAULT_DEBOUNCE_MS);
    });
    for (const element of elements) {
      this.observer.observe(element, { box: 'border-box' });
    }
  }

  disconnect(): void {
    this.observer?.disconnect();
    this.observer = undefined;
    clearTimeout(this.timeout);
    this.timeout = undefined;
  }

  hostDisconnected(): void {
    this.disconnect();
  }
}
