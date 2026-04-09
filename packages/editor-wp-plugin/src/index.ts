/**
 * index.ts — NL Design System Community Editor WordPress Plugin
 *
 * All three Lit web components live in the MAIN document — Lit's internal
 * renderer uses the global `document` for comment/text marker nodes and
 * cannot run inside a cross-document context (iframe). Cross-document
 * insertion throws `NotSupportedError: The result must be in the same document`.
 *
 * Architecture
 * ─────────────
 * • `clippy-context` + `clippy-content` → main document, off-screen
 *   (`position:fixed; left:-9999px; width:720px`).
 *   Owns the TipTap editor, runs validators, publishes results via
 *   `lightValidationsContext` on `document.body`.
 *
 * • `clippy-validations-gutter` → main document, `position:fixed` overlay
 *   whose coordinates are computed from the iframe's bounding rect so it
 *   appears visually aligned with `body.editor-styles-wrapper`.
 *   Subscribes to `lightValidationsContext` on `document.body`.
 *
 * The iframe observer is still used to locate `body.editor-styles-wrapper`
 * so that the gutter overlay can be sized and positioned correctly.
 *
 * Content sync
 * ─────────────
 * 1. Initial HTML → `<div slot="value">` read by `clippy-context.firstUpdated`.
 * 2. Subsequent changes → `contextRef.current.editor.commands.setContent(html)`.
 */

import './plugin.css';

import { Content, Context, Gutter, initializeLocale } from '@nl-design-system-community/editor';
import { serialize } from '@wordpress/blocks';
import { useSelect } from '@wordpress/data';
import { useEffect, useRef } from '@wordpress/element';
import { registerPlugin } from '@wordpress/plugins';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const EDITOR_IFRAME_SELECTOR = 'iframe[name="editor-canvas"]';
const EDITOR_STYLES_WRAPPER_SELECTOR = 'body.editor-styles-wrapper';
const LOG = '[clippy-gutter]';
const CONTEXT_HOST_ID = 'clippy-wp-context-host';
const GUTTER_HOST_CLASS = 'clippy-gutter-host';

// Silence "declared but never used" — imported for side-effects (CE registration)
void Content;
void Gutter;

// ---------------------------------------------------------------------------
// Plugin component
// ---------------------------------------------------------------------------

function ClippyGutterPlugin(): null {
  const contextRef = useRef<Context | null>(null);
  const isFirstRender = useRef(true);
  /** Tracks current html without adding it as an effect dependency. */
  const htmlRef = useRef<string>('');
  /** Direct ref to the slot div so Effect 3 can keep it in sync. */
  const valueDivRef = useRef<HTMLElement | null>(null);

  const html = useSelect((select: (store: 'core/block-editor') => { getBlocks(): unknown[] }) => {
    const blocks = select('core/block-editor').getBlocks();
    return serialize(blocks as import('@wordpress/data').BlockInstance[]);
  });
  htmlRef.current = html;

  // ── Effect 1: clippy-context + clippy-content (main document, off-screen) ──
  useEffect(() => {
    if (document.getElementById(CONTEXT_HOST_ID)) return;

    const contextHost = document.createElement('div');
    contextHost.id = CONTEXT_HOST_ID;
    contextHost.className = 'ma-theme clippy-theme utrecht-root';
    contextHost.setAttribute('aria-hidden', 'true');
    contextHost.style.cssText =
      'left:-9999px;overflow:visible;pointer-events:none;position:fixed;top:0;width:720px;';

    const contextEl = document.createElement('clippy-context');
    contextEl.setAttribute('readonly', '');

    const valueDiv = document.createElement('div');
    valueDiv.setAttribute('slot', 'value');
    valueDiv.innerHTML = htmlRef.current ?? '';
    contextEl.appendChild(valueDiv);
    valueDivRef.current = valueDiv;

    const contentEl = document.createElement('clippy-content');
    contextEl.appendChild(contentEl);

    contextHost.appendChild(contextEl);
    document.body.appendChild(contextHost);

    contextRef.current = contextEl as unknown as Context;
    console.log(LOG, '✔ clippy-context mounted in main document (off-screen)');

    return () => {
      contextHost.remove();
      contextRef.current = null;
    };
  }, []);

  // ── Effect 2: gutter overlay (main document, fixed over iframe content) ──
  useEffect(() => {
    let removeLoadListener: (() => void) | undefined;
    let disconnectBodyObserver: (() => void) | undefined;
    let disconnectPositionWatcher: (() => void) | undefined;

    console.log(LOG, 'useEffect: starting gutter mount sequence');

    function buildGutterHost(editorBody: HTMLElement, iframe: HTMLIFrameElement): void {
      document.querySelector<HTMLElement>(`.${GUTTER_HOST_CLASS}`)?.remove();
      disconnectPositionWatcher?.();
      disconnectPositionWatcher = undefined;

      const host = document.createElement('div');
      host.className = `${GUTTER_HOST_CLASS} ma-theme clippy-theme utrecht-root`;
      host.style.cssText = 'inline-size:1rem;pointer-events:none;position:fixed;z-index:99999;';

      const gutterEl = document.createElement('clippy-validations-gutter');
      host.appendChild(gutterEl);
      document.body.appendChild(host);

      function updatePosition(): void {
        const iframeRect = iframe.getBoundingClientRect();
        const bodyRect = editorBody.getBoundingClientRect();
        host.style.top = `${iframeRect.top + bodyRect.top}px`;
        host.style.height = `${bodyRect.height}px`;
        host.style.right = `${window.innerWidth - (iframeRect.left + bodyRect.right)}px`;
        console.log(
          LOG,
          'updatePosition: top =', host.style.top,
          '| height =', host.style.height,
          '| right =', host.style.right,
        );
      }

      updatePosition();

      const ro = new ResizeObserver(updatePosition);
      ro.observe(iframe);
      window.addEventListener('resize', updatePosition, { passive: true });
      window.addEventListener('scroll', updatePosition, { passive: true });

      disconnectPositionWatcher = () => {
        ro.disconnect();
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition);
        host.remove();
      };

      console.log(LOG, 'buildGutterHost: ✔ gutter mounted in main document (fixed overlay)');
    }

    function tryMount(iframe: HTMLIFrameElement): boolean {
      const iframeDoc = iframe.contentDocument;
      console.log(
        LOG,
        'tryMount: readyState =', iframeDoc?.readyState,
        '| body.className =', iframeDoc?.body?.className || '(empty)',
        '| body children:', iframeDoc?.body?.childElementCount ?? 0,
      );

      const editorBody = iframeDoc?.querySelector<HTMLElement>(EDITOR_STYLES_WRAPPER_SELECTOR);
      if (!editorBody) {
        console.log(LOG, `tryMount: ✘ "${EDITOR_STYLES_WRAPPER_SELECTOR}" not found`);
        return false;
      }

      console.log(LOG, `tryMount: ✔ found "${EDITOR_STYLES_WRAPPER_SELECTOR}"`);
      buildGutterHost(editorBody, iframe);
      return true;
    }

    function onIframeLoad(iframe: HTMLIFrameElement): void {
      disconnectBodyObserver?.();
      disconnectBodyObserver = undefined;

      console.log(
        LOG,
        'onIframeLoad: readyState =', iframe.contentDocument?.readyState,
        '| body.className =', iframe.contentDocument?.body?.className || '(empty)',
      );

      if (tryMount(iframe)) return;

      const iframeBody = iframe.contentDocument?.body;
      if (!iframeBody) {
        console.warn(LOG, 'onIframeLoad: body is null — nothing to observe');
        return;
      }

      console.log(LOG, 'onIframeLoad: body not ready yet, starting MutationObserver');
      const obs = new MutationObserver(() => {
        console.log(LOG, 'MutationObserver (iframe body): mutation detected, retrying mount');
        if (tryMount(iframe)) {
          console.log(LOG, 'MutationObserver (iframe body): ✔ mount succeeded, disconnecting');
          obs.disconnect();
          disconnectBodyObserver = undefined;
        }
      });
      obs.observe(iframeBody, {
        attributeFilter: ['class'],
        attributes: true,
        childList: true,
        subtree: true,
      });
      disconnectBodyObserver = () => obs.disconnect();
    }

    function onIframeAppended(iframe: HTMLIFrameElement): void {
      function handleLoad() {
        console.log(LOG, 'iframe load event fired');
        onIframeLoad(iframe);
      }
      iframe.addEventListener('load', handleLoad);
      removeLoadListener = () => iframe.removeEventListener('load', handleLoad);
      console.log(LOG, 'onIframeAppended: trying immediate mount');
      onIframeLoad(iframe);
    }

    const existingIframe = document.querySelector<HTMLIFrameElement>(EDITOR_IFRAME_SELECTOR);
    if (existingIframe) {
      console.log(LOG, 'fast path: iframe already in DOM');
      onIframeAppended(existingIframe);
    } else {
      console.log(LOG, 'slow path: waiting for iframe via MutationObserver on document.body');
      const bodyObserver = new MutationObserver(() => {
        const iframe = document.querySelector<HTMLIFrameElement>(EDITOR_IFRAME_SELECTOR);
        if (!iframe) return;
        console.log(LOG, 'MutationObserver (document.body): ✔ iframe appeared');
        bodyObserver.disconnect();
        onIframeAppended(iframe);
      });
      bodyObserver.observe(document.body, { childList: true, subtree: true });
      removeLoadListener = () => bodyObserver.disconnect();
    }

    return () => {
      console.log(LOG, 'cleanup: removing listeners and observers');
      removeLoadListener?.();
      disconnectBodyObserver?.();
      disconnectPositionWatcher?.();
    };
  }, []);

  // ── Effect 3: push Gutenberg content changes into the TipTap editor ──
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
    }

    // Always keep the slot div up to date. clippy-context reads slot content
    // in firstUpdated(), which may fire after this effect runs (Lit renders
    // asynchronously). Keeping innerHTML current ensures firstUpdated always
    // picks up the latest Gutenberg HTML regardless of timing.
    if (valueDivRef.current) {
      valueDivRef.current.innerHTML = html;
    }

    // Once the TipTap editor has been created by clippy-context, push changes
    // directly via setContent so the validator re-runs on every block change.
    contextRef.current?.editor?.commands.setContent(html);
  }, [html]);

  return null;
}

// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------

initializeLocale().then(() => {
  registerPlugin('nl-design-system-community-editor-clippy-gutter', {
    render: ClippyGutterPlugin,
  });
});
