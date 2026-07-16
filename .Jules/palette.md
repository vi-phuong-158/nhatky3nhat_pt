## 2024-05-19 - Accessible Lightbox Image Cards
**Learning:** Pinterest-style masonry image cards (`<motion.div>`) acting as clickable lightboxes are often completely inaccessible to keyboard users if they lack interactive roles and keydown handlers.
**Action:** When implementing custom clickable cards with `div` or `motion.div` tags, always include `role="button"`, `tabIndex={0}`, an informative `aria-label`, and an `onKeyDown` handler listening for `Enter` and `Space` to trigger the click action.
