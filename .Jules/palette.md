## 2024-05-15 - Interactive Images Lack Keyboard Accessibility
**Learning:** Interactive images (like those opening lightboxes) are often implemented using the standard `<img>` tag with an `onClick` handler. This makes them inaccessible to keyboard users as they cannot be focused via Tab and triggered via Enter/Space.
**Action:** Always add `role="button"`, `tabIndex={0}`, and an `onKeyDown` handler to interactive images to ensure keyboard accessibility. Wait for Enter or Space to trigger the action.
