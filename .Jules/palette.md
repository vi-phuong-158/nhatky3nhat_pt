
## 2024-04-27 - Keyboard Accessibility for Custom Interactive Elements
**Learning:** Interactive elements like images and cards (e.g., `album-card` in `AlbumView.jsx`, `post-image` in `PostCard.jsx`) were implemented using non-interactive elements (`div`, `img`) with `onClick` handlers but lacked keyboard support or ARIA roles. This breaks keyboard navigation and screen reader support.
**Action:** Always add `role="button"`, `tabIndex={0}`, and `onKeyDown` handlers (for Enter/Space) when making non-interactive elements clickable to ensure full accessibility.
