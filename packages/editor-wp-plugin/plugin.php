<?php
/**
 * Plugin Name:       NL Design System Community Editor – Clippy Gutter
 * Plugin URI:        https://github.com/nl-design-system/editor
 * Description:       Renders real-time WCAG accessibility validation indicators
 *                    alongside the WordPress block editor canvas.
 * Version:           0.1.0
 * Requires at least: 6.4
 * Requires PHP:      8.1
 * Author:            Community for NL Design System
 * Author URI:        https://nldesignsystem.nl
 * License:           EUPL-1.2
 * License URI:       https://joinup.ec.europa.eu/collection/eupl/eupl-text-eupl-12
 * Text Domain:       nl-design-system-community-editor-wp-plugin
 *
 * @package NlDesignSystemCommunityEditorWpPlugin
 */

declare(strict_types=1);

namespace NlDesignSystemCommunity\EditorWpPlugin;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Registers the block defined in block.json.
 *
 * WordPress reads block.json and automatically:
 *  - registers dist/index.js as the editorScript (loaded only in the editor)
 *  - registers dist/index.css as the editorStyle (loaded only in the editor)
 *  - resolves script dependencies from dist/index.asset.php
 *
 * The block has `supports.inserter: false` so it never appears in the block
 * inserter — it is purely a mechanism to deliver the editor UI overlay.
 *
 * @return void
 */
function register_block(): void {
    register_block_type( plugin_dir_path( __FILE__ ) );
}

add_action( 'init', __NAMESPACE__ . '\register_block' );
