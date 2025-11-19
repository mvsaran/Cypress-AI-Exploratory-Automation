/**
 * NaukriPage - simplified page object for naukri.com exploratory testing
 * Note: Naukri has dynamic content and multiple redirects; tests use best-effort selectors
 * and log AI insights instead of failing for uncommon site variations.
 */
class NaukriPage {
  constructor() {
    this.selectors = {
      // search input often uses placeholder text - fallback to common input selectors
      searchBox: 'input[placeholder*="skills"], input[placeholder*="Search"], input[name*=skill], input[type="search"]',
      searchButton: 'button[type="submit"], button:contains("Search")',
      jobCards: '.jobTuple, .jobTupleHeader, .list, .job-card',
      firstJobLink: '.jobTuple a[href], .job-card a[href]'
    };
  }

  visit() {
    // Use NAUKRI_URL from env; if not set, fallback to AMAZON_URL which we also point to Naukri
    const url = Cypress.env('NAUKRI_URL') || Cypress.env('AMAZON_URL');
    cy.visit(url, { timeout: 60000 });
  }

  search(term) {
    // best-effort search: try to find an input and type
    return cy.get('body').then($body => {
      if ($body.find(this.selectors.searchBox).length) {
        cy.get(this.selectors.searchBox).first().clear({ force: true }).type(term, { delay: 20 }).type('{enter}');
      } else if ($body.find('input').length) {
        cy.get('input').first().clear({ force: true }).type(term).type('{enter}');
      } else {
        // can't locate search box — log and continue
        cy.task('ai:log', { type: 'anomaly', anomalyType: 'search_box_missing', message: 'Search input not found on Naukri page' });
      }
    });
  }

  analyzeResults() {
    return cy.get('body').then($body => {
      const count = $body.find(this.selectors.jobCards).length || $body.find('article, li').length;
      return { count };
    });
  }

  openFirstJob() {
    return cy.get(this.selectors.firstJobLink).first().then($a => {
      const href = $a && $a.attr && $a.attr('href');
      if (href) {
        // open in same tab
        return cy.visit(href, { failOnStatusCode: false });
      }
      // attempt clicking as a fallback; silence errors with then's failure handler
      return cy.get(this.selectors.firstJobLink).first().click({ force: true }).then(() => {}, () => {});
    }, () => {
      // if selector not found, just continue
      return null;
    });
  }
}

module.exports = new NaukriPage();
