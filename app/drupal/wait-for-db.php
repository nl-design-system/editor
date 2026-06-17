<?php

// Blocks quotes, semicolons and whitespace that could otherwise break out of the DSN string.
const SAFE_IDENTIFIER_PATTERN = '/^[a-zA-Z0-9._-]+$/';

// Reads an environment variable, falling back to a default when unset/empty.
function envValue(string $name, string $default): string
{
    $value = getenv($name);
    if ($value === false || $value === '') {
        return $default;
    }
    return $value;
}

// Reads a positive integer environment variable, falling back to a default.
function envInt(string $name, int $default): int
{
    $value = getenv($name);
    if ($value === false || $value === '' || !ctype_digit($value)) {
        return $default;
    }
    $int = (int) $value;
    return $int > 0 ? $int : $default;
}

// Writes a log to STDERR.
function logLine(string $message): void
{
    fwrite(STDERR, '[wait-for-db] ' . $message . PHP_EOL);
}

// Aborts with an error message on STDERR and a non-zero exit code.
function fail(string $message): void
{
    logLine('ERROR: ' . $message);
    exit(1);
}

$user = envValue('POSTGRES_USER', 'drupal');
$password = envValue('POSTGRES_PASSWORD', 'drupal');
$host = envValue('POSTGRES_HOST', 'postgres');
$db = envValue('POSTGRES_DB', 'drupal');
$port = envInt('POSTGRES_PORT', 5432);

$attempts = envInt('DB_WAIT_ATTEMPTS', 30);
$interval = envInt('DB_WAIT_INTERVAL', 2);

if (!preg_match(SAFE_IDENTIFIER_PATTERN, $host)) {
    fail('POSTGRES_HOST contains invalid characters: ' . $host);
}
if (!preg_match(SAFE_IDENTIFIER_PATTERN, $db)) {
    fail('POSTGRES_DB contains invalid characters: ' . $db);
}
if ($port < 1 || $port > 65535) {
    fail('POSTGRES_PORT is out of range: ' . $port);
}
if ($user === '') {
    fail('POSTGRES_USER may not be empty.');
}

$dsn = sprintf('pgsql:host=%s;port=%d;dbname=%s', $host, $port, $db);

logLine("Waiting for database at {$host}:{$port} (db={$db})...");

$connected = false;
for ($i = 1; $i <= $attempts; $i++) {
    try {
        $pdo = new PDO($dsn, $user, $password, [PDO::ATTR_TIMEOUT => 2]);
        unset($pdo);
        $connected = true;
        break;
    } catch (Throwable $e) {
        logLine("Attempt {$i}/{$attempts} failed ({$e->getMessage()}), retrying in {$interval}s...");
        if ($i < $attempts) {
            sleep($interval);
        }
    }
}

if (!$connected) {
    fail("Database not reachable after {$attempts} attempts.");
}

logLine('Database is ready.');

// rawurlencode() prevents special characters in user/password from breaking the URL structure.
$url = sprintf(
    'pgsql://%s:%s@%s:%d/%s',
    rawurlencode($user),
    rawurlencode($password),
    $host,
    $port,
    rawurlencode($db)
);

// Only the URL goes to STDOUT so callers can capture it cleanly.
fwrite(STDOUT, $url);
