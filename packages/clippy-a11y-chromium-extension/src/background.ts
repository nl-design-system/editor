import type { AnalyzeOptions, InspectionPayload } from './shared';

const MENU_ID = 'clippy-inspect-element';

// Context menus survive service-worker restarts, but not always a browser
// restart, so (re)create on both install and startup. `removeAll` first avoids
// a duplicate-id error.
const setupMenu = (): void => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({ id: MENU_ID, contexts: ['all'], title: 'Inspect element with Clippy' });
  });
};

chrome.runtime.onInstalled.addListener(setupMenu);
chrome.runtime.onStartup.addListener(setupMenu);

/**
 * Runs in the page's isolated world. Marks the element recorded by the tracker
 * (falling back to `<body>`), analyzes just that element via the injected
 * validator, and returns a serializable payload for the popup.
 */
const inspectInPage = (): InspectionPayload => {
  const MARK = 'data-clippy-inspect-root';
  for (const marked of document.querySelectorAll(`[${MARK}]`)) {
    marked.removeAttribute(MARK);
  }

  const target: Element = window.__clippyLastRightClicked ?? document.body;
  target.setAttribute(MARK, 'true');

  // Document-level rules (single/top-level H1, heading order) are whole-page
  // concerns, so they are excluded when validating a single element.
  const options: AnalyzeOptions = {
    disableRules: [
      'document-must-have-correct-heading-order',
      'document-must-have-single-heading-one',
      'document-must-have-top-level-heading-one',
    ],
    enableRules: ['*'],
    selector: `[${MARK}]`,
    topHeadingLevel: 1,
  };
  const result = window.__clippyA11y!.analyzeElement(target, options);
  const total = result.violations.reduce((sum, violation) => sum + violation.nodes.length, 0);

  const id = target.id ? `#${target.id}` : '';
  const classAttr = target.getAttribute('class');
  const classes = classAttr ? `.${classAttr.trim().split(/\s+/).join('.')}` : '';
  const label = `${target.tagName.toLowerCase()}${id}${classes}`.slice(0, 80);

  return { badge: total > 99 ? '99+' : String(total), label, result };
};

const inspectElement = async (tabId: number, frameId: number): Promise<void> => {
  const target = { frameIds: [frameId], tabId };
  // Ensure the validator is present in the frame, then run the inspection.
  await chrome.scripting.executeScript({ files: ['inject.js'], target });
  const [injection] = await chrome.scripting.executeScript({ func: inspectInPage, target });

  const payload = injection?.result;
  if (!payload) return;

  await chrome.storage.session.set({ clippyInspection: payload });
  await chrome.action.setBadgeText({ text: payload.badge });
  await chrome.action.setBadgeBackgroundColor({ color: '#d5223b' });

  try {
    await chrome.action.openPopup();
  } catch {
    // openPopup is best-effort (and unavailable in older browsers); the badge
    // signals the user to click the toolbar icon to see the result.
  }
};

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== MENU_ID || typeof tab?.id !== 'number') return;
  inspectElement(tab.id, info.frameId ?? 0).catch(() => {
    // Nothing actionable in the service worker; failures surface as no result.
  });
});
