FROM drupal:11-apache

RUN composer require drush/drush --no-interaction --working-dir=/opt/drupal

COPY modules/ /var/www/html/modules/custom/
COPY setup.sh /usr/local/bin/setup.sh
RUN chmod +x /usr/local/bin/setup.sh

# Run Apache on port 8080 so the process does not need root
RUN sed -i 's/Listen 80/Listen 8080/' /etc/apache2/ports.conf \
    && sed -i 's/<VirtualHost \*:80>/<VirtualHost *:8080>/' /etc/apache2/sites-available/000-default.conf \
    && echo "ServerName localhost" >> /etc/apache2/apache2.conf \
    && chown -R www-data:www-data /var/log/apache2 /var/run/apache2

USER www-data

ENTRYPOINT ["/usr/local/bin/setup.sh"]
CMD ["apache2-foreground"]
