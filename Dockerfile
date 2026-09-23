FROM wordpress:php8.2-apache AS wordpress-base

FROM php:8.2-apache

RUN apt-get update && apt-get install -y \
    libfreetype6-dev \
    libjpeg62-turbo-dev \
    libpng-dev \
    libzip-dev \
    libicu-dev \
    libonig-dev \
    libxml2-dev \
    libcurl4-openssl-dev \
    unzip \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install \
        mysqli \
        pdo_mysql \
        gd \
        zip \
        intl \
        mbstring \
        exif \
        xml \
        curl \
    && a2enmod rewrite \
    && rm -rf /var/lib/apt/lists/*

# Use the official WordPress startup script,
# but keep the final image based on php:8.2-apache
# so it does not inherit WordPress's /var/www/html volume.
COPY --from=wordpress-base /usr/local/bin/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

COPY . /var/www/html/

RUN rm -f /var/www/html/wp-config.php \
    && rm -rf /var/www/html/wp-content/uploads \
        /var/www/html/wp-content/cache \
        /var/www/html/wp-content/upgrade \
    && chown -R www-data:www-data /var/www/html \
    && chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["docker-entrypoint.sh"]

CMD ["apache2-foreground"]
