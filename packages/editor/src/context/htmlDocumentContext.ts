import { createContext } from '@lit/context';

/**
 * Provides the live HTML element that TipTap's ProseMirror view is mounted in.
 * Available after `clippy-content` calls `editor.mount(el)` and TipTap fires its
 * `create` event. Consumed by heading-structure, link-list and language-changes
 * to query the editor DOM directly without using TipTap internals.
 */
export const htmlDocumentContext = createContext<HTMLElement | undefined>('htmlDocument');
