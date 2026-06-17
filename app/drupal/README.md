# Drupal demo environment

## Prerequisites

Install Docker.

## Getting started

Copy the environment file and start the containers:

```shell
cp .env.example .env
docker compose up
```

Drupal installs itself automatically on first boot. When it's ready, the terminal prints a direct login URL:

```text
  Drupal ready → http://localhost:8081
  Login URL    → http://localhost:8081/user/reset/...
```

Click the login URL to enter Drupal immediately. A fresh URL is printed on every restart.

## Stopping

```shell
docker compose down
```

The database is preserved in a Docker volume, so Drupal remains installed on next `docker compose up`.

To reset completely and start from scratch:

```shell
docker compose down -v
```

## Custom modules

Modules in `./modules/` are automatically mounted into the container and enabled on startup. Add a new module folder there and simply restart the environment.

Edits to PHP files are reflected immediately on page reload. After structural changes (new hooks, schema updates) clear the cache:

```shell
docker compose exec drupal /opt/drupal/vendor/bin/drush --root=/opt/drupal/web cr
```

### Available modules

| Module   | Description                                                                                                                   |
| -------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `clippy` | Registers the ClippyPlugin with Drupal's CKEditor 5. Build it first with `pnpm build` from `packages/drupal-ckeditor-plugin`. |
