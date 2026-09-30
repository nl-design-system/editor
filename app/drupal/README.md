# Drupal demo environment

## Prerequisites

Install Docker.

## Getting started

Copy the environment file and start the containers:

```shell
cp .env.example .env
docker compose up
```

If you change the `Dockerfile`, `setup.sh`, `settings.php` or `wait-for-db.php`, rebuild explicitly — `docker compose up` reuses an existing local image otherwise:

```shell
docker compose up --build
```

Drupal installs itself automatically on first boot. When it's ready, the terminal prints a direct login URL:

```text
  Drupal ready → http://localhost:8081
  Login URL    → http://localhost:8081/user/reset/...
```

Click the login URL to enter Drupal immediately. A fresh URL is printed on every restart.

The generated Login URL is single-use and may expire. When necessary, log in manually at `http://localhost:8081/user/login` with the credentials from `.env` (`DRUPAL_ADMIN_USER` / `DRUPAL_ADMIN_PASSWORD`).

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

| Module        | Description                                                                                                                                                                   |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `clippy`      | Registers the ClippyPlugin with Drupal's CKEditor 5. Build it first with `pnpm build` from the repository root.                                                               |
| `clippy_demo` | Adds the _Clippy demo_ content type: a title, a rich text _Body_ field and an _Appendix_ of repeatable sections, each a Paragraphs item with a _Section title_ and rich text. |

### Trying the accessibility report

Go to _Content → Add content → Clippy demo_. The report beside the form covers the title, the _Body_ editor and every appendix section in page order. A _Section title_ counts as an `<h2>`:

- a `<h4>` in _Body_ after a `<h2>` is reported as a skipped level, and so is a `<h4>` in a section's _Text_ right after its _Section title_;
- clearing the title or a _Section title_ reports an empty heading, labelled with that field;
- _Add Section_ adds a section whose title and text join the report, and _Remove_ takes them out again.

`clippy_demo` sets up its content type when it is installed. On a database that already has an older version of it, reinstall it:

```shell
docker compose exec drupal /opt/drupal/vendor/bin/drush --root=/opt/drupal/web pmu clippy_demo --yes
docker compose exec drupal /opt/drupal/vendor/bin/drush --root=/opt/drupal/web en clippy_demo --yes
```
