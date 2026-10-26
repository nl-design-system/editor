import { pageReviewOptions } from './clippy-page-review-options.js';
import { PageReview } from './page-review.js';

new PageReview(pageReviewOptions(globalThis.drupalSettings));
