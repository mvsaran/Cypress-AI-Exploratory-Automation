/**
 * AITestHelper - in-memory AI analysis helper for Cypress tests.
 *
 * This helper collects structured step logs, element captures and anomalies during tests.
 * It communicates with the Cypress Node process via `cy.task('ai:log', payload)` and
 * requests a final save using `cy.task('ai:save')`. All data is kept in-memory during
 * the run and then persisted to `reports/ai-insights/latest-report.json` by the task.
 *
 * The helper focuses on lightweight, test-side collection of metadata for later
 * AI analysis (which could be done offline or by an external AI service).
 */

class AITestHelper {
  constructor(testContext) {
    // testContext helps tag logs with test metadata (title, id)
    this.testContext = testContext || {};
    this.stepCounter = 0;
    this.session = { steps: [], elements: [], anomalies: [], performance: [] };
  }

  // Log a test step for AI analysis. Returns the Cypress chainable from cy.task.
  logStep(step, details = {}) {
    this.stepCounter += 1;
    const payload = {
      type: 'step',
      stepNumber: this.stepCounter,
      step,
      details,
      test: this._meta()
    };
    // send to node task for aggregation and keep session
    this.session.steps.push(payload);
    return cy.task('ai:log', payload);
  }

  // Capture an element's basic data for AI analysis. Returns a chainable that yields details.
  captureElement(selector, description = '') {
    return cy.get(selector, { log: false, timeout: 2000 }).then($el => {
      const el = $el[0];
      let details;
      if (!el) {
        details = { selector, description, exists: false };
      } else {
        const bbox = el.getBoundingClientRect ? el.getBoundingClientRect() : {};
        details = {
          selector,
          description,
          exists: true,
          tagName: el.tagName,
          classes: el.className,
          text: el.innerText || '',
          rect: { x: bbox.x, y: bbox.y, width: bbox.width, height: bbox.height },
          attributes: Array.from(el.attributes || []).reduce((acc, a) => {
            acc[a.name] = a.value; return acc;
          }, {})
        };
      }
      const payload = { type: 'element', details, test: this._meta() };
      this.session.elements.push(payload);
      return cy.task('ai:log', payload).then(() => details);
    }, () => {
      // failure handler if cy.get times out or errors
      const details = { selector, description, exists: false };
      const payload = { type: 'element', details, test: this._meta() };
      this.session.elements.push(payload);
      return cy.task('ai:log', payload).then(() => details);
    });
  }

  // Detect an anomaly and record severity. Returns the cy.task chainable.
  detectAnomaly(type, message, severity = 'medium') {
    const payload = {
      type: 'anomaly',
      anomalyType: type,
      message,
      severity,
      time: new Date().toISOString(),
      test: this._meta()
    };
    this.session.anomalies.push(payload);
    return cy.task('ai:log', payload);
  }

  // Smart wait - logs reasoning and waits. Returns cy.wait chainable.
  smartWait(reason = 'wait for stability', timeout = 2000) {
    // log the intent and then wait
    return this.logStep('smartWait', { reason, timeout }).then(() => cy.wait(timeout, { log: false }));
  }

  // Analyze page structure: counts for links, buttons, inputs, images, forms. Returns analysis.
  analyzePage(pageName = '') {
    return cy.document({ log: false }).then(doc => {
      const analysis = {
        url: doc.location.href,
        title: doc.title,
        counts: {
          links: doc.querySelectorAll('a').length,
          buttons: doc.querySelectorAll('button').length,
          inputs: doc.querySelectorAll('input, textarea, select').length,
          images: doc.querySelectorAll('img').length,
          forms: doc.querySelectorAll('form').length
        }
      };
      const payload = { type: 'pageAnalysis', pageName, analysis, test: this._meta() };
      return cy.task('ai:log', payload).then(() => analysis);
    });
  }

  // Collect performance timing and accessibility quick checks, return compiled report
  generateAIReport() {
    // Get aggregated insights from node task, then persist
    return cy.task('ai:get').then(insights => cy.task('ai:save').then(saved => ({ insights, saved })));
  }

  _meta() {
    return {
      title: this.testContext.currentTest ? this.testContext.currentTest.title : undefined,
      fullTitle: this.testContext.currentTest ? this.testContext.currentTest.titlePath : undefined
    };
  }
}

module.exports = AITestHelper;
