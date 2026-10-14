<?php

declare(strict_types=1);

defined('TYPO3') or die();

if ((bool)($GLOBALS['TYPO3_CONF_VARS']['EXTENSIONS']['clippy']['enabled'] ?? true)) {
    $GLOBALS['TYPO3_CONF_VARS']['BE']['stylesheets']['clippy'] = 'EXT:clippy/Resources/Public/Css/';
}
