FROM php:8.4-apache

COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer

# intl is TYPO3's only requirement the base image lacks; pdo_pgsql, zip and gd are for postgres,
# composer and image processing.
RUN apt-get update \
    && apt-get install --no-install-recommends --yes \
        libfreetype6-dev \
        libicu-dev \
        libjpeg62-turbo-dev \
        libpng-dev \
        libpq-dev \
        libzip-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j"$(nproc)" gd intl pdo_pgsql zip \
    && rm -rf /var/lib/apt/lists/* \
# The minimums TYPO3's environment check asks for.
    && { \
        echo 'memory_limit = 512M'; \
        echo 'max_execution_time = 240'; \
        echo 'max_input_vars = 1500'; \
        echo 'upload_max_filesize = 32M'; \
        echo 'post_max_size = 32M'; \
    } > /usr/local/etc/php/conf.d/typo3.ini

ENV COMPOSER_ALLOW_SUPERUSER=1

RUN composer create-project typo3/cms-base-distribution:^14.3 /var/www/html --no-interaction --no-progress \
    && composer clear-cache

COPY packages/example/ /var/www/html/packages/example/
COPY packages/clippy/dist/ /var/www/html/packages/clippy/
RUN composer --working-dir=/var/www/html require --no-interaction --no-progress \
        nl-design-system-community/example:@dev \
        nl-design-system-community/clippy:@dev \
    && composer clear-cache

ENV TYPO3_CONTEXT=Production
ENV TYPO3_BASE_URL=http://localhost:8082

COPY setup.sh /usr/local/bin/setup.sh
COPY check-install.php /usr/local/bin/check-install.php
COPY wait-for-db.php /usr/local/bin/wait-for-db.php
# Apache runs on 8080 so the process needs no root, and FallbackResource replaces the .htaccess the
# installer writes into public/, which is not a volume and so does not survive a new container.
RUN chmod +x /usr/local/bin/setup.sh \
    && sed -i 's/Listen 80/Listen 8080/' /etc/apache2/ports.conf \
    && printf '%s\n' \
        '<VirtualHost *:8080>' \
        '    DocumentRoot /var/www/html/public' \
        '    FallbackResource /index.php' \
        '</VirtualHost>' \
        > /etc/apache2/sites-available/000-default.conf \
    && echo "ServerName localhost" >> /etc/apache2/apache2.conf \
    # Docker creates a missing mount point as root, which www-data may not write to.
    && mkdir -p /var/www/html/config /var/www/html/public/fileadmin \
    && chown -R www-data:www-data /var/log/apache2 /var/run/apache2 /var/www/html

# settings.php stays writable because `typo3 setup` rewrites it; additional.php holds what must not
# drift and stays root-owned. sites/ is kept outside config/ so startup can restore it after install.
COPY config/ /var/www/html/config/
COPY config/sites/ /usr/local/share/typo3/sites/
RUN chown -R www-data:www-data /var/www/html/config \
    && chown root:root /var/www/html/config/system/additional.php \
    && chmod 444 /var/www/html/config/system/additional.php

USER www-data

ENTRYPOINT ["/usr/local/bin/setup.sh"]
CMD ["apache2-foreground"]
