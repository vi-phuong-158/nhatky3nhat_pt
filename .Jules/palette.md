## 2024-05-15 - Interactive Image Keyboard Accessibility
**Learning:** For custom interactive non-button elements (like clickable image lightboxes), explicitly managing `onKeyDown` with `Enter` and `Space` is necessary, and calling `e.preventDefault()` for `Space` is critical to prevent unwanted page scrolling during interaction.
**Action:** Consistently apply `role="button"`, `tabIndex={0}`, descriptive `aria-label`, and `onKeyDown` with `Space` scrolling prevention to all non-button interactive elements like cards or lightboxes.
