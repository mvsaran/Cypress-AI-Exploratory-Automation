# Exploratory Testing with Cypress + AI Integration

This repository contains a Cypress-based exploratory testing project with lightweight AI-style logging and analysis helpers. The suite focuses on exploratory checks for SauceDemo and Parabank and includes defensive patterns to keep exploratory/scan-style specs robust in CI.

--

## Quick Links

- Tests: `cypress/e2e/`
- Support & helpers: `cypress/support/`
- Page objects: `cypress/support/page-objects/`
- Fixtures: `cypress/fixtures/`
- Reports: `reports/test-results/` and `reports/ai-insights/`
- Config: `cypress.config.js`

## What is Exploratory Testing?

Exploratory testing is a heuristic, discovery-oriented testing approach where the tester actively investigates an application to find issues, learn about the behavior, and record interesting findings. Rather than following a strict scripted checklist, exploratory tests adapt to the application as it is explored.

In this project we implement an automated, guided form of exploratory testing using Cypress to drive browsers and small in-test helpers to collect structured observations. The goal is to gather actionable insights (elements, anomalies, accessibility/performance notes, screenshots) while keeping tests tolerant so that audits don't break CI runs.

## High-level Implementation

- Tests are organized into two main areas:
  - `cypress/e2e/exploratory/` — scripted exploratory flows for stable paths (e.g., SauceDemo checkout, Parabank navigation).
  - `cypress/e2e/ai-driven/` — lightweight AI-driven exploratory scans that discover elements, check accessibility/performance heuristics, and attempt best-effort link checks.

- The in-test collector (`cypress/support/ai-helper.js`) and custom commands (`cypress/support/commands.js`) provide:
  - `cy.aiLog(message, data)` — attach structured observation to the node-side aggregator
  - `cy.captureAIScreenshot(name)` — viewport screenshot saved under `cypress/screenshots/ai-driven` with fail-safes
  - `cy.analyzeElement(selector)` — small element analysis helper

- Node-side tasks in `cypress.config.js` aggregate AI logs during the run and persist them at the end to `reports/ai-insights/latest-report.json` via the `ai:save` task.

## Project Structure (important files)

- `cypress.config.js` — Cypress configuration and Node tasks (`ai:log`, `ai:get`, `ai:save`, `ai:checkLinks`), reporter configuration, timeouts and run adjustments.
- `cypress/support/e2e.js` — global hooks (`beforeEach` / `afterEach`) wiring the AI helper and logging test lifecycle events.
- `cypress/support/commands.js` — custom Cypress commands wrapping AI actions and safe interactions.
- `cypress/support/ai-helper.js` — collects structured messages (steps, anomalies, element snapshots) and forwards via `cy.task('ai:log', ...)`.
- `cypress/support/page-objects/` — page objects: `ParabankPage.js`, `SauceDemoPage.js` (encapsulate interactions and robust selector handling).
- `cypress/e2e/exploratory/` — curated exploratory flows (SauceDemo, Parabank).
- `cypress/e2e/ai-driven/` — discovery and bug-detection specs (element discovery, accessibility/perf checks, broken-link detection).
- `reports/` — test reports (mochawesome) and `reports/ai-insights/latest-report.json` for AI logs.

## Important Design Decisions & Defensive Patterns

- Avoid mixing `async/await` with Cypress command chains. All in-test actions return Cypress chainables.
- Replace use of `Promise.catch()` on chainables with Cypress-friendly `.then(success, failure)` patterns.
- Screenshots are captured using `capture: 'viewport'` and are fail-safe — failing screenshot commands are logged and swallowed so exploratory scans don't fail the suite.
- For very slow or flaky third-party sites, the tests fetch page HTML with `cy.request()` and inject the HTML into the test document (`cy.document().then(doc => doc.write(...))`) rather than waiting for the full browser `load` event. This avoids long `pageLoadTimeout` hangs while still allowing DOM analysis.
- Broken-link checks are performed via node tasks (`ai:checkLinks`) to perform batch `HEAD` requests with per-request timeouts to avoid browser-side `cy.request()` timeouts.
- `cypress.config.js` contains several run-time tweaks to stabilize CI runs (e.g., `numTestsKeptInMemory`, `screenshotOnRunFailure: false`, `pageLoadTimeout` adjustments).

## How to Run

1. Install dependencies (project root):

```powershell
npm install
```

2. Run the full test suite (headless):

```powershell
npm run test:all
```

3. Open Cypress UI (interactive):

```powershell
npm run cy:open
```

4. Run only the AI-driven specs:

```powershell
npx cypress run --spec "cypress/e2e/ai-driven/*.cy.js"
```

5. After runs, AI insights and test results are available in:

- `reports/test-results/` (mochawesome HTML/JSON)
- `reports/ai-insights/latest-report.json` (aggregated AI logs)

## Troubleshooting & Notes

- If you encounter `cy.screenshot()` timeouts on some environments, the project is configured to avoid failing the suite from screenshot problems for AI-driven specs. You can re-enable screenshots for those specs by editing `cypress/support/e2e.js`.
- If a third-party site is extremely slow, `pageLoadTimeout` can be increased in `cypress.config.js` or the project will fallback to `cy.request()` + DOM injection for analysis.
- The AI/insight logs are intentionally non-blocking: they are collected as observations (not assertions). If you want to enforce failures for specific accessibility/performance thresholds, add explicit assertions in the relevant spec(s).

## Extending the Project

- Add more page objects under `cypress/support/page-objects/` for additional targets.
- Extend `ai:checkLinks` or add new Node tasks for deeper server-side analysis (screenshot diffs, external scan hooks).
- Integrate `axe-core` rules more deeply by installing `cypress-axe` (already optionally required in `support/e2e.js`) and customizing checks.

## Conventions

- Tests that perform discovery/logging should be tolerant and log anomalies, not fail the run.
- Tests that verify functionality (checkout flow on SauceDemo) use standard Cypress assertions and will fail CI if broken.

---

Author: Saran kumar
# Cypress AI Exploratory Automation

This repository contains a Cypress-based exploratory testing project augmented with a lightweight AI integration that collects structured logs, element captures, anomalies, and screenshots for offline AI analysis.

Overview:
- Tests: `cypress/e2e/` includes both exploratory tests and AI-driven scans for `Amazon`, `Flipkart`, and `SauceDemo`.
- AI Helper: `cypress/support/ai-helper.js` collects data and reports it to the Node process via `cy.task('ai:log')`.
- Reports: AI insights are saved to `reports/ai-insights/latest-report.json`. Mochawesome HTML reports are generated into `reports/test-results/`.

Quick setup
1. Install dependencies:

```powershell
cd C:/Users/mvsar/Projects/ExploratoryTesting;
npm install
```

2. Set optional environment variables (examples):

```powershell
setx AMAZON_URL "https://www.amazon.com";
setx FLIPKART_URL "https://www.flipkart.com";
setx SAUCEDEMO_URL "https://www.saucedemo.com";
setx AI_ENABLED "true";
```

Running tests
- Open interactive runner: `npm run cy:open`
- Run headless suite: `npm run cy:run`
- Run a specific group:
  - `npm run test:amazon`
  - `npm run test:flipkart`
  - `npm run test:saucedemo`
  - `npm run test:ai`

AI integration notes
- During tests the `AITestHelper` collects steps, element captures and anomalies and sends them to `cypress.config.js` node tasks via `cy.task('ai:log', payload)`.
- At the end of each test, the support hooks call `cy.task('ai:save')` to persist `reports/ai-insights/latest-report.json`.
- This project uses an in-memory store for run-time collection and writes a single JSON file at the end of a run. You can extend the node tasks to ship data to a remote AI service.

Extending and customizing
- Add more checks in `cypress/support/commands.js` to extend the smart actions and validations.
- Implement server-side AI analysis by reading `reports/ai-insights/latest-report.json` and running models on the data.

Important
- Tests are best-effort against dynamic production sites; prefer mocking or staging endpoints for repeatable runs.
- Do not use localStorage/sessionStorage for persistence — this repo uses in-memory collection and node-side persistence only.
