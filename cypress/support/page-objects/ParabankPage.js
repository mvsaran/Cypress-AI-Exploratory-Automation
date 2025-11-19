/**
 * ParabankPage - page object for https://parabank.parasoft.com
 * Provides simple search/browse flows for exploratory testing.
 */
class ParabankPage {
  constructor() {
    this.selectors = {
      username: 'input[name="username"]',
      password: 'input[name="password"]',
      loginBtn: 'input[value="Log In"]',
      accountsLink: 'a[href*=\"overview.htm\"]',
      openNewAccount: 'a[href*=\"openaccount.htm\"]',
      transferLink: 'a[href*=\"transfer.htm\"]',
      customerService: 'a[href*=\"contact.htm\"]'
    };
  }

  visit() {
    const url = Cypress.env('PARABANK_URL');
    // Try to fetch the HTML and inject it to avoid waiting on external resource loads
    return cy.request({ url, failOnStatusCode: false, timeout: 60000 }).then((resp) => {
      if (resp && resp.body) {
        cy.document().then(doc => {
          try {
            doc.open();
            doc.write(resp.body);
            doc.close();
          } catch (e) {
            // fallback
          }
        });
        return cy.wrap({ available: true });
      } else {
        return cy.wrap({ available: false });
      }
    }, (err) => {
      // If request failed, inject a minimal placeholder document and mark unavailable
      cy.task && cy.task('ai:log', { type: 'error', message: 'parabankRequestFailed', detail: String(err) });
      cy.document().then(doc => {
        try {
          doc.open();
          doc.write('<html><body><h1>Parabank Unavailable - placeholder</h1></body></html>');
          doc.close();
        } catch (e) {
          // ignore
        }
      });
      return cy.wrap({ available: false });
    });
  }

  login(username, password) {
    if (username) cy.get(this.selectors.username).clear().type(username, { delay: 20 });
    if (password) cy.get(this.selectors.password).clear().type(password, { delay: 20 });
    cy.get(this.selectors.loginBtn).click();
  }

  openAccountsOverview() {
    cy.get(this.selectors.accountsLink).click({ force: true });
  }

  openNewAccount() {
    // Try multiple strategies to locate the 'Open New Account' action:
    // 1. anchor with href containing 'openaccount.htm'
    // 2. anchor or button with visible text matching 'Open New Account' (case-insensitive)
    // 3. fallback: direct navigation to the known open account URL
    return cy.get('body').then($body => {
      if ($body.find(this.selectors.openNewAccount).length) {
        return cy.get(this.selectors.openNewAccount).first().click({ force: true });
      }

      // try anchor text match (case-insensitive)
      const linkTextMatch = $body.find('a').filter((i, el) => /open\s*new\s*account/i.test(el.innerText));
      if (linkTextMatch.length) {
        return cy.contains('a', /open\s*new\s*account/i).first().click({ force: true });
      }

      // try button text match
      const btnMatch = $body.find('button').filter((i, el) => /open\s*new\s*account/i.test(el.innerText));
      if (btnMatch.length) {
        return cy.contains('button', /open\s*new\s*account/i).first().click({ force: true });
      }

      // Fallback: navigate directly to the expected open account path
      const base = Cypress.env('PARABANK_URL') || '';
      const openPath = base.replace(/\/$/, '') + '/parabank/openaccount.htm';
      return cy.visit(openPath, { failOnStatusCode: false });
    });
  }

  navigateToTransfers() {
    // Robust navigation to Transfers page: try href selector, link/button text, then fallback URL
    return cy.get('body').then($body => {
      if ($body.find(this.selectors.transferLink).length) {
        return cy.get(this.selectors.transferLink).first().click({ force: true });
      }

      // try anchor text match
      const linkTextMatch = $body.find('a').filter((i, el) => /transfer/i.test(el.innerText));
      if (linkTextMatch.length) {
        return cy.contains('a', /transfer/i).first().click({ force: true });
      }

      // try button text match
      const btnMatch = $body.find('button').filter((i, el) => /transfer/i.test(el.innerText));
      if (btnMatch.length) {
        return cy.contains('button', /transfer/i).first().click({ force: true });
      }

      // fallback to direct URL
      const base = Cypress.env('PARABANK_URL') || '';
      const transferPath = base.replace(/\/$/, '') + '/parabank/transfer.htm';
      return cy.visit(transferPath, { failOnStatusCode: false });
    });
  }
}

module.exports = new ParabankPage();
