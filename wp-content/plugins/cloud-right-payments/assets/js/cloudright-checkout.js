(function () {
    'use strict';

    /*
     * =========================================================
     * CLOUDRIGHT CHECKOUT
     * =========================================================
     */

    let cloudRightCustomer = null;


    /*
     * =========================================================
     * START CHECKOUT
     * =========================================================
     */

    async function handleCloudRightCheckout() {

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

            openCloudRightAccountModal(cart);

        } catch (error) {

            console.error(
                'CloudRight checkout error:',
                error
            );

            showCloudRightToast(
                'Unable to start checkout. Please try again.'
            );
        }
    }


    /*
     * =========================================================
     * CHECKOUT BUTTON DETECTION
     * =========================================================
     */

    function isCloudRightCheckoutButton(element) {

        if (!element) {
            return false;
        }

        if (
            element.closest(
                '.wc-block-cart__submit-button'
            )
        ) {
            return true;
        }

        if (
            element.closest(
                'a.wc-block-mini-cart__footer-checkout'
            )
        ) {
            return true;
        }

        if (
            element.closest(
                '.checkout-button'
            )
        ) {
            return true;
        }

        const link =
            element.closest('a');

        if (link) {

            const href =
                link.getAttribute('href');

            if (
                href &&
                (
                    href.includes('/checkout') ||
                    href.includes('checkout')
                )
            ) {
                return true;
            }
        }

        return false;
    }


    /*
     * =========================================================
     * GLOBAL CHECKOUT CLICK HANDLER
     * =========================================================
     */

    document.addEventListener(
        'click',
        function (event) {

            const target =
                event.target instanceof Element
                    ? event.target
                    : null;

            if (!target) {
                return;
            }

            if (
                !isCloudRightCheckoutButton(
                    target
                )
            ) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();

            handleCloudRightCheckout();

        },
        true
    );


    /*
     * =========================================================
     * MINI CART
     * =========================================================
     */

    function setupCloudRightMiniCart() {

        const checkoutButtons =
            document.querySelectorAll(
                'a.wc-block-mini-cart__footer-checkout'
            );

        checkoutButtons.forEach(
            function (checkoutButton) {

                if (
                    checkoutButton.dataset.cloudrightAttached === 'true'
                ) {
                    return;
                }

                checkoutButton.dataset.cloudrightAttached =
                    'true';

                checkoutButton.addEventListener(
                    'click',
                    function (event) {

                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();

                        handleCloudRightCheckout();

                    },
                    true
                );

            }
        );
    }


    setupCloudRightMiniCart();


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
     * ACCOUNT MODAL
     * =========================================================
     */

    function openCloudRightAccountModal(cart) {

        const existingModal =
            document.getElementById(
                'cloudright-modal'
            );

        if (existingModal) {
            existingModal.remove();
        }


        const overlay =
            document.createElement('div');

        overlay.id =
            'cloudright-modal';


        overlay.innerHTML = `
            <div class="cloudright-overlay">

                <div class="cloudright-checkout-modal">

                    <!-- TOP BAR -->

                    <div class="cloudright-modal-topbar">

                        <div class="cloudright-brand-area">

                            <div class="cloudright-brand-mark">
                                CR
                            </div>

                            <div>

                                <div class="cloudright-brand">
                                    CloudRight
                                </div>

                                <div class="cloudright-brand-caption">
                                    Secure Checkout
                                </div>

                            </div>

                        </div>

                        <button
                            type="button"
                            class="cloudright-close"
                            id="cloudright-close"
                            aria-label="Close checkout"
                        >
                            <span></span>
                            <span></span>
                        </button>

                    </div>


                    <!-- PROGRESS -->

                    <div class="cloudright-progress">

                        <div class="cloudright-progress-step active">

                            <span class="cloudright-step-number">
                                1
                            </span>

                            <span class="cloudright-step-label">
                                Account
                            </span>

                        </div>

                        <div class="cloudright-progress-line"></div>

                        <div class="cloudright-progress-step">

                            <span class="cloudright-step-number">
                                2
                            </span>

                            <span class="cloudright-step-label">
                                Payment
                            </span>

                        </div>

                        <div class="cloudright-progress-line"></div>

                        <div class="cloudright-progress-step">

                            <span class="cloudright-step-number">
                                3
                            </span>

                            <span class="cloudright-step-label">
                                Confirmation
                            </span>

                        </div>

                    </div>


                    <!-- MAIN CONTENT -->

                    <div class="cloudright-checkout-body">

                        <div class="cloudright-account-panel">

                            <div class="cloudright-welcome">

                                <div class="cloudright-welcome-icon">
                                    👋
                                </div>

                                <div>

                                    <h2>
                                        Welcome to CloudRight
                                    </h2>

                                    <p>
                                        Sign in or create an account
                                        to continue your checkout.
                                    </p>

                                </div>

                            </div>


                            <div
                                id="cloudright-account-options"
                                class="cloudright-account-options"
                            >

                                <button
                                    type="button"
                                    id="cloudright-login-option"
                                    class="cloudright-account-card"
                                >

                                    <span class="cloudright-card-icon">
                                        →
                                    </span>

                                    <span class="cloudright-card-content">

                                        <strong>
                                            Login
                                        </strong>

                                        <small>
                                            Already have an account?
                                        </small>

                                    </span>

                                    <span class="cloudright-card-arrow">
                                        →
                                    </span>

                                </button>


                                <button
                                    type="button"
                                    id="cloudright-create-option"
                                    class="cloudright-account-card"
                                >

                                    <span class="cloudright-card-icon cloudright-card-icon-create">
                                        +
                                    </span>

                                    <span class="cloudright-card-content">

                                        <strong>
                                            Create Account
                                        </strong>

                                        <small>
                                            New to CloudRight?
                                        </small>

                                    </span>

                                    <span class="cloudright-card-arrow">
                                        →
                                    </span>

                                </button>

                            </div>


                            <div
                                id="cloudright-login-form"
                                class="cloudright-account-form"
                                style="display: none;"
                            >

                                <button
                                    type="button"
                                    id="cloudright-login-back"
                                    class="cloudright-back-button"
                                >
                                    ← Back
                                </button>


                                <div class="cloudright-form-heading">

                                    <h2>
                                        Sign in
                                    </h2>

                                    <p>
                                        Enter your registered email
                                        to continue.
                                    </p>

                                </div>


                                <div class="cloudright-form-group">

                                    <label
                                        for="cloudright-login-email"
                                    >
                                        Email address
                                    </label>

                                    <div class="cloudright-input-wrapper">

                                        <span class="cloudright-input-icon">
                                            @
                                        </span>

                                        <input
                                            type="email"
                                            id="cloudright-login-email"
                                            class="cloudright-account-input"
                                            placeholder="you@example.com"
                                            autocomplete="email"
                                        >

                                    </div>

                                </div>


                                <div
                                    id="cloudright-login-error"
                                    class="cloudright-form-error"
                                    style="display: none;"
                                ></div>


                                <button
                                    type="button"
                                    id="cloudright-login-button"
                                    class="cloudright-primary-button"
                                >
                                    <span>
                                        Continue
                                    </span>

                                    <span class="cloudright-button-arrow">
                                        →
                                    </span>

                                </button>


                                <div class="cloudright-secure-note">

                                    <span>
                                        ✓
                                    </span>

                                    Your information is securely handled.

                                </div>

                            </div>


                            <div
                                id="cloudright-create-form"
                                class="cloudright-account-form"
                                style="display: none;"
                            >

                                <button
                                    type="button"
                                    id="cloudright-create-back"
                                    class="cloudright-back-button"
                                >
                                    ← Back
                                </button>


                                <div class="cloudright-form-heading">

                                    <h2>
                                        Create your account
                                    </h2>

                                    <p>
                                        It only takes a few seconds.
                                    </p>

                                </div>


                                <div class="cloudright-form-row">

                                    <div class="cloudright-form-group">

                                        <label
                                            for="cloudright-first-name"
                                        >
                                            First name
                                        </label>

                                        <input
                                            type="text"
                                            id="cloudright-first-name"
                                            class="cloudright-account-input"
                                            placeholder="First name"
                                            autocomplete="given-name"
                                        >

                                    </div>


                                    <div class="cloudright-form-group">

                                        <label
                                            for="cloudright-last-name"
                                        >
                                            Last name
                                        </label>

                                        <input
                                            type="text"
                                            id="cloudright-last-name"
                                            class="cloudright-account-input"
                                            placeholder="Last name"
                                            autocomplete="family-name"
                                        >

                                    </div>

                                </div>


                                <div class="cloudright-form-group">

                                    <label
                                        for="cloudright-create-email"
                                    >
                                        Email address
                                    </label>

                                    <div class="cloudright-input-wrapper">

                                        <span class="cloudright-input-icon">
                                            @
                                        </span>

                                        <input
                                            type="email"
                                            id="cloudright-create-email"
                                            class="cloudright-account-input"
                                            placeholder="you@example.com"
                                            autocomplete="email"
                                        >

                                    </div>

                                </div>


                                <div
                                    id="cloudright-create-error"
                                    class="cloudright-form-error"
                                    style="display: none;"
                                ></div>


                                <button
                                    type="button"
                                    id="cloudright-create-button"
                                    class="cloudright-primary-button"
                                >
                                    <span>
                                        Create Account
                                    </span>

                                    <span class="cloudright-button-arrow">
                                        →
                                    </span>

                                </button>


                                <div class="cloudright-secure-note">

                                    <span>
                                        ✓
                                    </span>

                                    Your information is securely handled.

                                </div>

                            </div>

                        </div>


                        <!-- ORDER PREVIEW -->

                        <div class="cloudright-order-preview">

                            <div class="cloudright-preview-heading">

                                <span>
                                    Your order
                                </span>

                                <span class="cloudright-preview-lock">
                                    🔒
                                </span>

                            </div>


                            <div class="cloudright-preview-items">

                                ${buildAccountCartPreview(cart)}

                            </div>


                            <div class="cloudright-preview-total">

                                <span>
                                    Estimated total
                                </span>

                                <strong>
                                    ${formatCloudRightCartTotal(cart)}
                                </strong>

                            </div>


                            <div class="cloudright-trust-list">

                                <div>
                                    <span>✓</span>
                                    Secure checkout
                                </div>

                                <div>
                                    <span>✓</span>
                                    Order confirmation by email
                                </div>

                                <div>
                                    <span>✓</span>
                                    CloudRight protected payment
                                </div>

                            </div>

                        </div>

                    </div>


                    <div class="cloudright-modal-footer">

                        <span>
                            © ${new Date().getFullYear()} CloudRight
                        </span>

                        <span>
                            Secure checkout
                        </span>

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
         * ELEMENTS
         * =====================================================
         */

        const accountOptions =
            document.getElementById(
                'cloudright-account-options'
            );

        const loginForm =
            document.getElementById(
                'cloudright-login-form'
            );

        const createForm =
            document.getElementById(
                'cloudright-create-form'
            );

        const loginOption =
            document.getElementById(
                'cloudright-login-option'
            );

        const createOption =
            document.getElementById(
                'cloudright-create-option'
            );

        const loginBack =
            document.getElementById(
                'cloudright-login-back'
            );

        const createBack =
            document.getElementById(
                'cloudright-create-back'
            );


        /*
         * =====================================================
         * SHOW LOGIN
         * =====================================================
         */

        loginOption.addEventListener(
            'click',
            function () {

                accountOptions.style.display =
                    'none';

                createForm.style.display =
                    'none';

                loginForm.style.display =
                    'block';

                document.getElementById(
                    'cloudright-login-email'
                ).focus();

            }
        );


        /*
         * =====================================================
         * SHOW CREATE ACCOUNT
         * =====================================================
         */

        createOption.addEventListener(
            'click',
            function () {

                accountOptions.style.display =
                    'none';

                loginForm.style.display =
                    'none';

                createForm.style.display =
                    'block';

                document.getElementById(
                    'cloudright-first-name'
                ).focus();

            }
        );


        /*
         * =====================================================
         * BACK
         * =====================================================
         */

        loginBack.addEventListener(
            'click',
            function () {

                loginForm.style.display =
                    'none';

                accountOptions.style.display =
                    'flex';

                clearCloudRightFormError(
                    'cloudright-login-error'
                );

            }
        );


        createBack.addEventListener(
            'click',
            function () {

                createForm.style.display =
                    'none';

                accountOptions.style.display =
                    'flex';

                clearCloudRightFormError(
                    'cloudright-create-error'
                );

            }
        );


        /*
         * =====================================================
         * LOGIN
         * =====================================================
         */

        const loginButton =
            document.getElementById(
                'cloudright-login-button'
            );


        loginButton.addEventListener(
            'click',
            async function () {

                const emailInput =
                    document.getElementById(
                        'cloudright-login-email'
                    );

                const email =
                    emailInput.value.trim().toLowerCase();


                clearCloudRightFormError(
                    'cloudright-login-error'
                );


                if (!isValidEmail(email)) {

                    showCloudRightFormError(
                        'cloudright-login-error',
                        'Please enter a valid email address.'
                    );

                    emailInput.focus();

                    return;
                }


                setCloudRightButtonLoading(
                    loginButton,
                    'Checking account...'
                );


                try {

                    const response =
                        await fetch(
                            '/wp-json/cloudright/v1/login',
                            {
                                method: 'POST',

                                credentials: 'include',

                                headers: {
                                    'Content-Type':
                                        'application/json'
                                },

                                body: JSON.stringify({
                                    email: email
                                })
                            }
                        );


                    const result =
                        await response.json();


                    if (!response.ok || !result.success) {

                        showCloudRightFormError(
                            'cloudright-login-error',
                            result.message ||
                            'We could not find an account with this email.'
                        );

                        resetCloudRightButton(
                            loginButton,
                            'Continue',
                            '→'
                        );

                        return;
                    }


                    cloudRightCustomer = {

                        customer_id:
                            result.customer_id,

                        email:
                            result.email,

                        first_name:
                            result.first_name || '',

                        last_name:
                            result.last_name || ''

                    };


                    openCloudRightModal(
                        cart
                    );

                } catch (error) {

                    console.error(
                        'CloudRight login error:',
                        error
                    );


                    showCloudRightFormError(
                        'cloudright-login-error',
                        'Unable to sign in right now. Please try again.'
                    );

                } finally {

                    if (
                        !loginButton.disabled
                    ) {
                        return;
                    }

                    resetCloudRightButton(
                        loginButton,
                        'Continue',
                        '→'
                    );

                }

            }
        );


        /*
         * =====================================================
         * CREATE ACCOUNT
         * =====================================================
         */

        const createButton =
            document.getElementById(
                'cloudright-create-button'
            );


        createButton.addEventListener(
            'click',
            async function () {

                const firstName =
                    document.getElementById(
                        'cloudright-first-name'
                    ).value.trim();


                const lastName =
                    document.getElementById(
                        'cloudright-last-name'
                    ).value.trim();


                const email =
                    document.getElementById(
                        'cloudright-create-email'
                    ).value.trim().toLowerCase();


                clearCloudRightFormError(
                    'cloudright-create-error'
                );


                if (!firstName) {

                    showCloudRightFormError(
                        'cloudright-create-error',
                        'Please enter your first name.'
                    );

                    document.getElementById(
                        'cloudright-first-name'
                    ).focus();

                    return;
                }


                if (!lastName) {

                    showCloudRightFormError(
                        'cloudright-create-error',
                        'Please enter your last name.'
                    );

                    document.getElementById(
                        'cloudright-last-name'
                    ).focus();

                    return;
                }


                if (!isValidEmail(email)) {

                    showCloudRightFormError(
                        'cloudright-create-error',
                        'Please enter a valid email address.'
                    );

                    document.getElementById(
                        'cloudright-create-email'
                    ).focus();

                    return;
                }


                setCloudRightButtonLoading(
                    createButton,
                    'Creating account...'
                );


                try {

                    const response =
                        await fetch(
                            '/wp-json/cloudright/v1/create-account',
                            {
                                method: 'POST',

                                credentials: 'include',

                                headers: {
                                    'Content-Type':
                                        'application/json'
                                },

                                body: JSON.stringify({

                                    first_name:
                                        firstName,

                                    last_name:
                                        lastName,

                                    email:
                                        email

                                })
                            }
                        );


                    const result =
                        await response.json();


                    if (!response.ok || !result.success) {

                        showCloudRightFormError(
                            'cloudright-create-error',
                            result.message ||
                            'Unable to create your account.'
                        );

                        resetCloudRightButton(
                            createButton,
                            'Create Account',
                            '→'
                        );

                        return;
                    }


                    cloudRightCustomer = {

                        customer_id:
                            result.customer_id,

                        email:
                            result.email,

                        first_name:
                            result.first_name || '',

                        last_name:
                            result.last_name || ''

                    };


                    openCloudRightModal(
                        cart
                    );

                } catch (error) {

                    console.error(
                        'CloudRight create account error:',
                        error
                    );


                    showCloudRightFormError(
                        'cloudright-create-error',
                        'Unable to create your account right now.'
                    );

                } finally {

                    if (
                        !createButton.disabled
                    ) {
                        return;
                    }

                    resetCloudRightButton(
                        createButton,
                        'Create Account',
                        '→'
                    );

                }

            }
        );

    }


    /*
     * =========================================================
     * ACCOUNT CART PREVIEW
     * =========================================================
     */

    function buildAccountCartPreview(cart) {

        if (
            !cart.items ||
            cart.items.length === 0
        ) {

            return `
                <div class="cloudright-preview-empty">
                    Your cart is empty.
                </div>
            `;
        }


        const currencySymbol =
            cart.totals?.currency_symbol || '₹';

        const currencyMinorUnit =
            Number(
                cart.totals?.currency_minor_unit ?? 2
            );


        return cart.items
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


                return `
                    <div class="cloudright-preview-item">

                        <div class="cloudright-preview-image">

                            ${
                                imageUrl
                                    ? `
                                        <img
                                            src="${escapeHtml(imageUrl)}"
                                            alt="${escapeHtml(
                                                item.name || 'Product'
                                            )}"
                                        >
                                      `
                                    : `
                                        <span>
                                            🛍️
                                        </span>
                                      `
                            }

                            <span class="cloudright-preview-qty">
                                ${item.quantity || 1}
                            </span>

                        </div>


                        <div class="cloudright-preview-info">

                            <strong>
                                ${escapeHtml(
                                    item.name || 'Product'
                                )}
                            </strong>

                            <span>
                                ${currencySymbol}${itemPrice}
                            </span>

                        </div>

                    </div>
                `;

            })
            .join('');
    }


    /*
     * =========================================================
     * CART TOTAL
     * =========================================================
     */

    function formatCloudRightCartTotal(cart) {

        const currencySymbol =
            cart.totals?.currency_symbol || '₹';

        const currencyMinorUnit =
            Number(
                cart.totals?.currency_minor_unit ?? 2
            );

        const total =
            (
                Number(
                    cart.totals?.total_price || 0
                ) /
                Math.pow(
                    10,
                    currencyMinorUnit
                )
            ).toFixed(2);

        return `${currencySymbol}${total}`;
    }


    /*
     * =========================================================
     * PAYMENT MODAL
     * =========================================================
     */

    function openCloudRightModal(cart) {

        const existingModal =
            document.getElementById(
                'cloudright-modal'
            );

        if (existingModal) {
            existingModal.remove();
        }


        const currencySymbol =
            cart.totals?.currency_symbol || '₹';


        const currencyMinorUnit =
            Number(
                cart.totals?.currency_minor_unit ?? 2
            );


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
                                        src="${escapeHtml(imageUrl)}"
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


        const overlay =
            document.createElement('div');


        overlay.id =
            'cloudright-modal';


        overlay.innerHTML = `
            <div class="cloudright-overlay">

                <div class="cloudright-checkout-modal">

                    <div class="cloudright-modal-topbar">

                        <div class="cloudright-brand-area">

                            <div class="cloudright-brand-mark">
                                CR
                            </div>

                            <div>

                                <div class="cloudright-brand">
                                    CloudRight
                                </div>

                                <div class="cloudright-brand-caption">
                                    Secure Checkout
                                </div>

                            </div>

                        </div>

                        <button
                            type="button"
                            class="cloudright-close"
                            id="cloudright-close"
                            aria-label="Close checkout"
                        >
                            <span></span>
                            <span></span>
                        </button>

                    </div>


                    <div class="cloudright-progress">

                        <div class="cloudright-progress-step completed">

                            <span class="cloudright-step-number">
                                ✓
                            </span>

                            <span class="cloudright-step-label">
                                Account
                            </span>

                        </div>

                        <div class="cloudright-progress-line active"></div>

                        <div class="cloudright-progress-step active">

                            <span class="cloudright-step-number">
                                2
                            </span>

                            <span class="cloudright-step-label">
                                Payment
                            </span>

                        </div>

                        <div class="cloudright-progress-line"></div>

                        <div class="cloudright-progress-step">

                            <span class="cloudright-step-number">
                                3
                            </span>

                            <span class="cloudright-step-label">
                                Confirmation
                            </span>

                        </div>

                    </div>


                    <div class="cloudright-payment-body">

                        <div class="cloudright-payment-main">

                            <div class="cloudright-payment-heading">

                                <span class="cloudright-heading-icon">
                                    💳
                                </span>

                                <div>

                                    <h2>
                                        Complete your payment
                                    </h2>

                                    <p>
                                        Review your order and complete
                                        the payment securely.
                                    </p>

                                </div>

                            </div>


                            ${
                                cloudRightCustomer
                                    ? `
                                        <div class="cloudright-customer-badge">

                                            <span class="cloudright-customer-avatar">
                                                ${escapeHtml(
                                                    (
                                                        cloudRightCustomer.first_name ||
                                                        cloudRightCustomer.email ||
                                                        'C'
                                                    )
                                                        .charAt(0)
                                                        .toUpperCase()
                                                )}
                                            </span>

                                            <div>

                                                <strong>
                                                    ${escapeHtml(
                                                        (
                                                            cloudRightCustomer.first_name +
                                                            ' ' +
                                                            cloudRightCustomer.last_name
                                                        ).trim() ||
                                                        'Customer'
                                                    )}
                                                </strong>

                                                <span>
                                                    ${escapeHtml(
                                                        cloudRightCustomer.email
                                                    )}
                                                </span>

                                            </div>

                                        </div>
                                      `
                                    : ''
                            }


                            <div class="cloudright-cart-items">

                                ${cartItemsHtml}

                            </div>


                            <div class="cloudright-total-section">

                                <span>
                                    Total amount
                                </span>

                                <strong>
                                    ${currencySymbol}${cartTotal}
                                </strong>

                            </div>


                            <div class="cloudright-actions">

                                <button
                                    type="button"
                                    id="cloudright-success"
                                    class="cloudright-primary-button cloudright-payment-button"
                                >
                                    <span>
                                        Pay ${currencySymbol}${cartTotal}
                                    </span>

                                    <span>
                                        →
                                    </span>

                                </button>

                                <button
                                    type="button"
                                    id="cloudright-failure"
                                    class="cloudright-secondary-button"
                                >
                                    Cancel payment
                                </button>

                            </div>

                        </div>


                        <div class="cloudright-payment-side">

                            <div class="cloudright-side-title">
                                Secure payment
                            </div>

                            <div class="cloudright-security-icon">
                                🔒
                            </div>

                            <p>
                                Your payment is processed securely
                                through CloudRight.
                            </p>

                            <div class="cloudright-side-features">

                                <div>
                                    <span>✓</span>
                                    Secure transaction
                                </div>

                                <div>
                                    <span>✓</span>
                                    Order confirmation
                                </div>

                                <div>
                                    <span>✓</span>
                                    Email receipt
                                </div>

                            </div>

                        </div>

                    </div>


                    <div class="cloudright-modal-footer">

                        <span>
                            © ${new Date().getFullYear()} CloudRight
                        </span>

                        <span>
                            Secure checkout
                        </span>

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
         * SUCCESS
         * =====================================================
         */

        const successButton =
            document.getElementById(
                'cloudright-success'
            );


        successButton.addEventListener(
            'click',
            async function () {

                setCloudRightButtonLoading(
                    successButton,
                    'Processing payment...'
                );


                try {

                    const orderBody = {

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

                    };


                    if (cloudRightCustomer) {

                        orderBody.customer_id =
                            cloudRightCustomer.customer_id;

                        orderBody.customer_email =
                            cloudRightCustomer.email;

                        orderBody.customer_first_name =
                            cloudRightCustomer.first_name;

                        orderBody.customer_last_name =
                            cloudRightCustomer.last_name;

                    }


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

                                body: JSON.stringify(
                                    orderBody
                                )
                            }
                        );


                    const result =
                        await orderResponse.json();


                    if (!orderResponse.ok) {

                        if (
                            result.code === 'insufficient_inventory'
                        ) {

                            showCloudRightError(
                                result.message ||
                                'Insufficient inventory.'
                            );


                            resetCloudRightButton(
                                successButton,
                                'Try Payment Again',
                                '→'
                            );

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


                    overlay.remove();

                    cloudRightCustomer =
                        null;


                    if (result.order_received) {

                        const orderUrl =
                            new URL(
                                result.order_received,
                                window.location.origin
                            );


                        const orderId =
                            result.order_id;


                        const orderKey =
                            orderUrl.searchParams.get('key');


                        if (!orderId || !orderKey) {

                            throw new Error(
                                'Order information is incomplete'
                            );
                        }


                        const customOrderReceivedUrl =
                            `/order-received/?order_id=${encodeURIComponent(
                                orderId
                            )}&key=${encodeURIComponent(
                                orderKey
                            )}`;


                        window.location.href =
                            customOrderReceivedUrl;

                    } else {

                        throw new Error(
                            'Order received URL not returned'
                        );
                    }


                } catch (error) {

                    console.error(
                        'CloudRight order creation error:',
                        error
                    );


                    resetCloudRightButton(
                        successButton,
                        'Try Payment Again',
                        '→'
                    );


                    showCloudRightToast(
                        error.message ||
                        'Unable to complete the order.'
                    );

                }

            }
        );


        /*
         * =====================================================
         * FAILURE / CANCEL
         * =====================================================
         */

        const failureButton =
            document.getElementById(
                'cloudright-failure'
            );


        failureButton.addEventListener(
            'click',
            function () {

                overlay.remove();

                showCloudRightToast(
                    'Payment cancelled.'
                );

            }
        );

    }


    /*
     * =========================================================
     * BUTTON LOADING
     * =========================================================
     */

    function setCloudRightButtonLoading(
        button,
        message
    ) {

        button.disabled =
            true;

        button.dataset.originalText =
            button.textContent;

        button.innerHTML = `
            <span class="cloudright-loading-spinner"></span>
            <span>${escapeHtml(message)}</span>
        `;
    }


    /*
     * =========================================================
     * RESET BUTTON
     * =========================================================
     */

    function resetCloudRightButton(
        button,
        text,
        arrow
    ) {

        button.disabled =
            false;

        button.innerHTML = `
            <span>
                ${escapeHtml(text)}
            </span>

            <span class="cloudright-button-arrow">
                ${escapeHtml(arrow)}
            </span>
        `;
    }


    /*
     * =========================================================
     * EMAIL VALIDATION
     * =========================================================
     */

    function isValidEmail(email) {

        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            email
        );
    }


    /*
     * =========================================================
     * FORM ERROR
     * =========================================================
     */

    function showCloudRightFormError(
        elementId,
        message
    ) {

        const errorElement =
            document.getElementById(
                elementId
            );


        if (!errorElement) {
            return;
        }


        errorElement.textContent =
            message;


        errorElement.style.display =
            'block';
    }


    /*
     * =========================================================
     * CLEAR FORM ERROR
     * =========================================================
     */

    function clearCloudRightFormError(
        elementId
    ) {

        const errorElement =
            document.getElementById(
                elementId
            );


        if (!errorElement) {
            return;
        }


        errorElement.textContent =
            '';


        errorElement.style.display =
            'none';
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

        const existingToast =
            document.querySelector(
                '.cloudright-toast'
            );

        if (existingToast) {
            existingToast.remove();
        }


        const toast =
            document.createElement('div');


        toast.className =
            'cloudright-toast';


        toast.innerHTML = `
            <span class="cloudright-toast-icon">
                !
            </span>

            <span>
                ${escapeHtml(message)}
            </span>
        `;


        document.body.appendChild(
            toast
        );


        setTimeout(
            function () {

                toast.remove();

            },
            3500
        );
    }


    /*
     * =========================================================
     * PAYMENT / INVENTORY ERROR
     * =========================================================
     */

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