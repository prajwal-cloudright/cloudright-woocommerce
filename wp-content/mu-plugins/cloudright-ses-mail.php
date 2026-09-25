<?php
/**
 * CloudRight SES SMTP Mail Configuration
 *
 * Configures WordPress wp_mail() to send through
 * Amazon SES SMTP using runtime environment variables.
 */

defined('ABSPATH') || exit;

add_action('phpmailer_init', function ($phpmailer) {

    $smtp_host     = getenv('CLOUDRIGHT_SMTP_HOST');
    $smtp_port     = getenv('CLOUDRIGHT_SMTP_PORT');
    $smtp_username = getenv('CLOUDRIGHT_SMTP_USERNAME');
    $smtp_password = getenv('CLOUDRIGHT_SMTP_PASSWORD');
    $from_email    = getenv('CLOUDRIGHT_SMTP_FROM_EMAIL');
    $from_name     = getenv('CLOUDRIGHT_SMTP_FROM_NAME');

    /*
     * Do nothing if SMTP configuration is not available.
     */
    if (
        empty($smtp_host) ||
        empty($smtp_port) ||
        empty($smtp_username) ||
        empty($smtp_password)
    ) {
        return;
    }

    /*
     * Configure PHPMailer to use SMTP.
     */
    $phpmailer->isSMTP();

    $phpmailer->Host = $smtp_host;
    $phpmailer->Port = (int) $smtp_port;

    $phpmailer->SMTPAuth = true;
    $phpmailer->Username = $smtp_username;
    $phpmailer->Password = $smtp_password;

    /*
     * Amazon SES SMTP uses STARTTLS on port 587.
     */
    $phpmailer->SMTPSecure = 'tls';

    /*
     * Configure sender.
     */
    if (!empty($from_email)) {
        $phpmailer->From = $from_email;
    }

    if (!empty($from_name)) {
        $phpmailer->FromName = $from_name;
    }

    /*
     * Do not enable SMTP debug output in production.
     */
    $phpmailer->SMTPDebug = 0;
});
