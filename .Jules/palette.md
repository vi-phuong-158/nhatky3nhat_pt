## 2025-02-12 - Missing Native Validation & ARIA Patterns in Existing Forms
**Learning:** Legacy forms or initially built functional components (like `SubmitForm.jsx`) often lack basic HTML5 native accessibility/validation bindings (such as `required`, `aria-required`, and `aria-invalid` on inputs, or `role="alert"` on error containers).
**Action:** Always proactively enforce native ARIA requirements and semantics on critical interaction points (e.g. form fields, icons used for decoration, alert boxes) rather than relying exclusively on custom JavaScript validation text.
