import { describe, it, expect } from 'vitest';
import { waitForMedia } from './waitForMedia.ts';

describe('waitForMedia', () => {
  it('resolves immediately for a non-media element', async () => {
    const div = document.createElement('div');
    await expect(waitForMedia(div)).resolves.toBeUndefined();
  });

  it('resolves immediately for an already-complete image', async () => {
    const img = document.createElement('img');
    // jsdom sets complete=true when no src is set
    Object.defineProperty(img, 'complete', { configurable: true, get: () => true });
    await expect(waitForMedia(img)).resolves.toBeUndefined();
  });

  it('resolves when an incomplete image fires a load event', async () => {
    const img = document.createElement('img');
    Object.defineProperty(img, 'complete', { configurable: true, get: () => false });

    const promise = waitForMedia(img);
    img.dispatchEvent(new Event('load'));

    await expect(promise).resolves.toBeUndefined();
  });

  it('resolves when an incomplete image fires an error event', async () => {
    const img = document.createElement('img');
    Object.defineProperty(img, 'complete', { configurable: true, get: () => false });

    const promise = waitForMedia(img);
    img.dispatchEvent(new Event('error'));

    await expect(promise).resolves.toBeUndefined();
  });

  it('resolves immediately for a video with sufficient readyState', async () => {
    const video = document.createElement('video');
    Object.defineProperty(video, 'readyState', {
      configurable: true,
      get: () => HTMLMediaElement.HAVE_METADATA,
    });
    await expect(waitForMedia(video)).resolves.toBeUndefined();
  });

  it('resolves when a video fires a loadedmetadata event', async () => {
    const video = document.createElement('video');
    Object.defineProperty(video, 'readyState', {
      configurable: true,
      get: () => HTMLMediaElement.HAVE_NOTHING,
    });

    const promise = waitForMedia(video);
    video.dispatchEvent(new Event('loadedmetadata'));

    await expect(promise).resolves.toBeUndefined();
  });

  it('resolves when a video fires an error event', async () => {
    const video = document.createElement('video');
    Object.defineProperty(video, 'readyState', {
      configurable: true,
      get: () => HTMLMediaElement.HAVE_NOTHING,
    });

    const promise = waitForMedia(video);
    video.dispatchEvent(new Event('error'));

    await expect(promise).resolves.toBeUndefined();
  });
});
