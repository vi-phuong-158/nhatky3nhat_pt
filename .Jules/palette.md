## 2024-06-27 - Keyboard Accessibility for Clickable Divs and Images
**Learning:** Interactive `div` or `img` components that act as buttons or lightbox triggers lack native keyboard support. Users relying on keyboard navigation (Tab, Enter, Space) cannot interact with them.
**Action:** Always add `role="button"`, `tabIndex={0}`, an informative `aria-label`, and an `onKeyDown` handler (listening for `Enter` and `Space`, and calling `e.preventDefault()` for `Space` to prevent scrolling) to these non-semantic interactive elements.
