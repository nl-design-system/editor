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

$reverseProxyIp = getenv('TYPO3_REVERSE_PROXY_IP');
if (is_string($reverseProxyIp) && $reverseProxyIp !== '') {
    $GLOBALS['TYPO3_CONF_VARS']['SYS']['reverseProxyIP'] = $reverseProxyIp;
    $GLOBALS['TYPO3_CONF_VARS']['SYS']['reverseProxyHeaderMultiValue'] = 'last';
}

$reverseProxySsl = getenv('TYPO3_REVERSE_PROXY_SSL');
if (is_string($reverseProxySsl) && $reverseProxySsl !== '') {
    $GLOBALS['TYPO3_CONF_VARS']['SYS']['reverseProxySSL'] = $reverseProxySsl;
}
