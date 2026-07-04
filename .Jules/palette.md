## 2024-07-04 - Static aria-label overriding dynamic button states
**Learning:** In React components (like SubmitForm), applying a static `aria-label` to a button that displays dynamic inner text (e.g., loading states like 'Đang tải file...') causes screen readers to announce the static label instead of the critical dynamic status.
**Action:** Remove static `aria-labels` from buttons that contain dynamic, descriptive visible text to ensure screen readers announce status changes correctly.
