import type { AnalysisResult, Violation } from '@nl-design-system-community/clippy-a11y-validator';
import { SEVERITY_ORDER, countBySeverity, formatViolations } from '@nl-design-system-community/clippy-a11y-validator';
// Design tokens + theme the shared validation-item card relies on, followed by
// the card component itself (registers <clippy-validation-item>).
import '@nl-design-system-community/ma-design-tokens/dist/theme.css';
import '@utrecht/design-tokens/dist/theme.css';
import '@nl-design-system-community/editor/theme.css';
import '@nl-design-system-community/editor/validation-item';
import type { AnalyzeOptions, InspectionPayload } from './shared';
import './popup.css';

const form = document.querySelector<HTMLFormElement>('#controls')!;
const selectorInput = document.querySelector<HTMLInputElement>('#selector')!;
const validateButton = document.querySelector<HTMLButtonElement>('#validate')!;
const copyButton = document.querySelector<HTMLButtonElement>('#copy')!;
const contextEl = document.querySelector<HTMLParagraphElement>('#context')!;
const summaryEl = document.querySelector<HTMLParagraphElement>('#summary')!;
const listEl = document.querySelector<HTMLOListElement>('#violations')!;

let lastResult: AnalysisResult | null = null;

const errorMessage = (error: unknown): string => (error instanceof Error ? error.message : String(error));

const getActiveTabId = async (): Promise<number> => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) throw new Error('No active tab to analyze.');
  return tab.id;
};

const analyzePage = async (tabId: number, options: AnalyzeOptions): Promise<AnalysisResult> => {
  // 1. Inject the self-contained validator bundle into the page's isolated world.
  await chrome.scripting.executeScript({ files: ['inject.js'], target: { tabId } });
  // 2. Run it and return the (serializable) result to the popup.
  const [injection] = await chrome.scripting.executeScript({
    args: [options],
    func: (opts: AnalyzeOptions) => window.__clippyA11y!.analyze(opts),
    target: { tabId },
  });
  return injection.result;
};

const highlightOnPage = async (tabId: number, scopeSelector: string | null, target: string): Promise<void> => {
  await chrome.scripting.executeScript({
    args: [scopeSelector, target],
    func: (scope: string | null, sel: string) => window.__clippyA11y!.highlight(scope, sel),
    target: { tabId },
  });
};

// Builds the list of offending elements (with highlight buttons) that is slotted
// into the shared card's `tip-html` region.
const renderNodeList = (violation: Violation, scopeSelector: string | null, tabId: number): HTMLUListElement => {
  const nodes = document.createElement('ul');
  nodes.className = 'clippy-nodes';
  nodes.slot = 'tip-html';
  for (const node of violation.nodes) {
    const nodeItem = document.createElement('li');
    nodeItem.className = 'clippy-node';

    const locate = document.createElement('button');
    locate.type = 'button';
    locate.className = 'clippy-node__target';
    locate.textContent = node.target;
    locate.title = 'Highlight this element on the page';
    locate.addEventListener('click', () => {
      highlightOnPage(tabId, scopeSelector, node.target).catch((error: unknown) => {
        showError(errorMessage(error));
      });
    });

    const snippet = document.createElement('code');
    snippet.className = 'clippy-node__html';
    snippet.textContent = node.html; // textContent, never innerHTML — the snippet is page-controlled.

    nodeItem.append(locate, snippet);
    nodes.append(nodeItem);
  }
  return nodes;
};

// Renders one violation as the shared <clippy-validation-item> card, reused
// from the editor so the extension and the editor drawer look identical.
const renderViolation = (violation: Violation, scopeSelector: string | null, tabId: number): HTMLLIElement => {
  const listItem = document.createElement('li');
  listItem.className = 'clippy-violation';

  const card = document.createElement('clippy-validation-item');
  card.mode = 'readonly';
  card.severity = violation.severity;
  card.description = violation.description;
  card.href = violation.href;
  card.append(renderNodeList(violation, scopeSelector, tabId));

  listItem.append(card);
  return listItem;
};

const render = (result: AnalysisResult, scopeSelector: string | null, tabId: number): void => {
  lastResult = result;
  const counts = countBySeverity(result);
  const total = counts.error + counts.warning + counts.info;

  summaryEl.className = total === 0 ? 'clippy-summary clippy-summary--ok' : 'clippy-summary';
  summaryEl.textContent =
    total === 0
      ? 'No issues found ✓'
      : `${total} issue${total === 1 ? '' : 's'} — ${counts.error} error, ${counts.warning} warning, ${counts.info} info`;

  copyButton.hidden = total === 0;

  listEl.replaceChildren();
  const ordered = [...result.violations].sort(
    (a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity),
  );
  for (const violation of ordered) {
    listEl.append(renderViolation(violation, scopeSelector, tabId));
  }
};

const showError = (message: string): void => {
  lastResult = null;
  copyButton.hidden = true;
  summaryEl.className = 'clippy-summary clippy-summary--error';
  summaryEl.textContent = message;
  listEl.replaceChildren();
};

const runValidation = async (scopeSelector: string | null): Promise<void> => {
  contextEl.hidden = true;
  validateButton.disabled = true;
  summaryEl.className = 'clippy-summary';
  summaryEl.textContent = 'Analyzing…';
  try {
    const tabId = await getActiveTabId();
    const result = await analyzePage(tabId, {
      disableRules: [],
      enableRules: ['*'],
      selector: scopeSelector,
      topHeadingLevel: 1,
    });
    render(result, scopeSelector, tabId);
  } catch (error) {
    showError(`Could not analyze this page. ${errorMessage(error)}`);
  } finally {
    validateButton.disabled = false;
  }
};

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const scopeSelector = selectorInput.value.trim() || null;
  runValidation(scopeSelector).catch((error: unknown) => {
    showError(errorMessage(error));
  });
});

copyButton.addEventListener('click', () => {
  if (!lastResult) return;
  navigator.clipboard
    .writeText(formatViolations(lastResult))
    .then(() => {
      copyButton.textContent = 'Copied ✓';
      setTimeout(() => {
        copyButton.textContent = 'Copy report';
      }, 1500);
    })
    .catch((error: unknown) => {
      showError(errorMessage(error));
    });
});

// When opened from the "Inspect element with Clippy" context menu, the service
// worker leaves a scoped result in session storage; render it and clear the badge.
const consumePendingInspection = async (): Promise<void> => {
  const stored = await chrome.storage.session.get('clippyInspection');
  const inspection = stored['clippyInspection'] as InspectionPayload | undefined;
  if (!inspection) return;

  await chrome.storage.session.remove('clippyInspection');
  await chrome.action.setBadgeText({ text: '' });

  const tabId = await getActiveTabId();
  contextEl.hidden = false;
  contextEl.textContent = `Inspecting ${inspection.label}`;
  render(inspection.result, inspection.scopeSelector, tabId);
};

consumePendingInspection().catch((error: unknown) => {
  showError(errorMessage(error));
});
