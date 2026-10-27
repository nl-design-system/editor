<?php

declare(strict_types=1);

namespace NlDesignSystemCommunity\Clippy\Middleware;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\StreamFactoryInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;
use TYPO3\CMS\Core\Context\Context;
use TYPO3\CMS\Core\Utility\PathUtility;

final class InjectPageReview implements MiddlewareInterface
{
    private const SCRIPT = 'EXT:clippy/Resources/Public/PageReview/clippy-page-review.js';

    private const STYLESHEET = 'EXT:clippy/Resources/Public/PageReview/clippy-page-review.css';

    public function __construct(
        private readonly Context $context,
        private readonly StreamFactoryInterface $streamFactory,
    ) {}

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $isBackendUserLoggedIn = (bool)$this->context->getPropertyFromAspect('backend.user', 'isLoggedIn', false);
        $response = $handler->handle($request);

        if (!$isBackendUserLoggedIn || !str_starts_with($response->getHeaderLine('Content-Type'), 'text/html')) {
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

    private function tags(): string
    {
        return sprintf(
            '<link rel="stylesheet" href="%s"><script type="module" src="%s"></script>',
            htmlspecialchars(PathUtility::getPublicResourceWebPath(self::STYLESHEET)),
            htmlspecialchars(PathUtility::getPublicResourceWebPath(self::SCRIPT)),
        );
    }
}
