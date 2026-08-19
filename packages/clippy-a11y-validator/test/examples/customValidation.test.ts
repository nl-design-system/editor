import { describe, expect, it } from 'vitest';
import { analyzeWithCustomRule, LINK_NEW_TAB_SHOULD_WARN } from './customValidation';

const mount = (html: string): HTMLElement => {
  const root = document.createElement('div');
  root.innerHTML = html;
  return root;
};

describe('custom validation example', () => {
  it('detects a new-tab link that does not warn, and its fix annotates the link', () => {
    const root = mount('<p><a href="https://example.com" target="_blank">Read more</a></p>');

    const [entry, ...rest] = analyzeWithCustomRule(root);
    expect(rest).toHaveLength(0);
    expect(entry.result.validatorKey).toBe(LINK_NEW_TAB_SHOULD_WARN);

    entry.correct!();
    expect(root.querySelector('a')!.getAttribute('aria-label')).toBe('Read more (opens in a new tab)');
  });

  it('passes a link whose text already mentions the new tab', () => {
    const root = mount('<p><a href="https://example.com" target="_blank">Read more (opens in a new window)</a></p>');
    expect(analyzeWithCustomRule(root)).toHaveLength(0);
  });
});
