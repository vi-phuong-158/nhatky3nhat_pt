## 2024-06-04 - Playwright Element Interception by HTML Modals
**Learning:** The introductory modal in this app is defined in standard HTML (`index.html`), not React, and uses a hardcoded backdrop overlay that intercepts pointer events for the React app rendered underneath. This blocks standard Playwright locators.
**Action:** Always dismiss this `.modal-container-class` via `page.evaluate()` prior to attempting clicks on React components.
