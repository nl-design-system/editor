# TYPO3 demo environment

## Prerequisites

Install Docker.

## Getting started

Copy the environment file and start the containers:

```shell
cp .env.example .env
docker compose up
```

If you change the `Dockerfile`, the startup scripts or anything under `config/`, rebuild explicitly — `docker compose up` reuses an existing local image otherwise:

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

The database is preserved in a Docker volume, and startup asks the database whether TYPO3 is installed, so TYPO3 remains installed on the next `docker compose up`.

To reset completely and start from scratch:

```shell
docker compose down -v
```

## Deploying

The image is published to GHCR on every push to `main` by `.github/workflows/docker-typo3.yml`, tagged `sha-<commit>`. It carries its own `config/`, so it needs no persistent volume to boot: the database credentials, the site configuration and the settings that must not drift between containers all come from the image and the environment.

### Environment variables the deployment must set

Every variable below falls back to a default or an empty value when it is unset, so a missing secret produces a working-looking site rather than a visible failure. Check each one.

| Variable                           | Unset                                                                                                                                                                                                                                                                                        |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `TYPO3_SETUP_ADMIN_PASSWORD`       | Installation still succeeds, but `typo3 setup` skips creating the backend user and skips setting the install-tool password, so the site comes up with no way to log in. Both demo environments are publicly reachable, so this must also not be the well-known password from `.env.example`. |
| `TYPO3_SETUP_ADMIN_USERNAME`       | The installer falls back to `admin`. Only relevant when the password is set, since no user is created without one.                                                                                                                                                                           |
| `TYPO3_SETUP_ADMIN_EMAIL`          | The backend user is created without an email address.                                                                                                                                                                                                                                        |
| `TYPO3_ENCRYPTION_KEY`             | The installing container generates a random key into its own `settings.php`, which dies with the container because `config/` does not survive a rollout. Every container after it skips installation and runs with no key at all. Sessions and encrypted values break.                       |
| `TYPO3_TRUSTED_HOSTS_PATTERN`      | TYPO3 trusts only the server name, which the image hardcodes to `localhost`, so every request through an ingress is rejected as a host mismatch. Set a real pattern; a wildcard removes the protection rather than configuring it.                                                           |
| `TYPO3_INSTALL_TOOL_PASSWORD_HASH` | The install tool keeps its empty default. The value is a password hash, not a password: `typo3 install:password:set --dry-run` prints one.                                                                                                                                                   |
| `TYPO3_BASE_URL`                   | The site serves `http://localhost:8082`, the image default, instead of the deploy hostname.                                                                                                                                                                                                  |
| `TYPO3_DB_*`                       | `postgres`, `5432`, `typo3`, `typo3`, `typo3` — the local development values.                                                                                                                                                                                                                |
| `TYPO3_PROJECT_NAME`               | The site name is `TYPO3`.                                                                                                                                                                                                                                                                    |
| `TYPO3_CONTEXT`                    | The image defaults to `Production`; `compose.yaml` overrides it to `Development` locally.                                                                                                                                                                                                    |

### State

Only Postgres holds state that survives a rollout. Uploaded files are written to `public/fileadmin` inside the container and are therefore per-container unless a persistent claim is provisioned for that path — a cluster-side decision this repository deliberately does not make.

## Extensions

Extensions live in `./packages/`, the folder TYPO3 uses for local extensions, and are activated on startup. Each one is a Composer package, so it also has to be named in the `composer require` in the `Dockerfile`. Add the extension, add it to that line, and rebuild:

```shell
docker compose up --build
```

Edits under `Resources/Public/` are reflected immediately on page reload. Changes to PHP files need a cache flush, and a newly added `Resources/Public/` needs another rebuild to publish its assets.

### Available extensions

| Extension | Description                                                              |
| --------- | ------------------------------------------------------------------------ |
| `example` | Logs "Hello World" to the browser console on every backend page.         |
| `clippy`  | Accessibility feedback and the design-system content classes in the RTE. |

`clippy` is not a source folder: it is generated into `./packages/clippy/dist/` by `packages/typo3-ckeditor-plugin`, and that `dist/` is the extension root. The image build copies that `dist/`, so build it from the repository root before the first `docker compose up` — without it the build fails on the missing path:

```shell
pnpm install
pnpm run build
```

### Editing the content classes

The classes `clippy` adds to the editor's output ship as defaults in the extension's RTE preset. To override them per site in the backend, add the `Clippy` site set to the site once:

_Sites → Setup →_ edit the site _→ Sets →_ add **Clippy**.

_Sites → Setup →_ the site's **Settings** then lists every class under _Content classes_, and the values are stored in `config/sites/<site>/settings.yaml`. A field left empty outputs that element without a class. Without the set nothing changes: the defaults from the preset apply.

## Clearing the cache

After changing configuration or PHP inside the container:

```shell
docker compose exec typo3 php vendor/bin/typo3 cache:flush
```

Every TYPO3 CLI command is available that way; `php vendor/bin/typo3 list` shows them.
