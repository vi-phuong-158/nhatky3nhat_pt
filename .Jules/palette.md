## 2025-03-09 - [Clickable Images Accessibility]
**Learning:** In the `PostCard` and `AlbumView` components, interactive image elements (`img` and `motion.div`) functioning as lightbox triggers were missing essential keyboard accessibility semantics, leading to inaccessible UI for users unable to use a mouse.
**Action:** When creating custom interactive elements (like image cards or lightboxes) that respond to click events, always apply `role="button"`, `tabIndex={0}`, an informative `aria-label`, and an `onKeyDown` handler listening for 'Enter' or 'Space' to ensure full keyboard navigation.
