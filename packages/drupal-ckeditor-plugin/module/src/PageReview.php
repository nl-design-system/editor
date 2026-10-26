<?php

declare(strict_types=1);

namespace Drupal\clippy;

use Drupal\Core\Cache\CacheableMetadata;

/**
 * Adds Page review to pages rendered in the frontend theme.
 */
final class PageReview {

  public const PERMISSION = 'use clippy page review';

  /**
   * Attaches Page review to the page attachments.
   */
  public static function attach(array &$attachments): void {
    $theme_config = \Drupal::config('system.theme');
    $settings = \Drupal::config('clippy.settings');
    CacheableMetadata::createFromRenderArray($attachments)
      ->addCacheContexts(['user.permissions', 'theme', 'route'])
      ->addCacheableDependency($theme_config)
      ->addCacheableDependency($settings)
      ->applyTo($attachments);

    $is_frontend_page = \Drupal::theme()->getActiveTheme()->getName() === $theme_config->get('default')
      && !\Drupal::service('router.admin_context')->isAdminRoute();
    if ($settings->get('page_review') && $is_frontend_page && \Drupal::currentUser()->hasPermission(self::PERMISSION)) {
      $attachments['#attached']['library'][] = 'clippy/page-review';
      $attachments['#attached']['drupalSettings']['clippy']['pageReview']['reviewRoot'] = $settings->get('review_root');
    }
  }

}
