import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import './index';
import type { ContentViews } from './index';

describe('<clippy-content-views>', () => {
  let contentViews: ContentViews;

  beforeEach(async () => {
    document.documentElement.lang = 'nl';
    const content = document.createElement('main');
    content.innerHTML = '<h1>Titel</h1><p><a href="/contact">Contact</a></p><p lang="en">Hello</p>';
    contentViews = document.createElement('clippy-content-views');
    contentViews.htmlDocument = content;
    document.body.replaceChildren(content, contentViews);
    await contentViews.updateComplete;
  });

  afterEach(() => {
    document.body.replaceChildren();
  });

  it('shows only the Content view it is set to, named by its label', async () => {
    contentViews.view = 'link-list';
    await contentViews.updateComplete;

    expect(contentViews.label).toBe('Links');
    await expect.element(page.getByRole('link', { name: 'Contact' }).last()).toBeVisible();
    expect(contentViews.shadowRoot!.querySelector('clippy-heading-structure')).not.toBeVisible();

    contentViews.view = 'heading-structure';
    await contentViews.updateComplete;

    expect(contentViews.label).toBe('Kopstructuur');
    expect(contentViews.shadowRoot!.querySelector('clippy-link-list')).not.toBeVisible();
  });

  it('is hidden while hidden is set', async () => {
    contentViews.hidden = true;

    expect(contentViews).not.toBeVisible();
  });
});
