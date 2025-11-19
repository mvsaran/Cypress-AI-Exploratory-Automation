# 🤖 Cypress AI Exploratory Automation

> A powerful Cypress-based exploratory testing framework with lightweight AI integration for intelligent test discovery and analysis.

![Exploratory Testing](https://img.shields.io/badge/Framework-Cypress-29C5DB?style=for-the-badge)
![AI Integration](https://img.shields.io/badge/AI-Enabled-FF6B6B?style=for-the-badge)
![Node Tasks](https://img.shields.io/badge/Node%20Tasks-Async-FFA500?style=for-the-badge)

---

## 📋 Table of Contents

- [What is Exploratory Testing?](#-what-is-exploratory-testing)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Key Features](#-key-features)
- [How to Run](#-how-to-run)
- [Design Patterns](#-defensive-design-patterns)
- [Troubleshooting](#-troubleshooting)
- [Extending the Project](#-extending-the-project)

---

## 🎯 What is Exploratory Testing?

Exploratory testing is a heuristic, discovery-oriented approach where testers actively investigate applications to uncover issues, learn behavior patterns, and record findings. Unlike scripted testing, exploratory tests adapt dynamically to the application's actual state.

This project automates guided exploratory testing using:
- ✅ Cypress for browser automation
- 📊 Structured in-test observation collection
- 🤖 Lightweight AI-driven element discovery
- 📸 Contextual screenshot capture
- ♿ Accessibility and performance audits

---

## 🚀 Quick Start

### Prerequisites
- Node.js 14+ installed
- npm or yarn package manager

### 1️⃣ Installation

```powershell
cd /path/to/ExploratoryTesting
npm install
```

### 2️⃣ Configure Environment (Optional)

```powershell
setx AMAZON_URL "https://www.amazon.com"
setx FLIPKART_URL "https://www.flipkart.com"
setx SAUCEDEMO_URL "https://www.saucedemo.com"
setx AI_ENABLED "true"
```

### 3️⃣ Run Tests

```powershell
# Interactive mode
npm run cy:open

# Headless mode
npm run cy:run

# Specific targets
npm run test:amazon
npm run test:flipkart
npm run test:saucedemo
npm run test:ai
```

---

## 📁 Project Structure

```
ExploratoryTesting/
├── 📄 cypress.config.js                    # Main Cypress config + Node tasks
├── 📁 cypress/
│   ├── e2e/
│   │   ├── exploratory/                    # 🔍 Curated exploratory flows
│   │   └── ai-driven/                      # 🤖 AI-powered discovery specs
│   ├── support/
│   │   ├── e2e.js                         # Global hooks & lifecycle
│   │   ├── commands.js                     # Custom Cypress commands
│   │   ├── ai-helper.js                   # 🧠 AI data collector
│   │   └── page-objects/
│   │       ├── ParabankPage.js
│   │       ├── SauceDemoPage.js
│   │       └── ...
│   ├── fixtures/                           # Test data
│   └── screenshots/                        # 📸 Captured images
├── 📁 reports/
│   ├── test-results/                       # Mochawesome HTML/JSON
│   └── ai-insights/
│       └── latest-report.json              # 📊 AI analysis output
└── 📁 node_modules/                        # Dependencies
```

### 📍 Quick Navigation
- **Tests**: `cypress/e2e/`
- **Helpers**: `cypress/support/`
- **Page Objects**: `cypress/support/page-objects/`
- **Test Data**: `cypress/fixtures/`
- **Reports**: `reports/test-results/` & `reports/ai-insights/`

---

## ⭐ Key Features

### 🔍 Exploratory Flows
Scripted yet adaptive tests for stable paths:
- SauceDemo checkout journeys
- Parabank navigation patterns
- Multi-step user workflows

### 🤖 AI-Driven Scanning
Intelligent discovery capabilities:
- **Element Discovery**: Automatically identifies and catalogs interactive elements
- **Accessibility Audits**: ♿ WCAG compliance checks
- **Performance Analysis**: 📈 Load time and responsiveness metrics
- **Link Validation**: 🔗 Broken link detection via Node tasks
- **Anomaly Detection**: 🚨 Highlights unusual behaviors or missing elements

### 📸 Smart Capture System
- Viewport-optimized screenshots
- Fail-safe capture (won't break test suite)
- Contextual naming and organization
- Saved to `cypress/screenshots/ai-driven/`

### 📊 AI Insights Report
Comprehensive JSON output with:
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "testRun": "full-suite",
  "observations": [
    {
      "type": "element_discovery",
      "selector": ".add-to-cart",
      "count": 12,
      "accessibilityIssues": 2
    },
    {
      "type": "anomaly",
      "severity": "medium",
      "message": "Broken link detected"
    }
  ]
}
```

---

## 🎮 How to Run

### Command Reference

| Command | Purpose |
|---------|---------|
| `npm run cy:open` | 🖥️ Interactive Cypress UI |
| `npm run cy:run` | 🏃 Full headless test suite |
| `npm run test:amazon` | 🛍️ Amazon exploratory tests |
| `npm run test:flipkart` | 🏪 Flipkart exploratory tests |
| `npm run test:saucedemo` | 🔴 SauceDemo exploratory tests |
| `npm run test:ai` | 🤖 AI-driven discovery specs |
| `npm run test:all` | 🔄 Complete suite run |

### Example: Run AI Scans Only

```powershell
npx cypress run --spec "cypress/e2e/ai-driven/*.cy.js" --headless
```

### View Reports

After test runs, access:
- 📊 **Mochawesome**: `reports/test-results/index.html`
- 🧠 **AI Insights**: `reports/ai-insights/latest-report.json`

---

## 🛡️ Defensive Design Patterns

### ✅ Cypress Best Practices
- Avoid mixing `async/await` with command chains
- Use `.then(success, failure)` instead of `Promise.catch()`
- All actions return Cypress chainables

### 📸 Screenshot Safety
```javascript
cy.captureAIScreenshot('checkout-page')
  // Fails gracefully, logs issues, doesn't break suite
```

### 🌐 Third-Party Site Handling
For slow/flaky sites, inject HTML via `cy.request()` instead of waiting for load:
```javascript
cy.request(url).then(response => {
  cy.document().then(doc => doc.write(response.body))
})
```

### 🔗 Link Validation
Batch `HEAD` requests via Node tasks with per-request timeouts:
```javascript
cy.task('ai:checkLinks', urls)
```

### ⏱️ CI Stability Tweaks
Configured in `cypress.config.js`:
- Memory management: `numTestsKeptInMemory`
- No screenshots on failure for exploratory specs
- Adjusted `pageLoadTimeout`

---

## 🔧 Troubleshooting

### ❓ Screenshot Timeouts

**Problem**: Screenshot commands timing out on CI

**Solution**: Edit `cypress/support/e2e.js` to enable fail-safe mode for AI specs (already default)

```javascript
if (isAIDrivenSpec) {
  // Screenshots won't fail the suite
  captureScreenshotSafely()
}
```

### 🐌 Slow Third-Party Sites

**Problem**: `pageLoadTimeout` errors for external sites

**Solution**: Increase timeout in `cypress.config.js`:
```javascript
pageLoadTimeout: 60000, // 60 seconds
```

Or use HTML injection method for faster analysis.

### 📊 Missing AI Insights

**Problem**: `latest-report.json` not generated

**Solution**: Ensure `cy.task('ai:save')` is called in lifecycle hooks:
```javascript
afterEach(() => {
  cy.task('ai:save')
})
```

---

## 🔌 Extending the Project

### Add New Test Target

1. Create page object:
```javascript
// cypress/support/page-objects/MyPage.js
export class MyPage {
  visit() { cy.visit(Cypress.env('MY_URL')) }
  getSearchBox() { return cy.get('input[role="search"]') }
}
```

2. Create exploratory spec:
```javascript
// cypress/e2e/exploratory/my-target.cy.js
import { MyPage } from '../support/page-objects/MyPage'

describe('My Target - Exploratory', () => {
  const page = new MyPage()
  
  it('discovers elements', () => {
    page.visit()
    cy.aiLog('Discovered search interface')
  })
})
```

### Add Custom AI Analysis

Extend `cypress/support/commands.js`:
```javascript
Cypress.Commands.add('analyzeCustomMetric', (selector) => {
  cy.get(selector).then(el => {
    const data = {
      type: 'custom_analysis',
      metric: calculateMetric(el)
    }
    cy.task('ai:log', data)
  })
})
```

### Integrate Remote AI Service

Modify Node tasks in `cypress.config.js`:
```javascript
'ai:save': async (report) => {
  // Send to your AI service
  await fetch('https://your-ai-service.com/analyze', {
    method: 'POST',
    body: JSON.stringify(report)
  })
}
```

---


### Custom Commands

#### `cy.aiLog(message, data)`
Attach structured observation to collector
```javascript
cy.aiLog('Found checkout button', { selector: '.btn-checkout', visible: true })
```

#### `cy.captureAIScreenshot(name)`
Safe viewport screenshot capture
```javascript
cy.captureAIScreenshot('product-page')
```

#### `cy.analyzeElement(selector)`
Quick element analysis
```javascript
cy.analyzeElement('.product-card')
```

---

## ⚠️ Important Notes

- 🚫 **No localStorage/sessionStorage**: Project uses in-memory collection + Node persistence
- 🎯 **Best-effort testing**: Against production sites; use staging/mocking for reliability
- 🔄 **Non-blocking logs**: AI observations don't fail tests—add assertions for hard failures
- 📈 **Scalable**: Extend Node tasks for deeper analysis and remote reporting

---

## 👤 Author

**Saran Kumar**

---

## 📄 License

MIT License - Feel free to use this project as a template for your exploratory testing needs!

---

<div align="center">

### 🌟 Star this repo if you find it helpful!

Made with ❤️ for better exploratory testing

</div>
