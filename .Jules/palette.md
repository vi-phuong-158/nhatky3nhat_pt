## 2024-05-18 - Interactive Image Accessibility

**Learning:** When using `<img>` tags as interactive elements (e.g., clicking to open a lightbox), they inherently lack keyboard accessibility and semantic meaning. Screen readers will just announce them as images, and keyboard users cannot focus or activate them.

**Action:** Always add `role="button"` and `tabIndex={0}` to interactive `<img>` elements. Furthermore, an `onKeyDown` handler that listens for `Enter` and `Space` must be implemented to replicate the click functionality. Finally, provide clear visual focus states using classes like `focus-visible:ring-4`.