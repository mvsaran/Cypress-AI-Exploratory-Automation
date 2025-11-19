/**
 * Flipkart page object - simplified for exploratory testing.
 * Note: Flipkart often shows a login modal; tests should handle overlay closure if present.
 */
class FlipkartPage {
  constructor() {
    this.selectors = {
      searchBox: 'input[name=q]',
      productList: '._1AtVbE',
      firstProductLink: 'a._1fQZEK, a.s1Q9rs',
      cartBtn: 'a._3qQ9m1, a._2AkmmA',
      closeLoginModal: 'button._2KpZ6l._2doB4z'
    };
  }

  visit() {
    cy.visit(Cypress.env('FLIPKART_URL'));
    // close login modal if present
    cy.get('body').then($body => {
      if ($body.find(this.selectors.closeLoginModal).length) cy.get(this.selectors.closeLoginModal).click({ force: true });
    });
  }

  search(term) {
    cy.get(this.selectors.searchBox).clear().type(term).type('{enter}');
  }

  addFirstProductToCart() {
    cy.get(this.selectors.firstProductLink).first().invoke('removeAttr', 'target').click();
    // product page -> add to cart
    cy.get('button').contains(/Add to Cart|ADD TO CART|Add to cart/i).click({ force: true });
  }
}

module.exports = new FlipkartPage();
