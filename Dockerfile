FROM wordpress:php8.2-apache

RUN a2enmod rewrite

COPY wp-content /var/www/html/wp-content/

RUN rm -f /var/www/html/wp-config.php \
    && chown -R www-data:www-data /var/www/html/wp-content

EXPOSE 80
