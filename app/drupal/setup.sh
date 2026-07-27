#!/bin/bash
set -e

DRUSH=/opt/drupal/vendor/bin/drush
DRUPAL_ROOT=/opt/drupal/web

# Wait for the database to accept connections.
if ! php /usr/local/bin/wait-for-db.php; then
  echo "[setup] Database not reachable. Aborting."
  exit 1
fi

# Detect an existing install via the database (settings.php is baked in, never written to)
if $DRUSH --root="$DRUPAL_ROOT" status --field=bootstrap 2>/dev/null | grep -q "Successful"; then
  echo "[setup] Drupal already installed. Skipping installation."
else
  echo "[setup] Installing Drupal..."
  chmod 755 "${DRUPAL_ROOT}/sites/default"
  $DRUSH --root="$DRUPAL_ROOT" site:install standard \
    --account-name="${DRUPAL_ADMIN_USER:-admin}" \
    --account-pass="${DRUPAL_ADMIN_PASSWORD:-admin}" \
    --site-name="${DRUPAL_SITE_NAME:-Drupal}" \
    --yes

  echo "[setup] Drupal installed."
fi

# Enable custom modules (idempotent)
mapfile -t MODULES < <(find "${DRUPAL_ROOT}/modules/custom" -maxdepth 1 -mindepth 1 -type d -exec basename {} \;)
if [[ ${#MODULES[@]} -gt 0 ]]; then
  echo "[setup] Enabling modules: ${MODULES[*]}"
  $DRUSH --root="$DRUPAL_ROOT" en "${MODULES[@]}" --yes
fi

LOGIN_URL=$($DRUSH --root="$DRUPAL_ROOT" --uri="${DRUPAL_BASE_URL:-http://localhost:8081}" user:login)

echo ""
echo "  Drupal ready → ${DRUPAL_BASE_URL:-http://localhost:8081}"
echo "  Login URL    → $LOGIN_URL"
echo ""

echo "[setup] Ready. Starting Apache..."
exec "$@"
