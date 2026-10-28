import { PageReview } from './page-review.js';

const options = globalThis.document.getElementById('clippy-page-review-options');

new PageReview(options ? JSON.parse(options.textContent) : {});
