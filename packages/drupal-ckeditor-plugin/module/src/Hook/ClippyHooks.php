<?php

declare(strict_types=1);

namespace Drupal\clippy\Hook;

use Drupal\clippy\PageReview;
use Drupal\Core\Hook\Attribute\Hook;

/**
 * Hook implementations for Clippy.
 */
final class ClippyHooks {

  /**
   * Implements hook_page_attachments().
   */
  #[Hook('page_attachments')]
  public function pageAttachments(array &$attachments): void {
    PageReview::attach($attachments);
  }

}
