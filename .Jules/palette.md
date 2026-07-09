
## 2024-05-24 - Dynamic Form Feedback & Progress Bars
**Learning:** For screen readers to proactively announce dynamic form feedback, alerts must use `role="alert"` (with `aria-live="assertive"`) and success messages must use `role="status"` (with `aria-live="polite"`). Custom progress bars built with `div` elements require `role="progressbar"` along with `aria-valuenow`, `aria-valuemin`, and `aria-valuemax` to be semantically understood. Visual percentage text inside them should be marked `aria-hidden="true"` to prevent redundant screen reader announcements.
**Action:** Always apply `role="alert"` or `role="status"` to notification areas, and enforce ARIA progressbar roles and values for any custom upload or progress components.
