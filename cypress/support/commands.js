/**
 * Custom Cypress commands that integrate with the AITestHelper.
 * - `cy.aiLog` : write AI log messages
 * - `cy.smartClick` : click with visibility/enable checks
 * - `cy.smartType` : clear, type with small delay and log
 * - `cy.analyzeElement` : capture element analysis
 * - `cy.captureAIScreenshot` : capture screenshot and save for AI analysis
 * - `cy.validateVisualElement` : basic visual property checks
 */

const AITestHelper = require('./ai-helper');

// attach a helper instance per test via Cypress
Cypress.Commands.add('aiInit', (testContext) => {
  if (!Cypress.aiHelper || Cypress.aiHelper.testContext !== testContext) {
    Cypress.aiHelper = new AITestHelper(testContext);
  }
  return Cypress.aiHelper;
});

Cypress.Commands.add('aiLog', (message, data = {}) => {
  const helper = Cypress.aiHelper || new AITestHelper({});
  return helper.logStep(message, data);
});

Cypress.Commands.add('smartClick', (selector, description = '') => {
  cy.get(selector).should('be.visible').and('not.be.disabled').then($el => {
    // log before click
    Cypress.aiHelper && Cypress.aiHelper.logStep('click', { selector, description });
    cy.wrap($el).click({ force: false });
  });
});

Cypress.Commands.add('smartType', (selector, text, description = '') => {
  cy.get(selector).should('be.visible').then($el => {
    Cypress.aiHelper && Cypress.aiHelper.logStep('type', { selector, description, textPreview: String(text).slice(0, 32) });
    cy.wrap($el).clear({ force: true }).type(text, { delay: 20 });
  });
});

Cypress.Commands.add('analyzeElement', (selector) => {
  // returns a promise with captured element details
  const helper = Cypress.aiHelper || new AITestHelper({});
  return helper.captureElement(selector);
});

Cypress.Commands.add('captureAIScreenshot', (name) => {
  // Save screenshot to the configured ai-analysis folder and log
  // Use `viewport` capture to avoid long-running full page snapshots on heavy or cross-origin pages
  const fileName = `ai-${name}-${Date.now()}`;
  return cy.screenshot(`ai-analysis/${fileName}`, { capture: 'viewport' }).then(() => {
    // log screenshot event to AI helper (non-blocking)
    Cypress.aiHelper && Cypress.aiHelper.logStep('screenshot', { name: fileName });
  }, (err) => {
    // If screenshot fails (timeouts on heavy pages), log via task and swallow the error so tests don't fail
    if (cy.task) cy.task('ai:log', { type: 'error', message: 'screenshotFailed', detail: String(err) });
    return null;
  });
});

Cypress.Commands.add('validateVisualElement', (selector, expected = {}) => {
  // Basic visual checks; only compares presence and computed styles when provided
  return cy.get(selector).then($el => {
    if (!$el.length) {
      Cypress.aiHelper && Cypress.aiHelper.detectAnomaly('visual', `Element missing: ${selector}`, 'high');
      throw new Error(`Element not found: ${selector}`);
    }
    const el = $el[0];
    const styles = window.getComputedStyle(el);
    const mismatches = [];
    if (expected.visible === true && styles.display === 'none') mismatches.push('not visible');
    if (expected.color && styles.color !== expected.color) mismatches.push('color mismatch');
    if (mismatches.length) {
      Cypress.aiHelper && Cypress.aiHelper.detectAnomaly('visual', `${selector} visual mismatch: ${mismatches.join(', ')}`, 'medium');
    }
    return { selector, styles, mismatches };
  });
});

// expose commands to support files importing this module
module.exports = {};
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })