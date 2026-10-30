import { pageReviewOptions } from './clippy-page-review-options.js';
import { PageReview } from './page-review.js';

PageReview.mount(pageReviewOptions(globalThis.drupalSettings));
