<?php

return [
    'DB' => [
        'Connections' => [
            'Default' => [
                'charset' => 'utf8',
                'driver' => 'pdo_pgsql',
                'dbname' => getenv('TYPO3_DB_DBNAME') ?: 'typo3',
                'host' => getenv('TYPO3_DB_HOST') ?: 'postgres',
                'password' => getenv('TYPO3_DB_PASSWORD') ?: 'typo3',
                'port' => (int)(getenv('TYPO3_DB_PORT') ?: 5432),
                'user' => getenv('TYPO3_DB_USERNAME') ?: 'typo3',
            ],
        ],
    ],
    'FE' => [
        'cacheHash' => [
            'enforceValidation' => true,
        ],
        'disableNoCacheParameter' => true,
    ],
    'GFX' => [
        'processor_enabled' => false,
    ],
    'SYS' => [
        'features' => [
            'frontend.cache.autoTagging' => true,
            'security.system.enforceAllowedFileExtensions' => true,
        ],
        'sitename' => getenv('TYPO3_PROJECT_NAME') ?: 'TYPO3',
        'UTF8filesystem' => true,
    ],
];
