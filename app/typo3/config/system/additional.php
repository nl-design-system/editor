<?php

$encryptionKey = getenv('TYPO3_ENCRYPTION_KEY');
if (is_string($encryptionKey) && $encryptionKey !== '') {
    $GLOBALS['TYPO3_CONF_VARS']['SYS']['encryptionKey'] = $encryptionKey;
}

$trustedHostsPattern = getenv('TYPO3_TRUSTED_HOSTS_PATTERN');
if (is_string($trustedHostsPattern) && $trustedHostsPattern !== '') {
    $GLOBALS['TYPO3_CONF_VARS']['SYS']['trustedHostsPattern'] = $trustedHostsPattern;
}

$installToolPasswordHash = getenv('TYPO3_INSTALL_TOOL_PASSWORD_HASH');
if (is_string($installToolPasswordHash) && $installToolPasswordHash !== '') {
    $GLOBALS['TYPO3_CONF_VARS']['BE']['installToolPassword'] = $installToolPasswordHash;
}
