FROM wordpress:php8.2-apache

COPY . /var/www/html/

RUN rm -f /var/www/html/wp-config.php \
    && rm -rf /var/www/html/wp-content/uploads \
    /var/www/html/wp-content/cache \
    /var/www/html/wp-content/upgrade \
    && chown -R www-data:www-data /var/www/html

EXPOSE 80
