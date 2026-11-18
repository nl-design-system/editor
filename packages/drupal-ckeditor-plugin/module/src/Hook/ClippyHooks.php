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
   * Implements hook_library_info_alter().
   */
  #[Hook('library_info_alter')]
  public function libraryInfoAlter(array &$libraries, string $extension): void {
    if ($extension === 'olivero' && isset($libraries['global-styling'])) {
      $libraries['global-styling']['dependencies'][] = 'clippy/olivero';
    }
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
