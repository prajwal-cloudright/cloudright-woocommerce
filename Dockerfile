FROM wordpress:php8.2-apache

RUN a2enmod rewrite

RUN sed -i '/<Directory \/var\/www\/>/,/<\/Directory>/ s/AllowOverride None/AllowOverride All/' /etc/apache2/apache2.conf

COPY wp-content /var/www/html/wp-content/

RUN rm -f /var/www/html/wp-config.php \
    && chown -R www-data:www-data /var/www/html/wp-content

EXPOSE 80
