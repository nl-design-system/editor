import { pageReviewBehavior } from './pageReviewBehavior.ts';

declare const Drupal: { behaviors: Record<string, typeof pageReviewBehavior> };

Drupal.behaviors['clippyPageReview'] = pageReviewBehavior;
