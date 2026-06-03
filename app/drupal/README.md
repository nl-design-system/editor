# Example Drupal app with Clippy Editor

Drupal image: <https://hub.docker.com/_/drupal/>

## Prerequisites

Install Docker

## Getting started

Copy the .env.example environment file to .env:

```shell
cp .env.example .env
```

Then start the containers:

```shell
docker compose up
```

Open <http://localhost:8081> to run the Drupal installer. When prompted for database credentials:

| Field         | Value      |
| ------------- | ---------- |
| Database type | PostgreSQL |
| Database name | drupal     |
| Username      | drupal     |
| Password      | drupal     |

The host field is hidden under **Advanced Options** — make sure to set it:

| Field | Value    |
| ----- | -------- |
| Host  | postgres |

This only needs to be done once — the database and Drupal state are persisted in Docker volumes.

## Logging in

Go to <http://localhost:8081/user/login> with the credentials you set during the installer.

## Stopping

```shell
docker compose down
```

Volumes are preserved, so Drupal remains installed on next `docker compose up`.

To reset completely and start from scratch:

```shell
docker compose down -v
```

## Custom modules

Custom modules live in `modules/` and are bind-mounted into the container at
`/var/www/html/modules/custom/`. Edits to PHP files are reflected immediately on
page reload. After structural changes (new hooks, schema updates) clear the
Drupal cache via **Administration → Configuration → Development → Performance → Clear cache**.

Modules are **not enabled automatically** — go to
<http://localhost:8081/admin/modules>, find your module, check the box, and click
**Install**.
