/**
 * Returns a Promise that resolves once the given media element has finished
 * loading (or has failed), so that its rendered dimensions are available for
 * layout calculations.
 *
 * - `<img>` — resolves when `complete` is true, or on `load` / `error`
 * - `<video>` / `<audio>` — resolves when `readyState >= HAVE_METADATA`, or on `loadedmetadata` / `error`
 */
export const waitForMedia = (el: Element): Promise<void> =>
  new Promise<void>((resolve) => {
    if (el instanceof HTMLImageElement) {
      if (el.complete) {
        resolve();
        return;
      }
      el.addEventListener('load', () => resolve(), { once: true });
      el.addEventListener('error', () => resolve(), { once: true });
    } else if (el instanceof HTMLMediaElement) {
      if (el.readyState >= HTMLMediaElement.HAVE_METADATA) {
        resolve();
        return;
      }
      el.addEventListener('loadedmetadata', () => resolve(), { once: true });
      el.addEventListener('error', () => resolve(), { once: true });
    } else {
      resolve();
    }
  });
