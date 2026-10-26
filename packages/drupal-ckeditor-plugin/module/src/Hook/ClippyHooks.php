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

  /**
   * Implements hook_editor_js_settings_alter().
   */
  #[Hook('editor_js_settings_alter')]
  public function editorJsSettingsAlter(array &$settings): void {
    if (\Drupal::config('clippy.settings')->get('ckeditor')) {
      return;
    }
    foreach ($settings['editor']['formats'] ?? [] as $format_id => $format) {
      if (isset($format['editorSettings']['plugins'])) {
        $settings['editor']['formats'][$format_id]['editorSettings']['plugins'] = array_values(array_diff($format['editorSettings']['plugins'], ['clippyCkeditor.ClippyPlugin']));
      }
    }
  }

}
