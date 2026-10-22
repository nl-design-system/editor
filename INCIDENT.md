# Incident runbook

What to do when a vulnerability affects the editor's demo environments: mitigate it in the images (section 1), and take the environment offline until the mitigation is live (section 2).

## 1. PHP vulnerability in the Drupal or TYPO3 image

The Drupal and TYPO3 demo images are built from the official PHP-based images in `app/drupal/Dockerfile` and `app/typo3/Dockerfile`. When a PHP vulnerability is published before patched base images are available, override the affected PHP settings in the image.

1. Add a `RUN` step to both Dockerfiles that writes an ini file to `/usr/local/etc/php/conf.d/`. Prefix the file name with `zz-` so it loads last and wins over earlier ini files.
2. Chain a `php -r` check for each setting that matters, so the build fails when a setting does not take effect.
3. Open a PR and merge it to `main`. The Docker Drupal and Docker TYPO3 workflows then publish the new images, which the demo environments pick up through Flux.

### Example: CVE-2026-109618 / CVE-2026-109619 (October 2026)

`app/{drupal/typo3}/Dockerfile`:

```dockerfile
RUN { \
        echo 'session.upload_progress.enabled = 0'; \
        echo 'fatal_error_backtraces = 0'; \
        echo 'memory_limit = -1'; \
        echo 'post_max_size = 8M'; \
        echo 'upload_max_filesize = 2M'; \
        echo 'expose_php = 0'; \
        echo 'display_errors = 0'; \
    } > /usr/local/etc/php/conf.d/zz-cve-mitigation.ini \
    && php -r 'exit(ini_get("session.upload_progress.enabled") === "0" ? 0 : 1);' \
    && php -r 'exit(ini_get("fatal_error_backtraces") === "0" ? 0 : 1);' \
    && php -r 'exit(ini_get("memory_limit") === "-1" ? 0 : 1);' \
    && php -r 'exit(ini_get("expose_php") === "0" ? 0 : 1);' \
    && php -r 'exit(ini_get("display_errors") === "0" ? 0 : 1);'
```

## 2. Taking demo environments offline

The demo environments run on the NL Design System Kubernetes cluster, managed with Flux from the [`nl-design-system/infra`](https://github.com/nl-design-system/infra) repository. We do not have direct cluster access, so every change goes through a PR on the `dev` branch of that repository. Flux syncs `dev` every minute, so a merged PR takes effect within a few minutes.

[`INCIDENT.md` in `nl-design-system/infra`](https://github.com/nl-design-system/infra/blob/dev/INCIDENT.md) describes how to take the demo environments offline.
