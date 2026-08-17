# TYPO3 demo environment

## Prerequisites

Install Docker.

## Getting started

Copy the environment file and start the containers:

```shell
cp .env.example .env
docker compose up
```

If you change the `Dockerfile`, `setup.sh` or `wait-for-db.php`, rebuild explicitly — `docker compose up` reuses an existing local image otherwise:

```shell
docker compose up --build
```

TYPO3 installs itself automatically on first boot. When it's ready, the terminal prints where to go:

```text
  TYPO3 ready → http://localhost:8082/typo3
  Username    → admin
  Password    → the TYPO3_SETUP_ADMIN_PASSWORD from your .env
```

TYPO3 has no one-time login link, so log in with the credentials from `.env`. Note that TYPO3 enforces a password policy for strong passwords, the default of the env example meets the requirements.

## Stopping

```shell
docker compose down
```

The database and the configuration are preserved in Docker volumes, so TYPO3 remains installed on the next `docker compose up`.

To reset completely and start from scratch:

```shell
docker compose down -v
```

## Clearing the cache

After changing configuration inside the container:

```shell
docker compose exec typo3 php vendor/bin/typo3 cache:flush
```

Every TYPO3 CLI command is available that way; `php vendor/bin/typo3 list` shows them.
