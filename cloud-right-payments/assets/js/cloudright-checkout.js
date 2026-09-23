(function () {
    'use strict';


    /*
     * =========================================================
     * CLOUDRIGHT CHECKOUT
     * =========================================================
     */

    async function handleCloudRightCheckout() {

        console.log(
            'CloudRight: Starting checkout'
        );

        try {

            const response = await fetch(
                '/wp-json/wc/store/v1/cart',
                {
                    method: 'GET',
                    credentials: 'include'
                }
            );

            if (!response.ok) {
                throw new Error(
                    'Unable to retrieve cart'
                );
            }

            const cart = await response.json();

            console.log(
                'CloudRight: Active cart',
                cart
            );

            openCloudRightModal(cart);

        } catch (error) {

            console.error(
                'CloudRight checkout error:',
                error
            );
        }
    }


    /*
     * =========================================================
     * NORMAL CART PAGE
     * =========================================================
     */

    document.addEventListener(
        'click',
        function (event) {

            const button =
                event.target.closest(
                    '.wc-block-cart__submit-button'
                );

            if (!button) {
                return;
            }

            console.log(
                'CloudRight: Proceed to checkout clicked'
            );

            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();

            handleCloudRightCheckout();

        },
        true
    );

    /*
    * =========================================================
    * MINI CART DRAWER
    * =========================================================
    */

    function setupCloudRightMiniCart() {

    const checkoutButton =
        document.querySelector(
            'a.wc-block-mini-cart__footer-checkout'
        );

    if (!checkoutButton) {
        return;
    }

    /*
     * Avoid attaching the handler more than once.
     */
    if (
        checkoutButton.dataset.cloudrightAttached === 'true'
    ) {
        return;
    }

    checkoutButton.dataset.cloudrightAttached = 'true';

    console.log(
        'CloudRight: Mini Cart checkout button found'
    );

    checkoutButton.addEventListener(
        'click',
        function (event) {

            console.log(
                'CloudRight: Mini Cart checkout clicked'
            );

            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();

            handleCloudRightCheckout();

        },
        true
    );
}


/*
 * Check immediately.
 */
setupCloudRightMiniCart();


/*
 * WooCommerce dynamically creates the Mini Cart drawer.
 * Watch for it and attach our handler when it appears.
 */
const cloudRightObserver =
    new MutationObserver(
        function () {

            setupCloudRightMiniCart();

        }
    );


cloudRightObserver.observe(
    document.body,
    {
        childList: true,
        subtree: true
    }
);


    /*
     * =========================================================
     * CLOUDRIGHT MODAL
     * =========================================================
     */

    function openCloudRightModal(cart) {

        console.log(
            'CloudRight: Opening payment modal'
        );


        /*
         * Prevent duplicate popup.
         */
        const existingModal =
            document.getElementById(
                'cloudright-modal'
            );

        if (existingModal) {
            existingModal.remove();
        }


        /*
         * Currency information.
         */
        const currencySymbol =
            cart.totals?.currency_symbol || '₹';

        const currencyMinorUnit =
            Number(
                cart.totals?.currency_minor_unit ?? 2
            );


        /*
         * Cart total.
         */
        const cartTotal =
            (
                Number(
                    cart.totals?.total_price || 0
                ) /
                Math.pow(
                    10,
                    currencyMinorUnit
                )
            ).toFixed(2);


        /*
         * =====================================================
         * BUILD CART ITEMS
         * =====================================================
         */

        let cartItemsHtml = '';


        if (
            cart.items &&
            cart.items.length > 0
        ) {

            cartItemsHtml =
                cart.items
                    .map(function (item) {

                        const itemPrice =
                            (
                                Number(
                                    item.prices?.price || 0
                                ) /
                                Math.pow(
                                    10,
                                    currencyMinorUnit
                                )
                            ).toFixed(2);


                        /*
                         * WooCommerce Store API normally
                         * provides image information here.
                         */
                        let imageUrl = '';


                        if (
                            item.images &&
                            item.images.length > 0
                        ) {

                            imageUrl =
                                item.images[0].thumbnail ||
                                item.images[0].src ||
                                '';
                        }


                        const imageHtml =
                            imageUrl
                                ? `
                                    <img
                                        src="${imageUrl}"
                                        alt="${escapeHtml(
                                            item.name || 'Product'
                                        )}"
                                        class="cloudright-item-image"
                                    >
                                  `
                                : `
                                    <div class="cloudright-item-image-placeholder">
                                        🛍️
                                    </div>
                                  `;


                        return `
                            <div class="cloudright-cart-item">

                                <div class="cloudright-item-image-wrapper">
                                    ${imageHtml}
                                </div>

                                <div class="cloudright-item-details">

                                    <div class="cloudright-item-name">
                                        ${escapeHtml(
                                            item.name || 'Product'
                                        )}
                                    </div>

                                    <div class="cloudright-item-meta">
                                        Qty: ${item.quantity || 1}
                                    </div>

                                </div>

                                <div class="cloudright-item-price">
                                    ${currencySymbol}${itemPrice}
                                </div>

                            </div>
                        `;

                    })
                    .join('');

        } else {

            cartItemsHtml = `
                <div class="cloudright-empty-cart">
                    Your cart is empty.
                </div>
            `;
        }


        /*
         * =====================================================
         * CREATE POPUP
         * =====================================================
         */

        const overlay =
            document.createElement('div');


        overlay.id =
            'cloudright-modal';


        overlay.innerHTML = `
            <div class="cloudright-overlay">

                <div class="cloudright-modal">

                    <!-- HEADER -->

                    <div class="cloudright-header">

                        <div>
                            <div class="cloudright-brand">
                                CloudRight
                            </div>

                            <div class="cloudright-subtitle">
                                Smart Checkout
                            </div>
                        </div>

                        <button
                            type="button"
                            class="cloudright-close"
                            id="cloudright-close"
                            aria-label="Close"
                        >
                            ×
                        </button>

                    </div>


                    <!-- CONTENT -->

                    <div class="cloudright-content">

                        <div class="cloudright-payment-title">
                            Order Summary
                        </div>

                        <div class="cloudright-cart-items">

                            ${cartItemsHtml}

                        </div>


                        <!-- TOTAL -->

                        <div class="cloudright-total-section">

                            <div class="cloudright-total-label">
                                Total
                            </div>

                            <div class="cloudright-total-price">
                                ${currencySymbol}${cartTotal}
                            </div>

                        </div>



                        <!-- ACTIONS -->

                        <div class="cloudright-actions">

                            <button
                                type="button"
                                id="cloudright-success"
                                class="cloudright-success-button"
                            >
                                Pay ${currencySymbol}${cartTotal}
                            </button>

                            <button
                                type="button"
                                id="cloudright-failure"
                                class="cloudright-failure-button"
                            >
                                Simulate Failure
                            </button>

                        </div>

                    </div>

                </div>

            </div>
        `;


        document.body.appendChild(
            overlay
        );


        /*
         * =====================================================
         * CLOSE
         * =====================================================
         */

        const closeButton =
            document.getElementById(
                'cloudright-close'
            );


        closeButton.addEventListener(
            'click',
            function () {

                overlay.remove();

            }
        );


        /*
         * =====================================================
         * SIMULATE SUCCESS
         * =====================================================
         */

        const successButton =
            document.getElementById(
                'cloudright-success'
            );


        successButton.addEventListener(
            'click',
            async function () {

                console.log(
                    'CloudRight: Simulate Success clicked'
                );


                successButton.disabled = true;

                successButton.textContent =
                    'Processing...';


                try {

                    /*
                     * -----------------------------------------
                     * CREATE ORDER
                     * -----------------------------------------
                     */

                    const orderResponse =
                        await fetch(
                            '/wp-json/cloudright/v1/create-order',
                            {
                                method: 'POST',

                                credentials: 'include',

                                headers: {
                                    'Content-Type':
                                        'application/json'
                                },

                                body: JSON.stringify({

                                    items:
                                        cart.items,

                                    billing_address:
                                        cart.billing_address,

                                    shipping_address:
                                        cart.shipping_address,

                                    payment_method:
                                        cart.payment_methods?.[0] || '',

                                    transaction_id:
                                        'CLOUDRIGHT-DUMMY-' +
                                        Date.now()

                                })
                            }
                        );


                    const result =
                        await orderResponse.json();


                    console.log(
                        'CloudRight: Create order response',
                        result
                    );

                    if (!orderResponse.ok) {

                        if (
                            result.code === 'insufficient_inventory'
                        ) {

                            showCloudRightError(
                                result.message ||
                                'Insufficient inventory.'
                            );

                            successButton.disabled = false;

                            successButton.textContent =
                                'Try Payment Again';

                            return;
                        }


                        throw new Error(
                            result.message ||
                            'Unable to create order'
                        );
                    }


                    if (!result.success) {

                        throw new Error(
                            result.message ||
                            'Order creation failed'
                        );
                    }


                    console.log(
                        'CloudRight: Order created successfully',
                        result.order_id
                    );


                    /*
                     * -----------------------------------------
                     * GET CART NONCE
                     * -----------------------------------------
                     */

                    const cartResponse =
                        await fetch(
                            '/wp-json/wc/store/v1/cart',
                            {
                                method: 'GET',
                                credentials: 'include'
                            }
                        );


                    if (!cartResponse.ok) {

                        throw new Error(
                            'Unable to get WooCommerce cart'
                        );
                    }


                    const nonce =
                        cartResponse.headers.get(
                            'Nonce'
                        );


                    if (!nonce) {

                        throw new Error(
                            'WooCommerce Store API nonce not found'
                        );
                    }


                    /*
                     * -----------------------------------------
                     * CLEAR CART
                     * -----------------------------------------
                     */

                    const clearCartResponse =
                        await fetch(
                            '/wp-json/wc/store/v1/cart/items',
                            {
                                method: 'DELETE',

                                credentials: 'include',

                                headers: {
                                    'Nonce': nonce
                                }
                            }
                        );


                    if (!clearCartResponse.ok) {

                        const errorText =
                            await clearCartResponse.text();

                        console.error(
                            'CloudRight: Cart clear failed',
                            errorText
                        );

                        throw new Error(
                            'Unable to clear WooCommerce cart'
                        );
                    }


                    console.log(
                        'CloudRight: WooCommerce cart cleared'
                    );


                    /*
                     * -----------------------------------------
                     * CLOSE POPUP
                     * -----------------------------------------
                     */

                    overlay.remove();


                    /*
                     * -----------------------------------------
                     * REDIRECT TO THANK YOU PAGE
                     * -----------------------------------------
                     */

                    if (result.order_received) {

                        window.location.href =
                            result.order_received;

                    } else {

                        throw new Error(
                            'Order received URL not returned'
                        );
                    }


                } catch (error) {

                    successButton.disabled = false;

                    successButton.textContent =
                        'Try Payment Again';


                    console.error(
                        'CloudRight order creation error:',
                        error
                    );
                }

            }
        );


        /*
         * =====================================================
         * SIMULATE FAILURE
         * =====================================================
         */

        const failureButton =
            document.getElementById(
                'cloudright-failure'
            );


        failureButton.addEventListener(
            'click',
            function () {

                console.log(
                    'CloudRight: Simulate Failure clicked'
                );


                overlay.remove();


                showCloudRightToast(
                    'Payment Failed. Please try again.'
                );

            }
        );

    }


    /*
     * =========================================================
     * HTML ESCAPE
     * =========================================================
     */

    function escapeHtml(value) {

        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }


    /*
     * =========================================================
     * TOAST
     * =========================================================
     */

    function showCloudRightToast(message) {

        const toast =
            document.createElement('div');


        toast.className =
            'cloudright-toast';


        toast.textContent =
            message;


        document.body.appendChild(
            toast
        );


        setTimeout(
            function () {

                toast.remove();

            },
            3000
        );
    }

    function showCloudRightError(message) {

        const existingError =
            document.getElementById(
                'cloudright-inventory-error'
            );

        if (existingError) {
            existingError.remove();
        }


        const error =
            document.createElement('div');


        error.id =
            'cloudright-inventory-error';


        error.className =
            'cloudright-error';


        error.textContent =
            message;


        const actions =
            document.querySelector(
                '.cloudright-actions'
            );


        if (actions) {

            actions.parentNode.insertBefore(
                error,
                actions
            );
        }
    }

})();
