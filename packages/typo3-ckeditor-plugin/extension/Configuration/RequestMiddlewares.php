<?php

declare(strict_types=1);

use NlDesignSystemCommunity\Clippy\Middleware\InjectPageReview;

return [
    'frontend' => [
        'nl-design-system-community/clippy/page-review' => [
            'target' => InjectPageReview::class,
            'after' => [
                'typo3/cms-frontend/backend-user-authentication',
            ],
        ],
    ],
];
