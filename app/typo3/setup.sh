#!/bin/bash
set -e

TYPO3=/var/www/html/vendor/bin/typo3
TYPO3_ROOT=/var/www/html
SITE_CONFIG_TEMPLATE=/usr/local/share/typo3/sites

export TYPO3_SETUP_CREATE_SITE="${TYPO3_SETUP_CREATE_SITE:-${TYPO3_BASE_URL:-http://localhost:8082}}"

# Wait for the database to accept connections.
if ! php /usr/local/bin/wait-for-db.php; then
  echo "[setup] Database not reachable. Aborting."
  exit 1
fi

# settings.php is baked into the image, so only the database can tell an installation from an
# empty but reachable database.
INSTALLED=0
php /usr/local/bin/check-install.php || INSTALLED=$?

if [[ $INSTALLED -gt 1 ]]; then
  echo "[setup] Could not determine whether TYPO3 is installed. Aborting."
  exit 1
fi

if [[ $INSTALLED -eq 0 ]]; then
  echo "[setup] TYPO3 already installed. Skipping installation."
else
  echo "[setup] Installing TYPO3..."
  $TYPO3 setup --no-interaction --force --server-type=apache

  # The installer writes the site configuration with the base URL hardcoded, which would shadow
  # the committed one for the lifetime of this container.
  cp -R "${SITE_CONFIG_TEMPLATE}/." "${TYPO3_ROOT}/config/sites/"

  echo "[setup] TYPO3 installed."
fi

# Set up the extensions and apply pending database changes (the database persists across deploys)
echo "[setup] Setting up extensions and running database updates..."
$TYPO3 extension:setup
$TYPO3 cache:flush

echo ""
echo "  TYPO3 ready → ${TYPO3_SETUP_CREATE_SITE}/typo3"
echo "  Username    → ${TYPO3_SETUP_ADMIN_USERNAME:-admin}"
echo "  Password    → the TYPO3_SETUP_ADMIN_PASSWORD from your .env"
echo ""

echo "[setup] Ready. Starting Apache..."
exec "$@"
