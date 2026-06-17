import { describe, it, expect } from 'vitest';
import { waitForMedia } from './waitForMedia.ts';

/** Smallest valid GIF (1×1 px) as a data URI — used to trigger a real load event. */
const TINY_GIF = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

/** Malformed data URI — triggers a real error event on <img>. */
const BROKEN_IMAGE = 'data:image/png;base64,!!invalid!!';

describe('waitForMedia', () => {
  it('resolves immediately for a non-media element', async () => {
    const div = document.createElement('div');
    await expect(waitForMedia(div)).resolves.toBeUndefined();
  });

  it('resolves immediately for an already-complete image (no src)', async () => {
    const img = document.createElement('img');
    // Per the HTML spec an <img> with no src attribute is complete=true.
    expect(img.complete).toBe(true);
    await expect(waitForMedia(img)).resolves.toBeUndefined();
  });

  it('resolves when an image finishes loading', async () => {
    const img = document.createElement('img');
    // Setting src puts the image into loading state (complete=false); the real
    // load event resolves the promise once the browser has decoded the data URI.
    img.src = TINY_GIF;
    await expect(waitForMedia(img)).resolves.toBeUndefined();
  });

  it('resolves when an image fails to load', async () => {
    const img = document.createElement('img');
    // An invalid data URI causes the browser to fire a real error event.
    img.src = BROKEN_IMAGE;
    await expect(waitForMedia(img)).resolves.toBeUndefined();
  });

  it('resolves immediately for a video already at HAVE_METADATA', async () => {
    const video = document.createElement('video');
    // readyState is read-only; there is no easy browser-native way to reach
    // HAVE_METADATA without loading real media, so we stub just this property.
    Object.defineProperty(video, 'readyState', {
      configurable: true,
      get: () => HTMLMediaElement.HAVE_METADATA,
    });
    await expect(waitForMedia(video)).resolves.toBeUndefined();
  });

  it('resolves when a video fires a loadedmetadata event', async () => {
    const video = document.createElement('video');
    // A <video> with no src has readyState=HAVE_NOTHING (0) natively.
    const promise = waitForMedia(video);
    video.dispatchEvent(new Event('loadedmetadata'));
    await expect(promise).resolves.toBeUndefined();
  });

  it('resolves when a video fires an error event', async () => {
    const video = document.createElement('video');
    // A <video> with no src has readyState=HAVE_NOTHING (0) natively.
    const promise = waitForMedia(video);
    video.dispatchEvent(new Event('error'));
    await expect(promise).resolves.toBeUndefined();
  });
});
