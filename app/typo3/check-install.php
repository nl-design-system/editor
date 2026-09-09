<?php

// Exit codes: 0 = TYPO3 is installed, 1 = it is not, 2 = the question could not be answered.
const IDENTIFIER_PATTERN = '/^[a-zA-Z0-9._-]+$/';
const INSTALLED_TABLE = 'be_users';

$host = getenv('TYPO3_DB_HOST') ?: 'postgres';
$db = getenv('TYPO3_DB_DBNAME') ?: 'typo3';
$port = (int)(getenv('TYPO3_DB_PORT') ?: 5432);
$user = getenv('TYPO3_DB_USERNAME') ?: 'typo3';
$password = getenv('TYPO3_DB_PASSWORD') ?: 'typo3';

if (!preg_match(IDENTIFIER_PATTERN, $host) || !preg_match(IDENTIFIER_PATTERN, $db) || $port < 1 || $port > 65535) {
    fwrite(STDERR, '[check-install] ERROR: invalid database host, name or port.' . PHP_EOL);
    exit(2);
}

try {
    $pdo = new PDO(
        sprintf('pgsql:host=%s;port=%d;dbname=%s', $host, $port, $db),
        $user,
        $password,
        [PDO::ATTR_TIMEOUT => 5, PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    $statement = $pdo->prepare(
        'SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = current_schema() AND table_name = ?'
    );
    $statement->execute([INSTALLED_TABLE]);
    $installed = (int)$statement->fetchColumn() > 0;
} catch (Throwable $e) {
    fwrite(STDERR, '[check-install] ERROR: ' . $e->getMessage() . PHP_EOL);
    exit(2);
}

fwrite(STDERR, '[check-install] ' . ($installed ? 'TYPO3 is installed.' : 'No installation found.') . PHP_EOL);
exit($installed ? 0 : 1);
