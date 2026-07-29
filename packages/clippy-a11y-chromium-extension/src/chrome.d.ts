// Minimal ambient typings for the subset of the Chrome extension API this
// package uses, avoiding a dependency on the large (and fast-moving)
// `@types/chrome` package.
declare namespace chrome {
  namespace runtime {
    const onInstalled: { addListener(callback: () => void): void };
    const onStartup: { addListener(callback: () => void): void };
  }

  namespace tabs {
    interface Tab {
      id?: number;
      url?: string;
      title?: string;
    }
    function query(queryInfo: { active?: boolean; currentWindow?: boolean }): Promise<Tab[]>;
  }

  namespace scripting {
    interface InjectionResult<T> {
      result: T;
      frameId: number;
    }
    interface ScriptInjection<Args extends unknown[], Result> {
      target: { tabId: number; allFrames?: boolean; frameIds?: number[] };
      files?: string[];
      func?: (...args: Args) => Result;
      args?: Args;
      world?: 'ISOLATED' | 'MAIN';
    }
    function executeScript<Args extends unknown[], Result>(
      injection: ScriptInjection<Args, Result>,
    ): Promise<InjectionResult<Awaited<Result>>[]>;
  }

  namespace contextMenus {
    interface OnClickData {
      menuItemId: number | string;
      frameId?: number;
    }
    function create(properties: { id: string; title: string; contexts: string[] }): void;
    function removeAll(callback?: () => void): void;
    const onClicked: {
      addListener(callback: (info: OnClickData, tab?: tabs.Tab) => void): void;
    };
  }

  namespace action {
    function openPopup(): Promise<void>;
    function setBadgeText(details: { text: string; tabId?: number }): Promise<void>;
    function setBadgeBackgroundColor(details: { color: string; tabId?: number }): Promise<void>;
  }

  namespace storage {
    interface StorageArea {
      get(keys?: string | string[] | null): Promise<Record<string, unknown>>;
      set(items: Record<string, unknown>): Promise<void>;
      remove(keys: string | string[]): Promise<void>;
    }
    const session: StorageArea;
  }
}
