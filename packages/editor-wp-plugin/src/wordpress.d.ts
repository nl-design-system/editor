/**
 * Vite handles CSS imports as side effects. TypeScript needs a module
 * declaration so it does not flag `import './plugin.css'` as an error.
 */
declare module '*.css' {
  const styles: string;
  export default styles;
}

/**
 * Minimal ambient type declarations for the WordPress globals…
 * exposes at runtime via the wp.* namespace. Full types ship with
 * @wordpress/plugins, @wordpress/data, @wordpress/blocks and @wordpress/element
 * but we keep them minimal here to avoid mandatory peer-dependency installation
 * for consumers that only want the PHP plugin.
 */
declare module '@wordpress/plugins' {
  export interface PluginSettings {
    /** React component rendered by the plugin. May return a portal or null. */
    render: () => import('@wordpress/element').WPElement | null;
    icon?: string;
  }
  export function registerPlugin(name: string, settings: PluginSettings): void;
  export function unregisterPlugin(name: string): void;
}

declare module '@wordpress/data' {
  export interface BlockInstance {
    clientId: string;
    name: string;
    attributes: Record<string, unknown>;
    innerBlocks: BlockInstance[];
  }
  export interface BlockEditorSelector {
    getBlocks(): BlockInstance[];
  }
  export function select(store: 'core/block-editor'): BlockEditorSelector;
  export function subscribe(listener: () => void): () => void;
  /**
   * React hook that subscribes to a Gutenberg store and re-renders when the
   * selected value changes.
   */
  export function useSelect<T>(selector: (select: <S>(store: S) => S extends 'core/block-editor' ? BlockEditorSelector : never) => T): T;
}

declare module '@wordpress/blocks' {
  export function serialize(blocks: import('@wordpress/data').BlockInstance[]): string;
}

/**
 * @wordpress/element is WordPress's React abstraction layer. It re-exports
 * React's public API under the `wp.element` global so plugins share the same
 * React instance as the block editor.
 */
declare module '@wordpress/element' {
  // Re-export the subset of React types we use.
  export type WPElement = import('react').ReactNode;

  export const Fragment: import('react').ExoticComponent;

  export function createElement(
    type: string | import('react').ComponentType,
    props: Record<string, unknown> | null,
    ...children: import('react').ReactNode[]
  ): import('react').ReactElement;

  export function createPortal(
    children: import('react').ReactNode,
    container: Element,
  ): import('react').ReactPortal;

  export function useEffect(
    effect: import('react').EffectCallback,
    deps?: import('react').DependencyList,
  ): void;

  export function useRef<T>(initialValue: T | null): import('react').MutableRefObject<T | null>;

  export function useState<T>(initialValue: T | (() => T)): [T, import('react').Dispatch<import('react').SetStateAction<T>>];

  export function useState<T = undefined>(): [T | undefined, import('react').Dispatch<import('react').SetStateAction<T | undefined>>];
}
