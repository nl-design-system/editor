<?php

declare(strict_types=1);

namespace NlDesignSystemCommunity\Clippy\EventListener;

use TYPO3\CMS\Core\Configuration\Exception\ExtensionConfigurationExtensionNotConfiguredException;
use TYPO3\CMS\Core\Configuration\Exception\ExtensionConfigurationPathDoesNotExistException;
use TYPO3\CMS\Core\Configuration\ExtensionConfiguration;
use TYPO3\CMS\RteCKEditor\Form\Element\Event\BeforePrepareConfigurationForEditorEvent;

final class AddClippyEditorExtension
{
    private const MODULE = '@nl-design-system-community/clippy/clippy.js';

    private const CONTENTS_CSS = [
        'EXT:clippy/Resources/Public/Css/clippy-tokens.css',
        'EXT:clippy/Resources/Public/Css/clippy.css',
    ];

    public function __construct(private readonly ExtensionConfiguration $extensionConfiguration) {}

    public function __invoke(BeforePrepareConfigurationForEditorEvent $event): void
    {
        $configuration = $event->getConfiguration();
        $importModules = $configuration['importModules'] ?? [];

        if (
            !$this->isEnabled()
            || $this->listsClippy($importModules)
            || $this->listsClippy($configuration['removeImportModules'] ?? [])
        ) {
            return;
        }

        $configuration['importModules'] = [
            ...$importModules,
            ['module' => self::MODULE, 'exports' => ['ClippyPlugin']],
        ];
        $configuration['contentsCss'] = [...(array)($configuration['contentsCss'] ?? []), ...self::CONTENTS_CSS];

        $event->setConfiguration($configuration);
    }

    private function isEnabled(): bool
    {
        try {
            return (bool)$this->extensionConfiguration->get('clippy', 'enabled');
        } catch (ExtensionConfigurationExtensionNotConfiguredException|ExtensionConfigurationPathDoesNotExistException) {
            return true;
        }
    }

    private function listsClippy(array $importModules): bool
    {
        foreach ($importModules as $importModule) {
            if ((is_array($importModule) ? $importModule['module'] ?? null : $importModule) === self::MODULE) {
                return true;
            }
        }
        return false;
    }
}
