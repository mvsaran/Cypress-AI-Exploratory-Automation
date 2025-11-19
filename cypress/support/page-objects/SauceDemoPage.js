/**
 * Page object for SauceDemo (https://www.saucedemo.com)
 * Provides login, add to cart, checkout and complete order flows.
 */
class SauceDemoPage {
  constructor() {
    this.selectors = {
      username: '#user-name',
      password: '#password',
      loginBtn: '#login-button',
      inventoryItems: '.inventory_item',
      addToCartBtn: '.btn_inventory',
      cartLink: '.shopping_cart_link',
      checkoutBtn: '[data-test=checkout]',
      firstName: '[data-test=firstName]',
      lastName: '[data-test=lastName]',
      postalCode: '[data-test=postalCode]',
      continueBtn: '[data-test=continue]',
      finishBtn: '[data-test=finish]'
    };
  }

  visit() {
    cy.visit(Cypress.env('SAUCEDEMO_URL'));
  }

  login(user, pass) {
    cy.smartType(this.selectors.username, user, 'enter username');
    cy.smartType(this.selectors.password, pass, 'enter password');
    cy.smartClick(this.selectors.loginBtn, 'submit login');
  }

  addFirstItemToCart() {
    cy.get(this.selectors.inventoryItems).first().within(() => {
      cy.get(this.selectors.addToCartBtn).click();
    });
  }

  openCart() {
    cy.get(this.selectors.cartLink).click();
  }

  checkout(info) {
    cy.get(this.selectors.checkoutBtn).click();
    cy.smartType(this.selectors.firstName, info.firstName, 'first name');
    cy.smartType(this.selectors.lastName, info.lastName, 'last name');
    cy.smartType(this.selectors.postalCode, info.postalCode, 'postal code');
    cy.get(this.selectors.continueBtn).click();
    cy.get(this.selectors.finishBtn).click();
  }
}

module.exports = new SauceDemoPage();
