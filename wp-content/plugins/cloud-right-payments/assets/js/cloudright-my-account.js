(function () {
    'use strict';

    /*
     * =========================================================
     * CLOUDRIGHT MY ACCOUNT
     * Email-only account interface
     * =========================================================
     */

    const API_BASE =
        window.cloudRightMyAccountConfig &&
        window.cloudRightMyAccountConfig.restUrl
            ? window.cloudRightMyAccountConfig.restUrl
            : '/wp-json/cloudright/v1';


    /*
     * =========================================================
     * STORAGE
     * =========================================================
     */

    const STORAGE_KEY = 'cloudright_customer';


    function getStoredCustomer() {

        try {

            const customer =
                localStorage.getItem(STORAGE_KEY);

            if (!customer) {
                return null;
            }

            return JSON.parse(customer);

        } catch (error) {

            console.error(
                'CloudRight: Unable to read customer information.',
                error
            );

            return null;
        }
    }


    function saveCustomer(customer) {

        try {

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(customer)
            );

        } catch (error) {

            console.error(
                'CloudRight: Unable to save customer information.',
                error
            );
        }
    }


    function clearCustomer() {

        try {

            localStorage.removeItem(
                STORAGE_KEY
            );

        } catch (error) {

            console.error(
                'CloudRight: Unable to clear customer information.',
                error
            );
        }
    }


    /*
     * =========================================================
     * HELPERS
     * =========================================================
     */

    function escapeHtml(value) {

        const div = document.createElement('div');

        div.textContent =
            value === undefined || value === null
                ? ''
                : String(value);

        return div.innerHTML;
    }


    function getInitials(customer) {

        const firstName =
            customer && customer.first_name
                ? customer.first_name.trim()
                : '';

        const lastName =
            customer && customer.last_name
                ? customer.last_name.trim()
                : '';

        if (firstName || lastName) {

            return (
                (firstName.charAt(0) || '') +
                (lastName.charAt(0) || '')
            ).toUpperCase();

        }

        if (customer && customer.email) {

            return customer.email
                .charAt(0)
                .toUpperCase();

        }

        return 'C';
    }


    function getDisplayName(customer) {

        if (
            customer &&
            customer.first_name
        ) {

            return customer.first_name;

        }

        if (customer && customer.email) {

            return customer.email
                .split('@')[0];

        }

        return 'Customer';
    }


    function isValidEmail(email) {

        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            email
        );
    }


    /*
     * =========================================================
     * API
     * =========================================================
     */

    async function loginWithEmail(email) {

        const response =
            await fetch(
                API_BASE + '/login',
                {
                    method: 'POST',

                    headers: {
                        'Content-Type':
                            'application/json'
                    },

                    body: JSON.stringify({
                        email: email
                    })
                }
            );


        let data = null;

        try {

            data =
                await response.json();

        } catch (error) {

            data = null;
        }


        if (
            !response.ok ||
            !data ||
            !data.success
        ) {

            throw new Error(
                data &&
                data.message
                    ? data.message
                    : 'Unable to login with this email address.'
            );
        }


        return data;
    }


    /*
     * =========================================================
     * MAIN CONTAINER
     * =========================================================
     */

    function getAccountContainer() {

        return document.querySelector(
            '.woocommerce'
        );
    }


    /*
     * =========================================================
     * LOGIN UI
     * =========================================================
     */

    function renderLogin(container) {

        container.innerHTML = `
            <div class="cloudright-account-page">

                <div class="cloudright-account-shell">

                    <div class="cloudright-account-brand">

                        <div class="cloudright-account-brand-mark">
                            CR
                        </div>

                        <div>
                            <div class="cloudright-account-brand-name">
                                CloudRight
                            </div>

                            <div class="cloudright-account-brand-caption">
                                Customer Account
                            </div>
                        </div>

                    </div>


                    <div class="cloudright-account-icon">
                        ✉
                    </div>


                    <h1>
                        Login to Your Account
                    </h1>


                    <p class="cloudright-account-description">
                        Enter your email address to continue.
                    </p>


                    <form
                        id="cloudright-my-account-login-form"
                        class="cloudright-account-login-form"
                    >

                        <div class="cloudright-account-field">

                            <label for="cloudright-my-account-email">
                                Email Address
                            </label>

                            <div class="cloudright-account-input-wrapper">

                                <span class="cloudright-account-input-icon">
                                    @
                                </span>

                                <input
                                    type="email"
                                    id="cloudright-my-account-email"
                                    name="email"
                                    placeholder="you@example.com"
                                    autocomplete="email"
                                    required
                                >

                            </div>

                        </div>


                        <div
                            id="cloudright-my-account-error"
                            class="cloudright-account-error"
                            style="display:none;"
                        ></div>


                        <button
                            type="submit"
                            id="cloudright-my-account-login-button"
                            class="cloudright-account-primary-button"
                        >
                            <span class="cloudright-account-button-text">
                                Continue with Email
                            </span>

                            <span class="cloudright-account-button-arrow">
                                →
                            </span>
                        </button>


                        <div class="cloudright-account-security-note">

                            <span>✓</span>

                            Simple and secure account access

                        </div>

                    </form>

                </div>

            </div>
        `;


        setupLoginForm(
            container
        );
    }


    /*
     * =========================================================
     * LOGGED-IN UI
     * =========================================================
     */

    function renderAccount(container, customer) {

        const initials =
            getInitials(customer);

        const displayName =
            getDisplayName(customer);


        container.innerHTML = `
            <div class="cloudright-account-page">

                <div class="cloudright-account-shell">

                    <div class="cloudright-account-brand">

                        <div class="cloudright-account-brand-mark">
                            CR
                        </div>

                        <div>
                            <div class="cloudright-account-brand-name">
                                CloudRight
                            </div>

                            <div class="cloudright-account-brand-caption">
                                Customer Account
                            </div>
                        </div>

                    </div>


                    <div class="cloudright-account-profile-avatar">
                        ${escapeHtml(initials)}
                    </div>


                    <div class="cloudright-account-welcome">

                        <span>
                            Welcome back
                        </span>

                        <h1>
                            ${escapeHtml(displayName)}
                        </h1>

                    </div>


                    <div class="cloudright-account-information">

                        <div class="cloudright-account-section-label">
                            ACCOUNT INFORMATION
                        </div>


                        <div class="cloudright-account-info-card">

                            <div class="cloudright-account-info-icon">
                                @
                            </div>


                            <div class="cloudright-account-info-content">

                                <span>
                                    Email Address
                                </span>

                                <strong>
                                    ${escapeHtml(customer.email || '')}
                                </strong>

                            </div>

                        </div>

                    </div>


                    <button
                        type="button"
                        id="cloudright-my-account-logout"
                        class="cloudright-account-logout-button"
                    >
                        <span>
                            Logout
                        </span>

                        <span>
                            →
                        </span>
                    </button>


                    <div class="cloudright-account-footer">
                        CloudRight Customer Account
                    </div>

                </div>

            </div>
        `;


        setupLogout(
            container
        );
    }


    /*
     * =========================================================
     * LOGIN FORM
     * =========================================================
     */

    function setupLoginForm(container) {

        const form =
            container.querySelector(
                '#cloudright-my-account-login-form'
            );


        const emailInput =
            container.querySelector(
                '#cloudright-my-account-email'
            );


        const errorBox =
            container.querySelector(
                '#cloudright-my-account-error'
            );


        const button =
            container.querySelector(
                '#cloudright-my-account-login-button'
            );


        if (
            !form ||
            !emailInput ||
            !errorBox ||
            !button
        ) {

            return;
        }


        form.addEventListener(
            'submit',
            async function (event) {

                event.preventDefault();


                const email =
                    emailInput.value
                        .trim()
                        .toLowerCase();


                errorBox.style.display =
                    'none';

                errorBox.textContent =
                    '';


                if (!isValidEmail(email)) {

                    errorBox.textContent =
                        'Please enter a valid email address.';

                    errorBox.style.display =
                        'block';

                    emailInput.focus();

                    return;
                }


                button.disabled =
                    true;


                button.innerHTML = `
                    <span class="cloudright-account-loading-spinner"></span>
                    <span>Checking...</span>
                `;


                try {

                    const customer =
                        await loginWithEmail(
                            email
                        );


                    saveCustomer(
                        customer
                    );


                    renderAccount(
                        container,
                        customer
                    );


                } catch (error) {

                    console.error(
                        'CloudRight login error:',
                        error
                    );


                    errorBox.textContent =
                        error.message ||
                        'Unable to login. Please try again.';

                    errorBox.style.display =
                        'block';


                    button.disabled =
                        false;


                    button.innerHTML = `
                        <span class="cloudright-account-button-text">
                            Continue with Email
                        </span>

                        <span class="cloudright-account-button-arrow">
                            →
                        </span>
                    `;

                }

            }
        );
    }


    /*
     * =========================================================
     * LOGOUT
     * =========================================================
     */

    function setupLogout(container) {

        const logoutButton =
            container.querySelector(
                '#cloudright-my-account-logout'
            );


        if (!logoutButton) {
            return;
        }


        logoutButton.addEventListener(
            'click',
            function () {

                clearCustomer();

                renderLogin(
                    container
                );

                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });

            }
        );
    }


    /*
     * =========================================================
     * REMOVE DEFAULT WOOCOMMERCE ACCOUNT CONTENT
     * =========================================================
     */

    function prepareAccountPage() {

        const body =
            document.body;


        if (
            !body.classList.contains(
                'woocommerce-account'
            )
        ) {

            return;
        }


        const container =
            getAccountContainer();


        if (!container) {
            return;
        }


        const customer =
            getStoredCustomer();


        if (customer) {

            renderAccount(
                container,
                customer
            );

        } else {

            renderLogin(
                container
            );
        }

    }


    /*
     * =========================================================
     * START
     * =========================================================
     */

    function initialize() {

        prepareAccountPage();

    }


    if (
        document.readyState ===
        'loading'
    ) {

        document.addEventListener(
            'DOMContentLoaded',
            initialize
        );

    } else {

        initialize();
    }

})();
