## 2026-05-01 - Added Dialog Accessibility and Escape Key Support
**Learning:** React modal components (like AlbumView and StatsView) were missing essential accessibility attributes (`role="dialog"`, `aria-modal="true"`) and keyboard navigation support (Escape key to dismiss).
**Action:** Implemented `Escape` key listeners and added ARIA attributes to overlay elements to align with standard accessibility guidelines. Form inputs in SubmitForm also updated to include `required` and `aria-required="true"`.
