/**
 * Amazon page object - simplified for exploratory testing.
 * NOTE: Amazon is dynamic and may block automation. Use env `AMAZON_URL` to set a safe test endpoint.
 */
class AmazonPage {
  constructor() {
    this.selectors = {
      searchBox: '#twotabsearchtextbox, input[name="field-keywords"]',
      searchButton: 'input[type="submit"][value="Go"]',
      productResults: '[data-component-type="s-search-result"], .s-result-item',
      filters: '#s-refinements, .a-section .s-refinements',
      firstProduct: '[data-component-type="s-search-result"] h2 a'
    };
  }

  visit() {
    cy.visit(Cypress.env('AMAZON_URL'));
  }

  search(term) {
    cy.get(this.selectors.searchBox).first().clear().type(term, { delay: 20 });
    cy.get(this.selectors.searchBox).first().type('{enter}');
  }

  analyzeResults() {
    return cy.get(this.selectors.productResults).then($els => {
      return { count: $els.length };
    });
  }

  openFirstProduct() {
    cy.get(this.selectors.firstProduct).first().click({ force: true });
  }
}

module.exports = new AmazonPage();
