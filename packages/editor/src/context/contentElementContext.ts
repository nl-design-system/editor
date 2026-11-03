import { createContext } from '@lit/context';

/**
 * Provides the rendered element the editor content is mounted in. Available after
 * `clippy-content` mounts the editor; `undefined` before that and in readonly mode.
 */
export const contentElementContext = createContext<HTMLElement | undefined>('contentElement');
