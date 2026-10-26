<?php

declare(strict_types=1);

namespace Drupal\clippy\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Turns the Clippy features on or off and configures Page review.
 */
final class SettingsForm extends ConfigFormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormId(): string {
    return 'clippy_settings';
  }

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames(): array {
    return ['clippy.settings'];
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state): array {
    $form['ckeditor'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Show accessibility feedback in CKEditor'),
      '#config_target' => 'clippy.settings:ckeditor',
    ];
    $form['page_review'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Show Page review on frontend pages'),
      '#description' => $this->t('Only users with the %permission permission see it.', ['%permission' => $this->t('Use Page review')]),
      '#config_target' => 'clippy.settings:page_review',
    ];
    $form['review_root'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Review root selector'),
      '#description' => $this->t("A CSS selector for the theme's main content region. Page review validates the first element that matches. When nothing matches, it validates <code>main, [role=main]</code>, then the whole <code>body</code>."),
      '#config_target' => 'clippy.settings:review_root',
      '#states' => [
        'visible' => [':input[name="page_review"]' => ['checked' => TRUE]],
      ],
    ];
    return parent::buildForm($form, $form_state);
  }

}
