#!/bin/bash
set -e

DRUSH=/opt/drupal/vendor/bin/drush
DRUPAL_ROOT=/opt/drupal/web
SETTINGS=${DRUPAL_ROOT}/sites/default/settings.php
DB_URL="pgsql://${POSTGRES_USER:-drupal}:${POSTGRES_PASSWORD:-drupal}@${POSTGRES_HOST:-postgres}/${POSTGRES_DB:-drupal}"

# Wait for database
echo "[setup] Waiting for database..."
DB_READY=false
for i in $(seq 1 30); do
  if php -r "try { new PDO('pgsql:host=${POSTGRES_HOST:-postgres};dbname=${POSTGRES_DB:-drupal}', '${POSTGRES_USER:-drupal}', '${POSTGRES_PASSWORD:-drupal}'); } catch(Exception \$e) { exit(1); }" 2>/dev/null; then
    DB_READY=true
    break
  fi
  echo "[setup] Attempt $i/30, retrying in 2s..."
  sleep 2
done

if [[ "$DB_READY" != "true" ]]; then
  echo "[setup] Database not reachable after 30 attempts. Aborting."
  exit 1
fi

# Install Drupal on first run (settings.php is created by site:install)
if [[ ! -f "$SETTINGS" ]]; then
  echo "[setup] Installing Drupal..."
  chmod 755 "${DRUPAL_ROOT}/sites/default"
  $DRUSH --root="$DRUPAL_ROOT" site:install standard \
    --db-url="$DB_URL" \
    --account-name="${DRUPAL_ADMIN_USER:-admin}" \
    --account-pass="${DRUPAL_ADMIN_PASSWORD:-admin}" \
    --site-name="${DRUPAL_SITE_NAME:-Drupal}" \
    --yes

  echo "[setup] Drupal installed."
fi

# Enable custom modules (idempotent)
MODULES=$(find "${DRUPAL_ROOT}/modules/custom" -maxdepth 1 -mindepth 1 -type d | xargs -I{} basename {} | tr '\n' ' ')
if [[ -n "$MODULES" ]]; then
  echo "[setup] Enabling modules: $MODULES"
  $DRUSH --root="$DRUPAL_ROOT" en $MODULES --yes
fi

LOGIN_URL=$($DRUSH --root="$DRUPAL_ROOT" --uri="${DRUPAL_BASE_URL:-http://localhost:8081}" user:login)

echo ""
echo "  Drupal ready → ${DRUPAL_BASE_URL:-http://localhost:8081}"
echo "  Login URL    → $LOGIN_URL"
echo ""

echo "[setup] Ready. Starting Apache..."
exec "$@"
