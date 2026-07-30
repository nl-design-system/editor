import type { AnalysisResult, Violation, ViolationNode } from '@nl-design-system-community/clippy-a11y-validator';
import { SEVERITY_ORDER, countBySeverity, formatViolations } from '@nl-design-system-community/clippy-a11y-validator';
import {
  ValidationItem,
  validationMessages,
  type ValidationKey,
} from '@nl-design-system-community/editor/validation-item';
// Design tokens + theme the shared validation-item card relies on, followed by
// the card component itself (registers <clippy-validation-item>) and the
// localised messages catalogue it shares with the editor's drawer.
import '@nl-design-system-community/ma-design-tokens/dist/theme.css';
import '@utrecht/design-tokens/dist/theme.css';
import '@nl-design-system-community/editor/theme.css';
// `.nl-paragraph` for the slotted tip — the drawer gets this from the list's
// shadow; here the tip lives in the document, so load the rule globally.
import '@nl-design-system-candidate/paragraph-css/paragraph.css';
import { render } from 'lit';
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

/**
 * Localised guidance tip for one detection — identical to the editor drawer's
 * `validationMessages()[key].tip(tipPayload)`. Returns `null` when the rule has
 * no tip (or its payload is absent), matching the drawer's "no paragraph" case.
 */
const tipFor = (violation: Violation, node: ViolationNode) => {
  const message = validationMessages()[violation.validatorKey as ValidationKey];
  return message?.tip?.(node.tipPayload) ?? null;
};

// Renders one detection as the shared <clippy-validation-item> card, exactly as
// the editor's drawer does: description, an optional tip paragraph slotted into
// `tip-html`, and the "Extensive explanation" href link. `readonly` mode drops
// the Focus/Correct actions, which have no meaning without a live editor.
const renderCard = (violation: Violation, node: ViolationNode): HTMLLIElement => {
  const listItem = document.createElement('li');
  listItem.className = 'clippy-violation';

  const card = document.createElement('clippy-validation-item') as ValidationItem;
  card.mode = 'readonly';
  card.severity = violation.severity;
  card.description = violation.description;
  if (violation.href) {
    card.href = violation.href;
  }

  const tip = tipFor(violation, node);
  if (tip) {
    const paragraph = document.createElement('p');
    paragraph.className = 'nl-paragraph';
    paragraph.slot = 'tip-html';
    render(tip, paragraph);
    card.append(paragraph);
  }

  listItem.append(card);
  return listItem;
};

const renderResult = (result: AnalysisResult): void => {
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
  // One card per detection, ordered by severity — mirrors the drawer, which
  // renders a separate <clippy-validation-item> per validation range.
  const cards = result.violations
    .flatMap((violation) => violation.nodes.map((node) => ({ node, violation })))
    .sort((a, b) => SEVERITY_ORDER.indexOf(a.violation.severity) - SEVERITY_ORDER.indexOf(b.violation.severity));
  for (const { node, violation } of cards) {
    listEl.append(renderCard(violation, node));
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
    renderResult(result);
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

  contextEl.hidden = false;
  contextEl.textContent = `Inspecting ${inspection.label}`;
  renderResult(inspection.result);
};

consumePendingInspection().catch((error: unknown) => {
  showError(errorMessage(error));
});
