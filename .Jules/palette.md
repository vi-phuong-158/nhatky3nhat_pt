## 2024-11-25 - Interactive non-button elements need keyboard handlers
**Learning:** Found several `<img>` and `<div>` elements acting as buttons (with `onClick` handlers) missing keyboard accessibility. Screen readers and keyboard users could not interact with them.
**Action:** Always add `role="button"`, `tabIndex={0}`, an `aria-label`, and an `onKeyDown` handler listening for 'Enter' and 'Space' (preventing default scrolling for Space) to make custom non-button elements fully accessible.
