import { PageReview } from '@nl-design-system-community/editor/page-review';

declare global {
  function once(id: string, element: Element): Element[];
}

export const pageReviewBehavior = {
  attach(): void {
    if (once('clippy-page-review', document.body).length > 0) {
      new PageReview({});
    }
  },
};
