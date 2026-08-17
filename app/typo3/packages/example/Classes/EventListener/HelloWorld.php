<?php

declare(strict_types=1);

namespace NlDesignSystemCommunity\Example\EventListener;

use TYPO3\CMS\Backend\Controller\Event\BeforeBackendPageRenderEvent;
use TYPO3\CMS\Core\Attribute\AsEventListener;
use TYPO3\CMS\Core\Page\JavaScriptModuleInstruction;

final class HelloWorld
{
    #[AsEventListener('example/hello-world')]
    public function __invoke(BeforeBackendPageRenderEvent $event): void
    {
        $event->javaScriptRenderer->addJavaScriptModuleInstruction(
            JavaScriptModuleInstruction::create('@nl-design-system-community/example/example.js'),
        );
    }
}
