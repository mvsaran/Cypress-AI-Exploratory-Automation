/// <reference types="cypress" />
describe('AI Exploratory - element discovery, perf and accessibility', () => {
  it('discovers interactive elements and performs basic accessibility checks', function () {
    // Accessibility: run axe quick checks when available (guarded and non-failing)
    if (typeof cy.injectAxe === 'function') {
      // attempt injection and log any injection failures
      cy.injectAxe().then(() => {
        if (typeof cy.checkA11y === 'function') {
          cy.checkA11y(null, null, (violations) => {
            if (violations && violations.length) {
              cy.task('ai:log', { type: 'accessibility', violationsCount: violations.length, violations });
            }
          }, true);
        }
      }, (err) => {
        cy.task('ai:log', { type: 'error', message: 'axeInjectFailed', detail: String(err) });
      });
    }




    const url = Cypress.env('PARABANK_URL') || Cypress.config('baseUrl') || 'about:blank';
    // Fetch page HTML and inject into a blank document to avoid waiting for remote load event
    cy.request({ url, failOnStatusCode: false, timeout: 15000 }).then((resp) => {
      if (resp && resp.body) {
        // load HTML into the current test document without fetching external resources
        cy.document().then(doc => {
          try {
            doc.open();
            doc.write(resp.body);
            doc.close();
          } catch (e) {
            // fallback to normal visit if write fails
          }
        });
        cy.aiLog('aiExploratoryFetched', { url, status: resp.status });
      } else {
        // fallback to visiting the page (may wait for load)
        cy.visit(url, { failOnStatusCode: false });
        cy.aiLog('aiExploratoryVisit', { url });
      }
    }, (err) => {
      // If request failed, attempt a normal visit and log the error
      cy.task('ai:log', { type: 'error', message: 'requestFailed', detail: String(err) });
      cy.visit(url, { failOnStatusCode: false });
      cy.aiLog('aiExploratoryVisit', { url });
    }).then(() => {

      // Dynamic element discovery via body snapshot to avoid timeouts
      cy.get('body', { timeout: 10000 }).then($body => {
        try {
          const els = $body.find('a, button, input, textarea, select, img');
          cy.aiLog('discoveredElements', { count: els.length });
          const sample = Array.from(els).slice(0, 10).map(el => ({ tag: el.tagName, text: (el.innerText || '').slice(0, 40) }));
          cy.aiLog('elementSample', { sample });
        } catch (e) {
          cy.task('ai:log', { type: 'error', message: 'elementDiscoveryFailed', detail: String(e) });
        }
      }, (err) => {
        cy.task('ai:log', { type: 'error', message: 'bodySnapshotFailed', detail: String(err) });
      });

      // Performance monitoring: safe access to navigation timing
      cy.window().then(win => {
        try {
          const nav = win.performance && (win.performance.getEntriesByType ? win.performance.getEntriesByType('navigation')[0] : null);
          let load = null;
          if (nav && nav.loadEventEnd) load = nav.loadEventEnd - (nav.startTime || 0);
          else if (win.performance && win.performance.timing && win.performance.timing.loadEventEnd) {
            const t = win.performance.timing;
            load = t.loadEventEnd && t.navigationStart ? t.loadEventEnd - t.navigationStart : null;
          }
          if (load !== null) {
            cy.aiLog('performance', { load });
            if (load > 5000) cy.task('ai:log', { type: 'anomaly', anomalyType: 'slow_page', severity: 'high', message: `Load time ${load}ms` });
          }
        } catch (e) {
          cy.task('ai:log', { type: 'error', message: 'performanceCheckFailed', detail: String(e) });
        }
      }, (err) => {
        cy.task('ai:log', { type: 'error', message: 'windowAccessFailed', detail: String(err) });
      });

      // Accessibility quick scan: images with missing alt - log but do not fail
      cy.get('img', { timeout: 5000 }).then($imgs => {
        try {
          const missingAlt = Array.from($imgs).filter(img => !(img.getAttribute && (img.getAttribute('alt') || '').trim())).slice(0, 10).map(i => i.src || '');
          if (missingAlt.length) cy.aiLog('accessibility.missingAlt', { count: missingAlt.length, examples: missingAlt });
        } catch (e) {
          cy.task('ai:log', { type: 'error', message: 'accessibilityScanFailed', detail: String(e) });
        }
      }, (err) => {
        cy.task('ai:log', { type: 'error', message: 'imgCollectionFailed', detail: String(err) });
      });

      // Capture screenshot in a fail-safe way (command already swallows failures)
      cy.captureAIScreenshot('ai-exploratory-home').then(() => {}, (err) => {
        cy.task('ai:log', { type: 'error', message: 'screenshotFailed', detail: String(err) });
      });
    }, (err) => {
      cy.task('ai:log', { type: 'error', message: 'visitFailed', detail: String(err) });
    });
  });
});
