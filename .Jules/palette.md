## 2024-05-18 - Modal Keyboard Accessibility & ARIA roles
**Learning:** Custom modals (like AlbumView and StatsView) often lack default browser keyboard support. Users relying on keyboards or screen readers can get trapped in these overlays or miss important context. It's critical to add Escape key support to dismiss these modals easily.
**Action:** Always add `useEffect` to listen for the `Escape` key in custom overlays. Ensure root overlay elements have `role="dialog"`, `aria-modal="true"`, and `aria-labelledby="<id-of-heading>"` to provide proper context to screen readers.
