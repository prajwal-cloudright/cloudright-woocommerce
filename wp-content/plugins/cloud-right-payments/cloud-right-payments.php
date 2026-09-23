<?php
/**
 * Plugin Name: CloudRight Payments
 * Description: CloudRight payment integration for WooCommerce.
 * Version: 1.0.0
 * Author: CloudRight
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}


/**
 * Enqueue CloudRight checkout assets.
 */
function cloudright_enqueue_checkout_script() {

	wp_enqueue_script(
		'cloudright-checkout',
		plugin_dir_url( __FILE__ ) . 'assets/js/cloudright-checkout.js',
		array(),
		'1.0.1',
		true
	);

	wp_enqueue_style(
		'cloudright-checkout',
		plugin_dir_url( __FILE__ ) . 'assets/css/cloudright-checkout.css',
		array(),
		'1.0.1'
	);
}

add_action(
	'wp_enqueue_scripts',
	'cloudright_enqueue_checkout_script'
);


/**
 * Load CloudRight REST API.
 */
require_once plugin_dir_path( __FILE__ ) . 'includes/class-cloudright-api.php';


/**
 * Register REST API routes.
 */
add_action(
	'rest_api_init',
	function () {

		$cloudright_api = new CloudRight_API();

		$cloudright_api->register_routes();
	}
);
