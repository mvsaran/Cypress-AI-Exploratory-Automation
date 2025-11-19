/// <reference types="cypress" />
const sauce = require('../../support/page-objects/SauceDemoPage');

describe('SauceDemo - Checkout flow with AI monitoring', () => {
  beforeEach(() => {
    // ensure AI helper is ready in support hooks
  });

  it('completes checkout and generates AI report', function () {
    cy.fixture('test-data').then((data) => {
      const creds = data.saucedemo;
      // Visit and login
      sauce.visit();
      cy.aiLog('visiting saucedemo');
      sauce.login(creds.user, creds.password);
      cy.aiLog('logged in', { user: creds.user });

      // Add item and open cart
      sauce.addFirstItemToCart();
      cy.captureAIScreenshot('after-add-to-cart');

      sauce.openCart();
      cy.aiLog('opened cart');

      // Anomaly check: if cart empty, record
      cy.get('.cart_item').then($items => {
        if ($items.length === 0) {
          cy.aiLog('emptyCartAttempt', { moment: 'beforeCheckout' });
          cy.task('ai:log', { type: 'anomaly', anomalyType: 'empty_cart_checkout', severity: 'high', message: 'Attempted checkout with empty cart' });
        }
      });

      // Checkout
      sauce.checkout(creds.checkout);
      cy.captureAIScreenshot('after-checkout');

      // Generate AI report for this test
      cy.aiLog('generateReport').then(() => cy.task('ai:save'));
    });
  });
});
