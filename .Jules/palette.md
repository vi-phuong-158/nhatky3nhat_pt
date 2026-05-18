## 2024-05-18 - Native Form Validation and Accessibility
**Learning:** Transitioning from JavaScript-only form validation to HTML5 native validation (`required`) combined with ARIA patterns (`aria-required="true"`, `role="alert"`, `role="status"`, `aria-hidden="true"`) significantly improves accessibility for screen readers and reduces the amount of code needed to handle error states.
**Action:** Always include native form validation and ARIA roles for forms in React components instead of relying solely on JavaScript to display error messages.
