#!/bin/bash
set -e

TYPO3=/var/www/html/vendor/bin/typo3
TYPO3_ROOT=/var/www/html
SETTINGS="${TYPO3_ROOT}/config/system/settings.php"

# Wait for the database to accept connections.
if ! php /usr/local/bin/wait-for-db.php; then
  echo "[setup] Database not reachable. Aborting."
  exit 1
fi

# The installer writes settings.php, and config/ lives in a volume, so its presence marks an
# existing install.
if [[ -f "$SETTINGS" ]]; then
  echo "[setup] TYPO3 already installed. Skipping installation."
else
  echo "[setup] Installing TYPO3..."
  $TYPO3 setup --no-interaction --force --server-type=apache

  echo "[setup] TYPO3 installed."
fi

# Set up the extensions and apply pending database changes (the database persists across deploys)
echo "[setup] Setting up extensions and running database updates..."
$TYPO3 extension:setup
$TYPO3 cache:flush

echo ""
echo "  TYPO3 ready → ${TYPO3_SETUP_CREATE_SITE:-http://localhost:8082}/typo3"
echo "  Username    → ${TYPO3_SETUP_ADMIN_USERNAME:-admin}"
echo "  Password    → the TYPO3_SETUP_ADMIN_PASSWORD from your .env"
echo ""

echo "[setup] Ready. Starting Apache..."
exec "$@"
