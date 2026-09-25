<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}


class CloudRight_API {

	/**
	 * Register REST API routes.
	 */
	public function register_routes() {

		/**
		 * -------------------------------------------------------
		 * Create Account
		 * -------------------------------------------------------
		 */
		register_rest_route(
			'cloudright/v1',
			'/create-account',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'create_account' ),
				'permission_callback' => '__return_true',
			)
		);


		/**
		 * -------------------------------------------------------
		 * Login
		 * -------------------------------------------------------
		 */
		register_rest_route(
			'cloudright/v1',
			'/login',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'login' ),
				'permission_callback' => '__return_true',
			)
		);


		/**
		 * -------------------------------------------------------
		 * Create Order
		 * -------------------------------------------------------
		 */
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
	 * ---------------------------------------------------------------
	 * CREATE ACCOUNT
	 * ---------------------------------------------------------------
	 *
	 * Creates a WooCommerce customer using:
	 *
	 * First Name
	 * Last Name
	 * Email
	 *
	 * No password is requested in the CloudRight UI.
	 */
	public function create_account( WP_REST_Request $request ) {

		/**
		 * Make sure WooCommerce is available.
		 */
		if ( ! function_exists( 'wc_create_new_customer' ) ) {

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
		 * Get customer information.
		 */
		$first_name = isset( $data['first_name'] )
			? sanitize_text_field( $data['first_name'] )
			: '';

		$last_name = isset( $data['last_name'] )
			? sanitize_text_field( $data['last_name'] )
			: '';

		$email = isset( $data['email'] )
			? sanitize_email( $data['email'] )
			: '';


		/**
		 * Validate first name.
		 */
		if ( empty( $first_name ) ) {

			return new WP_Error(
				'first_name_required',
				'First name is required.',
				array(
					'status' => 400,
				)
			);
		}


		/**
		 * Validate last name.
		 */
		if ( empty( $last_name ) ) {

			return new WP_Error(
				'last_name_required',
				'Last name is required.',
				array(
					'status' => 400,
				)
			);
		}


		/**
		 * Validate email.
		 */
		if ( empty( $email ) || ! is_email( $email ) ) {

			return new WP_Error(
				'invalid_email',
				'Please enter a valid email address.',
				array(
					'status' => 400,
				)
			);
		}


		/**
		 * Normalize email.
		 */
		$email = strtolower( trim( $email ) );


		/**
		 * Check whether email already exists.
		 */
		$existing_user = get_user_by(
			'email',
			$email
		);

		if ( $existing_user ) {

			return new WP_Error(
				'account_exists',
				'An account with this email already exists. Please use Login.',
				array(
					'status' => 409,
				)
			);
		}


		/**
		 * Create WooCommerce customer.
		 *
		 * A random password is generated internally.
		 * The customer does not need to enter a password
		 * through the CloudRight checkout UI.
		 */
		$customer_id = wc_create_new_customer(
			$email,
			'',
			'',
			array(
				'first_name' => $first_name,
				'last_name'  => $last_name,
			)
		);


		/**
		 * Check creation result.
		 */
		if ( is_wp_error( $customer_id ) ) {

			return new WP_Error(
				'account_creation_failed',
				$customer_id->get_error_message(),
				array(
					'status' => 400,
				)
			);
		}


		/**
		 * Get created user.
		 */
		$user = get_user_by(
			'id',
			$customer_id
		);


		/**
		 * Return success.
		 */
		return rest_ensure_response(
			array(
				'success'     => true,
				'message'     => 'Account created successfully.',
				'customer_id' => $customer_id,
				'email'       => $user
					? $user->user_email
					: $email,
				'first_name'  => $first_name,
				'last_name'   => $last_name,
			)
		);
	}


	/**
	 * ---------------------------------------------------------------
	 * LOGIN
	 * ---------------------------------------------------------------
	 *
	 * CloudRight uses email-only customer identification.
	 *
	 * If the email already exists:
	 *     Use the existing customer.
	 *
	 * If the email does not exist:
	 *     Automatically create a new WooCommerce customer.
	 *
	 * No password or OTP is requested.
	 */
	public function login( WP_REST_Request $request ) {

		/**
		 * Make sure WooCommerce is available.
		 */
		if ( ! function_exists( 'wc_create_new_customer' ) ) {

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
		 * Get email.
		 */
		$email = isset( $data['email'] )
			? sanitize_email( $data['email'] )
			: '';


		/**
		 * Validate email.
		 */
		if ( empty( $email ) || ! is_email( $email ) ) {

			return new WP_Error(
				'invalid_email',
				'Please enter a valid email address.',
				array(
					'status' => 400,
				)
			);
		}


		/**
		 * Normalize email.
		 */
		$email = strtolower( trim( $email ) );


		/**
		 * -------------------------------------------------------
		 * Check whether customer already exists.
		 * -------------------------------------------------------
		 */
		$user = get_user_by(
			'email',
			$email
		);


		/**
		 * -------------------------------------------------------
		 * Existing customer
		 * -------------------------------------------------------
		 *
		 * If the customer already exists, simply return the
		 * existing customer information.
		 */
		if ( $user ) {

			return rest_ensure_response(
				array(
					'success'     => true,
					'message'     => 'Login successful.',
					'customer_id' => $user->ID,
					'email'       => $user->user_email,
					'first_name'  => get_user_meta(
						$user->ID,
						'first_name',
						true
					),
					'last_name'   => get_user_meta(
						$user->ID,
						'last_name',
						true
					),
					'new_customer' => false,
				)
			);
		}


		/**
		 * -------------------------------------------------------
		 * New customer
		 * -------------------------------------------------------
		 *
		 * No account exists for this email.
		 *
		 * Automatically create a WooCommerce customer.
		 *
		 * The CloudRight UI does not ask the customer for a
		 * password, first name, last name, or OTP.
		 *
		 * WooCommerce will generate the internal password.
		 */
		$customer_id = wc_create_new_customer(
			$email,
			'',
			'',
			array(
				'first_name' => '',
				'last_name'  => '',
			)
		);


		/**
		 * Check account creation result.
		 */
		if ( is_wp_error( $customer_id ) ) {

			return new WP_Error(
				'account_creation_failed',
				$customer_id->get_error_message(),
				array(
					'status' => 400,
				)
			);
		}


		/**
		 * Get newly created user.
		 */
		$user = get_user_by(
			'id',
			$customer_id
		);


		/**
		 * Make sure the user was created correctly.
		 */
		if ( ! $user ) {

			return new WP_Error(
				'account_creation_failed',
				'Customer account could not be created.',
				array(
					'status' => 500,
				)
			);
		}


		/**
		 * Return newly created customer information.
		 */
		return rest_ensure_response(
			array(
				'success'      => true,
				'message'      => 'Account created and login successful.',
				'customer_id'  => $user->ID,
				'email'        => $user->user_email,
				'first_name'   => '',
				'last_name'    => '',
				'new_customer' => true,
			)
		);
	}


	/**
	 * ---------------------------------------------------------------
	 * CREATE ORDER
	 * ---------------------------------------------------------------
	 *
	 * Creates WooCommerce order after successful
	 * CloudRight dummy payment.
	 *
	 * The customer may not have a normal WordPress login session.
	 * Therefore the customer_id/customer_email/customer name sent
	 * from the CloudRight checkout are used to associate the order
	 * with the WooCommerce customer.
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
		 * -------------------------------------------------------
		 * Customer information
		 * -------------------------------------------------------
		 *
		 * The frontend sends customer information after
		 * successful CloudRight Login/Create Account.
		 */
		$customer_id = 0;

		if ( isset( $data['customer_id'] ) ) {

			$customer_id = absint(
				$data['customer_id']
			);
		}


		$customer_email = '';

		if ( ! empty( $data['customer_email'] ) ) {

			$customer_email = sanitize_email(
				$data['customer_email']
			);
		}


		$customer_first_name = '';

		if ( ! empty( $data['customer_first_name'] ) ) {

			$customer_first_name = sanitize_text_field(
				$data['customer_first_name']
			);
		}


		$customer_last_name = '';

		if ( ! empty( $data['customer_last_name'] ) ) {

			$customer_last_name = sanitize_text_field(
				$data['customer_last_name']
			);
		}


		/**
		 * Validate customer ID when supplied.
		 *
		 * This makes sure the supplied ID belongs to
		 * an existing WordPress user.
		 */
		if ( $customer_id > 0 ) {

			$customer_user = get_user_by(
				'id',
				$customer_id
			);

			if ( ! $customer_user ) {

				return new WP_Error(
					'invalid_customer',
					'Customer account could not be found.',
					array(
						'status' => 400,
					)
				);
			}


			/**
			 * Use the actual WordPress customer email.
			 */
			$customer_email = $customer_user->user_email;


			/**
			 * Use stored customer names when available.
			 */
			$stored_first_name = get_user_meta(
				$customer_id,
				'first_name',
				true
			);

			$stored_last_name = get_user_meta(
				$customer_id,
				'last_name',
				true
			);


			if ( ! empty( $stored_first_name ) ) {

				$customer_first_name = $stored_first_name;
			}

			if ( ! empty( $stored_last_name ) ) {

				$customer_last_name = $stored_last_name;
			}
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
		 * Priority:
		 *
		 * 1. CloudRight customer_id
		 * 2. Current WordPress logged-in user
		 *
		 * This allows the CloudRight customer flow to work
		 * without requiring WordPress Admin login.
		 */
		if ( $customer_id > 0 ) {

			$order->set_customer_id(
				$customer_id
			);

		} else {

			$user_id = get_current_user_id();

			if ( $user_id > 0 ) {

				$order->set_customer_id(
					$user_id
				);
			}
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

		} elseif ( $customer_id > 0 ) {

			/**
			 * -------------------------------------------------------
			 * Customer information fallback
			 * -------------------------------------------------------
			 *
			 * If no billing address was supplied,
			 * still store the registered customer's
			 * name and email on the order.
			 */
			$order->set_billing_first_name(
				$customer_first_name
			);

			$order->set_billing_last_name(
				$customer_last_name
			);

			$order->set_billing_email(
				$customer_email
			);
		}


		/**
		 * -------------------------------------------------------
		 * Make sure customer email is stored
		 * -------------------------------------------------------
		 *
		 * If a billing address was supplied but its email is
		 * empty, use the registered CloudRight customer email.
		 */
		if (
			$customer_id > 0 &&
			empty( $order->get_billing_email() )
		) {

			$order->set_billing_email(
				$customer_email
			);
		}


		/**
		 * -------------------------------------------------------
		 * Make sure customer name is stored
		 * -------------------------------------------------------
		 *
		 * If billing names are empty, use the registered
		 * CloudRight customer names.
		 */
		if (
			$customer_id > 0 &&
			empty( $order->get_billing_first_name() )
		) {

			$order->set_billing_first_name(
				$customer_first_name
			);
		}


		if (
			$customer_id > 0 &&
			empty( $order->get_billing_last_name() )
		) {

			$order->set_billing_last_name(
				$customer_last_name
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
		 */
		$order->set_status(
			'processing',
			'CloudRight dummy payment successful.'
		);


		/**
		 * Save order.
		 */
		$order->save();


		/**
		 * -------------------------------------------------------
		 * Clear WooCommerce cart
		 * -------------------------------------------------------
		 *
		 * The frontend previously tried to obtain a Store API
		 * nonce to clear the cart. That nonce is not available
		 * in the current setup.
		 *
		 * Clear the cart from the backend instead.
		 */
		if ( function_exists( 'wc_load_cart' ) ) {

			wc_load_cart();
		}

		if ( function_exists( 'WC' ) && WC()->cart ) {

			WC()->cart->empty_cart();
		}


		/**
		 * Trigger WooCommerce emails.
		 */
		$mailer = WC()->mailer();

		$email = $mailer->get_emails();

		if ( isset( $email['WC_Email_New_Order'] ) ) {

			$email['WC_Email_New_Order']->trigger(
				$order->get_id()
			);
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