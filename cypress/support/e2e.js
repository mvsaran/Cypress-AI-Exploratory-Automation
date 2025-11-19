// Global support file for Cypress E2E tests
// - Import custom commands, axe for accessibility, and initialize AI monitoring hooks

// Load custom commands and AI helpers
require('./commands');

// Load cypress-axe for accessibility testing (provides cy.injectAxe and cy.checkA11y)
try {
  require('cypress-axe');
} catch (e) {
  // if cypress-axe is not installed yet, tests will continue without axe; installation step will add it
  // Logging silently to avoid failing the support file loading
  // console.warn('cypress-axe not available:', e.message);
}

// Attach to test lifecycle to start AI helper and capture test-level artifacts
beforeEach(function () {
  // Initialize AI helper with the current mocha context
  cy.aiInit(this);
  // Inject axe for accessibility checks (if available)
  if (cy.injectAxe) {
    cy.injectAxe();
  }
  // Log test start
  cy.aiLog('testStart', { title: this.currentTest && this.currentTest.title });
});

afterEach(function () {
  // On failure, capture screenshot and console errors
  const testTitle = this.currentTest && this.currentTest.title;
  if (this.currentTest && this.currentTest.state === 'failed') {
    const name = String(testTitle || 'test').replace(/\s+/g, '_').toLowerCase();
    // Skip heavy screenshots for AI-driven exploratory specs to avoid intermittent timeouts
    const specName = (Cypress.spec && Cypress.spec.name) || '';
    if (specName.includes('ai-driven')) {
      cy.aiLog('testFailure', { title: testTitle, err: this.currentTest.err && this.currentTest.err.message, note: 'screenshot skipped for ai-driven spec' });
    } else {
      cy.captureAIScreenshot(`failure-${name}`);
      cy.aiLog('testFailure', { title: testTitle, err: this.currentTest.err && this.currentTest.err.message });
    }
  }

  // Generate and persist AI report for this test
  cy.aiLog('testEnd', { title: testTitle }).then(() => cy.task && cy.task('ai:save'));
});

// Capture uncaught exceptions in test runner and log them (avoid using `cy` here)
Cypress.on('uncaught:exception', (err) => {
  Cypress.log({ name: 'uncaught:exception', message: String(err) });
  // Do not fail the test due to third-party script errors by default
  return false;
});