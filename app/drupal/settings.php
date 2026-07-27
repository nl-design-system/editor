<?php

$databases['default']['default'] = [
  'driver' => 'pgsql',
  'database' => getenv('POSTGRES_DB') ?: 'drupal',
  'username' => getenv('POSTGRES_USER') ?: 'drupal',
  'password' => getenv('POSTGRES_PASSWORD') ?: 'drupal',
  'host' => getenv('POSTGRES_HOST') ?: 'postgres',
  'port' => getenv('POSTGRES_PORT') ?: '5432',
];

$settings['hash_salt'] = getenv('DRUPAL_HASH_SALT') ?: '';

$settings['config_sync_directory'] = '/opt/drupal/config/sync';
