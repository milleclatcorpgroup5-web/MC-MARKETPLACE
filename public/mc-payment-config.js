/*
 * M.C Marketplace — Payment Foundation V4.0.1
 * Architecture only. Payment is DISABLED by default.
 *
 * IMPORTANT:
 * - No provider is activated here.
 * - No secret/private API key belongs in this frontend file.
 * - When PAYMENT_ENABLED is false, the marketplace must never
 *   attempt to charge, authorize, capture, refund, or redirect
 *   a customer to a payment provider.
 * - Real payment execution must be implemented server-side later.
 */

(function (global) {
  "use strict";

  const VERSION = "4.0.1";

  const PAYMENT_STATUS = Object.freeze({
    PENDING: "pending",
    PROCESSING: "processing",
    PAID: "paid",
    FAILED: "failed",
    CANCELLED: "cancelled",
    REFUNDED: "refunded"
  });

  const PROVIDERS = Object.freeze({
    MONCASH: "moncash",
    NATCASH: "natcash",
    CARD: "card"
  });

  const CONFIG = Object.freeze({
    version: VERSION,

    // MASTER SWITCH — keep false until a real provider/backend
    // integration has been configured and tested.
    enabled: false,

    mode: "disabled",

    currency: "HTG",

    providers: Object.freeze({
      [PROVIDERS.MONCASH]: Object.freeze({
        enabled: false,
        name: "MonCash"
      }),
      [PROVIDERS.NATCASH]: Object.freeze({
        enabled: false,
        name: "NatCash"
      }),
      [PROVIDERS.CARD]: Object.freeze({
        enabled: false,
        name: "Card"
      })
    }),

    // Payment is initiated only by a trusted backend endpoint
    // after activation. This is intentionally empty for now.
    backendEndpoint: "",

    // Frontend may create an order, but it must not claim that
    // the order has been paid.
    defaultOrderPaymentStatus: PAYMENT_STATUS.PENDING
  });

  function isPaymentEnabled() {
    return CONFIG.enabled === true;
  }

  function getConfig() {
    return CONFIG;
  }

  function getEnabledProviders() {
    if (!isPaymentEnabled()) return [];

    return Object.keys(CONFIG.providers).filter(function (provider) {
      return CONFIG.providers[provider].enabled === true;
    });
  }

  function isProviderEnabled(provider) {
    return isPaymentEnabled() &&
      !!CONFIG.providers[provider] &&
      CONFIG.providers[provider].enabled === true;
  }

  function canStartPayment() {
    if (!isPaymentEnabled()) return false;

    return getEnabledProviders().length > 0 &&
      typeof CONFIG.backendEndpoint === "string" &&
      CONFIG.backendEndpoint.length > 0;
  }

  function getInitialPaymentState() {
    return {
      paymentStatus: CONFIG.defaultOrderPaymentStatus,
      paymentProvider: null,
      paymentReference: null,
      paymentTransactionId: null,
      paymentUpdatedAt: null
    };
  }

  const api = Object.freeze({
    VERSION,
    PAYMENT_STATUS,
    PROVIDERS,
    getConfig,
    isPaymentEnabled,
    getEnabledProviders,
    isProviderEnabled,
    canStartPayment,
    getInitialPaymentState
  });

  global.MCPayment = api;
})(window);
