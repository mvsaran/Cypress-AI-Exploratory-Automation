const fs = require('fs');
const path = require('path');

/**
 * Cypress configuration with AI logging tasks and mochawesome reporter options.
 * - Environment variables for site URLs and AI_ENABLED flag
 * - Custom tasks to collect AI logs and persist to `reports/ai-insights/latest-report.json`
 */
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  // Reduce memory footprint across multiple specs to avoid Electron crashes
  numTestsKeptInMemory: 0,
  e2e: {
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.js',
    // Prevent Cypress from auto-capturing screenshots on test failure (can hang on some headless runs)
    screenshotOnRunFailure: false,
    setupNodeEvents(on, config) {
      // In-memory store for AI insights during the run.
      const aiInsights = { tests: [] };

      // task: ai:log - append a log entry to the in-memory insights
      on('task', {
        'ai:log'(payload) {
          try {
            const time = new Date().toISOString();
            aiInsights.tests.push(Object.assign({ time }, payload));
            return null;
          } catch (err) {
            return null;
          }
        },

        // Retrieve current insights (useful in after:run hook)
        'ai:get'() {
          return aiInsights;
        },

        // Persist insights to file
        'ai:save'() {
          try {
            const outDir = path.join(process.cwd(), 'reports', 'ai-insights');
            if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
            const outFile = path.join(outDir, 'latest-report.json');
            fs.writeFileSync(outFile, JSON.stringify(aiInsights, null, 2));
            return { path: outFile };
          } catch (err) {
            return { error: String(err) };
          }
        }
      ,
        // Node-side link check to avoid cy.request timeouts in the browser
        async 'ai:checkLink'(href) {
          try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 10000);
            const res = await fetch(href, { method: 'HEAD', redirect: 'follow', signal: controller.signal });
            clearTimeout(timeout);
            return { status: res.status };
          } catch (err) {
            return { error: String(err) };
          }
        }
      ,
        // Batch link checks - accepts an array of hrefs and returns array of results
        async 'ai:checkLinks'(hrefs) {
          // Run checks in parallel with per-request timeouts to stay within task time limits
          const checks = hrefs.map(href => (async () => {
            try {
              const controller = new AbortController();
              const timeout = setTimeout(() => controller.abort(), 8000);
              const res = await fetch(href, { method: 'HEAD', redirect: 'follow', signal: controller.signal });
              clearTimeout(timeout);
              return { href, status: res.status };
            } catch (err) {
              return { href, error: String(err) };
            }
          })());

          const settled = await Promise.allSettled(checks);
          return settled.map(s => (s.status === 'fulfilled' ? s.value : { href: null, error: 'checkFailed' }));
        }
      });

      // Return the updated config (add reporter options)
      config.reporter = 'mochawesome';
      config.reporterOptions = {
        reportDir: 'reports/test-results',
        overwrite: false,
        html: true,
        json: true,
        charts: true,
        embeddedScreenshots: true
      };

      return config;
    }
  },
  video: false,
  screenshotsFolder: 'cypress/screenshots',
  // Increase page load timeout to handle slower external sites during exploratory runs
  pageLoadTimeout: 120000,
  env: {
    PARABANK_URL: process.env.PARABANK_URL || 'https://parabank.parasoft.com',
    SAUCEDEMO_URL: process.env.SAUCEDEMO_URL || 'https://www.saucedemo.com',
    AI_ENABLED: process.env.AI_ENABLED || 'true'
  },
  viewportWidth: 1280,
  viewportHeight: 800
});
