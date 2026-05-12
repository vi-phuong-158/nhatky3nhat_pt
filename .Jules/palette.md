## 2025-05-12 - Form Accessibility & Validation
**Learning:** Adding native validation (`required`) combined with ARIA attributes (`aria-required`, `role="alert"`, `aria-live`) greatly improves screen reader experiences for forms.
**Action:** Enforce native `required` and `aria-required="true"` on visually required fields. Use `role="alert" aria-live="assertive"` for error messages, and `role="status" aria-live="polite"` for success messages. Add `aria-hidden="true"` to decorative icons (like `material-symbols-outlined`) to reduce screen reader noise.
