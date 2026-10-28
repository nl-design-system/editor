<?php

declare(strict_types=1);

namespace NlDesignSystemCommunity\Clippy\Middleware;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\StreamFactoryInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;
use TYPO3\CMS\Core\Configuration\Exception\ExtensionConfigurationExtensionNotConfiguredException;
use TYPO3\CMS\Core\Configuration\Exception\ExtensionConfigurationPathDoesNotExistException;
use TYPO3\CMS\Core\Configuration\ExtensionConfiguration;
use TYPO3\CMS\Core\Context\Context;
use TYPO3\CMS\Core\Utility\PathUtility;

final class InjectPageReview implements MiddlewareInterface
{
    private const SCRIPT = 'EXT:clippy/Resources/Public/PageReview/clippy-page-review.js';

    private const STYLESHEET = 'EXT:clippy/Resources/Public/PageReview/clippy-page-review.css';

    private const OPTIONS_ID = 'clippy-page-review-options';

    private const DEFAULT_REVIEW_ROOT = 'main, [role=main]';

    public function __construct(
        private readonly Context $context,
        private readonly ExtensionConfiguration $extensionConfiguration,
        private readonly StreamFactoryInterface $streamFactory,
    ) {}

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $isEnabled = $this->isEnabledForBackendUser();
        $response = $handler->handle($request);

        if (!$isEnabled || !str_starts_with($response->getHeaderLine('Content-Type'), 'text/html')) {
            return $response;
        }

        $html = (string)$response->getBody();
        $headEnd = stripos($html, '</head>');
        if ($headEnd === false) {
            return $response;
        }

        $html = substr_replace($html, $this->tags(), $headEnd, 0);
        $response = $response->withBody($this->streamFactory->createStream($html));
        if ($response->hasHeader('Content-Length')) {
            $response = $response->withHeader('Content-Length', (string)strlen($html));
        }
        return $response;
    }

    private function isEnabledForBackendUser(): bool
    {
        return (bool)$this->context->getPropertyFromAspect('backend.user', 'isLoggedIn', false)
            && (bool)$this->extensionSetting('pageReview', true);
    }

    private function options(): array
    {
        return [
            'gutter' => (bool)$this->extensionSetting('gutterAlways', true) ? 'always' : 'drawer',
            'reviewRoot' => trim((string)$this->extensionSetting('reviewRoot', self::DEFAULT_REVIEW_ROOT)),
        ];
    }

    private function extensionSetting(string $path, mixed $default): mixed
    {
        try {
            return $this->extensionConfiguration->get('clippy', $path);
        } catch (ExtensionConfigurationExtensionNotConfiguredException|ExtensionConfigurationPathDoesNotExistException) {
            return $default;
        }
    }

    private function tags(): string
    {
        return sprintf(
            '<link rel="stylesheet" href="%s"><script type="application/json" id="%s">%s</script><script type="module" src="%s"></script>',
            htmlspecialchars(PathUtility::getPublicResourceWebPath(self::STYLESHEET)),
            self::OPTIONS_ID,
            json_encode($this->options(), JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_THROW_ON_ERROR),
            htmlspecialchars(PathUtility::getPublicResourceWebPath(self::SCRIPT)),
        );
    }
}
