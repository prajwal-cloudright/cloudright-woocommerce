<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}


class CloudRight_API {

	/**
	 * Register REST API routes.
	 */
	public function register_routes() {

		register_rest_route(
			'cloudright/v1',
			'/create-order',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'create_order' ),
				'permission_callback' => '__return_true',
			)
		);
	}


	/**
	 * Create WooCommerce order after successful
	 * CloudRight dummy payment.
	 */
	public function create_order( WP_REST_Request $request ) {

		/**
		 * Make sure WooCommerce is available.
		 */
		if ( ! function_exists( 'wc_create_order' ) ) {

			return new WP_Error(
				'woocommerce_missing',
				'WooCommerce is not available.',
				array(
					'status' => 500,
				)
			);
		}


		/**
		 * Get request data.
		 */
		$data = $request->get_json_params();

		if ( ! is_array( $data ) ) {

			return new WP_Error(
				'invalid_request',
				'Invalid request data.',
				array(
					'status' => 400,
				)
			);
		}


		/**
		 * Cart items are required.
		 */
		if ( empty( $data['items'] ) || ! is_array( $data['items'] ) ) {

			return new WP_Error(
				'empty_cart',
				'Cart is empty.',
				array(
					'status' => 400,
				)
			);
		}


		/**
		 * Create WooCommerce order.
		 */
		try {

						/**
			 * -------------------------------------------------------
			 * Validate inventory before creating order.
			 * -------------------------------------------------------
			 */
			foreach ( $data['items'] as $item ) {

				if ( empty( $item['id'] ) ) {
					continue;
				}

				$product_id = absint( $item['id'] );

				$product = wc_get_product( $product_id );

				if ( ! $product ) {
					return new WP_Error(
						'product_not_found',
						'Product could not be found.',
						array(
							'status' => 400,
						)
					);
				}

				$quantity = ! empty( $item['quantity'] )
					? absint( $item['quantity'] )
					: 1;


				/**
				 * If backorders are allowed,
				 * do not block the order because of stock.
				 */
				if ( $product->backorders_allowed() ) {
					continue;
				}


				/**
				 * Product does not allow backorders.
				 */
				if ( ! $product->managing_stock() ) {
					continue;
				}


				$stock_quantity = $product->get_stock_quantity();


				/**
				 * Insufficient inventory.
				 */
				if (
					null === $stock_quantity ||
					$stock_quantity < $quantity
				) {

					return new WP_Error(
						'insufficient_inventory',
						sprintf(
							'Insufficient inventory for "%s". Available: %s, Requested: %s.',
							$product->get_name(),
							null === $stock_quantity
								? '0'
								: $stock_quantity,
							$quantity
						),
						array(
							'status' => 409,
						)
					);
				}
			}

			$order = wc_create_order();

		} catch ( Exception $e ) {

			return new WP_Error(
				'order_creation_failed',
				$e->getMessage(),
				array(
					'status' => 500,
				)
			);
		}


		if ( is_wp_error( $order ) ) {
			return $order;
		}


		/**
		 * -------------------------------------------------------
		 * Customer ID
		 * -------------------------------------------------------
		 *
		 * The CloudRight REST request may not have a logged-in
		 * WordPress session.
		 *
		 * Therefore only set customer ID when WordPress provides
		 * a valid logged-in user.
		 */
		$user_id = get_current_user_id();

		if ( $user_id > 0 ) {
			$order->set_customer_id( $user_id );
		}


		/**
		 * -------------------------------------------------------
		 * Add products to order
		 * -------------------------------------------------------
		 */
		foreach ( $data['items'] as $item ) {

			if ( empty( $item['id'] ) ) {
				continue;
			}

			$product_id = absint( $item['id'] );

			$product = wc_get_product( $product_id );

			if ( ! $product ) {
				continue;
			}

			$quantity = 1;

			if ( ! empty( $item['quantity'] ) ) {
				$quantity = max(
					1,
					absint( $item['quantity'] )
				);
			}

			$order->add_product(
				$product,
				$quantity
			);
		}


		/**
		 * -------------------------------------------------------
		 * Billing address
		 * -------------------------------------------------------
		 */
		if ( ! empty( $data['billing_address'] ) ) {

			$billing = $data['billing_address'];

			$order->set_billing_first_name(
				sanitize_text_field(
					isset( $billing['first_name'] )
						? $billing['first_name']
						: ''
				)
			);

			$order->set_billing_last_name(
				sanitize_text_field(
					isset( $billing['last_name'] )
						? $billing['last_name']
						: ''
				)
			);

			$order->set_billing_company(
				sanitize_text_field(
					isset( $billing['company'] )
						? $billing['company']
						: ''
				)
			);

			$order->set_billing_address_1(
				sanitize_text_field(
					isset( $billing['address_1'] )
						? $billing['address_1']
						: ''
				)
			);

			$order->set_billing_address_2(
				sanitize_text_field(
					isset( $billing['address_2'] )
						? $billing['address_2']
						: ''
				)
			);

			$order->set_billing_city(
				sanitize_text_field(
					isset( $billing['city'] )
						? $billing['city']
						: ''
				)
			);

			$order->set_billing_state(
				sanitize_text_field(
					isset( $billing['state'] )
						? $billing['state']
						: ''
				)
			);

			$order->set_billing_postcode(
				sanitize_text_field(
					isset( $billing['postcode'] )
						? $billing['postcode']
						: ''
				)
			);

			$order->set_billing_country(
				sanitize_text_field(
					isset( $billing['country'] )
						? $billing['country']
						: ''
				)
			);

			$order->set_billing_phone(
				sanitize_text_field(
					isset( $billing['phone'] )
						? $billing['phone']
						: ''
				)
			);

			$order->set_billing_email(
				sanitize_email(
					isset( $billing['email'] )
						? $billing['email']
						: ''
				)
			);
		}


		/**
		 * -------------------------------------------------------
		 * Shipping address
		 * -------------------------------------------------------
		 */
		if ( ! empty( $data['shipping_address'] ) ) {

			$shipping = $data['shipping_address'];

			$order->set_shipping_first_name(
				sanitize_text_field(
					isset( $shipping['first_name'] )
						? $shipping['first_name']
						: ''
				)
			);

			$order->set_shipping_last_name(
				sanitize_text_field(
					isset( $shipping['last_name'] )
						? $shipping['last_name']
						: ''
				)
			);

			$order->set_shipping_company(
				sanitize_text_field(
					isset( $shipping['company'] )
						? $shipping['company']
						: ''
				)
			);

			$order->set_shipping_address_1(
				sanitize_text_field(
					isset( $shipping['address_1'] )
						? $shipping['address_1']
						: ''
				)
			);

			$order->set_shipping_address_2(
				sanitize_text_field(
					isset( $shipping['address_2'] )
						? $shipping['address_2']
						: ''
				)
			);

			$order->set_shipping_city(
				sanitize_text_field(
					isset( $shipping['city'] )
						? $shipping['city']
						: ''
				)
			);

			$order->set_shipping_state(
				sanitize_text_field(
					isset( $shipping['state'] )
						? $shipping['state']
						: ''
				)
			);

			$order->set_shipping_postcode(
				sanitize_text_field(
					isset( $shipping['postcode'] )
						? $shipping['postcode']
						: ''
				)
			);

			$order->set_shipping_country(
				sanitize_text_field(
					isset( $shipping['country'] )
						? $shipping['country']
						: ''
				)
			);
		}


		/**
		 * -------------------------------------------------------
		 * Payment method
		 * -------------------------------------------------------
		 *
		 * Preserve the WooCommerce selected payment method.
		 *
		 * Example:
		 * cod
		 */
		if ( ! empty( $data['payment_method'] ) ) {

			$payment_method = sanitize_text_field(
				$data['payment_method']
			);

			$order->set_payment_method(
				$payment_method
			);

			if ( 'cod' === $payment_method ) {

				$order->set_payment_method_title(
					'Cash on delivery'
				);
			}
		}


		/**
		 * -------------------------------------------------------
		 * CloudRight transaction ID
		 * -------------------------------------------------------
		 */
		$transaction_id = '';

		if ( ! empty( $data['transaction_id'] ) ) {

			$transaction_id = sanitize_text_field(
				$data['transaction_id']
			);

			$order->update_meta_data(
				'_cloudright_transaction_id',
				$transaction_id
			);
		}


		/**
		 * -------------------------------------------------------
		 * CloudRight payment status
		 * -------------------------------------------------------
		 */
		$order->update_meta_data(
			'_cloudright_payment_status',
			'success'
		);


		/**
		 * Calculate order totals.
		 */
		$order->calculate_totals();


		/**
		 * -------------------------------------------------------
		 * Mark order as Processing
		 * -------------------------------------------------------
		 *
		 * CloudRight dummy payment has succeeded.
		 *
		 * We intentionally do NOT call:
		 *
		 * $order->payment_complete();
		 *
		 * because the WooCommerce payment method may be COD.
		 */
		$order->set_status(
			'processing',
			'CloudRight dummy payment successful.'
		);


		/**
		 * Save order.
		 */
		$order->save();

		/*
		* Trigger WooCommerce emails.
		*/
		$mailer = WC()->mailer();

		$email = $mailer->get_emails();

		if ( isset( $email['WC_Email_New_Order'] ) ) {
			$email['WC_Email_New_Order']->trigger( $order->get_id() );
		}

		if ( isset( $email['WC_Email_Customer_Processing_Order'] ) ) {
			$email['WC_Email_Customer_Processing_Order']->trigger( $order->get_id() );
		}


		/**
		 * -------------------------------------------------------
		 * Native WooCommerce thank-you URL
		 * -------------------------------------------------------
		 */
		$order_received_url =
			$order->get_checkout_order_received_url();


		/**
		 * Return response to JavaScript.
		 */
		return rest_ensure_response(
			array(
				'success'        => true,
				'order_id'       => $order->get_id(),
				'order_received' => $order_received_url,
				'transaction_id' => $transaction_id,
				'total'          => $order->get_total(),
			)
		);
	}
}