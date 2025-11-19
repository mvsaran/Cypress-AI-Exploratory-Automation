/// <reference types="cypress" />
const parabank = require('../../support/page-objects/ParabankPage');

describe('Parabank exploratory tests', () => {
  // bump screenshot timeout for this spec (ms)
  before(() => {
    Cypress.config('screenshotTimeout', 60000); // 60s
  });

  it('visits Parabank, navigates and captures AI insights', function () {
    // return the fixture chain so Cypress waits for it
    return cy.fixture('test-data').then(data => {
      const term = data.parabank && data.parabank.searchTerms && data.parabank.searchTerms[0]
        ? data.parabank.searchTerms[0]
        : null;

      // IMPORTANT: return the visit chain so Cypress waits for all nested commands
      return parabank.visit().then((res) => {
        cy.aiLog('visitParabank', { available: !!(res && res.available) });
        if (!res || res.available === false) {
          // Site unavailable — log and skip interactions to keep suite stable
          cy.aiLog('parabankUnavailable', { url: Cypress.env('PARABANK_URL') });
          return;
        }

        // If credentials are provided in fixtures, attempt login; otherwise just explore
        if (data.parabank && data.parabank.user) {
          parabank.login(data.parabank.user.username, data.parabank.user.password);
          cy.aiLog('parabankLogin', { user: data.parabank.user.username });
          parabank.openAccountsOverview();

          // ensure captureAIScreenshot returns the cy.screenshot() chainable
          return cy.captureAIScreenshot('parabank-accounts-overview');
        } else {
          // navigate to a couple pages
          parabank.openNewAccount();
          // ensure return
          return cy.captureAIScreenshot('parabank-open-account')
            .then(() => {
              parabank.navigateToTransfers();
              return cy.captureAIScreenshot('parabank-transfers');
            });
        }
      });
    });
  });
});
