import { PageReview } from './page-review.js';

const options = globalThis.document.getElementById('clippy-page-review-options');

PageReview.mount(options ? JSON.parse(options.textContent) : {});
