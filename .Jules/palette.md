
## 2024-05-26 - Avoid static aria-labels on buttons with dynamic states
**Learning:** Adding a static `aria-label` (e.g., `aria-label="Submit"`) to a button that displays dynamic text (like a loading spinner with "Processing...") overrides the button's text content. This prevents screen readers from announcing critical status updates, leaving visually impaired users unaware of async operations.
**Action:** When a button's content changes dynamically to reflect state, rely on the button's text content for accessibility rather than a static `aria-label`. Use `aria-hidden="true"` on decorative icons inside the button to prevent redundant announcements.
