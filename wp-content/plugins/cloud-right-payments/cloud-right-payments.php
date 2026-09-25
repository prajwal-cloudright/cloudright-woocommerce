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
 * Enqueue CloudRight My Account assets.
 */
function cloudright_enqueue_my_account_assets() {

	if ( ! function_exists( 'is_account_page' ) || ! is_account_page() ) {
		return;
	}


	wp_enqueue_script(
		'cloudright-my-account',
		plugin_dir_url( __FILE__ ) . 'assets/js/cloudright-my-account.js',
		array(),
		'1.0.0',
		true
	);


	wp_enqueue_style(
		'cloudright-my-account',
		plugin_dir_url( __FILE__ ) . 'assets/css/cloudright-my-account.css',
		array(),
		'1.0.0'
	);


	wp_localize_script(
		'cloudright-my-account',
		'cloudRightMyAccountConfig',
		array(
			'restUrl' => esc_url_raw(
				rest_url( 'cloudright/v1' )
			),
		)
	);
}

add_action(
	'wp_enqueue_scripts',
	'cloudright_enqueue_my_account_assets'
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


/**
 * CloudRight custom Order Received page.
 *
 * This shortcode displays the custom order confirmation page.
 *
 * Usage:
 * [cloudright_order_received]
 */
function cloudright_order_received_shortcode() {

	if ( ! function_exists( 'wc_get_order' ) ) {
		return '<p>WooCommerce is not available.</p>';
	}

	$order_id  = isset( $_GET['order_id'] ) ? absint( $_GET['order_id'] ) : 0;
	$order_key = isset( $_GET['key'] ) ? sanitize_text_field( wp_unslash( $_GET['key'] ) ) : '';

	if ( ! $order_id || empty( $order_key ) ) {
		return '
			<div class="cloudright-order-page">
				<div class="cloudright-order-card cloudright-order-error-card">
					<div class="cloudright-order-error-icon">!</div>
					<h1>Order Information Missing</h1>
					<p>We could not find the order information for this page.</p>
				</div>
			</div>
		';
	}

	$order = wc_get_order( $order_id );

	if ( ! $order ) {
		return '
			<div class="cloudright-order-page">
				<div class="cloudright-order-card cloudright-order-error-card">
					<div class="cloudright-order-error-icon">!</div>
					<h1>Order Not Found</h1>
					<p>We could not find the requested order.</p>
				</div>
			</div>
		';
	}


	/**
	 * Verify the WooCommerce order key.
	 */
	if ( ! hash_equals( $order->get_order_key(), $order_key ) ) {
		return '
			<div class="cloudright-order-page">
				<div class="cloudright-order-card cloudright-order-error-card">
					<div class="cloudright-order-error-icon">!</div>
					<h1>Invalid Order Link</h1>
					<p>This order confirmation link is not valid.</p>
				</div>
			</div>
		';
	}


	$order_number = $order->get_order_number();
	$order_date   = $order->get_date_created();

	$date_text = $order_date
		? $order_date->date_i18n( 'F j, Y' )
		: '';

	$customer_email = $order->get_billing_email();
	$first_name     = $order->get_billing_first_name();
	$subtotal       = $order->get_subtotal();
	$total          = $order->get_total();
	$currency       = $order->get_currency();

	ob_start();
	?>

	<div class="cloudright-order-page">

		<div class="cloudright-order-card">

			<!-- Success Header -->
			<div class="cloudright-order-success-header">

				<div class="cloudright-success-icon-wrap">
					<div class="cloudright-success-icon">
						✓
					</div>
				</div>

				<div class="cloudright-success-label">
					Payment Successful
				</div>

				<h1>Order Received</h1>

				<p class="cloudright-order-thank-you">
					Thank you<?php echo $first_name ? ', ' . esc_html( $first_name ) : ''; ?>!
				</p>

				<p class="cloudright-order-success-description">
					Your order has been successfully placed and your payment has been confirmed.
				</p>

			</div>


			<!-- Order Information -->
			<div class="cloudright-order-info-grid">

				<div class="cloudright-order-info-item">

					<div class="cloudright-order-info-icon">
						#
					</div>

					<div>
						<span>Order Number</span>

						<strong>
							#<?php echo esc_html( $order_number ); ?>
						</strong>
					</div>

				</div>


				<div class="cloudright-order-info-item">

					<div class="cloudright-order-info-icon">
						<span>▣</span>
					</div>

					<div>
						<span>Order Date</span>

						<strong>
							<?php echo esc_html( $date_text ); ?>
						</strong>
					</div>

				</div>


				<div class="cloudright-order-info-item">

					<div class="cloudright-order-info-icon">
						<span>@</span>
					</div>

					<div>
						<span>Confirmation Email</span>

						<strong class="cloudright-email-value">
							<?php echo esc_html( $customer_email ); ?>
						</strong>
					</div>

				</div>

			</div>


			<!-- Order Details -->
			<div class="cloudright-order-section">

				<div class="cloudright-section-heading">

					<div>
						<span class="cloudright-section-eyebrow">
							PURCHASE SUMMARY
						</span>

						<h2>Order Details</h2>
					</div>

				</div>


				<div class="cloudright-order-items">

					<?php foreach ( $order->get_items() as $item_id => $item ) : ?>

						<?php
						$product    = $item->get_product();
						$product_id = $product ? $product->get_id() : 0;
						$quantity   = $item->get_quantity();
						$line_total = $item->get_total();
						?>

						<div class="cloudright-order-item">

							<div class="cloudright-product-left">

								<div class="cloudright-product-icon">
									<?php echo $product ? '◆' : '•'; ?>
								</div>

								<div class="cloudright-product-details">

									<?php if ( $product_id ) : ?>

										<a
											href="<?php echo esc_url( get_permalink( $product_id ) ); ?>"
											class="cloudright-product-name"
										>
											<?php echo esc_html( $item->get_name() ); ?>
										</a>

									<?php else : ?>

										<span class="cloudright-product-name">
											<?php echo esc_html( $item->get_name() ); ?>
										</span>

									<?php endif; ?>

									<span class="cloudright-product-quantity">
										Quantity: <?php echo esc_html( $quantity ); ?>
									</span>

								</div>

							</div>


							<div class="cloudright-product-price">

								<?php
								echo wp_kses_post(
									wc_price(
										$line_total,
										array(
											'currency' => $currency,
										)
									)
								);
								?>

							</div>

						</div>

					<?php endforeach; ?>

				</div>


				<!-- Price Summary -->
				<div class="cloudright-price-summary">

					<div class="cloudright-price-row">

						<span>Subtotal</span>

						<strong>
							<?php
							echo wp_kses_post(
								wc_price(
									$subtotal,
									array(
										'currency' => $currency,
									)
								)
							);
							?>
						</strong>

					</div>


					<div class="cloudright-price-row cloudright-final-total">

						<span>Total</span>

						<strong>
							<?php
							echo wp_kses_post(
								wc_price(
									$total,
									array(
										'currency' => $currency,
									)
								)
							);
							?>
						</strong>

					</div>

				</div>

			</div>


			<!-- Payment Status -->
			<div class="cloudright-payment-card">

				<div class="cloudright-payment-left">

					<div class="cloudright-payment-icon">
						✓
					</div>

					<div>

						<span class="cloudright-payment-label">
							Payment Method
						</span>

						<strong>
							CloudRight
						</strong>

					</div>

				</div>


				<div class="cloudright-paid-badge">
					<span>✓</span>
					Paid
				</div>

			</div>


			<!-- Confirmation Message -->
			<div class="cloudright-confirmation-message">

				<div class="cloudright-confirmation-icon">
					✉
				</div>

				<div>

					<strong>Order confirmation sent</strong>

					<p>
						Your order details and confirmation have been sent to
						<?php echo esc_html( $customer_email ); ?>.
					</p>

				</div>

			</div>


			<!-- Footer Message -->
			<div class="cloudright-order-footer">

				<p>
					Thank you for shopping with
					<strong>CloudRight</strong>.
				</p>

				<span>
					We appreciate your order.
				</span>

			</div>

		</div>

	</div>

	<?php

	return ob_get_clean();
}


add_shortcode(
	'cloudright_order_received',
	'cloudright_order_received_shortcode'
);