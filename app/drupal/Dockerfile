FROM drupal:11-apache

RUN composer require drush/drush --no-interaction --working-dir=/opt/drupal

COPY settings.php /var/www/html/sites/default/settings.php
COPY setup.sh /usr/local/bin/setup.sh
COPY wait-for-db.php /usr/local/bin/wait-for-db.php
# Run Apache on port 8080 so the process does not need root
RUN chmod +x /usr/local/bin/setup.sh \
    && chmod 444 /var/www/html/sites/default/settings.php \
    && sed -i 's/Listen 80/Listen 8080/' /etc/apache2/ports.conf \
    && sed -i 's/<VirtualHost \*:80>/<VirtualHost *:8080>/' /etc/apache2/sites-available/000-default.conf \
    && echo "ServerName localhost" >> /etc/apache2/apache2.conf \
    && chown -R www-data:www-data /var/log/apache2 /var/run/apache2 \
    && mkdir -p /opt/drupal/config/sync \
    && chown -R www-data:www-data /opt/drupal/config

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

COPY modules/ /var/www/html/modules/custom/

USER www-data

ENTRYPOINT ["/usr/local/bin/setup.sh"]
CMD ["apache2-foreground"]
